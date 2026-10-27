import {
  HttpException,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { Bot } from 'grammy';
import { AuthService } from './auth.service.js';
import { RateLimitService } from '../rate-limit/rate-limit.service.js';
import { RateLimitExceededException } from '../rate-limit/rate-limit.exception.js';

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private readonly bot: Bot;
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    private readonly auth: AuthService,
    private readonly limiter: RateLimitService,
  ) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    this.bot = new Bot(token);
  }

  onModuleInit() {
    this.bot.command('start', async (ctx) => {
      const from = ctx.from;
      // Codes must only be sent to the account owner's private chat.
      if (!from || ctx.chat.type !== 'private') return;
      try {
        await this.limiter.consume('telegram-bot', from.id.toString());
      } catch (error) {
        // Avoid turning a command flood into a flood of outgoing replies.
        if (error instanceof RateLimitExceededException) return;
        this.logger.error('Telegram rate limit check failed');
        return;
      }

      const sessionToken = ctx.match?.trim();
      if (!sessionToken) {
        await ctx.reply(
          'Откройте Telegram через приложение NORI, чтобы получить код для входа.',
        );
        return;
      }
      try {
        const { code } = await this.auth.issueTelegramCode(sessionToken, from);
        await ctx.reply(
          `Ваш код для входа в NORI:\n\n${code}\n\nКод действует до 5 минут с момента первой выдачи.`,
        );
      } catch (error) {
        if (error instanceof HttpException) {
          await ctx.reply(
            'Ссылка недействительна, истекла или заблокирована. Начните вход заново в NORI.',
          );
          return;
        }
        this.logger.error('Failed to issue Telegram sign-in code');
        await ctx.reply('Не удалось выдать код. Попробуйте позже.');
      }
    });

    this.bot.catch(() => this.logger.error('Telegram bot request failed'));
    void this.bot
      .start()
      .catch(() => this.logger.error('Telegram bot polling failed'));
  }

  onModuleDestroy() {
    if (this.bot.isRunning()) void this.bot.stop();
  }
}
