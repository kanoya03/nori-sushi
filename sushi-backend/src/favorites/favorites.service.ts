import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async getFavorites(
    userId: number,
  ) {
    return this.prisma.favorite.findMany({
      where: {
        userId,

        product: {
          isAvailable: true,
        },
      },

      include: {
        product: {
          include: {
            category: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async addFavorite(
    userId: number,
    productId: number,
  ) {
    const product =
      await this.prisma.product.findFirst({
        where: {
          id: productId,
          isAvailable: true,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    return this.prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },

      update: {},

      create: {
        userId,
        productId,
      },
    });
  }

  async removeFavorite(
    userId: number,
    productId: number,
  ) {
    const favorite =
      await this.prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

    if (!favorite) {
      throw new NotFoundException(
        'Favorite not found',
      );
    }

    await this.prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return {
      success: true,
    };
  }
}