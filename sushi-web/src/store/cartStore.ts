import { create } from 'zustand';
import { readJson, writeJson } from '../lib/storage';
import { addToCart, decrementCart, readCart, type CartEntry } from '../utils/cart';

export const CART_KEY = 'nori-web-cart';
type CartState = {
  entries: CartEntry[];
  storageError: boolean;
  add: (productId: number, quantity?: number) => void;
  decrease: (productId: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set, get) => {
  const save = (entries: CartEntry[]) =>
    set({ entries, storageError: !writeJson(CART_KEY, entries) });
  return {
    entries: readCart(readJson(CART_KEY)),
    storageError: false,
    add: (id, quantity = 1) => save(addToCart(get().entries, id, quantity)),
    decrease: (id) => save(decrementCart(get().entries, id)),
    remove: (id) => save(get().entries.filter((entry) => entry.productId !== id)),
    clear: () => save([]),
  };
});
