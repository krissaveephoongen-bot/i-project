import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { getAppNavigation } from "@/app/navigation/config";
import type { NavSection } from "@/app/navigation/types";

/**
 * Hook for managing navigation
 * Provides role-based filtering and active route detection
 */
export function useNavigation(t?: (key: string, def?: string) => string) {
    const pathname = usePathname() ?? "";
    const { user } = useAuth() || {};
    const userRole = user?.role || "member";

    // Memoize navigation structure filtered by user role
    const navigation = useMemo(() => {
        const defaultTranslate = (key: string, def?: string) => def || key;
        const translate = t || defaultTranslate;

        const allNavigation = getAppNavigation(translate);

        return allNavigation.map(section => ({
            ...section,
            items: section.items.filter(item => item.roles.includes(userRole))
        })).filter(section => section.items.length > 0);
    }, [userRole, t]);

    /**
     * Check if a route is currently active
     * @param href - The route href to check
     * @returns true if the route matches the current pathname
     */
    const useIsActive = (href?: string): boolean => {
        if (!href) return false;
        return pathname === href || (href !== "/" && pathname.startsWith(href));
    };

    return {
        navigation,
        userRole,
        pathname,
        useIsActive,
    };
}
