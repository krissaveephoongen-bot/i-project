import { DollarSign, CheckCircle, Activity, PieChart, TrendingUp } from 'lucide-react';

interface DashboardKPIsProps {
  totals: {
    b: number;
    c: number;
    a: number;
    rm: number;
    avgSpi: number;
  };
}

export default function DashboardKPIs({ totals }: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 gap-y-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <DollarSign className="w-16 h-16 text-slate-900" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">งบประมาณรวม (Total Budget)</span>
          <span className="text-2xl font-bold text-slate-900">฿{totals.b.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <CheckCircle className="w-16 h-16 text-purple-600" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">ผูกพันงบ (Committed)</span>
          <span className="text-2xl font-bold text-purple-600">฿{totals.c.toLocaleString()}</span>
          <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((totals.c / (totals.b || 1)) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="w-16 h-16 text-blue-600" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">จ่ายจริง (Actual Cost)</span>
          <span className="text-2xl font-bold text-blue-600">฿{totals.a.toLocaleString()}</span>
          <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((totals.a / (totals.b || 1)) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <PieChart className="w-16 h-16 text-slate-400" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">งบคงเหลือ (Remaining)</span>
          <span className="text-2xl font-bold text-slate-700">฿{totals.rm.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all hover:-translate-y-1 duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-16 h-16 text-emerald-600" />
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">ประสิทธิภาพ (Avg SPI)</span>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold ${totals.avgSpi >= 1 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {totals.avgSpi.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 mb-1.5">ดัชนีชี้วัด</span>
          </div>
        </div>
      </div>
    </div>
  );
}
