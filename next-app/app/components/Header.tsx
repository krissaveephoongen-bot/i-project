'use client';

import {
  Search,
  ChevronRight,
  Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ title, breadcrumbs }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-[260px] right-0 h-[64px] bg-background border-b border-border flex items-center justify-between px-6 z-40">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <>
            <a href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Home className="w-4 h-4" />
            </a>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                {crumb.href ? (
                  <a href={crumb.href} className="text-muted-foreground hover:text-foreground">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </div>
            ))}
          </>
        ) : (
          <span className="text-foreground font-medium">{title}</span>
        )}
      </div>

      {/* Right: Search, Language, Notifications */}
      <div className="flex items-center gap-4">
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('navigation.search')}
            className="w-72 pl-10 pr-4 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter />
      </div>
    </header>
  );
}
