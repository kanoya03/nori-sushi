import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  getMe(
    @Req() request: { user: { sub: number } },
  ) {
    return this.usersService.getCurrentUser(
      request.user.sub,
    );
  }

  @Patch('me')
  updateMe(
    @Req() request: { user: { sub: number } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateCurrentUser(
      request.user.sub,
      dto,
    );
  }
}