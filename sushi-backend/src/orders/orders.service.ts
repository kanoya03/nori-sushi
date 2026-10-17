import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateOrderDto } from './dto/create-order.dto.js';

const MINIMUM_ORDER_AMOUNT = 5000;
const DELIVERY_FEE = 700;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  private getGuestToken(
    guestToken?: string,
  ): string {
    const normalizedToken =
      guestToken?.trim();

    if (!normalizedToken) {
      throw new BadRequestException(
        'Guest token is required',
      );
    }

    return normalizedToken;
  }

  private async buildOrderData(
    dto: CreateOrderDto,
  ) {
    if (!dto.items.length) {
      throw new BadRequestException(
        'Order must contain at least one item',
      );
    }

    if (
      dto.deliveryType ===
        'DELIVERY' &&
      !dto.address?.trim()
    ) {
      throw new BadRequestException(
        'Delivery address is required',
      );
    }

    if (
      dto.deliveryType ===
        'PICKUP' &&
      !dto.address?.trim()
    ) {
      throw new BadRequestException(
        'Pickup point is required',
      );
    }

    const productIds = [
      ...new Set(
        dto.items.map(
          (item) =>
            item.productId,
        ),
      ),
    ];

    const products =
      await this.prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },

          isAvailable: true,
        },
      });

    if (
      products.length !==
      productIds.length
    ) {
      throw new BadRequestException(
        'Some products are unavailable',
      );
    }

    const orderItems =
      dto.items.map(
        (item) => {
          if (
            item.quantity < 1
          ) {
            throw new BadRequestException(
              'Quantity must be at least 1',
            );
          }

          const product =
            products.find(
              (product) =>
                product.id ===
                item.productId,
            );

          if (!product) {
            throw new NotFoundException(
              'Product not found',
            );
          }

          return {
            productId:
              product.id,

            quantity:
              item.quantity,

            productName:
              product.name,

            unitPrice:
              product.price,
          };
        },
      );

    const subtotal =
      orderItems.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          item.unitPrice *
            item.quantity,
        0,
      );

    if (
      subtotal <
      MINIMUM_ORDER_AMOUNT
    ) {
      throw new BadRequestException(
        `Minimum order amount is ${MINIMUM_ORDER_AMOUNT}`,
      );
    }

    const deliveryFee =
      dto.deliveryType ===
      'DELIVERY'
        ? DELIVERY_FEE
        : 0;

    const totalPrice =
      subtotal +
      deliveryFee;

    return {
      orderItems,
      subtotal,
      deliveryFee,
      totalPrice,
    };
  }

  async createOrder(
    userId: number,
    dto: CreateOrderDto,
  ) {
    const {
      orderItems,
      subtotal,
      deliveryFee,
      totalPrice,
    } =
      await this.buildOrderData(
        dto,
      );

    return this.prisma.order.create({
      data: {
        userId,

        guestToken: null,

        deliveryType:
          dto.deliveryType,

        paymentMethod:
          dto.paymentMethod,

        address:
          dto.address?.trim() ||
          null,

        comment:
          dto.comment?.trim() ||
          null,

        subtotal,

        deliveryFee,

        totalPrice,

        items: {
          create:
            orderItems,
        },
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async createGuestOrder(
    dto: CreateOrderDto,
  ) {
    const {
      orderItems,
      subtotal,
      deliveryFee,
      totalPrice,
    } =
      await this.buildOrderData(
        dto,
      );

    const guestToken =
      randomUUID();

    return this.prisma.order.create({
      data: {
        userId: null,

        guestToken,

        deliveryType:
          dto.deliveryType,

        paymentMethod:
          dto.paymentMethod,

        address:
          dto.address?.trim() ||
          null,

        comment:
          dto.comment?.trim() ||
          null,

        subtotal,

        deliveryFee,

        totalPrice,

        items: {
          create:
            orderItems,
        },
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getOrders(
    userId: number,
  ) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrderById(
    userId: number,
    orderId: number,
  ) {
    const order =
      await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    return order;
  }

  async getGuestOrder(
    orderId: number,
    guestToken?: string,
  ) {
    const token =
      this.getGuestToken(
        guestToken,
      );

    const order =
      await this.prisma.order.findFirst({
        where: {
          id: orderId,
          guestToken: token,
          userId: null,
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    return order;
  }

  async cancelOrder(
    userId: number,
    orderId: number,
  ) {
    const order =
      await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    if (
      order.status !==
        'PENDING' &&
      order.status !==
        'CONFIRMED'
    ) {
      throw new BadRequestException(
        'This order can no longer be cancelled',
      );
    }

    return this.prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status:
          'CANCELLED',
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async cancelGuestOrder(
    orderId: number,
    guestToken?: string,
  ) {
    const token =
      this.getGuestToken(
        guestToken,
      );

    const order =
      await this.prisma.order.findFirst({
        where: {
          id: orderId,
          guestToken: token,
          userId: null,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    if (
      order.status !==
        'PENDING' &&
      order.status !==
        'CONFIRMED'
    ) {
      throw new BadRequestException(
        'This order can no longer be cancelled',
      );
    }

    return this.prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status:
          'CANCELLED',
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}