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
  Database,
  Truck,
  ShieldCheck,
  LifeBuoy
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
      title: "OPERATIONS (LIFECYCLE)",
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
        { name: t("navigation.tasks", "Execution (Tasks)"), href: "/tasks", icon: CheckSquare, roles: ["admin", "manager", "member"] },
        { name: t("navigation.timesheet"), href: "/timesheet", icon: Calendar, roles: ["admin", "manager", "member"] },
        {
          name: t("navigation.expenses", "Financials"),
          href: "/expenses",
          icon: CreditCard,
          roles: ["admin", "manager", "member"],
          children: [
            { name: "Expenses Overview", href: "/expenses", icon: CreditCard },
            { name: "Vendor Payments", href: "/expenses/vendor-payments", icon: CreditCard },
          ],
        },
        { name: "Delivery & Cutover", href: "/delivery", icon: Truck, roles: ["admin", "manager"] },
        { 
          name: "Warranty & Support", 
          href: "/warranty", 
          icon: ShieldCheck, 
          roles: ["admin", "manager", "member"],
          children: [
            { name: "Dashboard", href: "/warranty", icon: LayoutDashboard },
            { name: "SLA Tickets", href: "/warranty/tickets", icon: LifeBuoy },
            { name: "PM Schedule", href: "/warranty/pm-schedule", icon: Calendar },
          ]
        },
      ],
    },
    {
      title: t("navigation.workspace", "WORKSPACE"),
      items: [
        { name: t("navigation.clients"), href: "/clients", icon: Users, roles: ["admin", "manager"] },
        { 
          name: t("navigation.approvals"), 
          href: "/approvals", 
          icon: UserCheck, 
          roles: ["admin", "manager"] 
        },
        { name: "Resources", href: "/resources", icon: Users, roles: ["admin", "manager"] },
      ],
    },
    {
      title: t("navigation.admin_section", "ADMINISTRATION"),
      items: [
        {
          name: "Master Data",
          icon: Database,
          roles: ["admin"],
          href: "/admin/master-data",
        },
        {
          name: t("navigation.admin"),
          icon: Settings,
          roles: ["admin"],
          children: [
            { name: "Overview", href: "/admin", icon: LayoutDashboard },
            { name: t("navigation.users"), href: "/admin/users", icon: Users },
            { name: "Project Assignment", href: "/admin/project-assign", icon: Users },
            { name: "Vendors", href: "/admin/vendors", icon: Users },
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
    { label: "Master Data", href: "/admin/master-data", icon: Database },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Assignments", href: "/admin/project-assign", icon: Briefcase },
    { label: "Vendors", href: "/admin/vendors", icon: Users },
    { label: "System Health", href: "/admin/health", icon: Server },
  ];
}
