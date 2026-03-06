"use client";

import { Search, ChevronRight, Home, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import NotificationCenter from "./NotificationCenter";
import { useSidebar } from "./SidebarContext";

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ title, breadcrumbs }: HeaderProps) {
  const { t } = useTranslation();
  const { toggleMobile } = useSidebar();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      router.push(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-[260px] h-[64px] bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 z-40"
      role="banner"
    >
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobile}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <a
                  href="/"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label="หน้าแรก"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                </a>
              </li>
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  <ChevronRight
                    className="w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      className="text-foreground font-medium"
                      aria-current="page"
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <span className="text-foreground font-medium">{title}</span>
        )}
      </div>

      {/* Right: Search, Language, Notifications */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Global Search - hidden on small screens */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t("navigation.search")}
            aria-label={t("navigation.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="w-48 lg:w-72 pl-10 pr-4 py-2 text-sm border border-input bg-background rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
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
