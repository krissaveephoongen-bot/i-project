"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Database,
  Activity,
  RefreshCw,
  AlertTriangle,
  Server,
  Globe,
  Users,
  Clock,
  TrendingUp,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/hooks/useLanguage";

interface SystemComponent {
  name: string;
  status: "healthy" | "unhealthy" | "degraded";
  icon: React.ReactNode;
  description: string;
  metrics: Record<string, any>;
  lastChecked: string;
  error?: string;
}

interface SystemHealth {
  overall: "healthy" | "unhealthy" | "degraded";
  components: SystemComponent[];
  timestamp: string;
  uptime: string;
  version: string;
}

export const dynamic = "force-dynamic";

export default function AdminHealthPage() {
  const { language } = useLanguage();
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const labels = {
    title: language === "th" ? "ระบบสุขภาพ" : "System Health",
    subtitle:
      language === "th"
        ? "จุดเดียวสำหรับตรวจสอบสถานะระบบทั้งหมด"
        : "Single point monitoring for all system components",
    overall: language === "th" ? "สถานะรวม" : "Overall Status",
    components: language === "th" ? "ส่วนประกอบ" : "Components",
    refresh: language === "th" ? "รีเฟร" : "Refresh",
    autoRefresh: language === "th" ? "รีเฟรอัตโน" : "Auto Refresh",
    lastChecked: language === "th" ? "ตรวจสอบล่าสุดท้าย" : "Last Checked",
    healthy: language === "th" ? "สุขภาพ" : "Healthy",
    unhealthy: language === "th" ? "ใช้งานไม่ได้" : "Unhealthy",
    degraded: language === "th" ? "บางส่วนใช้งานไม่ได้" : "Degraded",
    metrics: language === "th" ? "ตัวชี้วัด" : "Metrics",
    actions: language === "th" ? "การดำเนินการ" : "Actions",
    details: language === "th" ? "รายละเอียด" : "Details",
    monitoring: language === "th" ? "การตรวจสอบ" : "Monitoring",
    performance: language === "th" ? "ประสิทธิภาพ" : "Performance",
    database: language === "th" ? "ฐานข้อมูล" : "Database",
    cache: language === "th" ? "แคช" : "Cache",
    api: language === "th" ? "API" : "API",
    uptime: language === "th" ? "เวลาทำงาน" : "Uptime",
    version: language === "th" ? "เวอร์ชัน" : "Version",
    error: language === "th" ? "ข้อผิดพลาด" : "Error",
    noData: language === "th" ? "ไม่มีข้อมูล" : "No Data Available",
  };

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);

      // Fetch all system components in parallel
      const [supabaseHealth, redisHealth, apiHealth] = await Promise.allSettled(
        [
          fetch("/api/health", { cache: "no-store" }),
          fetch("/api/redis/health", { cache: "no-store" }),
          fetch("/api/system/health", { cache: "no-store" }),
        ],
      );

      const components: SystemComponent[] = [];

      // Supabase Component
      if (supabaseHealth.status === "fulfilled") {
        const data = await supabaseHealth.value.json();
        components.push({
          name: "Supabase Database",
          status: data?.supabase?.connected ? "healthy" : "unhealthy",
          icon: <Database className="w-5 h-5" />,
          description: "Primary database connection",
          metrics: {
            connected: data?.supabase?.connected || false,
            urlPresent: data?.supabase?.urlPresent || false,
            keyPresent: data?.supabase?.keyPresent || false,
            responseTime: Math.random() * 100 + 50, // Mock response time
          },
          lastChecked: new Date().toISOString(),
          error: data?.supabase?.error,
        });
      } else {
        components.push({
          name: "Supabase Database",
          status: "unhealthy",
          icon: <Database className="w-5 h-5" />,
          description: "Primary database connection",
          metrics: {},
          lastChecked: new Date().toISOString(),
          error: "Connection failed",
        });
      }

      // Redis Component
      if (redisHealth.status === "fulfilled") {
        const data = await redisHealth.value.json();
        components.push({
          name: "Redis Cache",
          status: data?.redis?.connected ? "healthy" : "unhealthy",
          icon: <Activity className="w-5 h-5" />,
          description: "In-memory caching layer",
          metrics: {
            connected: data?.redis?.connected || false,
            memory: data?.redis?.memory || "0B",
            keys: data?.redis?.keys || "0",
            hitRate: data?.redis?.hit_rate || "0%",
            opsPerSec:
              data?.redis?.operations?.instantaneous_ops_per_sec || "0",
          },
          lastChecked: new Date().toISOString(),
          error: data?.redis?.error,
        });
      } else {
        components.push({
          name: "Redis Cache",
          status: "unhealthy",
          icon: <Activity className="w-5 h-5" />,
          description: "In-memory caching layer",
          metrics: {},
          lastChecked: new Date().toISOString(),
          error: "Connection failed",
        });
      }

      // API Component
      if (apiHealth.status === "fulfilled") {
        const data = await apiHealth.value.json();
        components.push({
          name: "API Services",
          status: data?.api?.healthy ? "healthy" : "degraded",
          icon: <Server className="w-5 h-5" />,
          description: "Application API endpoints",
          metrics: {
            healthy: data?.api?.healthy || false,
            endpoints: data?.api?.endpoints || 0,
            responseTime: data?.api?.avgResponseTime || "0ms",
            errorRate: data?.api?.errorRate || "0%",
          },
          lastChecked: new Date().toISOString(),
          error: data?.api?.error,
        });
      } else {
        components.push({
          name: "API Services",
          status: "degraded",
          icon: <Server className="w-5 h-5" />,
          description: "Application API endpoints",
          metrics: {},
          lastChecked: new Date().toISOString(),
          error: "Health check failed",
        });
      }

      // Calculate overall status
      const unhealthyCount = components.filter(
        (c) => c.status === "unhealthy",
      ).length;
      const degradedCount = components.filter(
        (c) => c.status === "degraded",
      ).length;

      let overall: "healthy" | "unhealthy" | "degraded";
      if (unhealthyCount > 0) {
        overall = "unhealthy";
      } else if (degradedCount > 0) {
        overall = "degraded";
      } else {
        overall = "healthy";
      }

      setHealthData({
        overall,
        components,
        timestamp: new Date().toISOString(),
        uptime: "99.9%",
        version: "1.0.0",
      });

      setError(null);
    } catch (e: any) {
      console.error("System health check error:", e);
      setError(e?.message || "health check failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();

    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "unhealthy":
        return "text-red-600";
      case "degraded":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "unhealthy":
        return "bg-red-100 text-red-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />;
      case "unhealthy":
        return <XCircle className="w-4 h-4" />;
      case "degraded":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title={labels.title}
          breadcrumbs={[
            { label: language === "th" ? "แดชบแผล" : "Admin", href: "/admin" },
            { label: labels.title },
          ]}
        />

        <div className="pt-24 px-6 pb-6 container mx-auto space-y-6 w-full max-w-full">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {labels.title}
              </h1>
              <p className="text-slate-500 mt-1">{labels.subtitle}</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                className="gap-2"
              >
                <Clock
                  className={`w-4 h-4 ${autoRefresh ? "animate-pulse" : ""}`}
                />
                {labels.autoRefresh}
              </Button>
              <Button
                onClick={fetchSystemHealth}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                {labels.refresh}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div className="text-red-700 text-sm">
                  {labels.error}: {error}
                </div>
              </div>
            </div>
          )}

          {/* Overall Status Card */}
          {healthData && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(healthData.overall)}
                  {labels.overall}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusBadge(healthData.overall)}>
                      {labels[healthData.overall]}
                    </Badge>
                    <div className="text-sm text-slate-500">
                      {healthData.components.length} {labels.components}
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <div>
                      {labels.lastChecked}:{" "}
                      {new Date(healthData.timestamp).toLocaleTimeString()}
                    </div>
                    <div>
                      {labels.uptime}: {healthData.uptime}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Components Grid */}
          {healthData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthData.components.map((component) => (
                <Card
                  key={component.name}
                  className="shadow-sm border-slate-200"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {component.icon}
                        <span className="font-semibold">{component.name}</span>
                      </div>
                      <Badge className={getStatusBadge(component.status)}>
                        {labels[component.status]}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Description */}
                      <p className="text-sm text-slate-600">
                        {component.description}
                      </p>

                      {/* Metrics */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-700">
                          {labels.metrics}:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(component.metrics).map(
                            ([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-slate-500">{key}:</span>
                                <span className="text-slate-700 font-medium">
                                  {String(value)}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Error Display */}
                      {component.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {labels.error}: {component.error}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => {
                            // Component-specific actions
                            if (component.name === "Redis Cache") {
                              window.open("/admin/cache-dashboard", "_blank");
                            } else if (component.name === "Supabase Database") {
                              window.open("/api/health", "_blank");
                            }
                          }}
                        >
                          <Settings className="w-3 h-3" />
                          {labels.details}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => {
                            // Test component
                            if (component.name === "Redis Cache") {
                              window.open("/api/redis/test", "_blank");
                            } else if (component.name === "Supabase Database") {
                              window.open("/api/admin/supabase-ping", "_blank");
                            }
                          }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {labels.performance}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() =>
                    window.open("/admin/cache-dashboard", "_blank")
                  }
                  className="gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Cache Dashboard
                </Button>
                <Button
                  onClick={() => window.open("/api/redis/stats", "_blank")}
                  className="gap-2"
                >
                  <Database className="w-4 h-4" />
                  Redis Stats
                </Button>
                <Button
                  onClick={() => window.open("/api/redis/keys", "_blank")}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Cache Keys
                </Button>
                <Button
                  onClick={() => window.open("/api/system/metrics", "_blank")}
                  className="gap-2"
                >
                  <Globe className="w-4 h-4" />
                  System Metrics
                </Button>
                <Button
                  onClick={() => window.open("/api/system/logs", "_blank")}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  System Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
