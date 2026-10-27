import { apiClient, ApiError } from './client';

import {
  mapApiProduct,
  type ApiProduct,
} from './productMapper';

import type { Product } from '../types/product';

export const getProducts =
  async (signal?: AbortSignal): Promise<Product[]> => {
    const products =
      await apiClient.get<ApiProduct[]>(
        '/products', { signal }
      );

    if (!Array.isArray(products) || products.some((product) => !product || !Number.isSafeInteger(product.id) || !Number.isSafeInteger(product.price) || product.price < 0 || !product.category || typeof product.name !== 'string')) {
      throw new ApiError('Invalid products response.', 0, undefined, 'response');
    }
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
