import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import type { Product } from '../types/product';

import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from '../api/favoritesApi';

const GUEST_FAVORITES_KEY =
  'guestFavorites';

type FavoritesState = {
  favorites: Product[];
  isLoading: boolean;
  guestFavoritesRestored: boolean;

  loadFavorites: (
    accessToken: string | null
  ) => Promise<void>;

  restoreGuestFavorites:
    () => Promise<void>;

  addToFavorites: (
    product: Product,
    accessToken: string | null
  ) => Promise<void>;

  removeFromFavorites: (
    productId: number,
    accessToken: string | null
  ) => Promise<void>;

  toggleFavorite: (
    product: Product,
    accessToken: string | null
  ) => Promise<void>;

  isFavorite: (
    productId: number
  ) => boolean;

  clearFavorites: () => void;
};

const saveGuestFavorites = async (
  favorites: Product[]
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(
      GUEST_FAVORITES_KEY,
      JSON.stringify(favorites)
    );
  } catch (error) {
    console.error(
      'Failed to save guest favorites:',
      error
    );
  }
};

const readGuestFavorites =
  async (): Promise<Product[]> => {
    try {
      const stored =
        await SecureStore.getItemAsync(
          GUEST_FAVORITES_KEY
        );

      if (!stored) {
        return [];
      }

      const parsed: unknown =
        JSON.parse(stored);

      return Array.isArray(parsed)
        ? (parsed as Product[])
        : [];
    } catch (error) {
      console.error(
        'Failed to restore guest favorites:',
        error
      );

      return [];
    }
  };

export const useFavoritesStore =
  create<FavoritesState>(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      guestFavoritesRestored: false,

      restoreGuestFavorites:
        async () => {
          if (
            get()
              .guestFavoritesRestored
          ) {
            return;
          }

          const favorites =
            await readGuestFavorites();

          set({
            favorites,
            guestFavoritesRestored:
              true,
          });
        },

      loadFavorites:
        async (
          accessToken
        ) => {
          if (!accessToken) {
            await get()
              .restoreGuestFavorites();

            return;
          }

          set({
            isLoading: true,

            // После выхода из аккаунта
            // гостевые favorites должны
            // загрузиться заново.
            guestFavoritesRestored:
              false,
          });

          try {
            const favorites =
              await getFavorites(
                accessToken
              );

            set({
              favorites,
            });
          } catch (error) {
            console.error(
              'Failed to load favorites:',
              error
            );
          } finally {
            set({
              isLoading: false,
            });
          }
        },

      addToFavorites:
        async (
          product,
          accessToken
        ) => {
          if (accessToken) {
            await addFavorite(
              product.id,
              accessToken
            );

            set(
              (state) => ({
                favorites: [
                  product,

                  ...state.favorites.filter(
                    (item) =>
                      item.id !==
                      product.id
                  ),
                ],
              })
            );

            return;
          }

          const nextFavorites = [
            product,

            ...get().favorites.filter(
              (item) =>
                item.id !==
                product.id
            ),
          ];

          set({
            favorites:
              nextFavorites,
          });

          await saveGuestFavorites(
            nextFavorites
          );
        },

      removeFromFavorites:
        async (
          productId,
          accessToken
        ) => {
          if (accessToken) {
            await removeFavorite(
              productId,
              accessToken
            );

            set(
              (state) => ({
                favorites:
                  state.favorites.filter(
                    (product) =>
                      product.id !==
                      productId
                  ),
              })
            );

            return;
          }

          const nextFavorites =
            get().favorites.filter(
              (product) =>
                product.id !==
                productId
            );

          set({
            favorites:
              nextFavorites,
          });

          await saveGuestFavorites(
            nextFavorites
          );
        },

      toggleFavorite:
        async (
          product,
          accessToken
        ) => {
          if (
            !accessToken &&
            !get()
              .guestFavoritesRestored
          ) {
            await get()
              .restoreGuestFavorites();
          }

          const isFavorite =
            get().isFavorite(
              product.id
            );

          if (isFavorite) {
            await get()
              .removeFromFavorites(
                product.id,
                accessToken
              );

            return;
          }

          await get()
            .addToFavorites(
              product,
              accessToken
            );
        },

      isFavorite: (
        productId
      ) => {
        return get()
          .favorites.some(
            (product) =>
              product.id ===
              productId
          );
      },

      clearFavorites: () => {
        set({
          favorites: [],
          guestFavoritesRestored:
            false,
        });
      },
    })
  );