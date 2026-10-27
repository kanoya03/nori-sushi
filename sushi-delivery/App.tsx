import {
  useEffect,
} from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const restoreError = useAuthStore((state) => state.restoreError);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
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
      authIsRestoring || restoreError
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
    restoreError,
    loadFavorites,
    clearFavorites,
  ]);

  useEffect(() => {
    const restoreAddress =
      async () => {
        if (
          authIsRestoring || restoreError
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
    restoreError,
    setCurrentAddress,
    clearCurrentAddress,
  ]);

  if (
    languageIsRestoring
  ) {
    return null;
  }

  if (!user && (authIsRestoring || restoreError)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 28, gap: 20, backgroundColor: '#fff' }}>
        {authIsRestoring ? <>
          <ActivityIndicator size="large" color="#111" />
          <Text>{t('auth.restoringSession')}</Text>
        </> : <>
          <Text accessibilityRole="alert">{t('auth.restoreError')}</Text>
          <Pressable onPress={() => void restoreSession()} style={{ padding: 16, borderRadius: 12, backgroundColor: '#111' }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>{t('auth.retrySession')}</Text>
          </Pressable>
          <Pressable onPress={() => void logout().catch(() => undefined)} style={{ padding: 16 }}>
            <Text style={{ textAlign: 'center' }}>{t('auth.continueAsGuest')}</Text>
          </Pressable>
        </>}
      </View>
    );
  }
  return <AppNavigator />;
}
