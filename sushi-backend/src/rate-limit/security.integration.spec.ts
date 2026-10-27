import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  BadRequestException,
  UnauthorizedException,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import type { Request } from 'express';
import { securityDatabase } from '../../test/security-database.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from '../auth/auth.service.js';
import { AuthController } from '../auth/auth.controller.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OrdersService } from '../orders/orders.service.js';
import { OrdersController } from '../orders/orders.controller.js';
import { RateLimitService } from './rate-limit.service.js';
import { RateLimitExceededException } from './rate-limit.exception.js';
import { RateLimitGuard } from './rate-limit.guard.js';
import { clientIdentity } from './client-identity.js';

let storage: Awaited<ReturnType<typeof securityDatabase>>;
const jwt = { signAsync: vi.fn(async () => 'signed-token') };
let auth: AuthService;

beforeAll(async () => {
  storage = await securityDatabase();
  auth = new AuthService(storage.prisma, jwt as unknown as JwtService);
}, 30_000);

beforeEach(async () => {
  await storage.db.exec('TRUNCATE "RequestRateLimit", "TelegramAuthSession";');
  jwt.signAsync.mockClear();
  vi.stubEnv('RENDER', 'false');
});
afterEach(() => vi.unstubAllEnvs());
afterAll(async () => storage?.db.close());

async function session(ready = true) {
  const token = randomUUID();
  await storage.db.query(
    `INSERT INTO "TelegramAuthSession" ("token", "telegramId", "code", "expiresAt")
    VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')`,
    [token, ready ? '123' : null, ready ? '123456' : null],
  );
  return token;
}

describe('persistent request limits on PostgreSQL', () => {
  it('shares one quota between instances and admits only 20 of 30 parallel checks', async () => {
    const instances = [
      new RateLimitService(storage.prisma),
      new RateLimitService(storage.prisma),
    ];
    const results = await Promise.allSettled(
      Array.from({ length: 30 }, (_, i) =>
        instances[i % 2].consume('telegram-verify', 'client'),
      ),
    );
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(20);
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(10);
    await expect(
      new RateLimitService(storage.prisma).consume('telegram-verify', 'client'),
    ).rejects.toBeInstanceOf(RateLimitExceededException);
    await expect(
      instances[0].consume('telegram-verify', 'other-client'),
    ).resolves.toBeUndefined();
    const rows = (
      await storage.db.query<{ key: string; count: number }>(
        'SELECT "key", "count" FROM "RequestRateLimit"',
      )
    ).rows;
    expect(rows.every((row) => /^[a-f0-9]{64}$/.test(row.key))).toBe(true);
    expect(Math.max(...rows.map((row) => row.count))).toBe(21);
  });

  it('resets an expired window and preserves the longer hourly quota', async () => {
    const limiter = new RateLimitService(storage.prisma);
    for (let batch = 0; batch < 4; batch++) {
      for (let i = 0; i < 5; i++)
        await limiter.consume('telegram-start', 'client');
      await expect(
        limiter.consume('telegram-start', 'client'),
      ).rejects.toBeInstanceOf(RateLimitExceededException);
      await storage.db
        .exec(`UPDATE "RequestRateLimit" SET "expiresAt" = NOW() - INTERVAL '1 second'
        WHERE "expiresAt" < NOW() + INTERVAL '2 minutes';`);
    }
    await expect(
      limiter.consume('telegram-start', 'client'),
    ).rejects.toBeInstanceOf(RateLimitExceededException);
    await storage.db.exec(
      `UPDATE "RequestRateLimit" SET "expiresAt" = NOW() - INTERVAL '1 second';`,
    );
    await expect(
      limiter.consume('telegram-start', 'client'),
    ).resolves.toBeUndefined();
  });

  it('cleans old counters and sessions while preserving live records', async () => {
    const limiter = new RateLimitService(storage.prisma);
    await limiter.consume('telegram-verify', 'live');
    const live = await session();
    const old = await session();
    await storage.db.query(
      `UPDATE "TelegramAuthSession" SET "expiresAt" = NOW() - INTERVAL '2 days' WHERE "token" = $1`,
      [old],
    );
    await storage.db.exec(
      `INSERT INTO "RequestRateLimit" VALUES ('old', 1, NOW() - INTERVAL '2 hours')`,
    );
    await limiter.cleanupExpired();
    expect(
      (await storage.db.query('SELECT * FROM "RequestRateLimit"')).rows,
    ).toHaveLength(1);
    expect(
      (await storage.db.query('SELECT "token" FROM "TelegramAuthSession"'))
        .rows,
    ).toEqual([{ token: live }]);
  });
});

