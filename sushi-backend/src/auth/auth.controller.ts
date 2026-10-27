import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import { AuthService } from './auth.service.js';

import { TelegramVerifyCodeDto } from './dto/telegram-verify-code.dto.js';
import { LimitRequests, RateLimitGuard } from '../rate-limit/rate-limit.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('telegram/start')
  @UseGuards(RateLimitGuard)
  @LimitRequests('telegram-start')
  startTelegramAuth() {
    return this.authService.startTelegramAuth();
  }

  @Post('telegram/verify')
  @UseGuards(RateLimitGuard)
  @LimitRequests('telegram-verify')
  verifyTelegramCode(
    @Body() dto: TelegramVerifyCodeDto,
  ) {
    return this.authService.verifyTelegramCode(
      dto?.sessionToken,
      dto?.code,
    );
  }

  @Post('google')
  @UseGuards(RateLimitGuard)
  @LimitRequests('google-auth')
  verifyGoogle(
    @Body()
    body: {
      idToken: string;
    },
  ) {
    return this.authService.verifyGoogleToken(
      body.idToken,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(
    @Req()
    request: {
      user: {
        sub: number;
      };
    },
  ) {
    return this.authService.getCurrentUser(
      request.user.sub,
    );
  }
}
