"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumb, Typography } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageContainerProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
  className?: string;
  /** Optional actions slot rendered to the right of the title */
  actions?: React.ReactNode;
}

export default function PageContainer({
  title,
  description,
  breadcrumbs,
  children,
  className = "",
  actions,
}: PageContainerProps) {
  // Build Ant Design breadcrumb items
  const antdItems = [
    {
      key: "home",
      title: (
        <Link href="/" aria-label="Home">
          <HomeOutlined style={{ fontSize: 14, color: "#94a3b8" }} />
        </Link>
      ),
    },
    ...(breadcrumbs ?? []).map((crumb, idx) => ({
      key: `crumb-${idx}`,
      title: crumb.href ? (
        <Link
          href={crumb.href}
          style={{
            color:
              idx === (breadcrumbs ?? []).length - 1 ? "#1e293b" : "#64748b",
            fontWeight: idx === (breadcrumbs ?? []).length - 1 ? 600 : 400,
          }}
        >
          {crumb.label}
        </Link>
      ) : (
        <span style={{ color: "#1e293b", fontWeight: 600 }} aria-current="page">
          {crumb.label}
        </span>
      ),
    })),
  ];

  return (
    <div
      className={className}
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Breadcrumbs bar ─────────────────────────────────────────────── */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div
          style={{
            borderBottom: "1px solid #e2e8f0",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(8px)",
            position: "sticky",
            top: 64,
            zIndex: 30,
            padding: "10px 32px",
          }}
        >
          <Breadcrumb items={antdItems} style={{ fontSize: 13 }} />
        </div>
      )}

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid #e2e8f0",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(8px)",
          padding: "24px 32px",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <Title
              level={3}
              style={{
                margin: 0,
                fontSize: "clamp(20px, 2vw, 26px)",
                color: "#0f172a",
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {title}
            </Title>
            {description && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  display: "block",
                  marginTop: 4,
                }}
              >
                {description}
              </Text>
            )}
          </div>

          {actions && (
            <div style={{ flexShrink: 0, display: "flex", gap: 8 }}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          maxWidth: 1400,
          width: "100%",
          margin: "0 auto",
          padding: "28px 32px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}
