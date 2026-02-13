'use client';

import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

export default function FinancialTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/financial', { cache: 'no-store' })
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;
  if (!data) return <div className="text-red-500">Failed to load data</div>;

  const { projects, kpis, chartData } = data;

  return (
    <div className="space-y-6">
       {/* KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Revenue (Budget)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-green-600">฿{kpis.totalRevenue.toLocaleString()}</div>
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Cost (Spent)</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-red-600">฿{kpis.totalCost.toLocaleString()}</div>
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
             </CardHeader>
             <CardContent>
                <div className={`text-2xl font-bold ${kpis.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ฿{kpis.netProfit.toLocaleString()}
                </div>
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Profit Margin</CardTitle>
                <PieChart className="h-4 w-4 text-purple-500" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-purple-600">{kpis.margin}%</div>
             </CardContent>
          </Card>
       </div>

       {/* Chart */}
       <Card>
          <CardHeader>
             <CardTitle>Financial Trends (Monthly)</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                   <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <XAxis dataKey="name" tick={{fontSize: 12}} />
                   <YAxis tickFormatter={(v) => `฿${v/1000}k`} />
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <Tooltip formatter={(value: number) => `฿${value.toLocaleString()}`} />
                   <Legend />
                   <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                   <Area type="monotone" dataKey="cost" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" name="Cost" />
                </AreaChart>
             </ResponsiveContainer>
          </CardContent>
       </Card>

       {/* Table */}
       <Card>
          <CardHeader>
             <CardTitle>Project Financial Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
                <table className="w-full text-sm">
                   <thead className="bg-slate-50 border-b">
                      <tr>
                         <th className="py-3 px-4 text-left font-medium">Project</th>
                         <th className="py-3 px-4 text-right font-medium">Budget</th>
                         <th className="py-3 px-4 text-right font-medium">Spent</th>
                         <th className="py-3 px-4 text-right font-medium">Profit</th>
                         <th className="py-3 px-4 text-right font-medium">Margin</th>
                      </tr>
                   </thead>
                   <tbody>
                      {projects.map((p: any) => {
                          const profit = (Number(p.budget)||0) - (Number(p.spent)||0);
                          const margin = Number(p.budget) > 0 ? (profit / Number(p.budget)) * 100 : 0;
                          return (
                             <tr key={p.id} className="border-b hover:bg-slate-50">
                                <td className="py-3 px-4 font-medium">{p.name}</td>
                                <td className="py-3 px-4 text-right text-green-600">฿{Number(p.budget).toLocaleString()}</td>
                                <td className="py-3 px-4 text-right text-red-600">฿{Number(p.spent).toLocaleString()}</td>
                                <td className={`py-3 px-4 text-right font-medium ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    ฿{profit.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right">{margin.toFixed(1)}%</td>
                             </tr>
                          );
                      })}
                   </tbody>
                </table>
             </div>
          </CardContent>
       </Card>
    </div>
  );
}
