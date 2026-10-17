export class CreateOrderItemDto {
  productId: number;
  quantity: number;
}

export class CreateOrderDto {
  deliveryType:
    | 'DELIVERY'
    | 'PICKUP';

  paymentMethod:
    | 'CASH'
    | 'CARD_ON_DELIVERY';

  address?: string;

  comment?: string;

  items:
    CreateOrderItemDto[];
}