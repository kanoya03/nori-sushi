import {
  apiClient,
} from './client';

export type Category = {
  id: number;

  name: string;
  nameEn: string | null;

  slug: string;
};

export const getCategories =
  (): Promise<Category[]> => {
    return apiClient.get<Category[]>(
      '/categories'
    );
  };