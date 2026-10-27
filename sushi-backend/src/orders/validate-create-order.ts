import { BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { normalizePhoneNumber } from '../common/phone.js';

const MAX_ITEMS = 50;
const MAX_QUANTITY = 100;
const MAX_PRODUCT_ID = 2_147_483_647;
const MAX_ADDRESS_LENGTH = 500;
const MAX_COMMENT_LENGTH = 300;
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateCreateOrder(value: unknown): CreateOrderDto {
  if (!isRecord(value)) {
    throw new BadRequestException('Order body must be an object');
  }

  const deliveryType = value.deliveryType;
  const recipientPhone = normalizePhoneNumber(value.recipientPhone);
  if (!recipientPhone) {
    throw new BadRequestException(
      'A valid recipient phone number with country code is required',
    );
  }
  if (deliveryType !== 'DELIVERY' && deliveryType !== 'PICKUP') {
    throw new BadRequestException('Invalid delivery type');
  }

  const paymentMethod = value.paymentMethod;
  if (paymentMethod !== 'CASH' && paymentMethod !== 'CARD_ON_DELIVERY') {
    throw new BadRequestException('Invalid payment method');
  }

  if (typeof value.address !== 'string' || !value.address.trim()) {
    throw new BadRequestException(
      deliveryType === 'DELIVERY'
        ? 'Delivery address is required'
        : 'Pickup point is required',
    );
  }
  if (value.address.length > MAX_ADDRESS_LENGTH) {
    throw new BadRequestException('Address is too long');
  }

  if (
    value.comment !== undefined &&
    value.comment !== null &&
    typeof value.comment !== 'string'
  ) {
    throw new BadRequestException('Comment must be a string');
  }
  if (
    typeof value.comment === 'string' &&
    value.comment.length > MAX_COMMENT_LENGTH
  ) {
    throw new BadRequestException('Comment is too long');
  }

  if (
    value.idempotencyKey !== undefined &&
    (typeof value.idempotencyKey !== 'string' ||
      !UUID_V4.test(value.idempotencyKey))
  ) {
    throw new BadRequestException('Invalid idempotency key');
  }

  if (!Array.isArray(value.items) || value.items.length === 0) {
    throw new BadRequestException('Order must contain at least one item');
  }
  if (value.items.length > MAX_ITEMS) {
    throw new BadRequestException(
      `Order cannot contain more than ${MAX_ITEMS} items`,
    );
  }

  const productIds = new Set<number>();
  const items = value.items.map((item: unknown) => {
    if (!isRecord(item)) {
      throw new BadRequestException('Invalid order item');
    }

    const productId = item.productId;
    if (
      typeof productId !== 'number' ||
      !Number.isInteger(productId) ||
      productId < 1 ||
      productId > MAX_PRODUCT_ID
    ) {
      throw new BadRequestException('Product ID must be a positive integer');
    }

    const quantity = item.quantity;
    if (
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      throw new BadRequestException(
        `Quantity must be an integer between 1 and ${MAX_QUANTITY}`,
      );
    }

    if (productIds.has(productId)) {
      throw new BadRequestException('Duplicate products are not allowed');
    }
    productIds.add(productId);

    const expectedUnitPrice = item.expectedUnitPrice;
    if (
      expectedUnitPrice !== undefined &&
      (typeof expectedUnitPrice !== 'number' ||
        !Number.isInteger(expectedUnitPrice) ||
        expectedUnitPrice < 0 ||
        expectedUnitPrice > MAX_PRODUCT_ID)
    ) {
      throw new BadRequestException(
        'Expected unit price must be a non-negative integer',
      );
    }
    return {
      productId,
      quantity,
      ...(expectedUnitPrice === undefined
        ? {}
        : { expectedUnitPrice: expectedUnitPrice as number }),
    };
  });

  return {
    recipientPhone,
    deliveryType,
    paymentMethod,
    address: value.address.trim(),
    comment:
      typeof value.comment === 'string' ? value.comment.trim() : undefined,
    idempotencyKey:
      typeof value.idempotencyKey === 'string'
        ? value.idempotencyKey.toLowerCase()
        : undefined,
    items,
  };
}
