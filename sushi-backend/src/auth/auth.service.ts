import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { randomInt, randomUUID } from 'crypto';

import {
  OAuth2Client,
} from 'google-auth-library';

import { PrismaService } from '../prisma/prisma.service.js';
import { MAX_TELEGRAM_FAILURES, SESSION_TOKEN_PATTERN, telegramSessionLocked } from './telegram-security.js';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,

    private readonly jwtService: JwtService,
  ) {}

  async startTelegramAuth() {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;

    if (!botUsername) {
      throw new Error('TELEGRAM_BOT_USERNAME is not configured');
    }

    const token = randomUUID();

    await this.prisma.telegramAuthSession.create({
      data: {
        token,

        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return {
      sessionToken: token,

      telegramUrl: `https://t.me/${botUsername}` + `?start=${token}`,
    };
  }

  async verifyTelegramCode(sessionToken: string, code: string) {
    if (
      typeof sessionToken !== 'string' ||
      !SESSION_TOKEN_PATTERN.test(sessionToken) ||
      typeof code !== 'string' ||
      !/^\d{6}$/.test(code)
    ) {
      throw new BadRequestException(
        'A valid session token and six-digit code are required',
      );
    }
    const token = sessionToken.toLowerCase();
    // One conditional UPDATE both counts failed guesses and consumes a correct
    // code. PostgreSQL rechecks the predicate after concurrent row updates.
    const [attempt] = await this.prisma.$queryRaw<
      Array<{
        telegramId: string;
        verified: boolean;
        failedAttempts: number;
      }>
    >`
      UPDATE "TelegramAuthSession" SET
        "failedAttempts" = "failedAttempts" + CASE WHEN "code" = ${code} THEN 0 ELSE 1 END,
        "verified" = ("code" = ${code})
      WHERE "token" = ${token} AND "verified" = false
        AND "expiresAt" > NOW() AND "failedAttempts" < ${MAX_TELEGRAM_FAILURES}
        AND "code" IS NOT NULL AND "telegramId" IS NOT NULL
      RETURNING "telegramId", "verified", "failedAttempts"
    `;

    if (!attempt) {
      const session = await this.prisma.telegramAuthSession.findUnique({
        where: { token },
      });
      if (
        session &&
        !session.verified &&
        session.failedAttempts >= MAX_TELEGRAM_FAILURES
      ) {
        throw telegramSessionLocked();
      }
      throw new UnauthorizedException('Telegram session is invalid or expired');
    }
    if (!attempt.verified) {
      if (attempt.failedAttempts >= MAX_TELEGRAM_FAILURES)
        throw telegramSessionLocked();
      throw new UnauthorizedException('Invalid verification code');
    }

    const user = await this.prisma.user.findUnique({
      where: { telegramId: attempt.telegramId },
    });
    if (!user) throw new UnauthorizedException('User not found');
    const accessToken = await this.jwtService.signAsync({ sub: user.id });
    return { accessToken, user };
  }

  async issueTelegramCode(
    sessionToken: string,
    from: { id: number; first_name: string; last_name?: string },
  ) {
    if (!SESSION_TOKEN_PATTERN.test(sessionToken))
      throw new BadRequestException('Invalid Telegram session token');
    const token = sessionToken.toLowerCase();
    const telegramId = from.id.toString();
    const code = randomInt(100000, 1000000).toString();

    // Reopening /start cannot replace a code, extend its lifetime or reset guesses.
    await this.prisma.$executeRaw`
      UPDATE "TelegramAuthSession" SET
        "telegramId" = ${telegramId}, "code" = ${code},
        "expiresAt" = LEAST("expiresAt", NOW() + INTERVAL '5 minutes')
      WHERE "token" = ${token} AND "verified" = false AND "expiresAt" > NOW()
        AND "failedAttempts" < ${MAX_TELEGRAM_FAILURES}
        AND "telegramId" IS NULL AND "code" IS NULL
    `;
    const session = await this.prisma.telegramAuthSession.findUnique({
      where: { token },
    });
    if (
      !session ||
      session.verified ||
      session.expiresAt <= new Date() ||
      session.telegramId !== telegramId ||
      !session.code
    ) {
      throw new UnauthorizedException('Telegram session is invalid or expired');
    }
    if (session.failedAttempts >= MAX_TELEGRAM_FAILURES)
      throw telegramSessionLocked();

    await this.prisma.user.upsert({
      where: { telegramId },
      update: { firstName: from.first_name, lastName: from.last_name ?? null },
      create: {
        telegramId,
        firstName: from.first_name,
        lastName: from.last_name ?? null,
      },
    });
    return { code: session.code };
  }

  async verifyGoogleToken(idToken: string) {
    const audience = process.env.GOOGLE_WEB_CLIENT_ID;

    if (!audience) {
      throw new Error('GOOGLE_WEB_CLIENT_ID is not configured');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience,
      });

      const payload = ticket.getPayload();

      if (
        !payload ||
        !payload.sub ||
        payload.email_verified !== true ||
        !payload.email?.trim()
      ) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const googleId = payload.sub;

      const verifiedEmail = payload.email.trim().toLowerCase();

      const firstName = payload.given_name ?? null;

      const lastName = payload.family_name ?? null;

      let user = await this.prisma.user.findUnique({
        where: {
          googleId,
        },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            googleId,

            email: verifiedEmail,

            contactEmail: verifiedEmail,

            firstName,
            lastName,
          },
        });
      } else if (user.email !== verifiedEmail) {
        // Google supplies the sign-in email; profile changes cannot change it.
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { email: verifiedEmail },
        });
      }

      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
      });

      return {
        accessToken,
        user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Google token verification failed:', error);

      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
