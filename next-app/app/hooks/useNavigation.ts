"use client";

import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { getAppNavigation, canAccessMenuItem } from "@/app/navigation/config";
import type { NavSection, UserRole } from "@/app/navigation/types";

/**
 * Hook to get filtered navigation based on user role
 * @param userRole - User's current role
 * @returns Filtered navigation sections
 */
export function useNavigation(userRole: UserRole) {
  const { t } = useTranslation();

  const navigation = useMemo(() => {
    const allNav = getAppNavigation(t);

    // Filter sections and items based on user role
    return allNav
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => canAccessMenuItem(userRole, item.roles)),
      }))
      .filter((section) => section.items.length > 0);
  }, [userRole, t]);

  return navigation;
}

/**
 * Hook to check if a specific path is active
 * @param pathname - Current pathname
 * @param href - Link href to check
 * @returns true if active
 */
export function useIsActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}
