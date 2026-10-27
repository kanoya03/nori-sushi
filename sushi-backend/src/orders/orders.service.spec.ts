import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';

const validOrder = {
  deliveryType: 'DELIVERY',
  paymentMethod: 'CASH',
  address: '  Main Street 1  ',
  recipientPhone: '+7 (701) 123-45-67',
  comment: '  Please call  ',
  items: [{ productId: 1, quantity: 2 }],
};

function createService(price = 3000) {
  const findMany = vi.fn(async () => [
    { id: 1, name: 'Salmon roll', price, isAvailable: true },
  ]);
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 10,
    ...data,
  }));
  const findUnique = vi.fn(async () => null);
  const updateUser = vi.fn(async () => ({ id: 42 }));
  const tx = { order: { create }, user: { update: updateUser } };
  const transaction = vi.fn(
    async (operation: (client: typeof tx) => Promise<unknown>) => operation(tx),
  );
  const prisma = {
    $transaction: transaction,
    product: { findMany },
    order: { create, findUnique },
  } as unknown as PrismaService;
  return {
    service: new OrdersService(prisma),
    findMany,
    create,
    findUnique,
    updateUser,
    transaction,
  };
}

const attemptKey = '123e4567-e89b-42d3-a456-426614174000';

describe('order idempotency', () => {
  it('returns the original order after an ambiguous response even if prices changed', async () => {
    const { service, findUnique, findMany, create } = createService();
    const first = await service.createGuestOrder({
      ...validOrder,
      items: [{ productId: 1, quantity: 2, expectedUnitPrice: 3000 }],
      idempotencyKey: attemptKey,
    });
    findUnique.mockResolvedValue(first as never);
    const retry = await service.createGuestOrder({
      ...validOrder,
      items: [{ productId: 1, quantity: 2, expectedUnitPrice: 4000 }],
      idempotencyKey: attemptKey,
    });
    expect(retry).toEqual(first);
    expect(findMany).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
  });
  it('includes the normalized recipient phone in the attempt identity', async () => {
    const { service, findUnique, updateUser, transaction } = createService();
    const first = await service.createOrder(42, {
      ...validOrder,
      idempotencyKey: attemptKey,
    });
    findUnique.mockResolvedValue(first as never);
    await expect(
      service.createOrder(42, {
        ...validOrder,
        recipientPhone: '+77011234567',
        idempotencyKey: attemptKey,
      }),
    ).resolves.toEqual(first);
    await expect(
      service.createOrder(42, {
        ...validOrder,
        recipientPhone: '+393331234567',
        idempotencyKey: attemptKey,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(transaction).toHaveBeenCalledOnce();
    expect(updateUser).toHaveBeenCalledWith({
      where: { id: 42 },
      data: { phone: '+77011234567' },
    });
  });
  it('rejects malformed keys before accessing the database', async () => {
    const { service, findMany } = createService();
    await expect(
      service.createGuestOrder({ ...validOrder, idempotencyKey: 'bad' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('returns the original guest order and token without repricing on retry', async () => {
    const { service, create, findUnique, findMany } = createService();
    const first = await service.createGuestOrder({
      ...validOrder,
      idempotencyKey: attemptKey,
    });
    findUnique.mockResolvedValueOnce(first as never);
    const retry = await service.createGuestOrder({
      ...validOrder,
      idempotencyKey: attemptKey,
    });
    expect(retry).toEqual(first);
    expect(retry.guestToken).toBe(first.guestToken);
    expect(create).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('rejects reuse of a key for a changed order or a different account', async () => {
    const { service, findUnique, create } = createService();
    const first = await service.createOrder(42, {
      ...validOrder,
      idempotencyKey: attemptKey,
    });
    findUnique.mockResolvedValue(first as never);
    await expect(
      service.createOrder(42, {
        ...validOrder,
        comment: 'different',
        idempotencyKey: attemptKey,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      service.createOrder(43, { ...validOrder, idempotencyKey: attemptKey }),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      service.createGuestOrder({ ...validOrder, idempotencyKey: attemptKey }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('returns the winning order when two requests race on the unique key', async () => {
    let saved: Record<string, unknown> | null = null;
    const findUnique = vi.fn(async () => saved);
    const create = vi.fn(
      async ({ data }: { data: Record<string, unknown> }) => {
        if (saved) throw { code: 'P2002' };
        saved = { id: 10, ...data };
        return saved;
      },
    );
    const prisma = {
      product: {
        findMany: vi.fn(async () => [{ id: 1, name: 'Roll', price: 3000 }]),
      },
      order: { findUnique, create },
    } as unknown as PrismaService;
    const service = new OrdersService(prisma);
    const input = { ...validOrder, idempotencyKey: attemptKey };
    const [first, retry] = await Promise.all([
      service.createGuestOrder(input),
      service.createGuestOrder(input),
    ]);
    expect(first).toEqual(retry);
    expect(first.guestToken).toBe(retry.guestToken);
    expect(create).toHaveBeenCalledTimes(2);
  });
});

describe('order request validation', () => {
  it('requires the customer to review changed prices before any order is saved', async () => {
    const { service, create } = createService();
    await expect(
      service.createGuestOrder({
        ...validOrder,
        items: [{ productId: 1, quantity: 2, expectedUnitPrice: 2500 }],
      }),
    ).rejects.toMatchObject({
      status: 409,
      response: { code: 'CART_CHANGED' },
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a product that became unavailable after the catalog check', async () => {
    const { service, findMany, create } = createService();
    findMany.mockResolvedValueOnce([]);
    await expect(
      service.createGuestOrder({
        ...validOrder,
        items: [{ productId: 1, quantity: 2, expectedUnitPrice: 3000 }],
      }),
    ).rejects.toMatchObject({
      status: 409,
      response: { code: 'CART_CHANGED' },
    });
    expect(create).not.toHaveBeenCalled();
  });
  it.each([
    ['missing items', { ...validOrder, items: undefined }],
    ['null body', null],
    ['non-object body', []],
    ['empty items', { ...validOrder, items: [] }],
    [
      'invalid expected price',
      {
        ...validOrder,
        items: [{ productId: 1, quantity: 2, expectedUnitPrice: '3000' }],
      },
    ],
    ['missing phone', { ...validOrder, recipientPhone: undefined }],
    ['invalid phone type', { ...validOrder, recipientPhone: 77011234567 }],
    [
      'national phone without country code',
      { ...validOrder, recipientPhone: '87011234567' },
    ],
    [
      'invalid country calling code',
      { ...validOrder, recipientPhone: '+999123456789' },
    ],
    ['short phone', { ...validOrder, recipientPhone: '+7123' }],
    [
      'text containing a phone',
      { ...validOrder, recipientPhone: 'Call +7 701 1234567' },
    ],
    [
      'fractional quantity',
      { ...validOrder, items: [{ productId: 1, quantity: 1.5 }] },
    ],
    [
      'string quantity',
      { ...validOrder, items: [{ productId: 1, quantity: '2' }] },
    ],
    [
      'zero quantity',
      { ...validOrder, items: [{ productId: 1, quantity: 0 }] },
    ],
    [
      'excessive quantity',
      { ...validOrder, items: [{ productId: 1, quantity: 101 }] },
    ],
    [
      'invalid product ID',
      { ...validOrder, items: [{ productId: '1', quantity: 2 }] },
    ],
    ['missing item', { ...validOrder, items: [null] }],
    [
      'duplicate product',
      {
        ...validOrder,
        items: [
          { productId: 1, quantity: 1 },
          { productId: 1, quantity: 1 },
        ],
      },
    ],
    [
      'too many items',
      {
        ...validOrder,
        items: Array.from({ length: 51 }, (_, i) => ({
          productId: i + 1,
          quantity: 1,
        })),
      },
    ],
    ['invalid delivery type', { ...validOrder, deliveryType: 'DRONE' }],
    ['invalid payment method', { ...validOrder, paymentMethod: 'FREE' }],
    ['missing address', { ...validOrder, address: '   ' }],
    ['oversized address', { ...validOrder, address: 'A'.repeat(501) }],
    ['invalid comment', { ...validOrder, comment: { text: 'call' } }],
    ['oversized comment', { ...validOrder, comment: 'A'.repeat(301) }],
  ])('rejects %s before querying products', async (_name, input) => {
    const { service, findMany, create } = createService();

    await expect(
      service.createGuestOrder(input as CreateOrderDto),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findMany).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('prices a valid guest order from the database and saves normalized fields', async () => {
    const { service, create } = createService();

    await service.createGuestOrder(validOrder as CreateOrderDto);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          address: 'Main Street 1',
          recipientPhone: '+77011234567',
          comment: 'Please call',
          subtotal: 6000,
          deliveryFee: 700,
          totalPrice: 6700,
          items: {
            create: [
              {
                productId: 1,
                quantity: 2,
                productName: 'Salmon roll',
                unitPrice: 3000,
              },
            ],
          },
        }),
      }),
    );
  });

  it('validates authenticated orders too and accepts a valid pickup order', async () => {
    const { service, create } = createService();
    const pickup = { ...validOrder, deliveryType: 'PICKUP' } as CreateOrderDto;

    await service.createOrder(42, pickup);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 42,
          deliveryType: 'PICKUP',
          deliveryFee: 0,
          totalPrice: 6000,
        }),
      }),
    );
  });

  it('rejects totals outside the database integer range', async () => {
    const { service, create } = createService(2_000_000_000);

    await expect(
      service.createGuestOrder(validOrder as CreateOrderDto),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });
});

describe('orders HTTP responses', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const { findMany, create } = createService();
    const module = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        JwtAuthGuard,
        { provide: JwtService, useValue: { verifyAsync: vi.fn() } },
        {
          provide: PrismaService,
          useValue: { product: { findMany }, order: { create } },
        },
      ],
    })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication<App>();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns 400 for a guest order without items', async () => {
    await request(app.getHttpServer())
      .post('/orders/guest')
      .send({})
      .expect(400);
  });

  it('returns 400 for fractional item quantities', async () => {
    await request(app.getHttpServer())
      .post('/orders/guest')
      .send({ ...validOrder, items: [{ productId: 1, quantity: 1.5 }] })
      .expect(400);
  });
});
