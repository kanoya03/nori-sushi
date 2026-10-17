import { apiClient } from './client';

import {
  mapApiProduct,
  type ApiProduct,
} from './productMapper';

import type { Product } from '../types/product';

type ApiFavorite = {
  id: number;
  productId: number;
  product: ApiProduct;
};

export const getFavorites = async (
  accessToken: string
): Promise<Product[]> => {
  const favorites =
    await apiClient.getWithAuth<
      ApiFavorite[]
    >(
      '/favorites',
      accessToken
    );

  return favorites.map(
    ({ product }) =>
      mapApiProduct(product)
  );
};

export const addFavorite = (
  productId: number,
  accessToken: string
): Promise<void> => {
  return apiClient.postWithAuth<void>(
    `/favorites/${productId}`,
    accessToken
  );
};

export const removeFavorite = (
  productId: number,
  accessToken: string
): Promise<void> => {
  return apiClient.deleteWithAuth<void>(
    `/favorites/${productId}`,
    accessToken
  );
};