import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Users,
  Settings,
  BarChart3,
  CheckSquare,
  FileText,
  Briefcase,
  UserCheck,
  CreditCard,
  Activity,
  Server,
  Database
} from "lucide-react";

export type NavChild = {
  nameKey?: string;
  name?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type NavItem = {
  nameKey?: string;
  name?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<"admin" | "manager" | "member">;
  children?: NavChild[];
};

export type NavSection = {
  titleKey?: string;
  title?: string;
  items: NavItem[];
};

export function getAppNavigation(t: (key: string, def?: string) => string): NavSection[] {
  return [
    {
      title: t("navigation.analytics", "ANALYTICS"),
      items: [
        { name: t("navigation.dashboard"), href: "/", icon: LayoutDashboard, roles: ["admin", "manager", "member"] },
        { name: t("navigation.reports"), href: "/reports", icon: BarChart3, roles: ["admin", "manager"] },
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
            { name: t("navigation.allProjects", "All Projects"), href: "/projects", icon: FolderKanban },
            { name: "Weekly Activities", href: "/projects/weekly-activities", icon: Calendar },
          ],
        },
        { name: t("navigation.clients"), href: "/clients", icon: Users, roles: ["admin", "manager"] },
        { name: t("navigation.tasks"), href: "/tasks", icon: CheckSquare, roles: ["admin", "manager", "member"] },
        { name: t("navigation.timesheet"), href: "/timesheet", icon: Calendar, roles: ["admin", "manager", "member"] },
        {
          name: t("navigation.expenses"),
          href: "/expenses",
          icon: CreditCard,
          roles: ["admin", "manager", "member"],
          children: [
            { name: "All Expenses", href: "/expenses", icon: CreditCard },
            { name: "Memo Expenses", href: "/expenses/memo", icon: FileText },
            { name: "Travel Expenses", href: "/expenses/travel", icon: FolderKanban },
            { name: "Vendor Items", href: "/expenses/vendor-items", icon: FileText },
            { name: "Vendor Payments", href: "/expenses/vendor-payments", icon: CreditCard },
          ],
        },
        { name: t("navigation.sales"), href: "/sales", icon: FolderKanban, roles: ["admin", "manager"] },
        { 
          name: t("navigation.approvals"), 
          href: "/approvals", 
          icon: UserCheck, 
          roles: ["admin", "manager"] 
        },
        { name: t("navigation.stakeholders"), href: "/stakeholders", icon: Users, roles: ["admin", "manager"] },
        { name: "Resources", href: "/resources", icon: Users, roles: ["admin", "manager"] },
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
            { name: "Overview", href: "/admin", icon: LayoutDashboard },
            { name: t("navigation.users"), href: "/admin/users", icon: Users },
            { name: "Project Assignment", href: "/admin/project-assign", icon: Users },
            { name: "Timesheet Management", href: "/admin/timesheets", icon: Calendar },
            { name: "Vendors", href: "/admin/vendors", icon: Users },
            { name: "ประเภทกิจกรรม", href: "/admin/activities", icon: FileText },
            { name: "Cost Codes", href: "/admin/cost-codes", icon: FileText },
            { name: "System Health", href: "/admin/health", icon: Activity },
          ],
        },
      ],
    },
  ];
}

export function getAdminMenu() {
  return [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Assignments", href: "/admin/project-assign", icon: Briefcase },
    { label: "Timesheets", href: "/admin/timesheets", icon: Calendar },
    { label: "Vendors", href: "/admin/vendors", icon: Users },
    { label: "System Health", href: "/admin/health", icon: Server },
    { label: "Dev Tools", href: "/admin", icon: Database }, // Point to dashboard where tools are
  ];
}
