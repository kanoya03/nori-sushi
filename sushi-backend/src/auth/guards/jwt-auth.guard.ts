import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

type JwtPayload = {
  sub?: unknown;
};

@Injectable()
export class JwtAuthGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService:
      JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context
        .switchToHttp()
        .getRequest();

    const authHeader =
      request.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        'Bearer ',
      )
    ) {
      throw new UnauthorizedException(
        'Missing access token',
      );
    }

    const token =
      authHeader
        .substring(7)
        .trim();

    if (!token) {
      throw new UnauthorizedException(
        'Missing access token',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          token,
        );

      if (
        typeof payload.sub !==
        'number'
      ) {
        throw new UnauthorizedException(
          'Invalid access token',
        );
      }

      request.user = {
        sub:
          payload.sub,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid access token',
      );
    }
  }
}