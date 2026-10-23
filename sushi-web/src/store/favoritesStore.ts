import { create } from 'zustand';
import { getFavoriteIds, addFavorite, removeFavorite } from '../api/favoritesApi';
import { readJson, writeJson } from '../lib/storage';
import { validId } from '../utils/cart';

export const GUEST_FAVORITES_KEY = 'nori-web-guest-favorites';
const readGuestIds = () => {
  const value = readJson(GUEST_FAVORITES_KEY);
  return Array.isArray(value) ? [...new Set(value.filter(validId))] : [];
};

type FavoritesState = {
  ids: number[];
  ownerToken: string | null;
  status: 'ready' | 'loading' | 'error';
  pending: number[];
  mutationError: boolean;
  storageError: boolean;
  setSession: (token: string | null) => void;
  load: () => Promise<void>;
  toggle: (id: number) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => {
  let generation = 0;
  return {
    ids: readGuestIds(),
    ownerToken: null,
    status: 'ready',
    pending: [],
    mutationError: false,
    storageError: false,
    setSession: (token) => {
      generation += 1; // Ignore all in-flight results belonging to the previous session.
      set({
        ownerToken: token,
        ids: token ? [] : readGuestIds(),
        status: 'ready',
        pending: [],
        mutationError: false,
        storageError: false,
      });
      if (token) {
        void get().load();
      }
    },
    load: async () => {
      const { ownerToken, status, pending } = get();
      if (!ownerToken || status === 'loading' || pending.length) {
        return;
      }
      const version = generation;
      set({ status: 'loading', mutationError: false });
      try {
        const ids = await getFavoriteIds(ownerToken);
        if (version === generation) {
          set({ ids, status: 'ready' });
        }
      } catch {
        if (version === generation) {
          set({ status: 'error' });
        }
      }
    },
    toggle: async (id) => {
      const { ids, ownerToken, pending, status } = get();
      if (!validId(id) || pending.includes(id) || status !== 'ready') {
        return;
      }
      const version = generation;
      const removing = ids.includes(id);
      const next = (current: number[]) =>
        removing
          ? current.filter((value) => value !== id)
          : [id, ...current.filter((value) => value !== id)];
      if (!ownerToken) {
        const updated = next(ids);
        set({ ids: updated, storageError: !writeJson(GUEST_FAVORITES_KEY, updated) });
        return;
      }
      set({ pending: [...pending, id], mutationError: false });
      try {
        if (removing) {
          await removeFavorite(id, ownerToken);
        } else {
          await addFavorite(id, ownerToken);
        }
        if (version === generation) {
          set({ ids: next(get().ids) });
        }
      } catch {
        if (version === generation) {
          set({ mutationError: true });
        }
      } finally {
        if (version === generation) {
          set({ pending: get().pending.filter((value) => value !== id) });
        }
      }
    },
  };
});
