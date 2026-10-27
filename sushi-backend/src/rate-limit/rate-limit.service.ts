import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  RATE_LIMIT_POLICIES,
  type RateLimitPolicy,
} from './rate-limit.policies.js';
import { RateLimitExceededException } from './rate-limit.exception.js';

@Injectable()
export class RateLimitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RateLimitService.name);
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.cleanupTimer = setInterval(() => {
      void this.cleanupExpired().catch(() =>
        this.logger.error('Failed to clean up expired security counters'),
      );
    }, 60_000);
    this.cleanupTimer.unref();
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  async consume(policy: RateLimitPolicy, identity: string): Promise<void> {
    for (const window of RATE_LIMIT_POLICIES[policy].windows) {
      const key = createHash('sha256')
        .update(JSON.stringify([policy, window.seconds, identity]))
        .digest('hex');
      // PostgreSQL locks this counter during UPSERT; concurrent instances cannot
      // each observe a free slot. DB time also avoids clock skew between servers.
      const [result] = await this.prisma.$queryRaw<
        Array<{ allowed: boolean; retryAfter: number }>
      >`
        INSERT INTO "RequestRateLimit" ("key", "count", "expiresAt")
        VALUES (${key}, 1, NOW() + ${window.seconds} * INTERVAL '1 second')
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE WHEN "RequestRateLimit"."expiresAt" <= NOW() THEN 1
            ELSE LEAST("RequestRateLimit"."count" + 1, ${window.limit + 1}) END,
          "expiresAt" = CASE WHEN "RequestRateLimit"."expiresAt" <= NOW()
            THEN NOW() + ${window.seconds} * INTERVAL '1 second'
            ELSE "RequestRateLimit"."expiresAt" END
        RETURNING "count" <= ${window.limit} AS "allowed",
          GREATEST(1, CEIL(EXTRACT(EPOCH FROM ("expiresAt" - NOW()))))::int AS "retryAfter"
      `;
      if (!result) throw new Error('Rate limit counter was not returned');
      if (!result.allowed)
        throw new RateLimitExceededException(result.retryAfter);
    }
  }

  async cleanupExpired(): Promise<void> {
    // Bounded batches and row locks prevent cleanup from deleting a counter
    // that another instance has just reset for a new window.
    await this.prisma.$executeRaw`
      DELETE FROM "RequestRateLimit" WHERE "key" IN (
        SELECT "key" FROM "RequestRateLimit"
        WHERE "expiresAt" < NOW() - INTERVAL '1 hour'
        ORDER BY "expiresAt" LIMIT 1000 FOR UPDATE SKIP LOCKED
      )
    `;
    await this.prisma.$executeRaw`
      DELETE FROM "TelegramAuthSession" WHERE "id" IN (
        SELECT "id" FROM "TelegramAuthSession"
        WHERE "expiresAt" < NOW() - INTERVAL '1 day'
        ORDER BY "expiresAt" LIMIT 1000 FOR UPDATE SKIP LOCKED
      )
    `;
  }
}
