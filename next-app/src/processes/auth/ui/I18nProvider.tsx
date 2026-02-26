"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations = {
  en: {
    "dashboard.title": "Dashboard",
    "projects.title": "Projects",
    "users.title": "Users",
    "settings.title": "Settings",
    "auth.login": "Login",
    "auth.logout": "Logout",
  },
  th: {
    "dashboard.title": "แดชบอร์ด",
    "projects.title": "โปรเจค",
    "users.title": "ผู้ใช้",
    "settings.title": "การตั้งค่า",
    "auth.login": "เข้าสู่ระบบ",
    "auth.logout": "ออกจากระบบ",
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en");

  const t = (key: string): string => {
    return (
      translations[language as keyof typeof translations]?.[
        key as keyof typeof translations.en
      ] || key
    );
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
