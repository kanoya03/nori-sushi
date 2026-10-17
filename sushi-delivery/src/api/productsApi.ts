import { apiClient } from './client';

import {
  mapApiProduct,
  type ApiProduct,
} from './productMapper';

import type { Product } from '../types/product';

export const getProducts =
  async (): Promise<Product[]> => {
    const products =
      await apiClient.get<ApiProduct[]>(
        '/products'
      );

    return products.map(
      mapApiProduct
    );
  };

export const getProductById = async (
  id: number
): Promise<Product> => {
  const product =
    await apiClient.get<ApiProduct>(
      `/products/${id}`
    );

  return mapApiProduct(
    product
  );
};