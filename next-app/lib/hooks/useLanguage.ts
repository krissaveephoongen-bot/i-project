'use client';

import { useState, useCallback, useEffect } from 'react';
import { LANGUAGES } from '../config';

type Language = 'en' | 'th';

/**
 * Hook for managing language preference
 * - Stores preference in localStorage with sync across tabs
 * - Integrates with i18n for translations
 * - Manages locale context for date/number formatting
 * - Provides Thai-specific helpers
 */
export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(LANGUAGES.EN as Language);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount and listen for storage changes across tabs
  useEffect(() => {
    const initializeLanguage = () => {
      const stored = localStorage.getItem('app-language');
      if (stored === LANGUAGES.EN || stored === LANGUAGES.TH) {
        setLanguageState(stored as Language);
      } else {
        // Default to English, or detect from browser locale if needed
        const browserLang = navigator.language.split('-')[0];
        const defaultLang = browserLang === 'th' ? LANGUAGES.TH : LANGUAGES.EN;
        setLanguageState(defaultLang as Language);
      }
      setIsLoading(false);
    };

    initializeLanguage();

    // Listen for storage changes across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-language' && (e.newValue === LANGUAGES.EN || e.newValue === LANGUAGES.TH)) {
        setLanguageState(e.newValue as Language);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    // Validate language
    if (lang !== LANGUAGES.EN && lang !== LANGUAGES.TH) {
      console.warn(`Invalid language: ${lang}`);
      return;
    }

    setLanguageState(lang);
    localStorage.setItem('app-language', lang);

    // Update document lang attribute for accessibility
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }

    // Update locale for Intl API (date/number formatting)
    const locale = lang === LANGUAGES.TH ? 'th-TH' : 'en-US';
    
    // Store locale info in session storage for other components
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('app-locale', locale);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === LANGUAGES.EN ? (LANGUAGES.TH as Language) : (LANGUAGES.EN as Language);
    setLanguage(newLang);
  }, [language, setLanguage]);

  // Helper to get locale string for Intl API
  const getLocale = useCallback(() => {
    return language === LANGUAGES.TH ? 'th-TH' : 'en-US';
  }, [language]);

  // Helper to format date in current language locale
  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const locale = language === LANGUAGES.TH ? 'th-TH' : 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(date);
  }, [language]);

  // Helper to format number in current language locale
  const formatNumber = useCallback((num: number, options?: Intl.NumberFormatOptions): string => {
    const locale = language === LANGUAGES.TH ? 'th-TH' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(num);
  }, [language]);

  // Helper to format currency in current language locale
  const formatCurrency = useCallback((amount: number, currency: string = 'THB'): string => {
    const locale = language === LANGUAGES.TH ? 'th-TH' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [language]);

  const isThaiLanguage = language === LANGUAGES.TH;
  const isEnglish = language === LANGUAGES.EN;

  return {
    language,
    setLanguage,
    toggleLanguage,
    isThaiLanguage,
    isEnglish,
    isLoading,
    // New helpers for locale formatting
    getLocale,
    formatDate,
    formatNumber,
    formatCurrency,
  };
}
