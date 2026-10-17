import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { FavoritesController } from './favorites.controller.js';
import { FavoritesService } from './favorites.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],

  controllers: [
    FavoritesController,
  ],

  providers: [
    FavoritesService,
    JwtAuthGuard,
  ],
})
export class FavoritesModule {}