'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import SCurveChart from '../SCurveChart';
import ProjectTabs from '@/app/components/ProjectTabs';
import { Button } from '@/app/components/ui/Button';

// Icons
import { 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Flag,
  Edit
} from 'lucide-react';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import ProjectDetailReport from '@/app/components/ProjectDetailReport';

export default function ProjectOverviewPage() {
  const params = useParams() as { id?: string };
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const id = params?.id || '';
        const res = await fetch(`/api/projects/overview/${id}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'overview error');
        setOverview(json);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-500">Loading overview...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-red-500">
          <AlertCircle className="h-8 w-8" />
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  const p = overview?.project || {};
  const tasks = overview?.tasks || [];
  const milestones = overview?.milestones || [];
  const risks = overview?.risks || [];
  const summary = overview?.summary || {};
  const team = overview?.team || [];

  const completed = tasks.filter((t: any) => (t.status || '').toLowerCase() === 'completed').length;
  const inProgress = tasks.filter((t: any) => (t.status || '').toLowerCase() === 'in progress').length;
  const pending = tasks.filter((t: any) => (t.status || '').toLowerCase() === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Project Overview"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: p?.name || 'Project', href: `/projects/${params?.id || ''}` },
          { label: 'Overview' }
        ]}
      />
      <div className="pt-24 px-6 pb-6 container mx-auto space-y-6">
        <ProjectTabs>
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${params?.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Link>
          </Button>
        </ProjectTabs>
        
        <ProjectDetailReport
          title={p?.name}
          progressActual={Number(p?.progress || 0)}
          progressPlan={Number(p?.progressPlan || 0)} // Use progressPlan from project
          accountManager={team.find((m: any) => (m.role || '').toLowerCase() === 'account manager')?.name}
          projectManager={team.find((m: any) => (m.role || '').toLowerCase() === 'project manager')?.name}
          projectEngineer={team.find((m: any) => (m.role || '').toLowerCase() === 'project engineer')?.name}
          projectCo={team.find((m: any) => (m.role || '').toLowerCase() === 'project co')?.name}
          startDate={p?.startDate}
          endDate={p?.endDate}
          durationDays={p?.startDate && p?.endDate ? Math.ceil((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined}
          elapsedDays={p?.startDate ? Math.max(0, Math.ceil((Date.now() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24))) : undefined}
          projectValue={Number(summary?.totalBudget || p?.budget || 0)}
          projectType={p?.status}
          schedule={(overview?.milestones || []).map((m: any) => ({
            description: m.title || m.name || 'Milestone',
            amountIncVat: Number(m.amount || 0),
            deliveryPlanDate: m.dueDate || m.due_date,
            deliveryActualDate: m.actualDate || m.actual_date,
            invoiceDate: m.invoiceDate || m.invoice_date,
            planReceivedDate: m.planReceivedDate || m.plan_received_date,
            receiptDate: m.receiptDate || m.receipt_date,
          }))}
        />
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(p?.progress || 0).toFixed(1)}%</div>
              <Progress value={Number(p?.progress || 0)} className="h-2 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completed}</div>
              <p className="text-xs text-muted-foreground">tasks finished</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
              <p className="text-xs text-muted-foreground">tasks active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Target className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-600">{pending}</div>
              <p className="text-xs text-muted-foreground">tasks remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* S-Curve Chart */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Progress S-Curve</CardTitle>
            <CardDescription>Planned vs Actual progress over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
             <SCurveChart />
          </CardContent>
        </Card>

        {/* Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{Number(summary?.totalBudget || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Committed</CardTitle>
              <PieChart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">฿{Number(summary?.committedCost || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actual Cost</CardTitle>
              <PieChart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">฿{Number(summary?.actualCost || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">฿{Number(summary?.remainingBudget || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Risk & Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(risks || []).slice(0, 5).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-sm">{r.title || r.name}</span>
                    <Badge variant={
                      r.severity === 'High' ? 'destructive' : 
                      r.severity === 'Medium' ? 'default' : 
                      'secondary'
                    }>
                      {r.severity}
                    </Badge>
                  </div>
                ))}
                {(risks || []).length === 0 && <p className="text-sm text-slate-500 text-center py-4">No risks recorded.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-blue-500" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(milestones || []).slice(0, 5).map((m: any) => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-slate-500">{Number(m.percentage || 0)}%</span>
                    </div>
                    <Progress value={Number(m.percentage || 0)} className="h-2" />
                  </div>
                ))}
                {(milestones || []).length === 0 && <p className="text-sm text-slate-500 text-center py-4">No milestones defined.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
