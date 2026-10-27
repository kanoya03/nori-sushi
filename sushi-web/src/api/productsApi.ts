import { apiClient, ApiError } from './client';
import { isCategory } from './categoriesApi';
import { mapApiProduct, type ApiProduct } from './productMapper';
import type { Product } from '../types/product';

export function isProduct(value: unknown): value is ApiProduct {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const product = value as Record<string, unknown>;
  return (
    typeof product.id === 'number' &&
    typeof product.name === 'string' &&
    (product.nameEn === null || typeof product.nameEn === 'string') &&
    typeof product.description === 'string' &&
    (product.descriptionEn === null || typeof product.descriptionEn === 'string') &&
    typeof product.price === 'number' &&
    Number.isFinite(product.price) &&
    typeof product.weight === 'string' &&
    typeof product.imageUrl === 'string' &&
    typeof product.categoryId === 'number' &&
    isCategory(product.category)
  );
}

export async function getProductById(id: number, signal?: AbortSignal): Promise<Product> {
  const product = await apiClient.get<unknown>(`/products/${id}`, { signal });
  if (!isProduct(product)) {
    throw new ApiError('Invalid product response.', 0, 'response');
  }
  return mapApiProduct(product);
}

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  const products = await apiClient.get<unknown>('/products', { signal });
  if (!Array.isArray(products) || !products.every(isProduct)) {
    throw new ApiError('Invalid products response.', 0, 'response');
  }
  return products.map(mapApiProduct);
}
