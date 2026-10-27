import {
  Injectable,
  SetMetadata,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { clientIdentity } from './client-identity.js';
import {
  RATE_LIMIT_POLICIES,
  type RateLimitPolicy,
} from './rate-limit.policies.js';
import { RateLimitService } from './rate-limit.service.js';
import { RateLimitExceededException } from './rate-limit.exception.js';

const METADATA_KEY = 'request-rate-limit';
export const LimitRequests = (policy: RateLimitPolicy) =>
  SetMetadata(METADATA_KEY, policy);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly limiter: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = this.reflector.getAllAndOverride<RateLimitPolicy>(
      METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!policy) return true;
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { sub: number } }>();
    let identity = clientIdentity(request);
    if (RATE_LIMIT_POLICIES[policy].identity === 'user') {
      if (!Number.isSafeInteger(request.user?.sub))
        throw new UnauthorizedException();
      identity = `user:${request.user!.sub}`;
    }
    try {
      await this.limiter.consume(policy, identity);
    } catch (error) {
      if (error instanceof RateLimitExceededException) {
        context
          .switchToHttp()
          .getResponse<Response>()
          .setHeader('Retry-After', error.retryAfter);
      }
      throw error;
    }
    return true;
  }
}
