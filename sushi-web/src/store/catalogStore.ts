import { create } from 'zustand';
import { ApiError } from '../api/client';
import { getProducts } from '../api/productsApi';
import { getCategories, type Category } from '../api/categoriesApi';
import type { Product } from '../types/product';

type CatalogState = {
  products: Product[];
  categories: Category[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: 'timeout' | 'unavailable' | null;
  load: (refresh?: boolean) => Promise<void>;
  updateProduct: (product: Product) => void;
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: [],
  categories: [],
  status: 'idle',
  error: null,
  updateProduct: (product) =>
    set({
      products: get().products.some((item) => item.id === product.id)
        ? get().products.map((item) => (item.id === product.id ? product : item))
        : [...get().products, product],
    }),
  load: async (refresh = false) => {
    // Deduplicate StrictMode mounts and navigation. Never cache catalog data in storage.
    if (get().status === 'loading' || (get().status === 'success' && !refresh)) {
      return;
    }
    set({ status: 'loading', error: null });
    try {
      const [products, categories] = await Promise.all([getProducts(), getCategories()]);
      set({ products, categories, status: 'success' });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof ApiError && error.kind === 'timeout' ? 'timeout' : 'unavailable',
      });
    }
  },
}));
