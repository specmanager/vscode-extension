import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import heTranslation from './locales/he.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      es: {
        translation: esTranslation,
      },
      he: {
        translation: heTranslation,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'he'],
    interpolation: {
      escapeValue: false,
    },
    debug: false,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'specmanager-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
