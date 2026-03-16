"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Progress,
  Typography,
  Alert,
  Space,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Skeleton,
  Badge,
  Collapse,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FolderOpenOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  DatabaseOutlined,
  AlertOutlined,
  ThunderboltOutlined,
  CheckSquareOutlined,
  ShoppingOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityEntry {
  id: string;
  action: string;
  description: string | null;
  entityType: string;
  createdAt: string;
  userName: string;
}

interface OverviewData {
  activeProjects: number;
  tasksDueToday: number;
  pendingApprovals: number;
  budgetUtilization: number;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  recentActivity: ActivityEntry[];
}

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  actual: number;
  managerName: string;
  spi: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `฿${(n / 1_000).toFixed(0)}K`;
  return `฿${n.toFixed(0)}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  active: { color: "blue", label: "Active" },
  in_progress: { color: "blue", label: "In Progress" },
  "in progress": { color: "blue", label: "In Progress" },
  done: { color: "success", label: "Done" },
  completed: { color: "success", label: "Completed" },
  on_hold: { color: "warning", label: "On Hold" },
  "on hold": { color: "warning", label: "On Hold" },
  planning: { color: "purple", label: "Planning" },
  todo: { color: "default", label: "Todo" },
  cancelled: { color: "error", label: "Cancelled" },
};

function statusTag(s: string) {
  const cfg = STATUS_TAG[s?.toLowerCase()] ?? {
    color: "default",
    label: s,
  };
  return (
    <Tag
      color={cfg.color}
      style={{ borderRadius: 999, fontSize: 11, fontWeight: 500 }}
    >
      {cfg.label}
    </Tag>
  );
}

function progressColor(pct: number): string {
  if (pct >= 80) return "#10b981";
  if (pct >= 50) return "#4f46e5";
  if (pct >= 30) return "#f59e0b";
  return "#ef4444";
}

// ─── Quick-access tile data ───────────────────────────────────────────────────

interface TileConfig {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  badge?: string;
  badgeColor?: string;
  statKey?: keyof Pick<
    OverviewData,
    "activeProjects" | "tasksDueToday" | "pendingApprovals"
  >;
  statLabel?: string;
}

const TILES: TileConfig[] = [
  {
    title: "Projects",
    description: "Manage all your projects, phases, and milestones",
    href: "/projects",
    icon: <FolderOpenOutlined />,
    color: "#4f46e5",
    bg: "#eef2ff",
    badge: "Core",
    badgeColor: "blue",
    statKey: "activeProjects",
    statLabel: "Active",
  },
  {
    title: "Tasks & Execution",
    description: "Track tasks, WBS, and project execution status",
    href: "/tasks",
    icon: <CheckSquareOutlined />,
    color: "#10b981",
    bg: "#ecfdf5",
    badge: "Tracking",
    badgeColor: "green",
    statKey: "tasksDueToday",
    statLabel: "Due Today",
  },
  {
    title: "Financials",
    description: "Monitor budgets, expenses, and cash flow",
    href: "/expenses",
    icon: <DollarOutlined />,
    color: "#f59e0b",
    bg: "#fffbeb",
    badge: "Critical",
    badgeColor: "warning",
  },
  {
    title: "Approvals",
    description: "Review and approve pending expenses and timesheets",
    href: "/approvals",
    icon: <CheckCircleOutlined />,
    color: "#f97316",
    bg: "#fff7ed",
    statKey: "pendingApprovals",
    statLabel: "Pending",
  },
  {
    title: "Timesheet",
    description: "Record and approve team time entries",
    href: "/timesheet",
    icon: <CalendarOutlined />,
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    title: "Reports & Analytics",
    description: "View insights, trends, and KPI dashboards",
    href: "/reports",
    icon: <BarChartOutlined />,
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    title: "Clients",
    description: "Manage client information and contacts",
    href: "/clients",
    icon: <TeamOutlined />,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    title: "Warranty & Support",
    description: "Manage SLA tickets and preventive maintenance",
    href: "/warranty",
    icon: <SafetyCertificateOutlined />,
    color: "#dc2626",
    bg: "#fef2f2",
  },
];

const ADMIN_TILES: TileConfig[] = [
  {
    title: "Master Data",
    description: "Manage system configurations and reference data",
    href: "/admin/master-data",
    icon: <DatabaseOutlined />,
    color: "#475569",
    bg: "#f1f5f9",
  },
  {
    title: "User Management",
    description: "Manage users, roles, and permissions",
    href: "/admin/users",
    icon: <TeamOutlined />,
    color: "#475569",
    bg: "#f1f5f9",
  },
  {
    title: "Project Assignment",
    description: "Assign users to projects and teams",
    href: "/admin/project-assign",
    icon: <DeploymentUnitOutlined />,
    color: "#475569",
    bg: "#f1f5f9",
  },
  {
    title: "System Health",
    description: "Monitor system performance and logs",
    href: "/admin/health",
    icon: <ThunderboltOutlined />,
    color: "#475569",
    bg: "#f1f5f9",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickAccessTile({
  tile,
  overview,
}: {
  tile: TileConfig;
  overview: OverviewData | null;
}) {
  const statValue = tile.statKey && overview ? overview[tile.statKey] : null;

  return (
    <Link href={tile.href} style={{ textDecoration: "none" }}>
      <Card
        hoverable
        styles={{ body: { padding: 20 } }}
        style={{
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          height: "100%",
          transition: "box-shadow 0.2s, transform 0.2s",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: tile.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 20,
              color: tile.color,
            }}
          >
            {tile.icon}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 2,
              }}
            >
              <Text
                strong
                style={{
                  fontSize: 14,
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {tile.title}
              </Text>
              {tile.badge && (
                <Tag
                  color={tile.badgeColor}
                  style={{ borderRadius: 999, fontSize: 10, fontWeight: 600 }}
                >
                  {tile.badge}
                </Tag>
              )}
            </div>
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                display: "block",
                lineHeight: "18px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tile.description}
            </Text>

            {/* Stat */}
            {statValue !== null && (
              <div style={{ marginTop: 10 }}>
                <Divider style={{ margin: "8px 0", borderColor: "#f1f5f9" }} />
                <Text style={{ fontSize: 12, color: "#64748b" }}>
                  {tile.statLabel}:{" "}
                  <Text strong style={{ color: tile.color, fontSize: 13 }}>
                    {statValue}
                  </Text>
                </Text>
              </div>
            )}
          </div>

          {/* Arrow */}
          <ArrowRightOutlined
            style={{
              color: "#cbd5e1",
              fontSize: 13,
              flexShrink: 0,
              marginTop: 4,
            }}
          />
        </div>
      </Card>
    </Link>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function PortalDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Fetch KPI overview from real API ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/overview", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: OverviewData = await res.json();
        if (!cancelled) setOverview(data);
      } catch (err: any) {
        if (!cancelled)
          setOverviewError(err?.message ?? "Failed to load KPI data");
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch recent projects from real API ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/portfolio", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rows: ProjectRow[] = (data.rows ?? [])
          .slice(0, 8)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            status: p.status ?? "todo",
            progress: Number(p.progress ?? 0),
            budget: Number(p.budget ?? 0),
            actual: Number(p.actual ?? 0),
            managerName: p.managerName ?? "Unassigned",
            spi: Number(p.spi ?? 1),
          }));
        if (!cancelled) setProjects(rows);
      } catch {
        // silently degrade
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Project table columns ─────────────────────────────────────────────────
  const projectColumns: ColumnsType<ProjectRow> = useMemo(
    () => [
      {
        title: "Project",
        dataIndex: "name",
        key: "name",
        render: (name: string, row: ProjectRow) => (
          <Link
            href={`/projects/${row.id}`}
            style={{
              color: "#0f172a",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            {name}
          </Link>
        ),
        ellipsis: true,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (s: string) => statusTag(s),
      },
      {
        title: "Progress",
        dataIndex: "progress",
        key: "progress",
        width: 180,
        render: (pct: number) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Progress
              percent={pct}
              size="small"
              strokeColor={progressColor(pct)}
              trailColor="#f1f5f9"
              showInfo={false}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Text
              style={{
                fontSize: 12,
                color: "#475569",
                minWidth: 30,
                textAlign: "right",
              }}
            >
              {pct}%
            </Text>
          </div>
        ),
      },
      {
        title: "Budget",
        dataIndex: "budget",
        key: "budget",
        width: 110,
        render: (b: number) => (
          <Text style={{ fontSize: 13, color: "#475569" }}>
            {formatCurrency(b)}
          </Text>
        ),
      },
      {
        title: "PM",
        dataIndex: "managerName",
        key: "managerName",
        width: 150,
        ellipsis: true,
        render: (name: string) => (
          <Space size={6}>
            <Avatar
              size={22}
              style={{ background: "#4f46e5", fontSize: 10, flexShrink: 0 }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>
            <Text style={{ fontSize: 12, color: "#64748b" }}>{name}</Text>
          </Space>
        ),
      },
      {
        title: "SPI",
        dataIndex: "spi",
        key: "spi",
        width: 80,
        render: (spi: number) => (
          <Tag
            color={spi >= 1 ? "success" : "error"}
            style={{ borderRadius: 999, fontSize: 11, fontWeight: 600 }}
          >
            {spi.toFixed(2)}
          </Tag>
        ),
      },
    ],
    [],
  );

  // ── Activity timeline items ────────────────────────────────────────────────
  const activityItems = useMemo(
    () =>
      (overview?.recentActivity ?? []).map((a) => ({
        key: a.id,
        dot: (
          <Avatar
            size={26}
            style={{
              background: "#eef2ff",
              color: "#4f46e5",
              fontSize: 11,
              fontWeight: 700,
              border: "none",
            }}
          >
            {a.userName.charAt(0).toUpperCase()}
          </Avatar>
        ),
        children: (
          <div style={{ paddingBottom: 4 }}>
            <Text style={{ fontSize: 13, color: "#334155" }}>
              <Text strong style={{ color: "#0f172a" }}>
                {a.userName}
              </Text>{" "}
              · {a.action?.replace(/_/g, " ")}
              {a.description && (
                <Text type="secondary"> — {a.description}</Text>
              )}
            </Text>
            <br />
            <Text
              type="secondary"
              style={{ fontSize: 11, textTransform: "capitalize" }}
            >
              {a.entityType?.replace(/_/g, " ")} · {timeAgo(a.createdAt)}
            </Text>
          </div>
        ),
      })),
    [overview?.recentActivity],
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* ── Greeting Bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "20px 32px",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
              Good morning! 👋
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Here&apos;s what&apos;s happening in your workspace today.
            </Text>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#f1f5f9",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 13,
              color: "#475569",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            <CalendarOutlined style={{ color: "#94a3b8" }} />
            {today}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* ── Error banner ─────────────────────────────────────────────── */}
        {overviewError && (
          <Alert
            type="error"
            showIcon
            message="Could not load KPI data"
            description={overviewError}
            closable
          />
        )}

        {/* ── KPI Statistics ───────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {/* Active Projects */}
          <Col xs={12} sm={12} lg={6}>
            <Card
              styles={{ body: { padding: 20 } }}
              style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 18,
                    color: "#2563eb",
                  }}
                >
                  <FolderOpenOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  {overviewLoading ? (
                    <Skeleton.Input active size="small" style={{ width: 60 }} />
                  ) : (
                    <Statistic
                      value={overview?.activeProjects ?? 0}
                      valueStyle={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#0f172a",
                        lineHeight: 1,
                      }}
                    />
                  )}
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, marginTop: 4, display: "block" }}
                  >
                    Active Projects
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Tasks Due Today */}
          <Col xs={12} sm={12} lg={6}>
            <Card
              styles={{ body: { padding: 20 } }}
              style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "#fffbeb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 18,
                    color: "#d97706",
                  }}
                >
                  <ClockCircleOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  {overviewLoading ? (
                    <Skeleton.Input active size="small" style={{ width: 60 }} />
                  ) : (
                    <Statistic
                      value={overview?.tasksDueToday ?? 0}
                      valueStyle={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#0f172a",
                        lineHeight: 1,
                      }}
                    />
                  )}
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, marginTop: 4, display: "block" }}
                  >
                    Tasks Due Today
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Pending Approvals */}
          <Col xs={12} sm={12} lg={6}>
            <Card
              styles={{ body: { padding: 20 } }}
              style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "#fff7ed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 18,
                    color: "#ea580c",
                  }}
                >
                  <AlertOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  {overviewLoading ? (
                    <Skeleton.Input active size="small" style={{ width: 60 }} />
                  ) : (
                    <Statistic
                      value={overview?.pendingApprovals ?? 0}
                      valueStyle={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#0f172a",
                        lineHeight: 1,
                      }}
                    />
                  )}
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, marginTop: 4, display: "block" }}
                  >
                    Pending Approvals
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Budget Utilization */}
          <Col xs={12} sm={12} lg={6}>
            <Card
              styles={{ body: { padding: 20 } }}
              style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "#ecfdf5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 18,
                    color: "#059669",
                  }}
                >
                  <RiseOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  {overviewLoading ? (
                    <Skeleton.Input active size="small" style={{ width: 60 }} />
                  ) : (
                    <Statistic
                      value={overview?.budgetUtilization ?? 0}
                      suffix="%"
                      valueStyle={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#0f172a",
                        lineHeight: 1,
                      }}
                    />
                  )}
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, marginTop: 4, display: "block" }}
                  >
                    Budget Utilization
                  </Text>
                  {!overviewLoading && overview && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        display: "block",
                      }}
                    >
                      {formatCurrency(overview.totalSpent)} of{" "}
                      {formatCurrency(overview.totalBudget)}
                    </Text>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* ── Middle: Quick Access + Activity ──────────────────────────────── */}
        <Row gutter={[24, 24]}>
          {/* Quick Access (2/3 width) */}
          <Col xs={24} xl={16}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Title level={5} style={{ margin: 0, color: "#0f172a" }}>
                Quick Access
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Navigate to any module
              </Text>
            </div>
            <Row gutter={[12, 12]}>
              {TILES.map((tile) => (
                <Col key={tile.href} xs={24} sm={12} style={{ minWidth: 0 }}>
                  <QuickAccessTile tile={tile} overview={overview} />
                </Col>
              ))}
            </Row>
          </Col>

          {/* Recent Activity (1/3 width) */}
          <Col xs={24} xl={8}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Title level={5} style={{ margin: 0, color: "#0f172a" }}>
                Recent Activity
              </Title>
              <ClockCircleOutlined style={{ color: "#94a3b8" }} />
            </div>
            <Card
              styles={{ body: { padding: "16px 20px" } }}
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                height: "calc(100% - 40px)",
              }}
            >
              {overviewLoading ? (
                <Space direction="vertical" style={{ width: "100%" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <Skeleton.Avatar active size={26} />
                      <div style={{ flex: 1 }}>
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: "80%", marginBottom: 6 }}
                          block
                        />
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: "50%" }}
                          block
                        />
                      </div>
                    </div>
                  ))}
                </Space>
              ) : activityItems.length > 0 ? (
                <div>
                  {(overview?.recentActivity ?? []).map((a, idx) => (
                    <div
                      key={a.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        paddingBlock: 10,
                        borderBottom:
                          idx < (overview?.recentActivity ?? []).length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                      }}
                    >
                      <Avatar
                        size={26}
                        style={{
                          background: "#eef2ff",
                          color: "#4f46e5",
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {a.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#334155",
                            display: "block",
                          }}
                        >
                          <Text strong style={{ color: "#0f172a" }}>
                            {a.userName}
                          </Text>{" "}
                          · {a.action?.replace(/_/g, " ")}
                          {a.description && (
                            <Text type="secondary"> — {a.description}</Text>
                          )}
                        </Text>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 11,
                            textTransform: "capitalize",
                            display: "block",
                            marginTop: 2,
                          }}
                        >
                          {a.entityType?.replace(/_/g, " ")} ·{" "}
                          {timeAgo(a.createdAt)}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      No recent activity
                    </Text>
                  }
                  style={{ padding: "24px 0" }}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* ── Active Projects Table ─────────────────────────────────────────── */}
        {(projectsLoading || projects.length > 0) && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Title level={5} style={{ margin: 0, color: "#0f172a" }}>
                Active Projects
              </Title>
              <Link href="/projects" style={{ textDecoration: "none" }}>
                <Button
                  type="link"
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  style={{ color: "#4f46e5", fontWeight: 500, padding: 0 }}
                >
                  View all
                </Button>
              </Link>
            </div>
            <Card
              styles={{ body: { padding: 0 } }}
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              <Table<ProjectRow>
                columns={projectColumns}
                dataSource={projects}
                rowKey="id"
                loading={projectsLoading}
                pagination={false}
                size="middle"
                onRow={(record) => ({
                  style: { cursor: "pointer" },
                  onClick: () => {
                    window.location.href = `/projects/${record.id}`;
                  },
                })}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No active projects"
                      style={{ padding: "24px 0" }}
                    />
                  ),
                }}
              />
            </Card>
          </div>
        )}

        {/* ── Administration (collapsible) ──────────────────────────────────── */}
        <Collapse
          ghost
          style={{
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
          items={[
            {
              key: "admin",
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    <SettingOutlined />
                  </div>
                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 14,
                        color: "#0f172a",
                        display: "block",
                      }}
                    >
                      Administration
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Users, data, permissions, system health
                    </Text>
                  </div>
                </div>
              ),
              children: (
                <Row gutter={[12, 12]} style={{ padding: "4px 0 8px" }}>
                  {ADMIN_TILES.map((tile) => (
                    <Col key={tile.href} xs={24} sm={12} lg={6}>
                      <QuickAccessTile tile={tile} overview={null} />
                    </Col>
                  ))}
                </Row>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
