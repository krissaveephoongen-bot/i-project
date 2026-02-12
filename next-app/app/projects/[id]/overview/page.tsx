'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import SCurveChart from '../SCurveChart';
import ProjectTabs from '@/app/components/ProjectTabs';
import { Button } from '@/app/components/ui/Button';
import PageTransition from '@/app/components/PageTransition';
import { Skeleton } from '@/app/components/ui/Skeleton';

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
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="กำลังโหลดข้อมูล..."
          breadcrumbs={[
            { label: 'แดชบอร์ด', href: '/' },
            { label: 'โครงการ', href: '/projects' },
            { label: 'กำลังโหลด...' }
          ]}
        />
        <div className="pt-24 px-6 container mx-auto space-y-6">
            <div className="flex justify-end">
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-red-500 p-8 bg-white rounded-xl shadow-sm">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg font-medium">เกิดข้อผิดพลาด: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            ลองใหม่
          </Button>
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
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="ภาพรวมโครงการ"
          breadcrumbs={[
            { label: 'แดชบอร์ด', href: '/' },
            { label: 'โครงการ', href: '/projects' },
            { label: p?.name || 'โครงการ', href: `/projects/${params?.id || ''}` },
            { label: 'ภาพรวม' }
          ]}
        />
        <div className="pt-24 px-6 pb-6 container mx-auto space-y-6">
          <ProjectTabs>
            <Button asChild variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
              <Link href={`/projects/${params?.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                แก้ไขโครงการ
              </Link>
            </Button>
          </ProjectTabs>
          
          <ProjectDetailReport
            title={p?.name}
            progressActual={Number(p?.progress || 0)}
            progressPlan={Number(p?.progressPlan || 0)}
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
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">ความคืบหน้าภาพรวม</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{Number(p?.progress || 0).toFixed(1)}%</div>
                <Progress value={Number(p?.progress || 0)} className="h-2 mt-2" />
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">งานที่เสร็จแล้ว</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completed}</div>
                <p className="text-xs text-muted-foreground">งานที่เสร็จสิ้น</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">กำลังดำเนินการ</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
                <p className="text-xs text-muted-foreground">งานที่กำลังทำ</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">รอดำเนินการ</CardTitle>
                <Target className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-600">{pending}</div>
                <p className="text-xs text-muted-foreground">งานที่เหลือ</p>
              </CardContent>
            </Card>
          </div>

          {/* S-Curve Chart */}
          <Card className="col-span-full shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>กราฟความคืบหน้า (S-Curve)</CardTitle>
              <CardDescription>เปรียบเทียบแผนงานกับผลงานจริงตามเวลา</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
               <SCurveChart />
            </CardContent>
          </Card>

          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">งบประมาณทั้งหมด</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">฿{Number(summary?.totalBudget || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">ค่าใช้จ่ายผูกพัน</CardTitle>
                <PieChart className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">฿{Number(summary?.committedCost || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">ค่าใช้จ่ายจริง</CardTitle>
                <PieChart className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">฿{Number(summary?.actualCost || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">คงเหลือ</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">฿{Number(summary?.remainingBudget || 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Risk & Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  ความเสี่ยง (Risks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(risks || []).slice(0, 5).map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-sm text-slate-700">{r.title || r.name}</span>
                      <Badge variant={
                        r.severity === 'High' ? 'destructive' : 
                        r.severity === 'Medium' ? 'default' : 
                        'secondary'
                      }>
                        {r.severity}
                      </Badge>
                    </div>
                  ))}
                  {(risks || []).length === 0 && <p className="text-sm text-slate-500 text-center py-4">ไม่มีความเสี่ยงที่บันทึกไว้</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-blue-500" />
                  ไมล์สโตน (Milestones)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(milestones || []).slice(0, 5).map((m: any) => (
                    <div key={m.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{m.name}</span>
                        <span className="text-slate-500">{Number(m.percentage || 0)}%</span>
                      </div>
                      <Progress value={Number(m.percentage || 0)} className="h-2" />
                    </div>
                  ))}
                  {(milestones || []).length === 0 && <p className="text-sm text-slate-500 text-center py-4">ไม่มีไมล์สโตนที่กำหนดไว้</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
