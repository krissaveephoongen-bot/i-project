import Header from '@/app/components/Header';
import { supabase } from '@/app/lib/supabaseClient';
import { Users, Clock, Percent, Briefcase } from 'lucide-react';
import UserProductivityChart from '@/app/components/UserProductivityChart'; // New client component

export const dynamic = 'force-dynamic';

async function getResourceReportData() {
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, position, avatar')
        .in('role', ['employee', 'manager']);

    if (usersError) throw usersError;

    // For simplicity, we'll calculate for the last 30 days.
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    const { data: timesheetData, error: timesheetError } = await supabase
        .from('time_entries')
        .select('userId, hours')
        .gte('date', date30DaysAgo.toISOString());
    
    if (timesheetError) throw timesheetError;

    const userStats = (users || []).map((user: any) => {
        const userHours = (timesheetData || [])
            .filter((t: any) => t.userId === user.id)
            .reduce((sum: number, t: any) => sum + (t.hours || 0), 0);
        
        // Assuming 8 hours a day, 22 working days in the last 30 days
        const capacity = 8 * 22;
        const utilization = capacity > 0 ? (userHours / capacity) * 100 : 0;

        return {
            ...user,
            total_hours: userHours,
            utilization: Math.round(utilization)
        };
    });

    const totalTeamMembers = (users || []).length;
    const totalHoursLogged = userStats.reduce((sum: number, u: any) => sum + u.total_hours, 0);
    const averageUtilization = userStats.reduce((sum: number, u: any) => sum + u.utilization, 0) / totalTeamMembers;

    const kpis = {
        totalTeamMembers,
        totalHoursLogged,
        averageUtilization: Math.round(averageUtilization)
    };

    return { userStats, kpis };
}

function KpiCard({ title, value, icon: Icon }: {
  title: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm text-slate-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default async function ResourceReportPage() {
    const { userStats, kpis } = await getResourceReportData();

    return (
        <div className="min-h-screen">
            <Header
                title="Resource Report"
                breadcrumbs={[{ label: 'Reports' }, { label: 'Resources' }]}
            />
            <div className="pt-20 px-6 pb-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">Team Productivity & Utilization</h2>
                    <p className="text-sm text-slate-500">Overview of team performance and workload for the last 30 days.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <KpiCard title="Total Team Members" value={kpis.totalTeamMembers.toString()} icon={Users} />
                    <KpiCard title="Total Hours Logged" value={`${kpis.totalHoursLogged.toLocaleString()} hrs`} icon={Clock} />
                    <KpiCard title="Average Utilization" value={`${kpis.averageUtilization}%`} icon={Percent} />
                </div>

                {/* Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                   <UserProductivityChart data={userStats} />
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900">Resource Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Employee</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Hours Logged (30d)</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Utilization (30d)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {userStats.sort((a: any, b: any) => b.total_hours - a.total_hours).map((user: any) => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff`} alt={user.name} className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.position}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-slate-800 text-right font-medium">{user.total_hours.toLocaleString()} hrs</td>
                                        <td className="py-3 px-6 text-sm text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="font-medium">{user.utilization}%</span>
                                                <div className="w-24 h-2 bg-slate-200 rounded-full">
                                                    <div 
                                                        className={`h-2 rounded-full ${user.utilization > 85 ? 'bg-green-500' : user.utilization > 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                        style={{ width: `${user.utilization}%`}}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
