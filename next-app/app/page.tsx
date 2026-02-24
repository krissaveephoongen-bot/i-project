import Link from 'next/link';
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

import Header from './components/Header';
import { clsx } from 'clsx';
import FinancialChart from './components/FinancialChart'; // New client component
import TeamLoadChart from './components/TeamLoadChart';   // New client component
import PortfolioHealthMatrix from './components/dashboard/PortfolioHealthMatrix'; // New client component
import { Button } from './components/ui/Button';
import PageTransition from './components/PageTransition';
import { 
  getDashboardKPI, 
  getDashboardFinancials, 
  getDashboardTeamLoad 
} from '@/app/lib/data-service';

// --- UI COMPONENTS ---

function KpiCard({ title, value, change, positive, subtext, icon: Icon, alert }: {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  subtext?: string;
  icon: React.ComponentType<any>;
  alert?: boolean;
}) {
  return (
    <div className={clsx(
      'rounded-xl shadow-sm border p-6 transition-all hover:shadow-md',
      alert 
        ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800' 
        : 'border-border bg-card text-card-foreground'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className={clsx(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          alert 
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
            : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={clsx('flex items-center gap-1 text-sm font-medium', positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
      <p className={clsx('text-2xl font-bold', alert ? 'text-red-700 dark:text-red-400' : 'text-foreground')}>{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}

const getRiskColor = (risk: string) => {
    if (!risk) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'critical': return 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
};

const translateRisk = (risk: string) => {
    if (!risk) return '-';
    switch (risk.toLowerCase()) {
      case 'low': return 'ต่ำ';
      case 'medium': return 'ปานกลาง';
      case 'high': return 'สูง';
      case 'critical': return 'วิกฤต';
      default: return risk;
    }
}

// --- MAIN PAGE COMPONENT (SERVER) ---

export default async function ExecutiveDashboard() {
  const kpiData = await getDashboardKPI();
  // Use unified API to ensure Portfolio Health Matrix uses existing projects
  let projects: any[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL : ''}/api/dashboard/portfolio`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const rows = json?.rows || [];
      projects = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        code: r.code || '',
        progress_plan: 100,
        progress_actual: Number(r.progress || 0),
        spi: Number(r.spi ?? 1),
        cpi: Number(r.cpi ?? 1),
        budget: Number(r.budget || 0),
        risk_level: (r.risks?.high || 0) > 0 ? 'high' : ((r.risks?.medium || 0) > 0 ? 'medium' : 'low'),
        client: r.clientName || ''
      }));
    }
  } catch {
    projects = [];
  }
  const financialData = await getDashboardFinancials();
  const teamLoadData = await getDashboardTeamLoad();

  return (
    <PageTransition>
      <div className="min-h-screen bg-muted/30">
        <Header title="แดชบอร์ดผู้บริหาร" breadcrumbs={[{ label: 'แดชบอร์ด' }]} />

        <div className="pt-24 px-6 pb-6 container mx-auto">
          <div className="flex justify-end mb-6">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700">
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
            <PortfolioHealthMatrix projects={projects} />

            <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
               <TeamLoadChart data={teamLoadData as any[]} />
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
            <FinancialChart data={financialData} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
