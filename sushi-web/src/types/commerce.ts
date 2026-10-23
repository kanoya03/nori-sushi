export type DeliveryType = 'DELIVERY' | 'PICKUP';
export type PaymentMethod = 'CASH' | 'CARD_ON_DELIVERY';
export type OrderStatus =
  'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export type Address = {
  id: number;
  city: string;
  street: string;
  house: string;
  apartment: string | null;
  entrance: string | null;
  floor: string | null;
  comment: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressInput = {
  city: string;
  street: string;
  house: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  productName: string;
  unitPrice: number;
  product?: { id: number; name: string; nameEn: string | null } | null;
};

export type Order = {
  id: number;
  userId: number | null;
  guestToken?: string | null;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  address: string | null;
  comment: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  address: string;
  comment?: string;
  items: Array<{ productId: number; quantity: number }>;
};
