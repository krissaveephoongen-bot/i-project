"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Layout,
  Breadcrumb,
  Input,
  Avatar,
  Dropdown,
  Space,
  Button,
  Tooltip,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useAuth } from "./AuthProvider";
import { useSidebar } from "./SidebarContext";
import { useWalkthrough } from "./walkthrough/WalkthroughProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import NotificationCenter from "./NotificationCenter";
import { createClient as createBrowserSupabase } from "@/utils/supabase/client";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Crumb = { label: string; href?: string };

const PAGE_LABELS: Record<string, string> = {
  "": "Dashboard",
  projects: "Projects",
  tasks: "Tasks",
  timesheet: "Timesheet",
  expenses: "Financials",
  reports: "Reports",
  clients: "Clients",
  approvals: "Approvals",
  delivery: "Delivery",
  resources: "Resources",
  warranty: "Warranty & Support",
  staff: "Staff",
  vendor: "Vendors",
  settings: "Settings",
  help: "Help",
  admin: "Administration",
  users: "Users",
  billing: "Billing",
  sales: "Sales",
  stakeholders: "Stakeholders",
  profile: "Profile",
};

function buildBreadcrumbs(
  pathname: string,
  t: (k: string, d?: string) => string,
): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0)
    return [{ label: t("navigation.dashboard", "Dashboard"), href: "/" }];

  const crumbs: Crumb[] = [];
  let running = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    running += `/${seg}`;

    // Skip UUID-like segments (they get replaced by dynamic crumbs)
    if (/^[0-9a-f-]{36}$/i.test(seg) || /^[a-z]+-[0-9]{3,}$/i.test(seg)) {
      crumbs.push({ label: seg, href: running });
      continue;
    }

    const label =
      PAGE_LABELS[seg] ??
      seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    crumbs.push({
      label,
      href: i < segments.length - 1 ? running : undefined,
    });
  }

  return crumbs;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  title?: string;
  breadcrumbs?: Crumb[];
  onMobileMenuToggle?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Header({
  title,
  breadcrumbs: propBreadcrumbs,
  onMobileMenuToggle,
}: HeaderProps) {
  const { t } = useTranslation();
  const { toggleMobile } = useSidebar?.() ?? {};
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { start } = useWalkthrough?.() ?? {};

  const [searchValue, setSearchValue] = useState("");
  const [dynamicCrumbs, setDynamicCrumbs] = useState<Crumb[] | null>(null);

  const autoCrumbs =
    propBreadcrumbs && propBreadcrumbs.length > 0
      ? propBreadcrumbs
      : buildBreadcrumbs(pathname, t);

  const showBackButton =
    pathname !== "/" &&
    pathname !== "/projects" &&
    pathname.split("/").filter(Boolean).length > 1;

  // ── Dynamic breadcrumbs from DB ───────────────────────────────────────────
  useEffect(() => {
    setDynamicCrumbs(null);
    const supabase = createBrowserSupabase();
    const matchProject = pathname.match(/^\/projects\/([^/]+)/);
    const matchClient = pathname.match(/^\/clients\/([^/]+)/);

    const fetchName = async () => {
      if (matchProject) {
        const id = decodeURIComponent(matchProject[1]);
        const segs = pathname.split("/").filter(Boolean);
        const { data: pj } = await supabase
          .from("projects")
          .select("name")
          .eq("id", id)
          .single();
        if (!pj?.name) return;

        const crumbs: Crumb[] = [
          { label: t("navigation.projects", "Projects"), href: "/projects" },
          { label: pj.name, href: `/projects/${id}` },
        ];

        if (segs[2]) {
          const section = segs[2];
          const sectionMap: Record<string, string> = {
            overview: "Overview",
            milestones: "Milestones",
            tasks: "Tasks",
            documents: "Documents",
            budget: "Budget",
            "cost-sheet": "Cost Sheet",
            closure: "Closure",
            risks: "Risks",
            team: "Team",
          };
          crumbs.push({
            label: sectionMap[section] ?? section,
            href: `/projects/${id}/${section}`,
          });

          if (segs[3] && segs[3] !== "new") {
            const subId = decodeURIComponent(segs[3]);
            const tableMap: Record<
              string,
              { table: string; nameFields: string[] }
            > = {
              milestones: {
                table: "milestones",
                nameFields: ["title", "name"],
              },
              tasks: { table: "tasks", nameFields: ["title", "name"] },
              documents: { table: "documents", nameFields: ["title", "name"] },
              risks: { table: "risks", nameFields: ["title", "name"] },
            };
            const cfg = tableMap[section];
            if (cfg) {
              const { data: row } = await supabase
                .from(cfg.table)
                .select(cfg.nameFields.join(","))
                .eq("id", subId)
                .single();
              const disp = (row as any)?.title ?? (row as any)?.name;
              if (disp) crumbs.push({ label: disp });
            }
            if (segs[4] === "edit") crumbs.push({ label: "Edit" });
          }
        }

        setDynamicCrumbs(crumbs);
        return;
      }

      if (matchClient) {
        const id = decodeURIComponent(matchClient[1]);
        const { data } = await supabase
          .from("clients")
          .select("name")
          .eq("id", id)
          .single();
        if (data?.name) {
          setDynamicCrumbs([
            { label: t("navigation.clients", "Clients"), href: "/clients" },
            { label: data.name },
          ]);
        }
      }
    };

    fetchName();
  }, [pathname, t]);

  const crumbsToRender =
    dynamicCrumbs && dynamicCrumbs.length > 0 ? dynamicCrumbs : autoCrumbs;

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/projects?search=${encodeURIComponent(value.trim())}`);
      setSearchValue("");
    }
  };

  // ── User dropdown menu ────────────────────────────────────────────────────
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const avatarSrc =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? "User")}&background=4f46e5&color=fff&size=64`;

  const userMenuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <Text strong style={{ display: "block", fontSize: 14 }}>
            {user?.name ?? "User"}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email ?? ""}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "settings",
      label: t("navigation.settings", "Settings"),
      icon: <SettingOutlined />,
      onClick: () => router.push("/settings"),
    },
    {
      key: "profile",
      label: t("navigation.profile", "Profile"),
      icon: <UserOutlined />,
      onClick: () => router.push("/profile"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: (
        <span style={{ color: "#ef4444" }}>
          {t("navigation.logout", "Logout")}
        </span>
      ),
      icon: <LogoutOutlined style={{ color: "#ef4444" }} />,
      onClick: async () => {
        await signOut();
        router.push("/login");
      },
    },
  ];

  // ── Breadcrumb items for Ant Design ──────────────────────────────────────
  const antdBreadcrumbItems = [
    {
      key: "home",
      title: (
        <a
          href="/"
          style={{ color: "inherit", display: "flex", alignItems: "center" }}
          aria-label="Home"
        >
          <HomeOutlined style={{ fontSize: 14 }} />
        </a>
      ),
    },
    ...crumbsToRender.map((crumb, idx) => ({
      key: `crumb-${idx}`,
      title: crumb.href ? (
        <a
          href={crumb.href}
          style={{
            color: idx === crumbsToRender.length - 1 ? "#1e293b" : "#64748b",
            fontWeight: idx === crumbsToRender.length - 1 ? 600 : 400,
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
            verticalAlign: "bottom",
          }}
          title={crumb.label}
        >
          {crumb.label}
        </a>
      ) : (
        <span
          style={{
            color: "#1e293b",
            fontWeight: 600,
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
            verticalAlign: "bottom",
          }}
          title={crumb.label}
          aria-current="page"
        >
          {crumb.label}
        </span>
      ),
    })),
  ];

  return (
    <AntHeader
      role="banner"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 260,
        height: 64,
        padding: "0 24px",
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 40,
        transition: "left 0.3s",
      }}
      className="portal-header"
    >
      {/* ── Left: Hamburger · Back · Breadcrumbs ─────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          minWidth: 0,
          flex: 1,
        }}
      >
        {/* Mobile hamburger */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMobileMenuToggle ?? toggleMobile}
          aria-label="Open menu"
          style={{
            display: "none",
            color: "#64748b",
            flexShrink: 0,
          }}
          className="mobile-menu-btn"
        />

        {/* Back button — visible on deep routes */}
        {showBackButton && (
          <Tooltip title="Go back">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              size="small"
              style={{
                color: "#94a3b8",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
              }}
            />
          </Tooltip>
        )}

        {/* Breadcrumbs */}
        {crumbsToRender && crumbsToRender.length > 0 ? (
          <Breadcrumb
            items={antdBreadcrumbItems}
            style={{ fontSize: 13, flexShrink: 1, minWidth: 0 }}
          />
        ) : title ? (
          <Text strong style={{ fontSize: 15, color: "#1e293b" }}>
            {title}
          </Text>
        ) : null}
      </div>

      {/* ── Right: Tour · Search · Language · Theme · Notifications · User ── */}
      <Space size={8} style={{ flexShrink: 0, marginLeft: 16 }}>
        {/* Tour / Help pill */}
        {start && (
          <Tooltip title={t("navigation.tour", "Product Tour")}>
            <Button
              type="default"
              icon={<StarOutlined />}
              onClick={start}
              size="small"
              style={{
                borderColor: "#e0e7ff",
                color: "#4f46e5",
                background: "#eef2ff",
                borderRadius: 999,
                fontWeight: 500,
                fontSize: 12,
                padding: "0 12px",
                height: 28,
              }}
              className="hidden-mobile"
            >
              {t("navigation.tour", "Tour")}
            </Button>
          </Tooltip>
        )}

        {/* Global Search */}
        <Input
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          placeholder={t("navigation.search", "Search...")}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onPressEnter={() => handleSearch(searchValue)}
          style={{
            width: 220,
            borderRadius: 8,
            background: "#f8fafc",
            borderColor: "#e2e8f0",
            fontSize: 13,
          }}
          allowClear
          className="hidden-mobile"
        />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter />

        {/* User Avatar + Dropdown */}
        {user && (
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 8,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "0.8")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
              }
              aria-label="User menu"
            >
              <Avatar
                size={36}
                src={avatarSrc}
                style={{
                  background: "#4f46e5",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </Avatar>
            </button>
          </Dropdown>
        )}
      </Space>

      {/* ── Responsive styles ─────────────────────────────────────────────── */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .portal-header {
            left: 0 !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .hidden-mobile {
            display: none !important;
          }
        }
      `}</style>
    </AntHeader>
  );
}
