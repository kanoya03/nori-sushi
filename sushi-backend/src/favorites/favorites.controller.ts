import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FavoritesService } from './favorites.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(
    private readonly favoritesService:
      FavoritesService,
  ) {}

  @Get()
  getFavorites(
    @Req() request: { user: { sub: number } },
  ) {
    return this.favoritesService.getFavorites(
      request.user.sub,
    );
  }

  @Post(':productId')
  addFavorite(
    @Req() request: { user: { sub: number } },
    @Param('productId', ParseIntPipe)
    productId: number,
  ) {
    return this.favoritesService.addFavorite(
      request.user.sub,
      productId,
    );
  }

  @Delete(':productId')
  removeFavorite(
    @Req() request: { user: { sub: number } },
    @Param('productId', ParseIntPipe)
    productId: number,
  ) {
    return this.favoritesService.removeFavorite(
      request.user.sub,
      productId,
    );
  }
}