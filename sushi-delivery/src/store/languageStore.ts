import { create } from 'zustand';

import * as SecureStore
  from 'expo-secure-store';

import i18n, {
  getSystemLanguage,
  type AppLanguage,
} from '../i18n';

const LANGUAGE_KEY =
  'appLanguage';

type LanguageState = {
  language: AppLanguage;

  isRestoring:
    boolean;

  restoreLanguage:
    () => Promise<void>;

  setLanguage: (
    language: AppLanguage
  ) => Promise<void>;
};

const isAppLanguage = (
  value: string | null
): value is AppLanguage => {
  return (
    value === 'ru' ||
    value === 'en'
  );
};

export const useLanguageStore =
  create<LanguageState>(
    (set) => ({
      language:
        getSystemLanguage(),

      isRestoring: true,

      restoreLanguage:
        async () => {
          try {
            const storedLanguage =
              await SecureStore
                .getItemAsync(
                  LANGUAGE_KEY
                );

            const language =
              isAppLanguage(
                storedLanguage
              )
                ? storedLanguage
                : getSystemLanguage();

            await i18n
              .changeLanguage(
                language
              );

            set({
              language,
            });
          } catch (error) {
            console.error(
              'Failed to restore language:',
              error
            );

            const language =
              getSystemLanguage();

            await i18n
              .changeLanguage(
                language
              );

            set({
              language,
            });
          } finally {
            set({
              isRestoring:
                false,
            });
          }
        },

      setLanguage:
        async (
          language
        ) => {
          await SecureStore
            .setItemAsync(
              LANGUAGE_KEY,
              language
            );

          await i18n
            .changeLanguage(
              language
            );

          set({
            language,
          });
        },
    })
  );