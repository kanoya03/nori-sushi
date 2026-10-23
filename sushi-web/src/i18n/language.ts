export type AppLanguage = 'ru' | 'en';

const LANGUAGE_KEY = 'nori-web-language';

export function getInitialLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === 'ru' || stored === 'en') {
      return stored;
    }
  } catch {
    // Private browsing can disable storage; language switching still works.
  }
  return navigator.language.toLowerCase().split('-')[0] === 'ru' ? 'ru' : 'en';
}

export function saveLanguage(language: AppLanguage) {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Persistence is optional; do not block the in-memory preference.
  }
}
