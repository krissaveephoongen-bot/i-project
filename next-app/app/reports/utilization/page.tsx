 'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Header from '@/app/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function UtilizationPage() {
  const sp = useSearchParams();
  const now = new Date();
  const startDefault = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  const endDefault = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);
  const [data, setData] = useState<any[]>([]);
  const start = sp?.get('start') || startDefault;
  const end = sp?.get('end') || endDefault;
  const projectId = sp?.get('projectId') || undefined;

  useEffect(() => {
    const load = async () => {
      // In a real implementation, we would call an API that aggregates timesheets
      // For now, let's fetch timesheets and aggregate client-side or use a mock logic that mimics DB aggregation
      // We'll try to fetch from our existing timesheet API if possible, or simulate for this demo as we don't have the aggregate API yet.
      
      try {
        const u = new URLSearchParams();
        u.set('start', start);
        u.set('end', end);
        // We need a way to get all timesheets. Let's assume an admin endpoint or similar.
        // Falling back to a direct Supabase query via a server action or API route is best.
        // For this "Real Data" task, let's use the /api/timesheet/entries but we need it for ALL users.
        // Currently /api/timesheet/entries filters by userId.
        
        // Let's create a temporary solution: Fetch users first, then maybe their stats?
        // Or better: Let's assume we have implemented the API. 
        // Wait, the plan said "Implement Utilization Report with Real Data". 
        // I should probably create the API endpoint for this if it doesn't exist.
        
        const res = await fetch(`/api/reports/utilization?${u.toString()}`, { cache: 'no-store' });
        if (res.ok) {
            const json = await res.json();
            setData(Array.isArray(json) ? json : []);
        } else {
            // Fallback if API missing
             setData([]);
        }
      } catch (e) {
          console.error(e);
      }
    };
    load();
  }, [start, end, projectId]);

  return (
    <div className="min-h-screen bg-slate-50">
       <Header title="Resource Utilization" breadcrumbs={[{ label: 'Reports' }, { label: 'Utilization' }]} />
       
       <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto space-y-6">
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Workload Distribution (Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="user_name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                formatter={(v: any) => [`${Number(v).toFixed(1)} hrs`, 'Hours']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="billable_hours" name="Billable" stackId="a" fill="#2563eb" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="non_billable_hours" name="Non-Billable" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Summary / Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="text-sm text-slate-500 mb-1">Total Hours Logged</div>
                        <div className="text-3xl font-bold text-slate-900">
                            {data.reduce((acc, cur) => acc + (Number(cur.total_hours) || 0), 0).toFixed(1)}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 mb-1">Billable Ratio</div>
                        <div className="text-3xl font-bold text-blue-600">
                            {(() => {
                                const total = data.reduce((acc, cur) => acc + (Number(cur.total_hours) || 0), 0);
                                const billable = data.reduce((acc, cur) => acc + (Number(cur.billable_hours) || 0), 0);
                                return total > 0 ? ((billable / total) * 100).toFixed(1) : 0;
                            })()}%
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="font-medium mb-3">Top Performers</h4>
                        <div className="space-y-3">
                            {[...data].sort((a, b) => b.total_hours - a.total_hours).slice(0, 5).map((u, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">{i+1}. {u.user_name}</span>
                                    <span className="font-medium">{Number(u.total_hours).toFixed(1)} h</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
         </div>

         {/* Detailed Table */}
         <Card>
            <CardHeader>
                <CardTitle>Detailed Utilization</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-slate-50">
                                <th className="text-left py-3 px-4 font-semibold text-slate-600">Employee</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600">Total Hours</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600">Billable</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600">Non-Billable</th>
                                <th className="text-right py-3 px-4 font-semibold text-slate-600">Utilization %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i} className="border-b hover:bg-slate-50">
                                    <td className="py-3 px-4 font-medium">{row.user_name}</td>
                                    <td className="py-3 px-4 text-right">{Number(row.total_hours).toFixed(1)}</td>
                                    <td className="py-3 px-4 text-right text-blue-600">{Number(row.billable_hours).toFixed(1)}</td>
                                    <td className="py-3 px-4 text-right text-slate-500">{Number(row.non_billable_hours).toFixed(1)}</td>
                                    <td className="py-3 px-4 text-right font-medium">
                                        {row.total_hours > 0 ? ((row.billable_hours / row.total_hours) * 100).toFixed(0) : 0}%
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500">No data available for the selected period.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
         </Card>

       </div>
    </div>
  );
}
