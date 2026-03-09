"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import {
  Users,
  CreditCard,
  Trophy,
  FileText,
  RefreshCw,
  Download,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-hot-toast";

// Widgets
import DashboardKPIs from "@/app/components/dashboard-widgets/DashboardKPIs";
import ActiveProjectsTable from "@/app/components/dashboard-widgets/ActiveProjectsTable";
import TrendChartCard from "@/app/components/dashboard-widgets/TrendChartCard";
import FinancialChartCard from "@/app/components/dashboard-widgets/FinancialChartCard";
import DashboardFilters from "@/app/components/dashboard-widgets/DashboardFilters";
import PortfolioHealthCard from "@/app/components/dashboard-widgets/PortfolioHealthCard";
import RecentActivitiesCard from "@/app/components/dashboard-widgets/RecentActivitiesCard";
import { KpiCard } from "@/app/components/dashboard-widgets/KpiCard"; // Use existing generic card

// Types
import type { 
  ProjectRow, 
  DashboardTotals, 
  FinancialData, 
  SpiTrendData,
  VendorMetrics
} from "@/app/components/dashboard-widgets/types";

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [financials, setFinancials] = useState<FinancialData[]>([]);
  const [spiTrend, setSpiTrend] = useState<SpiTrendData[]>([]);
  const [vendorMetrics, setVendorMetrics] = useState<VendorMetrics | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    manager: "all",
    client: "all",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Parallel fetch
      const [portfolioRes, activitiesRes] = await Promise.all([
        fetch("/api/dashboard/portfolio"),
        fetch("/api/dashboard/activities")
      ]);

      if (!portfolioRes.ok) throw new Error("Failed to load portfolio data");
      
      const data = await portfolioRes.json();
      setProjects(data.rows || []);
      setFinancials(data.cashflow || []);
      setSpiTrend(data.spiTrend || []);
      setVendorMetrics(data.vendorMetrics || null);

      if (activitiesRes.ok) {
        const actData = await activitiesRes.json();
        setActivities(actData.activities || []);
      }
      
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (p.code || "").toLowerCase().includes(filters.search.toLowerCase());
      const matchStatus =
        filters.status === "all" ||
        p.status?.toLowerCase() === filters.status.toLowerCase();
      const matchManager =
        filters.manager === "all" || p.managerName === filters.manager;
      const matchClient =
        filters.client === "all" || p.clientName === filters.client;

      return matchSearch && matchStatus && matchManager && matchClient;
    });
  }, [projects, filters]);

  // KPIs Calculation
  const totals: DashboardTotals = useMemo(() => {
    const totalBudget = filteredProjects.reduce(
      (sum, p) => sum + (p.budget || 0),
      0
    );
    const totalCommitted = filteredProjects.reduce(
      (sum, p) => sum + (p.committed || 0),
      0
    );
    const totalActual = filteredProjects.reduce(
      (sum, p) => sum + (p.actual || 0),
      0
    );
    const totalRemaining = Math.max(
      totalBudget - totalActual - totalCommitted,
      0
    );
    const avgSpi =
      filteredProjects.length > 0
        ? filteredProjects.reduce((sum, p) => sum + (p.spi || 1), 0) /
          filteredProjects.length
        : 1;

    return {
      budget: totalBudget,
      committed: totalCommitted,
      actual: totalActual,
      remaining: totalRemaining,
      avgSpi,
    };
  }, [filteredProjects]);

  // Unique options for filters
  const managers = useMemo(
    () => Array.from(new Set(projects.map((p) => p.managerName).filter(Boolean))),
    [projects]
  );
  const clients = useMemo(
    () => Array.from(new Set(projects.map((p) => p.clientName).filter(Boolean))),
    [projects]
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="Executive Dashboard"
          breadcrumbs={[{ label: "ภาพรวมโครงการ" }]}
        />

        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-8">
          
          {/* Top Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ภาพรวมโครงการ (Project Portfolio)</h1>
              <p className="text-slate-500">ติดตามสถานะและความคืบหน้าของโครงการทั้งหมด</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                อัปเดตข้อมูล
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <DashboardKPIs totals={totals} />

          {/* Vendor Section (Added from old Dashboard) */}
          {vendorMetrics && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">สถานะเวนเดอร์ (Vendor Overview)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <KpiCard
                  title="จำนวนเวนเดอร์"
                  value={vendorMetrics.totalVendors.toString()}
                  icon={Users}
                />
                <KpiCard
                  title="รอชำระเงิน"
                  value={`฿${(vendorMetrics.pendingPaymentsAmount / 1000).toFixed(1)}k`}
                  icon={CreditCard}
                  alert={vendorMetrics.pendingPaymentsAmount > 50000}
                />
                <KpiCard
                  title="Top Vendor"
                  value={vendorMetrics.topVendorName}
                  subtext={`Spending: ฿${(vendorMetrics.topVendorSpend / 1000).toFixed(1)}k`}
                  icon={Trophy}
                />
                <KpiCard
                  title="สัญญา Active"
                  value={vendorMetrics.activeContracts.toString()}
                  icon={FileText}
                />
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChartCard spiTrend={spiTrend} />
            <FinancialChartCard financials={financials} />
          </div>

          {/* Matrix & Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PortfolioHealthCard projects={projects} />
            </div>
            <div>
              <RecentActivitiesCard activities={activities} />
            </div>
          </div>

          {/* Filters & Table */}
          <div className="space-y-4">
            <DashboardFilters
              filters={filters}
              setFilters={setFilters}
              managers={managers}
              clients={clients}
            />
            <ActiveProjectsTable projects={filteredProjects} />
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
