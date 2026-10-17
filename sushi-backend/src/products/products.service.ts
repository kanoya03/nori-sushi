import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  findAll() {
    return this.prisma.product.findMany({
      where: {
        isAvailable: true,
      },

      include: {
        category: true,
      },

      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(
    id: number,
  ) {
    const product =
      await this.prisma.product.findFirst({
        where: {
          id,
          isAvailable: true,
        },

        include: {
          category: true,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    return product;
  }
}