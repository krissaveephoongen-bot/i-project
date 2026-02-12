import Header from '@/app/components/Header';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import FinancialChart from '@/app/components/FinancialChart';

async function getFinancialReportData() {
  // Fetch real data from projects (budget, spent)
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select('id, name, budget, spent, startDate, endDate, createdAt')
    .order('createdAt', { ascending: false });

  if (projError) {
    console.error("Error fetching projects for financial report:", projError);
    return { monthlyData: [], kpis: { totalRevenue: 0, totalCost: 0, netProfit: 0, profitMargin: 0 }, projects: [] };
  }

  // Calculate KPIs based on real project data
  const totalRevenue = (projects || []).reduce((sum: number, p: any) => sum + Number(p.budget || 0), 0);
  const totalCost = (projects || []).reduce((sum: number, p: any) => sum + Number(p.spent || 0), 0);
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const kpis = {
    totalRevenue,
    totalCost,
    netProfit,
    profitMargin
  };

  // Generate monthly data from project distribution (Mocking monthly distribution from project totals for now as we lack transaction table)
  // In a real scenario, we would aggregate 'budget_lines' or 'invoices' and 'timesheets' + 'expenses' by month.
  // Here we will simulate monthly spread based on project start dates to visualize something meaningful from the real totals.
  const monthlyMap = new Map<string, { revenue: number, cost: number }>();
  
  (projects || []).forEach((p: any) => {
      const date = new Date(p.startDate || p.createdAt || new Date());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      
      if (!monthlyMap.has(key)) monthlyMap.set(key, { revenue: 0, cost: 0 });
      const entry = monthlyMap.get(key)!;
      entry.revenue += Number(p.budget || 0);
      entry.cost += Number(p.spent || 0);
  });

  const monthlyData = Array.from(monthlyMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort desc
    .map(([key, val]) => {
        const [y, m] = key.split('-');
        const date = new Date(Number(y), Number(m) - 1, 1);
        return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            rawDate: date,
            revenue: val.revenue,
            cost: val.cost
        };
    })
    .slice(0, 12); // Last 12 months

  return { monthlyData, kpis, projects };
}

function KpiCard({ title, value, icon: Icon, colorClass = 'text-blue-600' }: {
  title: string;
  value: string;
  icon: any;
  colorClass?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div>
          <h3 className="text-sm text-slate-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default async function FinancialReportPage() {
  const { monthlyData, kpis, projects } = await getFinancialReportData();

  return (
    <div className="min-h-screen">
      <Header
        title="Financial Report"
        breadcrumbs={[{ label: 'Reports' }, { label: 'Financial' }]}
      />
      <div className="pt-20 px-6 pb-6">
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Overall Performance</h2>
            <p className="text-sm text-slate-500">Summary of revenue (Budget), cost (Spent), and profit based on actual project data.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <KpiCard 
                title="Total Revenue (Budget)"
                value={new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(kpis.totalRevenue)}
                icon={TrendingUp}
                colorClass="text-green-600"
            />
            <KpiCard 
                title="Total Cost (Spent)"
                value={new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(kpis.totalCost)}
                icon={TrendingDown}
                colorClass="text-red-600"
            />
            <KpiCard 
                title="Net Profit (Estimated)"
                value={new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(kpis.netProfit)}
                icon={DollarSign}
                colorClass="text-blue-600"
            />
            <KpiCard 
                title="Profit Margin"
                value={`${kpis.profitMargin.toFixed(1)}%`}
                icon={Percent}
                colorClass="text-indigo-600"
            />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Financial Trends</h3>
            <FinancialChart data={monthlyData.slice().reverse()} />
        </div>

        {/* Project Breakdown Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Project Financial Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Project Name</th>
                            <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Budget (Revenue)</th>
                            <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Spent (Cost)</th>
                            <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Profit / Loss</th>
                            <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Margin</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(projects || []).map((p: any) => {
                            const profit = (p.budget || 0) - (p.spent || 0);
                            const margin = p.budget > 0 ? (profit / p.budget) * 100 : 0;
                            return (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{p.name}</td>
                                    <td className="py-4 px-6 text-sm text-green-600 text-right">{new Intl.NumberFormat('th-TH').format(p.budget || 0)}</td>
                                    <td className="py-4 px-6 text-sm text-red-600 text-right">{new Intl.NumberFormat('th-TH').format(p.spent || 0)}</td>
                                    <td className={`py-4 px-6 text-sm font-medium text-right ${profit >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                                        {new Intl.NumberFormat('th-TH').format(profit)}
                                    </td>
                                    <td className={`py-4 px-6 text-sm text-right ${margin >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                        {margin.toFixed(1)}%
                                    </td>
                                </tr>
                            );
                        })}
                        {(projects || []).length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-500">No projects found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
