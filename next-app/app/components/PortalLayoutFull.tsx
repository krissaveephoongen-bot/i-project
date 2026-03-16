"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Layout, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import Sidebar from "./Sidebar";
import Header from "./Header";

const { Sider, Content } = Layout;

const SIDEBAR_WIDTH = 260;

interface PortalLayoutFullProps {
  children: React.ReactNode;
}

export default function PortalLayoutFull({ children }: PortalLayoutFullProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);

  // Login page — no chrome
  if (pathname === "/login" || pathname?.startsWith("/login")) {
    return <>{children}</>;
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* ── Desktop Sidebar (fixed, always visible ≥ lg) ──────────── */}
      <div
        className="hidden lg:block"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          width: desktopCollapsed ? 0 : SIDEBAR_WIDTH,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
      >
        <Sidebar
          collapsed={desktopCollapsed}
          onCollapse={setDesktopCollapsed}
        />
      </div>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────── */}
      <Drawer
        open={mobileOpen}
        onClose={closeMobile}
        placement="left"
        width={SIDEBAR_WIDTH}
        closable={false}
        className="lg:hidden"
        styles={{
          body: { padding: 0, background: "#0A0F1E" },
          mask: { backdropFilter: "blur(4px)" },
        }}
        style={{ zIndex: 1000 }}
      >
        <Sidebar isMobile onNavigate={closeMobile} />
      </Drawer>

      {/* ── Main content column ───────────────────────────────────── */}
      <Layout
        style={{
          marginLeft:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? desktopCollapsed
                ? 0
                : SIDEBAR_WIDTH
              : 0,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          background: "#f8fafc",
          minHeight: "100vh",
        }}
        className="lg:ml-[260px]"
      >
        {/* Fixed Header */}
        <Header onMobileMenuToggle={openMobile} />

        {/* Scrollable Content Area — offset by 64 px header height */}
        <Content
          id="main-content"
          tabIndex={-1}
          style={{
            marginTop: 64,
            minHeight: "calc(100vh - 64px)",
            background: "#f8fafc",
            overflow: "auto",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
