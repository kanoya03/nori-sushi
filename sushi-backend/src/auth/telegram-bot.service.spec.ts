import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthService } from './auth.service.js';
import type { RateLimitService } from '../rate-limit/rate-limit.service.js';
import { RateLimitExceededException } from '../rate-limit/rate-limit.exception.js';
import { TelegramBotService } from './telegram-bot.service.js';

const command = vi.hoisted(() => vi.fn());
vi.mock('grammy', () => ({
  Bot: class {
    command = command;
    catch = vi.fn();
    start = vi.fn(async () => undefined);
    isRunning = vi.fn(() => false);
    stop = vi.fn();
  },
}));

describe('Telegram bot limits', () => {
  beforeEach(() => {
    command.mockClear();
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'test-token');
  });
  afterEach(() => vi.unstubAllEnvs());

  function setup() {
    const issueTelegramCode = vi.fn(async () => ({ code: '123456' }));
    const consume = vi.fn(async () => undefined);
    const bot = new TelegramBotService(
      { issueTelegramCode } as unknown as AuthService,
      { consume } as unknown as RateLimitService,
    );
    bot.onModuleInit();
    const handler = command.mock.calls[0][1] as (ctx: unknown) => Promise<void>;
    const ctx = {
      from: { id: 123, first_name: 'Test' },
      chat: { type: 'private' },
      match: 'token',
      reply: vi.fn(async () => undefined),
    };
    return { handler, ctx, consume, issueTelegramCode };
  }

  it('checks the Telegram account quota before issuing or sending a code', async () => {
    const { handler, ctx, consume, issueTelegramCode } = setup();
    consume.mockRejectedValueOnce(new RateLimitExceededException(60));
    await handler(ctx);
    expect(consume).toHaveBeenCalledWith('telegram-bot', '123');
    expect(issueTelegramCode).not.toHaveBeenCalled();
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  it('does not send authentication codes to group chats', async () => {
    const { handler, ctx, consume, issueTelegramCode } = setup();
    ctx.chat.type = 'group';
    await handler(ctx);
    expect(consume).not.toHaveBeenCalled();
    expect(issueTelegramCode).not.toHaveBeenCalled();
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  it('sends the session code after the quota check', async () => {
    const { handler, ctx, consume, issueTelegramCode } = setup();
    await handler(ctx);
    expect(consume).toHaveBeenCalledOnce();
    expect(issueTelegramCode).toHaveBeenCalledWith('token', ctx.from);
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining('123456'));
  });
});
