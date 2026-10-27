import { create } from 'zustand';

import type { Product } from '../types/product';
import type { CartItem } from '../types/cart';
import { refreshCartItems } from '../utils/refreshCart';

type CartState = {
  items: CartItem[];

  addProduct: (
    product: Product
  ) => void;

  addProductWithQuantity: (
    product: Product,
    quantity: number
  ) => void;

  removeProduct: (
    productId: number
  ) => void;

  increaseQuantity: (
    productId: number
  ) => void;

  decreaseQuantity: (
    productId: number
  ) => void;

  clearCart: () => void;
  refreshProducts: (products: Product[]) => ReturnType<typeof refreshCartItems>;

  getTotalPrice: () => number;
  getTotalQuantity: () => number;
};

const addProductToItems = (
  items: CartItem[],
  product: Product,
  quantity: number
): CartItem[] => {
  if (quantity <= 0) {
    return items;
  }

  const existingItem =
    items.find(
      (item) =>
        item.product.id ===
        product.id
    );

  if (!existingItem) {
    return [
      ...items,
      {
        product,
        quantity,
      },
    ];
  }

  return items.map(
    (item) =>
      item.product.id ===
      product.id
        ? {
            ...item,
            product,
            quantity:
              item.quantity +
              quantity,
          }
        : item
  );
};

export const useCartStore =
  create<CartState>((set, get) => ({
    items: [],
    refreshProducts: (products) => {
      const result = refreshCartItems(get().items, products);
      set({ items: result.items });
      return result;
    },

    addProduct: (
      product
    ) => {
      set((state) => ({
        items:
          addProductToItems(
            state.items,
            product,
            1
          ),
      }));
    },

    addProductWithQuantity: (
      product,
      quantity
    ) => {
      set((state) => ({
        items:
          addProductToItems(
            state.items,
            product,
            quantity
          ),
      }));
    },

    removeProduct: (
      productId
    ) => {
      set((state) => ({
        items:
          state.items.filter(
            (item) =>
              item.product.id !==
              productId
          ),
      }));
    },

    increaseQuantity: (
      productId
    ) => {
      set((state) => ({
        items:
          state.items.map(
            (item) =>
              item.product.id ===
              productId
                ? {
                    ...item,
                    quantity:
                      item.quantity +
                      1,
                  }
                : item
          ),
      }));
    },

    decreaseQuantity: (
      productId
    ) => {
      set((state) => ({
        items:
          state.items
            .map(
              (item) =>
                item.product.id ===
                productId
                  ? {
                      ...item,
                      quantity:
                        item.quantity -
                        1,
                    }
                  : item
            )
            .filter(
              (item) =>
                item.quantity >
                0
            ),
      }));
    },

    clearCart: () => {
      set({
        items: [],
      });
    },

    getTotalPrice: () =>
      get().items.reduce(
        (
          total,
          item
        ) =>
          total + (item.product.isAvailable === false ? 0 : item.product.price * item.quantity),
        0
      ),

    getTotalQuantity: () =>
      get().items.reduce(
        (
          total,
          item
        ) =>
          total +
          item.quantity,
        0
      ),
  }));
