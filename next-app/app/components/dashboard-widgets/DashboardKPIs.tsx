import React from "react";
import { Users, CreditCard, Trophy, FileText, Activity, AlertTriangle, Briefcase, TrendingUp } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { DashboardTotals } from "./types";

interface DashboardKPIsProps {
  totals: DashboardTotals;
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ totals }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <KpiCard
        title="งบประมาณรวม"
        value={`฿${(totals.budget / 1000000).toFixed(1)}M`}
        icon={CreditCard}
        trend={2.5}
        trendLabel="vs last month"
      />
      <KpiCard
        title="ใช้จ่ายจริง"
        value={`฿${(totals.actual / 1000000).toFixed(1)}M`}
        icon={TrendingUp}
        subtext={`Remaining: ฿${(totals.remaining / 1000000).toFixed(1)}M`}
      />
      <KpiCard
        title="SPI เฉลี่ย"
        value={totals.avgSpi.toFixed(2)}
        icon={Activity}
        alert={totals.avgSpi < 0.9}
        subtext={totals.avgSpi < 0.9 ? "Behind Schedule" : "On Track"}
      />
      <KpiCard
        title="งานค้างส่ง"
        value={totals.completedCount.toString()}
        icon={Briefcase}
        subtext="Completed Projects"
      />
    </div>
  );
};

export default React.memo(DashboardKPIs);
