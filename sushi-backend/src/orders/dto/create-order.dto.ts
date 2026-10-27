export class CreateOrderItemDto {
  productId: number;
  quantity: number;
  expectedUnitPrice?: number;
}

export class CreateOrderDto {
  recipientPhone: string;
  deliveryType:
    | 'DELIVERY'
    | 'PICKUP';

  paymentMethod:
    | 'CASH'
    | 'CARD_ON_DELIVERY';

  address?: string;

  comment?: string;

  idempotencyKey?: string;

  items:
    CreateOrderItemDto[];
}
