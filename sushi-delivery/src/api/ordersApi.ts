import { apiClient } from './client';

export type PaymentMethod =
  | 'CASH'
  | 'CARD_ON_DELIVERY';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type DeliveryType =
  | 'DELIVERY'
  | 'PICKUP';

export type OrderItemProduct = {
  id: number;
  name: string;
  nameEn: string | null;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  productName: string;
  unitPrice: number;

  product?:
    OrderItemProduct;
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

export type CreateOrderItem = {
  productId: number;
  quantity: number;
};

export type CreateOrderData = {
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  address?: string;
  comment?: string;
  items: CreateOrderItem[];
};

const buildGuestOrderUrl = (
  orderId: number,
  guestToken: string,
  suffix = ''
) => {
  const token =
    encodeURIComponent(
      guestToken
    );

  return `/orders/guest/${orderId}${suffix}?token=${token}`;
};

export const getOrders = (
  accessToken: string
): Promise<Order[]> => {
  return apiClient.getWithAuth<Order[]>(
    '/orders',
    accessToken
  );
};

export const getOrderById = (
  accessToken: string,
  orderId: number
): Promise<Order> => {
  return apiClient.getWithAuth<Order>(
    `/orders/${orderId}`,
    accessToken
  );
};

export const createOrder = (
  accessToken: string,
  data: CreateOrderData
): Promise<Order> => {
  return apiClient.postWithAuth<Order>(
    '/orders',
    accessToken,
    data
  );
};

export const cancelOrder = (
  accessToken: string,
  orderId: number
): Promise<Order> => {
  return apiClient.patchWithAuth<Order>(
    `/orders/${orderId}/cancel`,
    accessToken
  );
};

export const createGuestOrder = (
  data: CreateOrderData
): Promise<Order> => {
  return apiClient.post<Order>(
    '/orders/guest',
    data
  );
};

export const getGuestOrderById = (
  orderId: number,
  guestToken: string
): Promise<Order> => {
  return apiClient.get<Order>(
    buildGuestOrderUrl(
      orderId,
      guestToken
    )
  );
};

export const cancelGuestOrder = (
  orderId: number,
  guestToken: string
): Promise<Order> => {
  return apiClient.patch<Order>(
    buildGuestOrderUrl(
      orderId,
      guestToken,
      '/cancel'
    )
  );
};