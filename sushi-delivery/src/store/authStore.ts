import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import {
  getCurrentUser,
  type AuthUser,
} from '../api/authApi';

const ACCESS_TOKEN_KEY = 'accessToken';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isRestoring: boolean;

  setAuth: (
    accessToken: string,
    user: AuthUser
  ) => Promise<void>;

  setUser: (
    user: AuthUser
  ) => void;

  restoreSession: () => Promise<void>;

  logout: () => Promise<void>;
};

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isRestoring: true,

    setAuth: async (
      accessToken,
      user
    ) => {
      await SecureStore.setItemAsync(
        ACCESS_TOKEN_KEY,
        accessToken
      );

      set({
        accessToken,
        user,
      });
    },

    setUser: (user) => {
      set({ user });
    },

    restoreSession: async () => {
      try {
        const accessToken =
          await SecureStore.getItemAsync(
            ACCESS_TOKEN_KEY
          );

        if (!accessToken) {
          set({
            accessToken: null,
            user: null,
          });

          return;
        }

        const user =
          await getCurrentUser(
            accessToken
          );

        set({
          accessToken,
          user,
        });
      } catch (error) {
        console.error(
          'Failed to restore session:',
          error
        );

        await SecureStore.deleteItemAsync(
          ACCESS_TOKEN_KEY
        );

        set({
          accessToken: null,
          user: null,
        });
      } finally {
        set({
          isRestoring: false,
        });
      }
    },

    logout: async () => {
      try {
        await SecureStore.deleteItemAsync(
          ACCESS_TOKEN_KEY
        );
      } finally {
        set({
          accessToken: null,
          user: null,
        });
      }
    },
  }));