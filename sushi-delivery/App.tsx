import {
  useEffect,
} from 'react';

import {
  AppNavigator,
} from './src/navigation/AppNavigator';

import {
  useAuthStore,
} from './src/store/authStore';

import {
  useFavoritesStore,
} from './src/store/favoritesStore';

import {
  useAddressStore,
} from './src/store/addressStore';

import {
  useLanguageStore,
} from './src/store/languageStore';

import {
  getAddresses,
} from './src/api/addressesApi';

export default function App() {
  const restoreSession =
    useAuthStore(
      (state) =>
        state.restoreSession
    );

  const accessToken =
    useAuthStore(
      (state) =>
        state.accessToken
    );

  const authIsRestoring =
    useAuthStore(
      (state) =>
        state.isRestoring
    );

  const loadFavorites =
    useFavoritesStore(
      (state) =>
        state.loadFavorites
    );

  const clearFavorites =
    useFavoritesStore(
      (state) =>
        state.clearFavorites
    );

  const setCurrentAddress =
    useAddressStore(
      (state) =>
        state.setCurrentAddress
    );

  const clearCurrentAddress =
    useAddressStore(
      (state) =>
        state.clearCurrentAddress
    );

  const restoreLanguage =
    useLanguageStore(
      (state) =>
        state.restoreLanguage
    );

  const languageIsRestoring =
    useLanguageStore(
      (state) =>
        state.isRestoring
    );

  useEffect(() => {
    void restoreLanguage();
  }, [
    restoreLanguage,
  ]);

  useEffect(() => {
    void restoreSession();
  }, [
    restoreSession,
  ]);

  useEffect(() => {
    if (
      authIsRestoring
    ) {
      return;
    }

    if (accessToken) {
      void loadFavorites(
        accessToken
      );
    } else {
      clearFavorites();
    }
  }, [
    accessToken,
    authIsRestoring,
    loadFavorites,
    clearFavorites,
  ]);

  useEffect(() => {
    const restoreAddress =
      async () => {
        if (
          authIsRestoring
        ) {
          return;
        }

        if (!accessToken) {
          clearCurrentAddress();

          return;
        }

        try {
          const addresses =
            await getAddresses(
              accessToken
            );

          const currentAddress =
            addresses.find(
              (address) =>
                address.isDefault
            );

          if (currentAddress) {
            setCurrentAddress(
              currentAddress
            );
          } else {
            clearCurrentAddress();
          }
        } catch (error) {
          console.error(
            'Failed to restore address:',
            error
          );
        }
      };

    void restoreAddress();
  }, [
    accessToken,
    authIsRestoring,
    setCurrentAddress,
    clearCurrentAddress,
  ]);

  if (
    languageIsRestoring
  ) {
    return null;
  }

  return <AppNavigator />;
}