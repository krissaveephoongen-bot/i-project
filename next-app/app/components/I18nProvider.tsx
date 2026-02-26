"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import "../lib/i18n";

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    // Initialize i18n when component mounts
    const initI18n = async () => {
      if (!i18n.isInitialized) {
        await i18n.init();
      }
    };

    initI18n();
  }, [i18n]);

  return <>{children}</>;
}
