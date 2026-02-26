import Link from "next/link";
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Receipt,
  Download,
} from "lucide-react";

export const dynamic = "force-dynamic";

import Header from "./components/Header";
import FinancialChart from "./components/FinancialChart";
import TeamLoadChart from "./components/TeamLoadChart";
import PortfolioHealthMatrix from "./components/dashboard/PortfolioHealthMatrix";
import { Button } from "@/components/ui/button"; // Corrected import
import PageTransition from "./components/PageTransition";
import {
  getDashboardKPI,
  getDashboardFinancials,
  getDashboardTeamLoad,
} from "@/app/lib/data-service";
import { KpiCard } from "@/components/dashboard/KpiCard"; // Use new component

// --- MAIN PAGE COMPONENT (SERVER) ---

export default async function ExecutiveDashboard() {
  const kpiData = await getDashboardKPI();
  
  // Use unified API to ensure Portfolio Health Matrix uses existing projects
  let projects: any[] = [];
  try {
    // Optimization: Directly fetch from internal logic if possible, but keep existing fetch for safety
    // as per "Functional Integrity" constraint.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/dashboard/portfolio`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const rows = json?.rows || [];
      projects = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        code: r.code || "",
        progress_plan: 100,
        progress_actual: Number(r.progress || 0),
        spi: Number(r.spi ?? 1),
        cpi: Number(r.cpi ?? 1),
        budget: Number(r.budget || 0),
        risk_level:
          (r.risks?.high || 0) > 0
            ? "high"
            : (r.risks?.medium || 0) > 0
            ? "medium"
            : "low",
        client: r.clientName || "",
        status: r.status || "",
        managerName: r.managerName || "",
      }));
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    projects = [];
  }
  
  const financialData = await getDashboardFinancials();
  const teamLoadData = await getDashboardTeamLoad();

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
        <Header
          title="แดชบอร์ดผู้บริหาร"
          breadcrumbs={[{ label: "แดชบอร์ด" }]}
        />

        <div className="pt-24 px-4 md:px-6 pb-6 container mx-auto max-w-7xl">
          <div className="flex justify-end mb-6">
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              ส่งออกรายงาน
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <KpiCard
              title="มูลค่าพอร์ตโฟลิโอรวม"
              value={`฿${(kpiData.totalValue / 1000000).toFixed(1)}M`}
              icon={DollarSign}
            />
            <KpiCard
              title="SPI เฉลี่ย"
              value={kpiData.avgSpi.toFixed(2)}
              alert={kpiData.avgSpi < 1.0}
              icon={TrendingDown}
              subtext="เป้าหมาย: > 1.0"
            />
            <KpiCard
              title="ปัญหาที่พบ (Active Issues)"
              value={kpiData.activeIssues.toString()}
              icon={AlertTriangle}
              alert={kpiData.activeIssues > 10}
            />
            <KpiCard
              title="คาดการณ์การวางบิล (เดือนนี้)"
              value={`฿${(kpiData.billingForecast / 1000000).toFixed(1)}M`}
              icon={Receipt}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
                <PortfolioHealthMatrix projects={projects} />
            </div>

            <div className="bg-card rounded-xl shadow-sm border p-6">
              <TeamLoadChart data={teamLoadData as any[]} />
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border p-6 mb-6">
            <FinancialChart data={financialData} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
