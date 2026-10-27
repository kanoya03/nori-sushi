import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { getCurrentUser, type AuthUser } from "../api/authApi";
import { ApiError, setUnauthorizedHandler } from "../api/client";

const ACCESS_TOKEN_KEY = "accessToken";
type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isRestoring: boolean;
  restoreError: boolean;
  setAuth: (accessToken: string, user: AuthUser) => Promise<void>;
  setUser: (user: AuthUser) => void;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => {
  let generation = 0;
  let restoreController: AbortController | null = null;
  let writes: Promise<void> = Promise.resolve();
  const persist = (operation: () => Promise<void>) => {
    const pending = writes.then(operation);
    writes = pending.catch(() => undefined);
    return pending;
  };
  const supersede = () => {
    restoreController?.abort();
    restoreController = null;
    return ++generation;
  };
  return {
    user: null,
    accessToken: null,
    isRestoring: true,
    restoreError: false,
    setUser: (user) => set({ user }),
    setAuth: async (accessToken, user) => {
      const version = supersede();
      await persist(() =>
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      );
      if (version === generation)
        set({ accessToken, user, isRestoring: false, restoreError: false });
    },
    restoreSession: async () => {
      if (restoreController) return;
      const version = ++generation;
      const controller = new AbortController();
      restoreController = controller;
      set({ isRestoring: true, restoreError: false });
      try {
        await writes;
        const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (version !== generation) return;
        if (!token) {
          set({ accessToken: null, user: null });
          return;
        }
        const user = await getCurrentUser(token, controller.signal);
        if (version === generation) set({ accessToken: token, user });
      } catch (error) {
        if (version !== generation || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          try {
            await persist(() => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY));
            if (version === generation)
              set({ accessToken: null, user: null, restoreError: false });
          } catch {
            if (version === generation)
              set({ accessToken: null, user: null, restoreError: true });
          }
        } else {
          // Keep the saved token and any known user on offline/timeout/5xx.
          set({ restoreError: true });
        }
      } finally {
        if (version === generation) set({ isRestoring: false });
        if (restoreController === controller) restoreController = null;
      }
    },
    logout: async () => {
      const version = supersede();
      try {
        await persist(() => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY));
      } finally {
        if (version === generation)
          set({
            accessToken: null,
            user: null,
            isRestoring: false,
            restoreError: false,
          });
      }
    },
  };
});

setUnauthorizedHandler((token) => {
  if (useAuthStore.getState().accessToken === token) {
    void useAuthStore
      .getState()
      .logout()
      .catch(() => undefined);
  }
});
