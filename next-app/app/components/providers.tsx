// next-app/app/components/providers.tsx
"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { ConfigProvider, App as AntApp, theme as antdTheme } from "antd";

// ─── Ant Design brand theme ────────────────────────────────────────────────────
// Primary: indigo-600 (#4f46e5) matching the existing design system
const ANT_THEME: Parameters<typeof ConfigProvider>[0]["theme"] = {
  token: {
    colorPrimary: "#4f46e5",
    colorLink: "#4f46e5",
    colorLinkHover: "#4338ca",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#3b82f6",
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    lineHeight: 1.5715,
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f8fafc",
    colorBgElevated: "#ffffff",
    colorText: "#1e293b",
    colorTextSecondary: "#64748b",
    colorTextTertiary: "#94a3b8",
    colorBorder: "#e2e8f0",
    colorBorderSecondary: "#f1f5f9",
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)",
    boxShadowSecondary:
      "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)",
  },
  components: {
    // ── Layout ────────────────────────────────────────────
    Layout: {
      siderBg: "#0A0F1E",
      headerBg: "#ffffff",
      headerHeight: 64,
      headerPadding: "0 24px",
      footerBg: "#f8fafc",
      bodyBg: "#f8fafc",
      triggerBg: "#111827",
      triggerColor: "#94a3b8",
    },
    // ── Sidebar / Menu (dark theme) ───────────────────────
    Menu: {
      darkItemBg: "#0A0F1E",
      darkSubMenuItemBg: "#0d1526",
      darkItemSelectedBg: "rgba(79, 70, 229, 0.12)",
      darkItemSelectedColor: "#ffffff",
      darkItemHoverBg: "rgba(255, 255, 255, 0.06)",
      darkItemHoverColor: "#ffffff",
      darkItemColor: "#94a3b8",
      darkGroupTitleColor: "#475569",
      darkPopupBg: "#111827",
      itemHeight: 40,
      iconSize: 16,
      iconMarginInlineEnd: 12,
      subMenuItemBg: "transparent",
      groupTitleFontSize: 10,
      groupTitleLineHeight: "20px",
      collapsedIconSize: 18,
    },
    // ── Button ───────────────────────────────────────────
    Button: {
      primaryColor: "#ffffff",
      borderRadius: 8,
      defaultBorderColor: "#e2e8f0",
      defaultColor: "#374151",
      fontWeight: 500,
    },
    // ── Input / Search ────────────────────────────────────
    Input: {
      borderRadius: 8,
      paddingInline: 12,
      hoverBorderColor: "#a5b4fc",
      activeBorderColor: "#4f46e5",
      activeShadow: "0 0 0 3px rgba(79, 70, 229, 0.12)",
    },
    // ── Select ────────────────────────────────────────────
    Select: {
      borderRadius: 8,
      optionSelectedBg: "rgba(79, 70, 229, 0.08)",
      optionSelectedColor: "#4f46e5",
      selectorBg: "#ffffff",
    },
    // ── Table ─────────────────────────────────────────────
    Table: {
      borderRadius: 12,
      headerBg: "#f8fafc",
      headerColor: "#64748b",
      headerSortActiveBg: "#f1f5f9",
      headerSortHoverBg: "#f1f5f9",
      rowHoverBg: "#f8fafc",
      borderColor: "#e2e8f0",
      headerBorderRadius: 0,
      cellPaddingBlock: 14,
      cellPaddingInline: 16,
      fontSize: 14,
    },
    // ── Card ──────────────────────────────────────────────
    Card: {
      borderRadius: 12,
      boxShadowTertiary:
        "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
      headerBg: "transparent",
      paddingLG: 20,
    },
    // ── Modal ─────────────────────────────────────────────
    Modal: {
      borderRadius: 16,
      borderRadiusOuter: 16,
      contentBg: "#ffffff",
      headerBg: "#ffffff",
      footerBg: "#ffffff",
      titleFontSize: 16,
      titleColor: "#1e293b",
    },
    // ── Drawer ────────────────────────────────────────────
    Drawer: {
      colorBgElevated: "#ffffff",
      borderRadiusOuter: 0,
    },
    // ── Form ─────────────────────────────────────────────
    Form: {
      labelColor: "#374151",
      labelFontSize: 14,
      itemMarginBottom: 20,
      verticalLabelPadding: "0 0 6px",
    },
    // ── Tag ──────────────────────────────────────────────
    Tag: {
      borderRadius: 999,
      fontSizeSM: 11,
      lineHeightSM: "20px",
    },
    // ── Badge ────────────────────────────────────────────
    Badge: {
      colorBgContainer: "#4f46e5",
    },
    // ── Progress ─────────────────────────────────────────
    Progress: {
      defaultColor: "#4f46e5",
      remainingColor: "#f1f5f9",
    },
    // ── Breadcrumb ───────────────────────────────────────
    Breadcrumb: {
      itemColor: "#94a3b8",
      lastItemColor: "#1e293b",
      linkColor: "#64748b",
      linkHoverColor: "#4f46e5",
      separatorColor: "#cbd5e1",
      fontSize: 13,
    },
    // ── Dropdown ─────────────────────────────────────────
    Dropdown: {
      borderRadius: 10,
      paddingBlock: 4,
    },
    // ── Tooltip ──────────────────────────────────────────
    Tooltip: {
      borderRadius: 6,
      colorBgSpotlight: "#1e293b",
    },
    // ── Tabs ─────────────────────────────────────────────
    Tabs: {
      inkBarColor: "#4f46e5",
      itemSelectedColor: "#4f46e5",
      itemHoverColor: "#4338ca",
      itemColor: "#64748b",
      cardBg: "#f8fafc",
    },
    // ── Statistic ────────────────────────────────────────
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 28,
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    // ── Typography ────────────────────────────────────────
    Typography: {
      titleMarginTop: 0,
      titleMarginBottom: 0,
    },
    // ── Alert ────────────────────────────────────────────
    Alert: {
      borderRadius: 10,
      defaultPadding: "10px 16px",
    },
    // ── Notification / Message ────────────────────────────
    Notification: {
      borderRadius: 12,
      width: 384,
    },
    // ── Divider ──────────────────────────────────────────
    Divider: {
      colorSplit: "#f1f5f9",
    },
    // ── Avatar ────────────────────────────────────────────
    Avatar: {
      colorTextPlaceholder: "#ffffff",
      containerSize: 36,
    },
    // ── Segmented ─────────────────────────────────────────
    Segmented: {
      borderRadius: 8,
      itemSelectedBg: "#ffffff",
      trackBg: "#f1f5f9",
      itemColor: "#64748b",
      itemSelectedColor: "#1e293b",
    },
    // ── Spin ─────────────────────────────────────────────
    Spin: {
      colorPrimary: "#4f46e5",
    },
    // ── Empty ────────────────────────────────────────────
    Empty: {
      colorTextDescription: "#94a3b8",
    },
  },
};

// ─── QueryClient singleton ─────────────────────────────────────────────────────
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always new instance
    return makeQueryClient();
  }
  // Browser: reuse a single instance
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

// ─── Providers component ───────────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <ConfigProvider theme={ANT_THEME}>
        <AntApp>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: "10px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)",
                  fontSize: "14px",
                },
                success: {
                  iconTheme: { primary: "#10b981", secondary: "#fff" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "#fff" },
                },
              }}
            />
          </QueryClientProvider>
        </AntApp>
      </ConfigProvider>
    </ThemeProvider>
  );
}
