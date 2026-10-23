import { apiClient, ApiError } from './client';
import { isProduct } from './productsApi';

export async function getFavoriteIds(accessToken: string): Promise<number[]> {
  const result = await apiClient.get<unknown>('/favorites', { accessToken });
  if (
    !Array.isArray(result) ||
    !result.every(
      (entry) =>
        entry &&
        typeof entry === 'object' &&
        isProduct(entry.product) &&
        entry.productId === entry.product.id,
    )
  ) {
    throw new ApiError('Invalid favorites response.', 0, 'response');
  }
  return [...new Set(result.map((entry) => entry.productId as number))];
}

export const addFavorite = (id: number, accessToken: string) =>
  apiClient.request(`/favorites/${id}`, { method: 'POST', accessToken });

export async function removeFavorite(id: number, accessToken: string) {
  try {
    await apiClient.request(`/favorites/${id}`, { method: 'DELETE', accessToken });
  } catch (error) {
    // Another client may already have removed it; the desired server state is reached.
    if (!(error instanceof ApiError && error.status === 404)) {
      throw error;
    }
  }
}
