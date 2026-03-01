"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
  Database,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/lib/hooks/useLanguage";

interface CacheStats {
  connected: boolean;
  memory: string;
  keys: string;
  hits: string;
  misses: string;
  hit_rate: string;
  error?: string;
}

interface CacheKeyInfo {
  key: string;
  ttl: number;
  size: string;
  created_at: string;
  accessed_at: string;
}

export default function CacheDashboardPage() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [keys, setKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const labels = {
    title: language === "th" ? "แดชอแผล Redis" : "Redis Cache Dashboard",
    connected: language === "th" ? "เชื่อมต่ออยู่" : "Connection Status",
    memory: language === "th" ? "การใช้งาน Memory" : "Memory Usage",
    keys: language === "th" ? "จำนวนข้อมูล" : "Cache Keys",
    hits: language === "th" ? "Cache Hits" : "Cache Hits",
    misses: language === "th" ? "Cache Misses" : "Cache Misses",
    hitRate: language === "th" ? "Hit Rate" : "Hit Rate",
    refresh: language === "th" ? "รีเฟร" : "Refresh",
    lastRefresh: language === "th" ? "รีเฟรับล่าสุดท้าย" : "Last Refresh",
    noData: language === "th" ? "ไม่มีข้อมูล" : "No Data Available",
    error: language === "th" ? "ข้อผิดพลาด" : "Error",
    cacheKeys: language === "th" ? "คีย์แคชทั้งหมด" : "Cache Keys",
    ttl: language === "th" ? "TTL (วินาที่)" : "TTL (seconds)",
    size: language === "th" ? "ขนาด (bytes)" : "Size (bytes)",
    createdAt: language === "th" ? "สร้างเมื่อ" : "Created",
    accessedAt: language === "th" ? "เข้าถึงล่าสุดท้าย" : "Last Accessed",
    refreshStats: language === "th" ? "รีเฟร้อมข้อมูล" : "Refresh Stats",
    refreshKeys: language === "th" ? "รีเฟร้อมคีย์" : "Refresh Keys",
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/redis/health");
      const data = await response.json();
      setStats(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch Redis stats:", error);
      setStats({
        connected: false,
        memory: "0B",
        keys: "0",
        hits: "0",
        misses: "0",
        hit_rate: "0%",
        error: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKeys = async () => {
    try {
      const response = await fetch("/api/redis/keys");
      const data = await response.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error("Failed to fetch Redis keys:", error);
      setKeys([]);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchKeys()]);
  };

  const formatBytes = (bytes: string) => {
    const num = parseFloat(bytes);
    if (num >= 1073741824) return (num / 1073741824).toFixed(2) + " GB";
    if (num >= 1048576) return (num / 1048576).toFixed(2) + " MB";
    if (num >= 1024) return (num / 1024).toFixed(2) + " KB";
    return bytes + " bytes";
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "unhealthy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
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
              <p className="text-slate-500 mt-1">
                {language === "th"
                  ? "ตรวจสอบสถานะการทำงาน Redis cache"
                  : "Monitor Redis cache performance and usage statistics"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {labels.refresh}
              </Button>
              <Button onClick={() => fetchKeys()} className="gap-2">
                <Database className="w-4 h-4" />
                {labels.refreshKeys}
              </Button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Connection Status */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {labels.connected}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getBadgeVariant(stats?.connected ? "healthy" : "unhealthy")}`}
                    />
                    <span
                      className={`font-semibold ${
                        stats?.connected ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stats?.connected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  {stats?.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {labels.error}: {stats.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {labels.memory}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats?.memory || "Unknown"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {stats?.connected ? "of 30 MB limit" : "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cache Performance */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {labels.hits}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats?.hits || "0"}
                  </div>
                  <div className="text-sm text-slate-500">{labels.misses}</div>
                  <div className="text-sm text-green-600 font-medium">
                    {stats?.hit_rate || "0%"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cache Keys */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {labels.keys}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900">
                    {keys.length}
                  </div>
                  <div className="text-sm text-slate-500">
                    {labels.cacheKeys}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Refresh */}
          <div className="text-center text-sm text-slate-500">
            {lastRefresh && (
              <span>
                {labels.lastRefresh}: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Detailed Cache Keys Table */}
          {keys.length > 0 && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>{labels.cacheKeys}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          {language === "th" ? "คีย์" : "Key"}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          {labels.ttl}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          {labels.size}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          {labels.createdAt}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                          {labels.accessedAt}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {keys.map((key, index) => (
                        <tr key={key} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {key}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <Badge variant="secondary">
                              {language === "th" ? "ไม่มี" : "No TTL"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <Badge variant="secondary">
                              {formatBytes("0")}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {new Date().toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {new Date().toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => fetch("/api/redis/flush")}
                  className="gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Flush All Cache
                </Button>
                <Button
                  onClick={() => fetch("/api/redis/cleanup")}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Cleanup Expired Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
