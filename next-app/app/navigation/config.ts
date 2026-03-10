import {
    LayoutDashboard,
    FolderKanban,
    Calendar,
    Users,
    Settings,
    BarChart3,
    CheckSquare,
    Briefcase,
    UserCheck,
    CreditCard,
    Activity,
    Server,
    Database,
    Truck,
    ShieldCheck,
    LifeBuoy
} from "lucide-react";

import type { NavSection, AdminMenuItem, UserRole } from "./types";
import { NAVIGATION_PATHS, SECTION_TITLES } from "./constants";

/**
 * Get main application navigation structure (Consolidated)
 * Dashboard-centric approach with context-based secondary menu
 * Filtered by user role
 */
export function getAppNavigation(t: (key: string, def?: string) => string): NavSection[] {
    return [
        {
            title: t("navigation.main", "MAIN"),
            items: [
                {
                    name: t("navigation.dashboard"),
                    href: NAVIGATION_PATHS.DASHBOARD,
                    icon: LayoutDashboard,
                    roles: ["admin", "manager", "member"]
                },
                {
                    name: t("navigation.projects"),
                    href: NAVIGATION_PATHS.PROJECTS,
                    icon: FolderKanban,
                    roles: ["admin", "manager", "member"],
                    children: [
                        { name: "All Projects", href: NAVIGATION_PATHS.PROJECTS, icon: FolderKanban },
                        { name: "Weekly Activities", href: NAVIGATION_PATHS.PROJECTS_WEEKLY, icon: Calendar },
                    ],
                },
            ],
        },
        {
            title: t("navigation.secondary", "WORKSPACE & FEATURES"),
            items: [
                {
                    name: t("navigation.tasks", "Tasks"),
                    href: NAVIGATION_PATHS.TASKS,
                    icon: CheckSquare,
                    roles: ["admin", "manager", "member"]
                },
                {
                    name: t("navigation.timesheet"),
                    href: NAVIGATION_PATHS.TIMESHEET,
                    icon: Calendar,
                    roles: ["admin", "manager", "member"]
                },
                {
                    name: t("navigation.expenses", "Financials"),
                    href: NAVIGATION_PATHS.EXPENSES,
                    icon: CreditCard,
                    roles: ["admin", "manager", "member"],
                    children: [
                        { name: "Expenses Overview", href: NAVIGATION_PATHS.EXPENSES, icon: CreditCard },
                        { name: "Vendor Payments", href: NAVIGATION_PATHS.EXPENSES_VENDOR, icon: CreditCard },
                    ],
                },
                {
                    name: t("navigation.reports"),
                    href: NAVIGATION_PATHS.REPORTS,
                    icon: BarChart3,
                    roles: ["admin", "manager"]
                },
                {
                    name: "Warranty & Support",
                    href: NAVIGATION_PATHS.WARRANTY,
                    icon: ShieldCheck,
                    roles: ["admin", "manager", "member"],
                    children: [
                        { name: "Dashboard", href: NAVIGATION_PATHS.WARRANTY, icon: LayoutDashboard },
                        { name: "SLA Tickets", href: NAVIGATION_PATHS.WARRANTY_TICKETS, icon: LifeBuoy },
                        { name: "PM Schedule", href: NAVIGATION_PATHS.WARRANTY_PM, icon: Calendar },
                    ]
                },
                {
                    name: "Clients",
                    href: NAVIGATION_PATHS.CLIENTS,
                    icon: Users,
                    roles: ["admin", "manager"]
                },
                {
                    name: "Approvals",
                    href: NAVIGATION_PATHS.APPROVALS,
                    icon: UserCheck,
                    roles: ["admin", "manager"]
                },
                {
                    name: "Delivery",
                    href: NAVIGATION_PATHS.DELIVERY,
                    icon: Truck,
                    roles: ["admin", "manager"]
                },
                {
                    name: "Resources",
                    href: NAVIGATION_PATHS.RESOURCES,
                    icon: Users,
                    roles: ["admin", "manager"]
                },
            ],
        },
        {
            title: t("navigation.admin_section", "ADMINISTRATION"),
            items: [
                {
                    name: "Master Data",
                    icon: Database,
                    roles: ["admin"],
                    href: NAVIGATION_PATHS.ADMIN_MASTER_DATA,
                },
                {
                    name: t("navigation.admin"),
                    icon: Settings,
                    roles: ["admin"],
                    children: [
                        { name: "Overview", href: NAVIGATION_PATHS.ADMIN, icon: LayoutDashboard },
                        { name: t("navigation.users"), href: NAVIGATION_PATHS.ADMIN_USERS, icon: Users },
                        { name: "Project Assignment", href: NAVIGATION_PATHS.ADMIN_ASSIGN, icon: Users },
                        { name: "Vendors", href: NAVIGATION_PATHS.ADMIN_VENDORS, icon: Users },
                        { name: "System Health", href: NAVIGATION_PATHS.ADMIN_HEALTH, icon: Activity },
                    ],
                },
            ],
        },
    ];
}

/**
 * Get admin-specific menu items from main navigation
 * Extracts admin items from the main navigation structure
 */
export function getAdminMenu(t: (key: string, def?: string) => string = (key, def) => def || key): AdminMenuItem[] {
    const allNavigation = getAppNavigation(t);
    const adminSection = allNavigation.find(section =>
        section.title?.includes("ADMIN") || section.title?.includes("ADMINISTRATION")
    );

    if (!adminSection) {
        return [];
    }

    // Flatten admin items including nested children
    const adminItems: AdminMenuItem[] = [];

    adminSection.items.forEach(item => {
        if (item.href) {
            adminItems.push({
                label: item.name || item.nameKey || "Item",
                href: item.href,
                icon: item.icon,
            });
        }

        // Add child items if they exist
        if (item.children) {
            item.children.forEach(child => {
                adminItems.push({
                    label: child.name || child.nameKey || "Item",
                    href: child.href,
                    icon: child.icon,
                });
            });
        }
    });

    return adminItems;
}

/**
 * Check if a user has permission to view a menu item
 * @param userRole - The user's role
 * @param allowedRoles - Roles that can access this item
 * @returns true if user can access
 */
export function canAccessMenuItem(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(userRole);
}
