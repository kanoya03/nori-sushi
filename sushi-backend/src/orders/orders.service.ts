import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createHash, randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateOrderDto } from './dto/create-order.dto.js';
import { validateCreateOrder } from './validate-create-order.js';

const MINIMUM_ORDER_AMOUNT = 5000;
const DELIVERY_FEE = 700;
const MAX_ORDER_TOTAL = 2_147_483_647;

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
    const validatedDto = validateCreateOrder(dto);

    const productIds = [
      ...new Set(
        validatedDto.items.map(
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
      if (validatedDto.items.some((item) => item.expectedUnitPrice !== undefined)) {
        throw new ConflictException({ statusCode: 409, code: 'CART_CHANGED', message: 'Some products are unavailable. Review your cart.' });
      }
      throw new BadRequestException(
        'Some products are unavailable',
      );
    }

    const orderItems =
      validatedDto.items.map(
        (item) => {
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

          if (item.expectedUnitPrice !== undefined && item.expectedUnitPrice !== product.price) {
            throw new ConflictException({ statusCode: 409, code: 'CART_CHANGED', message: 'Product prices changed. Review your cart.' });
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
      validatedDto.deliveryType ===
      'DELIVERY'
        ? DELIVERY_FEE
        : 0;

    const totalPrice =
      subtotal +
      deliveryFee;

    if (!Number.isInteger(totalPrice) || totalPrice > MAX_ORDER_TOTAL) {
      throw new BadRequestException('Order total is too large');
    }

    return {
      validatedDto,
      orderItems,
      subtotal,
      deliveryFee,
      totalPrice,
    };
  }

  private async createOrderRecord(userId: number | null, dto: CreateOrderDto) {
    const validated = validateCreateOrder(dto);
    const key = validated.idempotencyKey;
    const requestHash = key
      ? createHash('sha256')
          .update(
            JSON.stringify({
              deliveryType: validated.deliveryType,
              recipientPhone: validated.recipientPhone,
              paymentMethod: validated.paymentMethod,
              address: validated.address,
              comment: validated.comment || null,
              // Prices are a client precondition, not a new checkout attempt.
              items: validated.items.map(({ productId, quantity }) => ({ productId, quantity })).sort((a, b) => a.productId - b.productId),
            }),
          )
          .digest('hex')
      : null;

    const findExisting = async () => {
      if (!key) return null;
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: key },
        include: { items: { include: { product: true } } },
      });
      if (existing && (existing.userId !== userId || existing.requestHash !== requestHash)) {
        throw new ConflictException('Idempotency key already belongs to another order');
      }
      return existing;
    };

    const existing = await findExisting();
    if (existing) return existing;

    const {
      validatedDto,
      orderItems,
      subtotal,
      deliveryFee,
      totalPrice,
    } =
      await this.buildOrderData(validated);

    try {
      const orderArgs = {
        data: {
          userId,
          guestToken: userId === null ? randomUUID() : null,
          idempotencyKey: key || null,
          requestHash,
          recipientPhone: validatedDto.recipientPhone,
          deliveryType: validatedDto.deliveryType,
          paymentMethod: validatedDto.paymentMethod,
          address: validatedDto.address || null,
          comment: validatedDto.comment || null,
          subtotal,
          deliveryFee,
          totalPrice,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true as const,
            },
          },
        },
      };
      if (userId === null) return await this.prisma.order.create(orderArgs);
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create(orderArgs);
        await tx.user.update({ where: { id: userId }, data: { phone: validatedDto.recipientPhone } });
        return order;
      });
    } catch (error) {
      // The unique index arbitrates two requests that arrive at the same time.
      if (
        key &&
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        const winner = await findExisting();
        if (winner) return winner;
      }
      throw error;
    }
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    return this.createOrderRecord(userId, dto);
  }

  async createGuestOrder(dto: CreateOrderDto) {
    return this.createOrderRecord(null, dto);
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
