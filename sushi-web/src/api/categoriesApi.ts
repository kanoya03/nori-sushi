import { apiClient, ApiError } from './client';

export type Category = {
  id: number;
  name: string;
  nameEn: string | null;
  slug: string;
};

export function isCategory(value: unknown): value is Category {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const category = value as Record<string, unknown>;
  return (
    typeof category.id === 'number' &&
    typeof category.name === 'string' &&
    (category.nameEn === null || typeof category.nameEn === 'string') &&
    typeof category.slug === 'string'
  );
}

export async function getCategories(): Promise<Category[]> {
  const categories = await apiClient.get<unknown>('/categories');
  if (!Array.isArray(categories) || !categories.every(isCategory)) {
    throw new ApiError('Invalid categories response.', 0, 'response');
  }
  return categories;
}
