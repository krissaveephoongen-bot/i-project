import React from "react";
import { Users, CreditCard, Trophy, FileText, Activity, AlertTriangle, Briefcase, TrendingUp } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { DashboardTotals } from "./types";

interface DashboardKPIsProps {
  totals: DashboardTotals;
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ totals }) => {
  // Guard against missing data
  if (!totals) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl border border-slate-200"></div>
        ))}
      </div>
    );
  }

  const budget = totals.budget || 0;
  const actual = totals.actual || 0;
  const remaining = totals.remaining || 0;
  const avgSpi = totals.avgSpi || 0;
  const completedCount = totals.completedCount || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <KpiCard
        title="งบประมาณรวม"
        value={`฿${(budget / 1000000).toFixed(1)}M`}
        icon={CreditCard}
        trend={2.5}
        trendLabel="vs last month"
      />
      <KpiCard
        title="ใช้จ่ายจริง"
        value={`฿${(actual / 1000000).toFixed(1)}M`}
        icon={TrendingUp}
        subtext={`Remaining: ฿${(remaining / 1000000).toFixed(1)}M`}
      />
      <KpiCard
        title="SPI เฉลี่ย"
        value={avgSpi.toFixed(2)}
        icon={Activity}
        alert={avgSpi < 0.9}
        subtext={avgSpi < 0.9 ? "Behind Schedule" : "On Track"}
      />
      <KpiCard
        title="งานค้างส่ง"
        value={completedCount.toString()}
        icon={Briefcase}
        subtext="Completed Projects"
      />
    </div>
  );
};

export default React.memo(DashboardKPIs);
