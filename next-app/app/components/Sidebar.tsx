"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Users,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  BarChart3,
  CheckSquare,
  FileText,
  Briefcase,
  UserCheck,
  CreditCard,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "./AuthProvider";

// --- Helper Components ---

interface NavItemProps {
  item: {
    name: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
    children?: {
      name: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  };
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNavigate?: () => void;
}

const NavItem = ({
  item,
  isActive,
  isExpanded,
  onToggleExpand,
  onNavigate,
}: NavItemProps) => {
  const isParent = !!item.children;
  const currentPathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (isParent) {
      e.preventDefault();
      onToggleExpand();
    } else if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <li>
      <Link
        href={item.href || "#"}
        onClick={handleClick}
        aria-expanded={isParent ? isExpanded : undefined}
        aria-current={isActive ? "page" : undefined}
        className={clsx(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive
            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
          isParent && "justify-between",
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span>{item.name}</span>
        </div>
        {isParent && (
          <ChevronDown
            className={clsx(
              "w-4 h-4 transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        )}
      </Link>
      {isParent && isExpanded && (
        <ul className="pl-7 pt-2 space-y-1" role="group">
          {item.children!.map((child) => (
            <li key={child.name}>
              <Link
                href={child.href}
                onClick={onNavigate}
                aria-current={
                  currentPathname === child.href ? "page" : undefined
                }
                className={clsx(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  currentPathname === child.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300",
                )}
              >
                <child.icon className="w-5 h-5 flex-shrink-0" />
                <span>{child.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

// --- Main Sidebar Component ---

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export default function Sidebar({
  isMobile = false,
  onNavigate,
}: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname() ?? "";
  const { user, signOut } = useAuth() || {};
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  // --- Role-based Navigation Structure ---
  const navStructure = [
    {
      title: t("navigation.analytics", "ANALYTICS"),
      items: [
        // {
        //     name: t('navigation.dashboard'),
        //     href: '/dashboard',
        //     icon: LayoutDashboard,
        //     roles: ['admin', 'manager', 'member']
        // },
        {
          name: t("navigation.reports"),
          href: "/reports",
          icon: BarChart3,
          roles: ["admin", "manager"],
        },
      ],
    },
    {
      title: t("navigation.workspace", "WORKSPACE"),
      items: [
        {
          name: t("navigation.projects"),
          href: "/projects",
          icon: FolderKanban,
          roles: ["admin", "manager", "member"],
          children: [
            {
              name: t("navigation.allProjects", "All Projects"),
              href: "/projects",
              icon: FolderKanban,
            },
            {
              name: "Weekly Activities",
              href: "/projects/weekly-activities",
              icon: Calendar,
            },
          ],
        },
        {
          name: t("navigation.clients"),
          href: "/clients",
          icon: Users,
          roles: ["admin", "manager"],
        },
        {
          name: t("navigation.tasks"),
          href: "/tasks",
          icon: CheckSquare,
          roles: ["admin", "manager", "member"],
        },
        {
          name: t("navigation.timesheet"),
          href: "/timesheet",
          icon: Calendar,
          roles: ["admin", "manager", "member"],
        },
        {
          name: t("navigation.expenses"),
          icon: CreditCard,
          roles: ["admin", "manager", "member"],
          children: [
            { name: "All Expenses", href: "/expenses", icon: CreditCard },
            { name: "Memo Expenses", href: "/expenses/memo", icon: FileText },
            {
              name: "Travel Expenses",
              href: "/expenses/travel",
              icon: FolderKanban,
            },
            {
              name: "Vendor Items",
              href: "/expenses/vendor-items",
              icon: FileText,
            },
            {
              name: "Vendor Payments",
              href: "/expenses/vendor-payments",
              icon: CreditCard,
            },
          ],
        },
        {
          name: t("navigation.sales"),
          href: "/sales",
          icon: FolderKanban,
          roles: ["admin", "manager"],
        },
        {
          name: t("navigation.approvals"),
          icon: UserCheck,
          roles: ["admin", "manager"],
          children: [
            {
              name: t("approvals.timesheets"),
              href: "/approvals/timesheets",
              icon: Calendar,
            },
            {
              name: t("approvals.expenses"),
              href: "/approvals/expenses",
              icon: Briefcase,
            },
          ],
        },
        {
          name: t("navigation.stakeholders"),
          href: "/stakeholders",
          icon: Users,
          roles: ["admin", "manager"],
        },
        {
          name: "Resources",
          href: "/resources",
          icon: Users,
          roles: ["admin", "manager"],
        },
      ],
    },
    {
      title: t("navigation.admin_section", "ADMIN"),
      items: [
        {
          name: t("navigation.admin"),
          icon: Settings,
          roles: ["admin"],
          children: [
            { name: t("navigation.users"), href: "/admin/users", icon: Users },
            {
              name: "ประเภทกิจกรรม",
              href: "/admin/activities",
              icon: FileText,
            },
            { name: "Cost Codes", href: "/admin/cost-codes", icon: FileText },
            { name: "System Health", href: "/admin/health", icon: BarChart3 },
            { name: "Vendors", href: "/admin/vendors", icon: Users },
            // { name: 'Activity Logs', href: '/admin/logs', icon: FileText }, // Hidden
          ],
        },
      ],
    },
  ];

  const handleToggleExpand = (name: string) => {
    setExpandedItems((prev: Record<string, boolean>) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const userRole = user?.role || "member";

  return (
    <aside
      className={clsx(
        "h-screen w-[260px] bg-background border-r border-border flex flex-col shadow-sm transition-colors duration-300",
        !isMobile && "fixed left-0 top-0 z-50",
      )}
      role="navigation"
      aria-label="เมนูหลัก"
    >
      {/* Logo Area */}
      <div className="h-[64px] flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            I-PROJECT
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-4 overflow-y-auto" aria-label="เมนูนำทาง">
        {navStructure.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {section.title}
            </h3>
            <ul className="space-y-1" role="list">
              {section.items
                .filter((item) => item.roles.includes(userRole))
                .map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    isActive={
                      pathname === (item.href || "") ||
                      ((item.href || "") !== "/" &&
                        pathname.startsWith(item.href || ""))
                    }
                    isExpanded={expandedItems[item.name]}
                    onToggleExpand={() => handleToggleExpand(item.name)}
                    onNavigate={onNavigate}
                  />
                ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Area */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Users className="w-5 h-5" aria-hidden="true" />
          {t("navigation.profile")}
        </Link>

        <Link
          href="/help"
          onClick={onNavigate}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HelpCircle className="w-5 h-5" aria-hidden="true" />
          {t("navigation.help")}
        </Link>

        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0284c7&color=fff`
                }
                alt={`รูปโปรไฟล์ของ ${user?.name || "ผู้ใช้"}`}
                width={40}
                height={40}
                className="rounded-full ring-2 ring-background object-cover"
                unoptimized={
                  user?.avatar?.startsWith("https://ui-avatars.com") ||
                  !user?.avatar
                }
              />
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"
                aria-label="ออนไลน์"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || t("common.guest", "Guest User")}
              </p>
              <p className="text-xs text-muted-foreground capitalize truncate">
                {user?.role || t("common.noRole", "No Role")}
              </p>
            </div>
            <Link
              href="/settings"
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label="ตั้งค่า"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="ออกจากระบบ"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          {t("navigation.logout")}
        </button>
      </div>
    </aside>
  );
}
