import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getInitialLanguage } from './language';
import en from './locales/en';
import ru from './locales/ru';

export type { AppLanguage } from './language';

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ru: { translation: ru } },
  lng: getInitialLanguage(),
  supportedLngs: ['ru', 'en'],
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

function updateDocumentLanguage(language: string) {
  document.documentElement.lang = language;
  document.title = `NORI SUSHI — ${language === 'ru' ? 'Меню' : 'Menu'}`;
}

updateDocumentLanguage(i18n.language);
i18n.on('languageChanged', updateDocumentLanguage);

export default i18n;
