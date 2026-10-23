import { create } from 'zustand';
import i18n, { type AppLanguage } from '../i18n';
import { saveLanguage } from '../i18n/language';

type LanguageState = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: i18n.language === 'ru' ? 'ru' : 'en',
  setLanguage: (language) => {
    void i18n.changeLanguage(language);
    saveLanguage(language);
    set({ language });
  },
}));
