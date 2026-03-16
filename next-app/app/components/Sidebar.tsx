"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Layout, Menu, Avatar, Divider, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  LogoutOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAuth } from "./AuthProvider";
import { useNavigation } from "@/hooks/useNavigation";
import type { NavSection } from "@/app/navigation/types";

const { Sider } = Layout;
const { Text } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a Lucide/React component to a sized React element for Ant Design menus */
function navIcon(
  IconComponent: React.ComponentType<{ className?: string }>,
): React.ReactNode {
  return <IconComponent className="w-[17px] h-[17px] flex-shrink-0" />;
}

/** Build Ant Design menu items from our NavSection[] structure */
function buildMenuItems(
  sections: NavSection[],
): NonNullable<MenuProps["items"]> {
  const items: NonNullable<MenuProps["items"]> = [];

  sections.forEach((section, idx) => {
    if (idx > 0) {
      items.push({ type: "divider", key: `divider-${idx}` });
    }

    // Section group label
    if (section.title) {
      items.push({
        type: "group",
        key: `group-${section.title}`,
        label: (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#475569",
              userSelect: "none",
            }}
          >
            {section.title}
          </span>
        ),
        children: section.items.map((item) => {
          const itemKey =
            item.name ?? item.nameKey ?? item.href ?? Math.random().toString();

          if (item.children && item.children.length > 0) {
            // Parent item → SubMenu
            return {
              key: itemKey,
              label: item.name ?? item.nameKey,
              icon: navIcon(item.icon),
              children: item.children.map((child) => ({
                key: child.href,
                label: child.name ?? child.nameKey,
                icon: navIcon(child.icon),
              })),
            };
          }

          // Leaf item
          return {
            key: item.href ?? itemKey,
            label: item.name ?? item.nameKey,
            icon: navIcon(item.icon),
          };
        }),
      });
    }
  });

  return items;
}

/** Derive the best-matching selectedKeys from the current pathname */
function deriveSelectedKeys(
  sections: NavSection[],
  pathname: string,
): string[] {
  let bestKey = "";
  let bestLength = 0;

  for (const section of sections) {
    for (const item of section.items) {
      // Check leaf item
      if (item.href && !item.children) {
        const match =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        if (match && item.href.length > bestLength) {
          bestKey = item.href;
          bestLength = item.href.length;
        }
      }
      // Check children
      if (item.children) {
        for (const child of item.children) {
          const match =
            pathname === child.href ||
            (child.href !== "/" && pathname.startsWith(child.href));
          if (match && child.href.length > bestLength) {
            bestKey = child.href;
            bestLength = child.href.length;
          }
        }
      }
    }
  }

  return bestKey ? [bestKey] : [];
}

