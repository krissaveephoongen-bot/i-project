import Link from 'next/link';
import {
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  AlertCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

import Header from './components/Header';
import { clsx } from 'clsx';
import FinancialChart from './components/FinancialChart'; // New client component
import TeamLoadChart from './components/TeamLoadChart';   // New client component
import { Button } from './components/ui/Button';
import { 
  getDashboardKPI, 
  getDashboardProjects, 
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
    <div className={clsx('bg-white rounded-xl shadow-sm border p-6', alert ? 'border-red-300 bg-red-50' : 'border-slate-200')}>
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', alert ? 'bg-red-100' : 'bg-blue-50')}>
          <Icon className={clsx('w-5 h-5', alert ? 'text-red-600' : 'text-blue-600')} />
        </div>
        {change && (
          <span className={clsx('flex items-center gap-1 text-sm font-medium', positive ? 'text-green-600' : 'text-red-600')}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <h3 className="text-sm text-slate-600 mb-1">{title}</h3>
      <p className={clsx('text-2xl font-bold', alert ? 'text-red-700' : 'text-slate-900')}>{value}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
}

const getRiskColor = (risk: string) => {
    if (!risk) return 'bg-slate-100 text-slate-700';
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      case 'critical': return 'bg-red-200 text-red-800';
      default: return 'bg-slate-100 text-slate-700';
    }
};

// --- MAIN PAGE COMPONENT (SERVER) ---

export default async function ExecutiveDashboard() {
  const kpiData = await getDashboardKPI();
  const projects = await getDashboardProjects();
  const financialData = await getDashboardFinancials();
  const teamLoadData = await getDashboardTeamLoad();

  return (
    <div className="min-h-screen">
      <Header title="Executive Dashboard" breadcrumbs={[{ label: 'Dashboard' }]} />

      <div className="pt-20 px-6 pb-6">
        <div className="flex justify-end mb-6">
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <KpiCard
            title="Total Portfolio Value"
            value={`฿${(kpiData.totalValue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
          />
          <KpiCard
            title="Avg. SPI"
            value={kpiData.avgSpi.toFixed(2)}
            alert={kpiData.avgSpi < 1.0}
            icon={TrendingDown}
          />
          <KpiCard
            title="Active Issues"
            value={kpiData.activeIssues.toString()}
            icon={AlertTriangle}
            alert={kpiData.activeIssues > 10}
          />
          <KpiCard
            title="Billing Forecast (This Month)"
            value={`฿${(kpiData.billingForecast / 1000000).toFixed(1)}M`}
            icon={Receipt}
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Portfolio Health Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Project Name</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Plan %</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Actual %</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">SPI</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project: any) => {
                    const plan = Number(project.progress_plan ?? project.progressPlan ?? 100);
                    const actual = Number(project.progress_actual ?? project.progress ?? 0);
                    const spiVal = Number(project.spi ?? (plan > 0 ? actual / plan : 1));
                    const risk = (project.risk_level ?? project.riskLevel ?? 'low') as string;
                    const clientName = project.client ?? '';
                    return (
                    <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link href={`/projects/${project.id}`} className="text-sm font-medium text-slate-900 hover:text-blue-600">
                          {project.name}
                        </Link>
                        <p className="text-xs text-slate-500">{clientName}</p>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-600">{plan}%</td>
                      <td className="py-3 px-4 text-center text-sm text-slate-900 font-medium">{actual}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className={clsx('inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium', spiVal >= 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {spiVal >= 1 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {spiVal.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={clsx('px-2 py-1 rounded text-xs font-medium', getRiskColor(risk))}>
                          {risk}
                        </span>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <TeamLoadChart data={teamLoadData as any[]} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <FinancialChart data={financialData} />
        </div>
      </div>
    </div>
  );
}
