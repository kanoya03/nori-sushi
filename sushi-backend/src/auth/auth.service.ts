import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import {
  OAuth2Client,
} from 'google-auth-library';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  private readonly googleClient =
    new OAuth2Client();

  constructor(
    private readonly prisma:
      PrismaService,

    private readonly jwtService:
      JwtService,
  ) {}

  async startTelegramAuth() {
    const botUsername =
      process.env.TELEGRAM_BOT_USERNAME;

    if (!botUsername) {
      throw new Error(
        'TELEGRAM_BOT_USERNAME is not configured',
      );
    }

    const token =
      randomUUID();

    await this.prisma.telegramAuthSession.create({
      data: {
        token,

        expiresAt: new Date(
          Date.now() +
            10 * 60 * 1000,
        ),
      },
    });

    return {
      sessionToken: token,

      telegramUrl:
        `https://t.me/${botUsername}` +
        `?start=${token}`,
    };
  }

  async verifyTelegramCode(
    sessionToken: string,
    code: string,
  ) {
    const session =
      await this.prisma.telegramAuthSession.findUnique({
        where: {
          token:
            sessionToken,
        },
      });

    if (
      !session ||
      !session.telegramId ||
      !session.code ||
      session.verified ||
      session.expiresAt <
        new Date()
    ) {
      throw new UnauthorizedException(
        'Telegram session is invalid or expired',
      );
    }

    if (
      session.code !==
      code
    ) {
      throw new UnauthorizedException(
        'Invalid verification code',
      );
    }

    const user =
      await this.prisma.user.findUnique({
        where: {
          telegramId:
            session.telegramId,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    await this.prisma.telegramAuthSession.update({
      where: {
        id:
          session.id,
      },

      data: {
        verified:
          true,
      },
    });

    const accessToken =
      await this.jwtService.signAsync({
        sub:
          user.id,
      });

    return {
      accessToken,
      user,
    };
  }

  async verifyGoogleToken(
    idToken: string,
  ) {
    const audience =
      process.env.GOOGLE_WEB_CLIENT_ID;

    if (!audience) {
      throw new Error(
        'GOOGLE_WEB_CLIENT_ID is not configured',
      );
    }

    try {
      const ticket =
        await this.googleClient.verifyIdToken({
          idToken,
          audience,
        });

      const payload =
        ticket.getPayload();

      if (
        !payload ||
        !payload.sub
      ) {
        throw new UnauthorizedException(
          'Invalid Google token',
        );
      }

      const googleId =
        payload.sub;

      const verifiedEmail =
        payload.email_verified ===
          true
          ? payload.email ??
            null
          : null;

      const firstName =
        payload.given_name ??
        null;

      const lastName =
        payload.family_name ??
        null;

      let user =
        await this.prisma.user.findUnique({
          where: {
            googleId,
          },
        });

      if (
        !user &&
        verifiedEmail
      ) {
        const existingByEmail =
          await this.prisma.user.findUnique({
            where: {
              email:
                verifiedEmail,
            },
          });

        if (
          existingByEmail
        ) {
          user =
            await this.prisma.user.update({
              where: {
                id:
                  existingByEmail.id,
              },

              data: {
                googleId,

                firstName:
                  existingByEmail.firstName ??
                  firstName,

                lastName:
                  existingByEmail.lastName ??
                  lastName,
              },
            });
        }
      }

      if (!user) {
        user =
          await this.prisma.user.create({
            data: {
              googleId,

              email:
                verifiedEmail,

              firstName,
              lastName,
            },
          });
      }

      const accessToken =
        await this.jwtService.signAsync({
          sub:
            user.id,
      });

      return {
        accessToken,
        user,
      };
    } catch (error) {
      if (
        error instanceof
        UnauthorizedException
      ) {
        throw error;
      }

      console.error(
        'Google token verification failed:',
        error,
      );

      throw new UnauthorizedException(
        'Invalid Google token',
      );
    }
  }

  async getCurrentUser(
    userId: number,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id:
            userId,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    return user;
  }
}