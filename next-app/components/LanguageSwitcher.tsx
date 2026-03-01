"use client";

import { useLanguage } from "@/lib/hooks/useLanguage";
import { LANGUAGES } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface LanguageSwitcherProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showLabel?: boolean;
}

/**
 * Enhanced Language switcher component
 * - Toggles between English and Thai
 * - Updates HTML lang attribute for accessibility
 * - Applies Thai-specific date/time formatting
 * - Triggers i18n and locale context updates
 */
export function LanguageSwitcher({
  variant = "outline",
  size = "sm",
  showLabel = false,
}: LanguageSwitcherProps) {
  const { language, setLanguage, isLoading, isThaiLanguage } = useLanguage();

  // Update HTML lang attribute and locale-specific formatting on language change
  useEffect(() => {
    if (!isLoading && typeof document !== "undefined") {
      document.documentElement.lang = language;

      // Set locale for Intl API (date/number formatting)
      const locale = isThaiLanguage ? "th-TH" : "en-US";

      // Apply Thai-specific styles if needed
      if (isThaiLanguage) {
        document.documentElement.classList.add("lang-thai");
        document.documentElement.classList.remove("lang-english");
      } else {
        document.documentElement.classList.add("lang-english");
        document.documentElement.classList.remove("lang-thai");
      }
    }
  }, [language, isLoading, isThaiLanguage]);

  const handleLanguageChange = (newLanguage: "en" | "th") => {
    setLanguage(newLanguage);

    // Dispatch custom event for any components listening to language changes
    window.dispatchEvent(
      new CustomEvent("languageChange", {
        detail: {
          language: newLanguage,
          isThaiLanguage: newLanguage === LANGUAGES.TH,
        },
      }),
    );
  };

  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        aria-label="Loading language selector"
      >
        ...
      </Button>
    );
  }

  return (
    <div className="flex gap-1" role="group" aria-label="Language selector">
      <Button
        variant={language === LANGUAGES.EN ? "default" : variant}
        size={size}
        onClick={() => handleLanguageChange("en")}
        aria-pressed={language === LANGUAGES.EN}
        aria-label="Switch to English"
        title="Switch to English"
      >
        {showLabel ? "English" : "EN"}
      </Button>
      <Button
        variant={language === LANGUAGES.TH ? "default" : variant}
        size={size}
        onClick={() => handleLanguageChange("th")}
        aria-pressed={language === LANGUAGES.TH}
        aria-label="เปลี่ยนเป็นภาษาไทย"
        title="เปลี่ยนเป็นภาษาไทย"
      >
        {showLabel ? "ไทย" : "TH"}
      </Button>
    </div>
  );
}
