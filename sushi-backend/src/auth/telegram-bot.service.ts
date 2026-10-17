import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import {
  Bot,
} from 'grammy';

import {
  randomInt,
} from 'crypto';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

@Injectable()
export class TelegramBotService
  implements
    OnModuleInit,
    OnModuleDestroy
{
  private readonly bot: Bot;

  constructor(
    private readonly prisma:
      PrismaService,
  ) {
    const token =
      process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error(
        'TELEGRAM_BOT_TOKEN is not configured',
      );
    }

    this.bot =
      new Bot(token);
  }

  onModuleInit() {
    this.bot.command(
      'start',
      async (ctx) => {
        const sessionToken =
          ctx.match?.trim();

        if (!sessionToken) {
          await ctx.reply(
            'Откройте Telegram через приложение NORI, чтобы получить код для входа.',
          );

          return;
        }

        const session =
          await this.prisma.telegramAuthSession.findUnique({
            where: {
              token:
                sessionToken,
            },
          });

        if (
          !session ||
          session.expiresAt <
            new Date() ||
          session.verified
        ) {
          await ctx.reply(
            'Ссылка для входа недействительна или истекла. Вернитесь в приложение и попробуйте снова.',
          );

          return;
        }

        const from =
          ctx.from;

        if (!from) {
          await ctx.reply(
            'Не удалось получить данные Telegram-пользователя.',
          );

          return;
        }

        const telegramId =
          from.id.toString();

        if (
          session.telegramId &&
          session.telegramId !==
            telegramId
        ) {
          await ctx.reply(
            'Эта ссылка уже используется другим Telegram-аккаунтом.',
          );

          return;
        }

        const code =
          randomInt(
            100000,
            1000000,
          ).toString();

        await this.prisma.user.upsert({
          where: {
            telegramId,
          },

          update: {
            firstName:
              from.first_name,

            lastName:
              from.last_name ??
              null,
          },

          create: {
            telegramId,

            firstName:
              from.first_name,

            lastName:
              from.last_name ??
              null,
          },
        });

        await this.prisma.telegramAuthSession.update({
          where: {
            token:
              sessionToken,
          },

          data: {
            telegramId,
            code,

            expiresAt:
              new Date(
                Date.now() +
                  5 * 60 * 1000,
              ),
          },
        });

        await ctx.reply(
          `Ваш код для входа в NORI:\n\n${code}\n\nКод действует 5 минут.`,
        );
      },
    );

    this.bot.start();
  }

  onModuleDestroy() {
    this.bot.stop();
  }
}