'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Users, Clock, Percent } from 'lucide-react';

export default function ResourcesTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ResourcesTab: Loading data...');
    fetch('/api/reports/resources', { cache: 'no-store' })
      .then(res => {
        console.log('ResourcesTab: Response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('ResourcesTab: Data received:', data);
        setData(data);
      })
      .catch(error => {
        console.error('ResourcesTab: Error loading data:', error);
        setData({ error: error.message });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;
  if (!data) return <div className="text-red-500">Failed to load data</div>;
  if (data.error) return <div className="text-red-500">Error: {data.error}</div>;

  const { userStats, kpis } = data;

  return (
    <div className="space-y-6">
       {/* KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Team Members</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-slate-900">{kpis.totalTeamMembers}</div>
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Hours Logged (30d)</CardTitle>
                <Clock className="h-4 w-4 text-green-500" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-green-600">{kpis.totalHoursLogged.toLocaleString()} hrs</div>
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Avg Utilization</CardTitle>
                <Percent className="h-4 w-4 text-purple-500" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-purple-600">{kpis.averageUtilization}%</div>
             </CardContent>
          </Card>
       </div>

       {/* Chart */}
       <Card>
          <CardHeader>
             <CardTitle>Team Utilization (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userStats} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                   <XAxis type="number" unit="%" domain={[0, 100]} />
                   <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                   <Tooltip />
                   <Legend />
                   <Bar dataKey="utilization" name="Utilization %" fill="#8884d8" radius={[0, 4, 4, 0]}>
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
       </Card>

       {/* Table */}
       <Card>
          <CardHeader>
             <CardTitle>Resource Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
                <table className="w-full text-sm">
                   <thead className="bg-slate-50 border-b">
                      <tr>
                         <th className="py-3 px-4 text-left font-medium">Employee</th>
                         <th className="py-3 px-4 text-right font-medium">Hours Logged</th>
                         <th className="py-3 px-4 text-right font-medium">Utilization</th>
                      </tr>
                   </thead>
                   <tbody>
                      {userStats.sort((a:any, b:any) => b.utilization - a.utilization).map((u: any) => (
                         <tr key={u.id} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs">
                                    {u.avatar ? <img src={u.avatar} alt={u.name} /> : u.name.charAt(0)}
                                </div>
                                {u.name}
                                <span className="text-xs text-slate-400 font-normal ml-1">({u.position})</span>
                            </td>
                            <td className="py-3 px-4 text-right">{u.total_hours} hrs</td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <span className="font-medium">{u.utilization}%</span>
                                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${u.utilization > 85 ? 'bg-green-500' : u.utilization > 60 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                                            style={{ width: `${Math.min(u.utilization, 100)}%` }} 
                                        />
                                    </div>
                                </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </CardContent>
       </Card>
    </div>
  );
}
