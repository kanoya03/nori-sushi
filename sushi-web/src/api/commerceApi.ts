import { apiClient } from './client';
import type { Address, AddressInput, CreateOrderInput, Order } from '../types/commerce';

export const getAddresses = (token: string, signal?: AbortSignal) =>
  apiClient.get<Address[]>('/addresses', { accessToken: token, signal });
export const createAddress = (token: string, data: AddressInput) =>
  apiClient.request<Address>('/addresses', { method: 'POST', accessToken: token, body: data });
export const updateAddress = (token: string, id: number, data: AddressInput) =>
  apiClient.request<Address>(`/addresses/${id}`, {
    method: 'PATCH',
    accessToken: token,
    body: data,
  });

export const getOrders = (token: string, signal?: AbortSignal) =>
  apiClient.get<Order[]>('/orders', { accessToken: token, signal });
export const getOrder = (token: string, id: number, signal?: AbortSignal) =>
  apiClient.get<Order>(`/orders/${id}`, { accessToken: token, signal });
export const createOrder = (token: string, data: CreateOrderInput, signal?: AbortSignal) =>
  apiClient.request<Order>('/orders', { method: 'POST', accessToken: token, body: data, signal });
export const cancelOrder = (token: string, id: number) =>
  apiClient.request<Order>(`/orders/${id}/cancel`, { method: 'PATCH', accessToken: token });
export const createGuestOrder = (data: CreateOrderInput, signal?: AbortSignal) =>
  apiClient.request<Order>('/orders/guest', { method: 'POST', body: data, signal });
export const getGuestOrder = (id: number, token: string, signal?: AbortSignal) =>
  apiClient.get<Order>(`/orders/guest/${id}?token=${encodeURIComponent(token)}`, { signal });
export const cancelGuestOrder = (id: number, token: string) =>
  apiClient.request<Order>(`/orders/guest/${id}/cancel?token=${encodeURIComponent(token)}`, {
    method: 'PATCH',
  });
