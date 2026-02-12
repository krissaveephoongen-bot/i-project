import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import en from './locales/en.json';
import th from './locales/th.json';

const resources = {
  en: {
    translation: en,
  },
  th: {
    translation: th,
  },
};

const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  i18n
    .use(Backend)
    .use(LanguageDetector);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    ...(isBrowser ? {
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
      backend: {
        loadPath: '/locales/{{lng}}.json',
      },
    } : {}),

    react: {
      useSuspense: false,
    },
  });

export default i18n;
