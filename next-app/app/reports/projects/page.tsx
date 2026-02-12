import Header from '@/app/components/Header';
import { supabase } from '@/app/lib/supabaseClient';
import { FolderKanban, CheckCircle, AlertOctagon, TrendingUp } from 'lucide-react';
import ProjectComparisonChart from '@/app/components/ProjectComparisonChart'; // New client component
import Link from 'next/link';

async function getProjectReportData() {
    const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, status, progress, progressPlan, budget, spent, startDate, endDate');

    if (error) {
        console.error("Error fetching project report data:", error);
        return { projects: [], kpis: { totalProjects: 0, onTime: 0, overBudget: 0, avgProgress: 0 }};
    }

    const totalProjects = projects.length;
    const onTime = (projects || []).filter((p: any) => p.status === 'completed' && new Date(p.endDate) <= new Date()).length;
    const overBudget = (projects || []).filter((p: any) => p.spent > p.budget).length;
    const avgProgress = totalProjects > 0 ? (projects || []).reduce((sum: number, p: any) => sum + p.progress, 0) / totalProjects : 0;
    
    const kpis = {
        totalProjects,
        onTime,
        overBudget,
        avgProgress: Math.round(avgProgress)
    };

    return { projects, kpis };
}

function KpiCard({ title, value, icon: Icon }: {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
}) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-100">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm text-slate-500 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </div>
    );
}

export default async function ProjectsReportPage() {
    const { projects, kpis } = await getProjectReportData();

    return (
        <div className="min-h-screen">
            <Header
                title="Projects Report"
                breadcrumbs={[{ label: 'Reports' }, { label: 'Projects' }]}
            />
            <div className="pt-20 px-6 pb-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">Projects Performance Overview</h2>
                    <p className="text-sm text-slate-500">Comparative analysis of all projects.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <KpiCard title="Total Projects" value={kpis.totalProjects.toString()} icon={FolderKanban} />
                    <KpiCard title="On-Time Completion" value={`${kpis.onTime} Projects`} icon={CheckCircle} />
                    <KpiCard title="Over Budget" value={`${kpis.overBudget} Projects`} icon={AlertOctagon} />
                    <KpiCard title="Average Progress" value={`${kpis.avgProgress}%`} icon={TrendingUp} />
                </div>

                {/* Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <ProjectComparisonChart data={(projects || []).map((p: any) => ({
                        name: p.name,
                        progress_plan: p.progressPlan,
                        progress: p.progress
                    }))} />
                </div>

                 {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900">All Projects Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">Project Name</th>
                                    <th className="text-center py-3 px-6 text-sm font-medium text-slate-600">Status</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Progress Plan</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Progress Actual</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Budget</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">Spent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(projects || []).map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-6">
                                            <Link href={`/projects/${p.id}`} className="text-sm font-medium text-blue-600 hover:underline">{p.name}</Link>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-center">{p.status}</td>
                                        <td className="py-3 px-6 text-sm text-slate-600 text-right">{p.progressPlan}%</td>
                                        <td className="py-3 px-6 text-sm text-slate-800 text-right font-bold">{p.progress}%</td>
                                        <td className="py-3 px-6 text-sm text-slate-600 text-right">{new Intl.NumberFormat('th-TH').format(p.budget)}</td>
                                        <td className={`py-3 px-6 text-sm text-right font-medium ${p.spent > p.budget ? 'text-red-500' : 'text-green-600'}`}>{new Intl.NumberFormat('th-TH').format(p.spent)}</td>
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