/** Derive which parent submenu keys should be open based on the current pathname */
function deriveDefaultOpenKeys(
  sections: NavSection[],
  pathname: string,
): string[] {
  const keys: string[] = [];

  for (const section of sections) {
    for (const item of section.items) {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) =>
            pathname === child.href ||
            (child.href !== "/" && pathname.startsWith(child.href)),
        );
        if (hasActiveChild) {
          keys.push(item.name ?? item.nameKey ?? "");
        }
      }
    }
  }

  return keys;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Sidebar({
  isMobile = false,
  onNavigate,
  collapsed = false,
  onCollapse,
}: SidebarProps) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth() || {};
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const translate = (key: string, def?: string): string =>
    t(key, def !== undefined ? { defaultValue: def } : undefined) as string;

  const { navigation, userRole } = useNavigation(translate);

  // ── Menu items built from navigation config ───────────────────────────────
  const menuItems = useMemo(() => buildMenuItems(navigation), [navigation]);

  const selectedKeys = useMemo(
    () => deriveSelectedKeys(navigation, pathname),
    [navigation, pathname],
  );

  const defaultOpenKeys = useMemo(
    () => deriveDefaultOpenKeys(navigation, pathname),
    [navigation, pathname],
  );

  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

  // ── Navigation handler ────────────────────────────────────────────────────
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key.startsWith("/")) {
      router.push(key);
      onNavigate?.();
    }
  };

  // ── Bottom actions (settings, help, logout) ───────────────────────────────
  const bottomItems: NonNullable<MenuProps["items"]> = [
    { type: "divider", key: "divider-bottom" },
    {
      key: "/settings",
      label: t("navigation.profile", "Profile"),
      icon: <SettingOutlined />,
    },
    {
      key: "/help",
      label: t("navigation.help", "Help"),
      icon: <QuestionCircleOutlined />,
    },
    {
      key: "__logout__",
      label: (
        <span style={{ color: "#f87171" }}>
          {t("navigation.logout", "Logout")}
        </span>
      ),
      icon: <LogoutOutlined style={{ color: "#f87171" }} />,
      danger: true,
    },
  ];

  const handleBottomClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "__logout__") {
      await signOut?.();
      router.push("/login");
      return;
    }
    if (key.startsWith("/")) {
      router.push(key);
      onNavigate?.();
    }
  };

  // ── Sider styles ─────────────────────────────────────────────────────────
  const siderStyle: React.CSSProperties = {
    position: isMobile ? "relative" : "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 50,
    height: "100vh",
    overflow: "hidden",
    background: "#0A0F1E",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const avatarSrc =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? "User")}&background=4f46e5&color=fff&size=64`;

  return (
    <Sider
      width={260}
      collapsed={collapsed}
      collapsedWidth={0}
      theme="dark"
      style={siderStyle}
      trigger={null}
      breakpoint="lg"
    >
      {/* ── Right-edge separator ──────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: "0 0 0 auto",
          width: 1,
          background:
            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.07), transparent)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* ── Logo ────────────────────────────────────────── */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            paddingInline: collapsed ? 12 : 20,
            flexShrink: 0,
            gap: 12,
          }}
        >
          <Link
            href="/"
            onClick={onNavigate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
            }}
          >
            {/* Icon badge */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(79,70,229,0.4)",
                position: "relative",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                P
              </span>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
            </div>

            {/* Wordmark */}
            {!collapsed && (
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: "rgba(255,255,255,0.9)",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                i-
                <span style={{ color: "#818cf8" }}>PROJECT</span>
              </span>
            )}
          </Link>
        </div>

        {/* ── Hairline divider ─────────────────────────────── */}
        <Divider
          style={{
            margin: "0 20px",
            borderColor: "rgba(255,255,255,0.07)",
            flexShrink: 0,
            minWidth: 0,
            width: "auto",
          }}
        />

        {/* ── Main Navigation ──────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingBottom: 8,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}
        >
          <Menu
            mode="inline"
            theme="dark"
            items={menuItems}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={handleMenuClick}
            inlineCollapsed={collapsed}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 13,
              fontWeight: 500,
              paddingInline: 8,
            }}
          />
        </div>

        {/* ── Bottom Hairline ──────────────────────────────── */}
        <Divider
          style={{
            margin: "0 12px",
            borderColor: "rgba(255,255,255,0.07)",
            flexShrink: 0,
            minWidth: 0,
            width: "auto",
          }}
        />

        {/* ── Bottom Actions ───────────────────────────────── */}
        <Menu
          mode="inline"
          theme="dark"
          items={bottomItems}
          selectedKeys={[]}
          onClick={handleBottomClick}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 13,
            fontWeight: 500,
            paddingInline: 8,
            flexShrink: 0,
          }}
        />

        {/* ── User Card ────────────────────────────────────── */}
        {!collapsed && (
          <div
            style={{
              margin: "8px 12px 12px",
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            {/* Avatar with online dot */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                size={34}
                src={avatarSrc}
                style={{ background: "#4f46e5" }}
              >
                {userInitial}
              </Avatar>
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#10b981",
                  border: "1.5px solid #0A0F1E",
                }}
              />
            </div>

            {/* Name + Role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: "20px",
                }}
              >
                {user?.name ?? t("common.guest", "Guest User")}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#475569",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: "16px",
                  textTransform: "capitalize",
                  marginTop: 1,
                }}
              >
                {userRole ?? user?.role ?? t("common.noRole", "No Role")}
              </Text>
            </div>

            {/* Settings icon shortcut */}
            <Tooltip
              title={t("navigation.settings", "Settings")}
              placement="right"
            >
              <button
                onClick={() => {
                  router.push("/settings");
                  onNavigate?.();
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  color: "#475569",
                  flexShrink: 0,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = "#fff")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "#475569")
                }
                aria-label="Settings"
              >
                <SettingOutlined style={{ fontSize: 14 }} />
              </button>
            </Tooltip>
          </div>
        )}

        {/* ── Collapsed avatar ─────────────────────────────── */}
        {collapsed && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "8px 0 12px",
              flexShrink: 0,
            }}
          >
            <Tooltip title={user?.name ?? "User"} placement="right">
              <Avatar
                size={36}
                src={avatarSrc}
                style={{ background: "#4f46e5", cursor: "pointer" }}
              >
                {userInitial}
              </Avatar>
            </Tooltip>
          </div>
        )}
      </div>
    </Sider>
  );
}