describe('Telegram verification on PostgreSQL', () => {
  it('locks after five failed guesses and does not accept the correct code afterwards', async () => {
    const token = await session();
    for (let i = 0; i < 4; i++)
      await expect(
        auth.verifyTelegramCode(token, '000000'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      auth.verifyTelegramCode(token, '000000'),
    ).rejects.toMatchObject({ status: 429 });
    await expect(
      auth.verifyTelegramCode(token, '123456'),
    ).rejects.toMatchObject({ status: 429 });
    const row = await storage.prisma.telegramAuthSession.findUnique({
      where: { token },
    });
    expect(row?.failedAttempts).toBe(5);
    expect(row?.verified).toBe(false);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('caps failed attempts during parallel guessing', async () => {
    const token = await session();
    await Promise.allSettled(
      Array.from({ length: 25 }, () =>
        auth.verifyTelegramCode(token, '000000'),
      ),
    );
    const row = await storage.prisma.telegramAuthSession.findUnique({
      where: { token },
    });
    expect(row?.failedAttempts).toBe(5);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('allows the correct code after four mistakes and consumes it once under parallel requests', async () => {
    const token = await session();
    for (let i = 0; i < 4; i++)
      await auth.verifyTelegramCode(token, '000000').catch(() => undefined);
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        auth.verifyTelegramCode(token, '123456'),
      ),
    );
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(jwt.signAsync).toHaveBeenCalledTimes(1);
  });

  it('does not issue a token for expired sessions or malformed input', async () => {
    const token = await session();
    await storage.db.query(
      `UPDATE "TelegramAuthSession" SET "expiresAt" = NOW() - INTERVAL '1 second' WHERE "token" = $1`,
      [token],
    );
    await expect(
      auth.verifyTelegramCode(token, '123456'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      auth.verifyTelegramCode('bad-token', '123456'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      auth.verifyTelegramCode(token, 123456 as unknown as string),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('reopening the bot preserves the code, expiration and failed-attempt count', async () => {
    const token = await session(false);
    const first = await auth.issueTelegramCode(token, {
      id: 123,
      first_name: 'User',
    });
    const original = await storage.prisma.telegramAuthSession.findUnique({
      where: { token },
    });
    await auth.verifyTelegramCode(token, '000000').catch(() => undefined);
    const second = await auth.issueTelegramCode(token, {
      id: 123,
      first_name: 'User',
    });
    const repeated = await storage.prisma.telegramAuthSession.findUnique({
      where: { token },
    });
    expect(second.code).toBe(first.code);
    expect(repeated?.expiresAt).toEqual(original?.expiresAt);
    expect(repeated?.failedAttempts).toBe(1);
    await expect(
      auth.issueTelegramCode(token, { id: 456, first_name: 'Other' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    for (let i = 0; i < 4; i++)
      await auth.verifyTelegramCode(token, '000000').catch(() => undefined);
    await expect(
      auth.issueTelegramCode(token, { id: 123, first_name: 'User' }),
    ).rejects.toMatchObject({ status: 429 });
  });

  it('binds a new session to only one of two competing Telegram accounts', async () => {
    const token = await session(false);
    const results = await Promise.allSettled([
      auth.issueTelegramCode(token, { id: 123, first_name: 'First' }),
      auth.issueTelegramCode(token, { id: 456, first_name: 'Second' }),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
  });
});

describe('client identity', () => {
  function req(ip: string, headers: Record<string, string> = {}) {
    return { socket: { remoteAddress: ip }, headers } as unknown as Request;
  }
  it('ignores forged forwarded headers on direct connections', () => {
    expect(
      clientIdentity(
        req('::ffff:192.0.2.1', {
          'x-forwarded-for': '192.0.2.99',
          'cf-connecting-ip': '192.0.2.99',
        }),
      ),
    ).toBe('192.0.2.1');
  });
  it('uses the Render ingress client address rather than user-controlled X-Forwarded-For', () => {
    vi.stubEnv('RENDER', 'true');
    expect(
      clientIdentity(
        req('10.0.0.1', {
          'cf-connecting-ip': '192.0.2.1',
          'x-forwarded-for': '192.0.2.99',
        }),
      ),
    ).toBe('192.0.2.1');
  });
  it('groups IPv6 host variations and equivalent spellings into one subnet', () => {
    expect(clientIdentity(req('2001:db8:1234:5678::1'))).toBe(
      clientIdentity(req('2001:0db8:1234:5678:abcd:ffff:1234:5678')),
    );
    expect(clientIdentity(req('2001:db8:1234:5678::1'))).not.toBe(
      clientIdentity(req('2001:db8:1234:5679::1')),
    );
  });
});

describe('HTTP guards on the actual auth and order controllers', () => {
  let app: INestApplication<App>;
  const createGuestOrder = vi.fn(async () => ({ id: 1 }));
  const startTelegramAuth = vi.fn(async () => ({ sessionToken: 'test' }));
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController, OrdersController],
      providers: [
        RateLimitGuard,
        RateLimitService,
        JwtAuthGuard,
        { provide: PrismaService, useValue: storage.prisma },
        { provide: AuthService, useValue: { startTelegramAuth } },
        { provide: OrdersService, useValue: { createGuestOrder } },
        { provide: JwtService, useValue: { verifyAsync: vi.fn() } },
      ],
    }).compile();
    app = module.createNestApplication<App>();
    await app.init();
  });
  beforeEach(() => {
    createGuestOrder.mockClear();
    startTelegramAuth.mockClear();
  });
  afterAll(async () => app?.close());

  it('rejects the eleventh guest order before calling the order service and includes Retry-After', async () => {
    for (let i = 0; i < 10; i++)
      await request(app.getHttpServer())
        .post('/orders/guest')
        .set('X-Forwarded-For', `192.0.2.${i}`)
        .send({})
        .expect(201);
    const response = await request(app.getHttpServer())
      .post('/orders/guest')
      .send({})
      .expect(429);
    expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
    expect(response.body.code).toBe('RATE_LIMITED');
    expect(createGuestOrder).toHaveBeenCalledTimes(10);
  });

  it('rejects the sixth Telegram session without creating it', async () => {
    for (let i = 0; i < 5; i++)
      await request(app.getHttpServer())
        .post('/auth/telegram/start')
        .expect(201);
    await request(app.getHttpServer()).post('/auth/telegram/start').expect(429);
    expect(startTelegramAuth).toHaveBeenCalledTimes(5);
  });
});
