import React from 'react';
import { DollarSign, CheckCircle, Activity, PieChart, TrendingUp } from 'lucide-react';
import type { DashboardTotals } from '../types';

interface DashboardKPIsProps {
  totals: DashboardTotals;
}

function DashboardKPIs({ totals }: DashboardKPIsProps) {
  return (
    <section aria-label="ตัวชี้วัดหลัก (KPIs)" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 gap-y-6">
      <div className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
          <DollarSign className="w-16 h-16" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">งบประมาณรวม (Total Budget)</span>
          <span className="text-2xl font-bold">฿{totals.budget.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
          <CheckCircle className="w-16 h-16 text-purple-600" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">ผูกพันงบ (Committed)</span>
          <span className="text-2xl font-bold text-purple-600">฿{totals.committed.toLocaleString()}</span>
          <div className="w-full bg-muted h-1 mt-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round((totals.committed / (totals.budget || 1)) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="สัดส่วนผูกพันงบ">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((totals.committed / (totals.budget || 1)) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
          <Activity className="w-16 h-16 text-blue-600" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">จ่ายจริง (Actual Cost)</span>
          <span className="text-2xl font-bold text-blue-600">฿{totals.actual.toLocaleString()}</span>
          <div className="w-full bg-muted h-1 mt-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round((totals.actual / (totals.budget || 1)) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="สัดส่วนจ่ายจริง">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((totals.actual / (totals.budget || 1)) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
          <PieChart className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">งบคงเหลือ (Remaining)</span>
          <span className="text-2xl font-bold">฿{totals.remaining.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-2xl p-5 shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" aria-hidden="true">
          <TrendingUp className="w-16 h-16 text-emerald-600" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">ประสิทธิภาพ (Avg SPI)</span>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold ${totals.avgSpi >= 1 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {totals.avgSpi.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground mb-1.5">ดัชนีชี้วัด</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(DashboardKPIs);
