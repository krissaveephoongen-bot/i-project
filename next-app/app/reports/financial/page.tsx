import Header from '@/app/components/Header';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import FinancialChart from '@/app/components/FinancialChart'; // Re-using the same chart component

async function getFinancialReportData() {
  const { data, error } = await supabase
    .from('financial_data')
    .select('month, revenue, cost')
    .order('month', { ascending: false });

  if (error) {
    console.error("Error fetching financial report data:", error);
    return { monthlyData: [], kpis: { totalRevenue: 0, totalCost: 0, netProfit: 0, profitMargin: 0 } };
  }

  const totalRevenue = (data || []).reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
  const totalCost = (data || []).reduce((sum: number, item: any) => sum + (item.cost || 0), 0);
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const kpis = {
    totalRevenue,
    totalCost,
    netProfit,
    profitMargin
  };
  
  const monthlyData = (data || []).map((d: any) => ({...d, month: new Date(d.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}));

  return { monthlyData, kpis };
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
  const { monthlyData, kpis } = await getFinancialReportData();

  return (
    <div className="min-h-screen">
      <Header
        title="Financial Report"
        breadcrumbs={[{ label: 'Reports' }, { label: 'Financial' }]}
      />
      <div className="pt-20 px-6 pb-6">
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Overall Performance</h2>
            <p className="text-sm text-slate-500">Summary of revenue, cost, and profit over the last 12 months.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <KpiCard 
                title="Total Revenue"
                value={new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(kpis.totalRevenue)}
                icon={TrendingUp}
                colorClass="text-green-600"
            />
            <KpiCard 
                title="Total Cost"
                value={new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(kpis.totalCost)}
                icon={TrendingDown}
                colorClass="text-red-600"
            />
            <KpiCard 
                title="Net Profit"
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
            <FinancialChart data={monthlyData.slice().reverse()} />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Monthly Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Month</th>
                            <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Revenue</th>
                            <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Cost</th>
                            <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Net Profit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {monthlyData.map((item: any) => {
                            const net = item.revenue - item.cost;
                            return (
                                <tr key={item.month} className="hover:bg-slate-50">
                                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{item.month}</td>
                                    <td className="py-4 px-6 text-sm text-green-600 text-right">{new Intl.NumberFormat('th-TH').format(item.revenue)}</td>
                                    <td className="py-4 px-6 text-sm text-red-600 text-right">{new Intl.NumberFormat('th-TH').format(item.cost)}</td>
                                    <td className={`py-4 px-6 text-sm font-medium text-right ${net > 0 ? 'text-slate-800' : 'text-red-500'}`}>
                                        {new Intl.NumberFormat('th-TH').format(net)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
