import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Import translation files
import en from "./locales/en.json";
import th from "./locales/th.json";

const resources = {
  en: {
    translation: en,
  },
  th: {
    translation: th,
  },
};

const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  i18n.use(Backend).use(LanguageDetector);
}

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  debug: process.env.NODE_ENV === "development",

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  ...(isBrowser
    ? {
        detection: {
          order: ["localStorage", "navigator", "htmlTag"],
          caches: ["localStorage"],
        },
        backend: {
          loadPath: "/locales/{{lng}}.json",
        },
      }
    : {}),

  react: {
    useSuspense: false,
  },
});

// Sync i18n language with localStorage when app language changes
if (isBrowser) {
  // Listen to app-language storage changes (from useLanguage hook)
  window.addEventListener("storage", (e) => {
    if (
      e.key === "app-language" &&
      (e.newValue === "en" || e.newValue === "th")
    ) {
      i18n.changeLanguage(e.newValue);
      // Update HTML lang attribute
      document.documentElement.lang = e.newValue;
    }
  });

  // Initial sync on page load
  const storedLang = localStorage.getItem("app-language");
  if (storedLang === "en" || storedLang === "th") {
    i18n.changeLanguage(storedLang);
    document.documentElement.lang = storedLang;
  }
}

export default i18n;
