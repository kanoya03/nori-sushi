import { create } from 'zustand';
import { ApiError, setUnauthorizedHandler } from '../api/client';
import { getCurrentUser, loginWithGoogle, verifyTelegramCode } from '../api/authApi';
import { readSessionToken, saveSessionToken } from '../lib/storage';
import { tokenExpiresAt } from '../utils/session';
import type { AuthResponse, AuthUser } from '../types/auth';
import { useFavoritesStore } from './favoritesStore';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  status: 'idle' | 'restoring' | 'guest' | 'authenticating' | 'authenticated' | 'error';
  error: 'googleFailed' | 'telegramFailed' | 'network' | null;
  expired: boolean;
  storageError: boolean;
  restore: () => Promise<void>;
  signInGoogle: (idToken: string) => Promise<void>;
  signInTelegram: (sessionToken: string, code: string) => Promise<void>;
  logout: (expired?: boolean) => void;
  expire: (token: string) => void;
};

export const useAuthStore = create<AuthState>((set, get) => {
  let generation = 0;
  const commit = ({ accessToken, user }: AuthResponse) => {
    const expiry = tokenExpiresAt(accessToken);
    if (expiry !== null && expiry <= Date.now()) {
      get().logout(true);
      return;
    }
    const persisted = saveSessionToken(accessToken);
    set({
      accessToken,
      user,
      status: 'authenticated',
      error: null,
      expired: false,
      storageError: !persisted,
    });
    useFavoritesStore.getState().setSession(accessToken);
  };
  const signIn = async (
    request: () => Promise<AuthResponse>,
    provider: 'googleFailed' | 'telegramFailed',
  ) => {
    if (get().status === 'authenticating') {
      return;
    }
    const version = ++generation;
    set({ status: 'authenticating', error: null, expired: false });
    try {
      const response = await request();
      if (version === generation) {
        commit(response);
      }
    } catch (error) {
      if (version === generation) {
        set({
          status: 'guest',
          error: error instanceof ApiError && error.status === 401 ? provider : 'network',
        });
      }
    }
  };
  return {
    user: null,
    accessToken: null,
    status: 'idle',
    error: null,
    expired: false,
    storageError: false,
    restore: async () => {
      if (!['idle', 'error'].includes(get().status)) {
        return;
      }
      const token = readSessionToken();
      if (!token) {
        set({ status: 'guest' });
        return;
      }
      const expiresAt = tokenExpiresAt(token);
      if (expiresAt !== null && expiresAt <= Date.now()) {
        get().logout(true);
        return;
      }
      const version = ++generation;
      set({ status: 'restoring', error: null });
      try {
        const user = await getCurrentUser(token);
        if (version === generation) {
          commit({ accessToken: token, user });
        }
      } catch (error) {
        if (version !== generation) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          get().logout(true);
        } else {
          set({ status: 'error', error: 'network' });
        } // Retain the saved token for a network retry.
      }
    },
    signInGoogle: (idToken) => signIn(() => loginWithGoogle(idToken), 'googleFailed'),
    signInTelegram: (sessionToken, code) =>
      signIn(() => verifyTelegramCode(sessionToken, code), 'telegramFailed'),
    logout: (expired = false) => {
      generation += 1;
      saveSessionToken(null);
      set({
        accessToken: null,
        user: null,
        status: 'guest',
        error: null,
        expired,
        storageError: false,
      });
      useFavoritesStore.getState().setSession(null);
    },
    expire: (token) => {
      if (get().accessToken === token) {
        get().logout(true);
      }
    },
  };
});

setUnauthorizedHandler((token) => useAuthStore.getState().expire(token));
