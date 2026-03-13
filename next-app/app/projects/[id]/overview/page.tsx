"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import SCurveChart from "../SCurveChart";
import ProjectTabs from "@/app/components/ProjectTabs";
import { Button } from "@/app/components/ui/button";
import PageTransition from "@/app/components/PageTransition";
import { Skeleton } from "@/app/components/ui/skeleton";

// Icons
import { getProjectOverview } from "../../overviewActions";
import {
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  PieChart,
  Flag,
  Edit,
  Plus,
  FileText,
} from "lucide-react"
import { getStatusDisplay, formatCurrency } from "../../statusUtils"

// Shadcn UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import ProjectDetailReport from "@/app/components/ProjectDetailReport";
import { Calendar, User } from "lucide-react";
import HealthPolicyForm from "@/app/components/HealthPolicyForm";

export default function ProjectOverviewPage() {
  const { id } = useParams() as { id?: string };
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const projectId = id || "";
        const json = await getProjectOverview(projectId);
        setOverview(json);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="กำลังโหลดข้อมูล..."
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "โครงการ", href: "/projects" },
            { label: "กำลังโหลด..." },
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
  const documents = (overview as any)?.documents || [];

  const completed = tasks.filter(
    (t: any) => (t.status || "").toLowerCase() === "completed",
  ).length;
  const inProgress = tasks.filter(
    (t: any) => (t.status || "").toLowerCase() === "in_progress",
  ).length;
  const pending = tasks.filter(
    (t: any) => (t.status || "").toLowerCase() === "todo",
  ).length;

  const policy = (overview as any)?.policy || {};
  const health = (() => {
    const end = p?.endDate ? new Date(p.endDate) : null;
    const overdue = end ? end.getTime() < Date.now() : false;
    const overdueDays = end ? Math.ceil((Date.now() - end.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const riskCount = (risks || []).length || 0;
    const severityScore = (risks || []).reduce((acc: number, r: any) => {
      const s = String(r.severity || "").toLowerCase();
      if (s === "high" || s === "critical") return acc + 2;
      if (s === "medium") return acc + 1;
      return acc;
    }, 0);
    const progress = Number(p?.progress || 0);
    const budget = Number(summary?.totalBudget || p?.budget || 0);
    const actualCost = Number(summary?.actualCost || 0);
    const plan = Number(p?.progressPlan || 0);
    const EV = (budget * progress) / 100;
    const PV = (budget * plan) / 100;
    const AC = actualCost;
    const SPI = PV > 0 ? EV / PV : null;
    const CPI = AC > 0 ? EV / AC : null;
    let level: "ดี" | "ปานกลาง" | "เสี่ยง" | "วิกฤต" = "ดี";
    const reasons: string[] = [];
    const spiMin = typeof policy.spiMin === "number" ? policy.spiMin : 1;
    const cpiMin = typeof policy.cpiMin === "number" ? policy.cpiMin : 1;
    const overdueWarnDays = typeof policy.overdueWarnDays === "number" ? policy.overdueWarnDays : 1;
    const overdueCriticalDays = typeof policy.overdueCriticalDays === "number" ? policy.overdueCriticalDays : 7;
    const riskCountWarn = typeof policy.riskCountWarn === "number" ? policy.riskCountWarn : 3;
    const riskCountCritical = typeof policy.riskCountCritical === "number" ? policy.riskCountCritical : 5;
    const riskSeverityScoreWarn = typeof policy.riskSeverityScoreWarn === "number" ? policy.riskSeverityScoreWarn : 2;
    const riskSeverityScoreCritical = typeof policy.riskSeverityScoreCritical === "number" ? policy.riskSeverityScoreCritical : 4;
    if (overdue) {
      if (overdueDays >= overdueCriticalDays) {
        level = "วิกฤต";
      } else if (overdueDays >= overdueWarnDays) {
        level = "เสี่ยง";
      }
      reasons.push(`เกินกำหนด ${overdueDays} วัน`);
    }
    if (progress < 30) {
      level = level === "ดี" ? "ปานกลาง" : level;
      reasons.push("ความคืบหน้า < 30%");
    }
    if (severityScore >= riskSeverityScoreCritical || riskCount >= riskCountCritical) {
      level = "วิกฤต";
      reasons.push("ความเสี่ยงสูง/จำนวนมาก");
    } else if (severityScore >= riskSeverityScoreWarn || riskCount >= riskCountWarn) {
      level = level === "ดี" ? "เสี่ยง" : level;
      reasons.push("ความเสี่ยงปานกลาง");
    }
    if (SPI !== null && SPI < spiMin) {
      level = level === "วิกฤต" ? level : "เสี่ยง";
      reasons.push(`SPI ต่ำ (${SPI.toFixed(2)})`);
    }
    if (CPI !== null && CPI < cpiMin) {
      level = "วิกฤต";
      reasons.push(`CPI ต่ำ (${CPI.toFixed(2)})`);
    }
    return { level, reasons, overdue, overdueDays, progress, riskCount, SPI, CPI };
  })();

  const billing = (() => {
    const ms = milestones || [];
    const total = ms.reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);
    const invoiced = ms
      .filter((m: any) => m.invoiceDate || m.invoice_date)
      .reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);
    const received = ms
      .filter((m: any) => m.receiptDate || m.receipt_date)
      .reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);
    
    const now = Date.now();
    const next7Days = now + 7 * 24 * 60 * 60 * 1000;
    const dueSoon = ms
      .filter((m: any) => {
        const d = m.dueDate || m.due_date;
        if (!d) return false;
        const t = new Date(d).getTime();
        return t >= now && t <= next7Days && !(m.receiptDate || m.receipt_date);
      })
      .reduce((sum: number, m: any) => sum + Number(m.amount || 0), 0);

    return {
      total: `฿${total.toLocaleString()}`,
      invoiced: `฿${invoiced.toLocaleString()}`,
      received: `฿${received.toLocaleString()}`,
      dueSoon: `฿${dueSoon.toLocaleString()}`,
    };
  })();

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="ภาพรวมโครงการ"
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "โครงการ", href: "/projects" },
            {
              label: p?.name || "โครงการ",
              href: `/projects/${id || ""}`,
            },
            { label: "ภาพรวม" },
          ]}
        />
        <div className="pt-24 px-4 sm:px-6 pb-6 container mx-auto space-y-6 w-full max-w-full">
          <ProjectTabs>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Link href={`/projects/${id}/tasks`}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มงาน
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Link href={`/projects/${id}/cost-sheet`}>
                <FileText className="w-4 h-4 mr-2" />
                Cost Sheet
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              <Link href={`/projects/${id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                แก้ไข
              </Link>
            </Button>
          </ProjectTabs>

          {/* Meta Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">ผู้รับผิดชอบ</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{team.find((m: any) => (m.role || '').toLowerCase() === 'project manager')?.name || 'ไม่ระบุ'}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{team.find((m: any) => (m.role || '').toLowerCase() === 'account manager')?.name || 'ไม่ระบุ'}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">ช่วงเวลาโครงการ</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{p?.startDate ? new Date(p.startDate).toLocaleDateString('th-TH') : '-'}</span>
                  <span className="text-muted-foreground">ถึง</span>
                  <span>{p?.endDate ? new Date(p.endDate).toLocaleDateString('th-TH') : '-'}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  สถานะ: <span className="font-medium text-foreground">{getStatusDisplay(p?.status || '').label}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">งบประมาณ</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>฿{Number(summary?.totalBudget || p?.budget || 0).toLocaleString()}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  คงเหลือ: <span className="font-medium text-foreground">฿{Number(summary?.remainingBudget || 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div id="project-detail-report">
          <ProjectDetailReport
            title={p?.name}
            progressActual={Number(p?.progress || 0)}
            accountManager={
              team.find(
                (m: any) => (m.role || "").toLowerCase() === "account manager",
              )?.name
            }
            projectManager={
              team.find(
                (m: any) => (m.role || "").toLowerCase() === "project manager",
              )?.name
            }
            projectEngineer={
              team.find(
                (m: any) => (m.role || "").toLowerCase() === "project engineer",
              )?.name
            }
            projectCo={
              team.find(
                (m: any) => (m.role || "").toLowerCase() === "project co",
              )?.name
            }
            startDate={p?.startDate}
            endDate={p?.endDate}
            durationDays={
              p?.startDate && p?.endDate
                ? Math.ceil(
                    (new Date(p.endDate).getTime() -
                      new Date(p.startDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )
                : undefined
            }
            elapsedDays={
              p?.startDate
                ? Math.max(
                    0,
                    Math.ceil(
                      (Date.now() - new Date(p.startDate).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )
                : undefined
            }
            projectValue={Number(summary?.totalBudget || p?.budget || 0)}
            projectType={p?.status}
            schedule={(overview?.milestones || []).map((m: any) => ({
              description: m.title || m.name || "Milestone",
              amountIncVat: Number(m.amount || 0),
              deliveryPlanDate: m.dueDate || m.due_date,
              deliveryActualDate: m.actualDate || m.actual_date,
              invoiceDate: m.invoiceDate || m.invoice_date,
              planReceivedDate: m.planReceivedDate || m.plan_received_date,
              receiptDate: m.receiptDate || m.receipt_date,
            }))}
          />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">ความคืบหน้า</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {Number(p?.progress || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <Progress value={Number(p?.progress || 0)} className="h-1.5 mt-3" />
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">เสร็จแล้ว</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{completed}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">งานที่เสร็จสิ้น</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">กำลังทำ</p>
                    <p className="text-2xl font-bold text-cyan-600 mt-1">{inProgress}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-50 text-cyan-600">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">กำลังดำเนินการ</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">รอดำเนินการ</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{pending}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                    <Target className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">งานที่เหลือ</p>
              </CardContent>
            </Card>
          </div>

          {/* Project Health + Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>สุขภาพโครงการ</CardTitle>
                <CardDescription>ภาพรวมความเสี่ยงและความคืบหน้า</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge
                    variant={
                      health.level === "ดี"
                        ? "secondary"
                        : health.level === "ปานกลาง"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {health.level}
                  </Badge>
                </div>
                <div className="text-sm text-slate-700">
                  <div>ความคืบหน้า: {health.progress}%</div>
                  <div>จำนวนความเสี่ยง: {health.riskCount}</div>
                  <div>
                    SPI:{" "}
                    {health.SPI !== null && health.SPI !== undefined
                      ? health.SPI.toFixed(2)
                      : "-"}{" "}
                    • CPI:{" "}
                    {health.CPI !== null && health.CPI !== undefined
                      ? health.CPI.toFixed(2)
                      : "-"}
                  </div>
                  {health.reasons.length > 0 && (
                    <ul className="list-disc pl-5 mt-2 text-slate-600">
                      {health.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>ไทม์ไลน์</CardTitle>
                <CardDescription>กิจกรรมล่าสุด</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ...(milestones || []).map((m: any) => ({
                    type: "ไมล์สโตน",
                    title: m.title || m.name,
                    date: m.actualDate || m.actual_date || m.dueDate || m.due_date,
                  })),
                  ...(tasks || []).map((t: any) => ({
                    type: "งาน",
                    title: t.title,
                    date: t.end_date || t.due_date || t.start_date,
                  })),
                  ...(documents || []).map((d: any) => ({
                    type: "เอกสาร",
                    title: d.name,
                    date: d.uploaded_at || d.modified,
                  })),
                ]
                  .filter((e) => !!e.date)
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .slice(0, 8)
                  .map((e: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{e.title}</div>
                        <div className="text-xs text-slate-500">
                          {e.type} •{" "}
                          {new Date(e.date).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                {((milestones || []).length === 0 &&
                  (tasks || []).length === 0 &&
                  (documents || []).length === 0) && (
                  <div className="text-sm text-slate-500">ยังไม่มีเหตุการณ์</div>
                )}
              </CardContent>
            </Card>
          </div>

          <HealthPolicyForm projectId={id as string} />

          {/* Billing Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">ไมล์สโตนทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent><div className="text-2xl font-semibold">{billing.total}</div></CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">ออกใบแจ้งหนี้แล้ว</CardTitle>
              </CardHeader>
              <CardContent><div className="text-2xl font-semibold">{billing.invoiced}</div></CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">รับชำระแล้ว</CardTitle>
              </CardHeader>
              <CardContent><div className="text-2xl font-semibold">{billing.received}</div></CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">ครบกำหนดใน 7 วัน</CardTitle>
              </CardHeader>
              <CardContent><div className="text-2xl font-semibold">{billing.dueSoon}</div></CardContent>
            </Card>
          </div>

          {/* S-Curve Chart */}
          <Card className="col-span-full shadow-sm border-slate-200" id="scurve-card">
            <CardHeader>
              <CardTitle>กราฟความคืบหน้า (S-Curve)</CardTitle>
              <CardDescription>
                เปรียบเทียบแผนงานกับผลงานจริงตามเวลา
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <SCurveChart tasks={tasks} />
            </CardContent>
          </Card>

          {/* Milestone Roll-up */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>ความคืบหน้าตามไมล์สโตน</CardTitle>
              <CardDescription>คิดจากงานที่ผูกกับแต่ละไมล์สโตน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const byId: Record<string, { title: string; w: number; ev: number }> = {};
                (milestones || []).forEach((m: any) => {
                  byId[m.id] = { title: m.title || m.name || "Milestone", w: 0, ev: 0 };
                });
                const statusToPercent = (s: any) => {
                  const x = String(s || "").toLowerCase();
                  if (x === "completed") return 100;
                  if (x === "in_progress") return 50;
                  return 0;
                };
                (tasks || []).forEach((t: any) => {
                  const mid = t.milestone_id || t.milestoneId;
                  if (!mid || !byId[mid]) return;
                  const w = Number(t.weight || 1);
                  const pa =
                    typeof t.progress_actual === "number" && !Number.isNaN(t.progress_actual)
                      ? t.progress_actual
                      : typeof t.actual_hours === "number" &&
                        typeof t.estimated_hours === "number" &&
                        t.estimated_hours > 0
                      ? Math.min(100, (t.actual_hours / t.estimated_hours) * 100)
                      : statusToPercent(t.status);
                  byId[mid].w += w;
                  byId[mid].ev += w * pa;
                });
                const arr = Object.entries(byId).map(([id, v]) => ({
                  id,
                  title: v.title,
                  progress: v.w > 0 ? Math.round((v.ev / v.w) * 10) / 10 : 0,
                }));
                if (arr.length === 0) {
                  return <div className="text-sm text-slate-500">ยังไม่มีข้อมูลไมล์สโตน</div>;
                }
                return arr.map((m) => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{m.title}</span>
                      <span className="text-slate-600">{m.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>

          {/* Budget Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">งบประมาณทั้งหมด</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {formatCurrency(Number(summary?.totalBudget || 0))}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">ค่าใช้จ่ายผูกพัน</p>
                <p className="text-xl font-bold text-purple-600 mt-1">
                  {formatCurrency(Number(summary?.committedCost || 0))}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">ค่าใช้จ่ายจริง</p>
                <p className="text-xl font-bold text-red-600 mt-1">
                  {formatCurrency(Number(summary?.actualCost || 0))}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">คงเหลือ</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {formatCurrency(Number(summary?.remainingBudget || 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Risk & Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 w-full bg-white" id="risks-card">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-red-100/80 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  ความเสี่ยง (Risks)
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[200px] pt-4">
                <div className="space-y-3">
                  {(risks || []).slice(0, 5).map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50/50 to-transparent rounded-lg border border-red-100/50 hover:border-red-200 transition-colors"
                    >
                      <span className="font-medium text-sm text-slate-700">
                        {r.title || r.name}
                      </span>
                      <Badge
                        variant={
                          r.severity === "High"
                            ? "destructive"
                            : r.severity === "Medium"
                              ? "default"
                              : "secondary"
                        }
                        className="ml-2"
                      >
                        {r.severity}
                      </Badge>
                    </div>
                  ))}
                  {(risks || []).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">
                      ไม่มีความเสี่ยงที่บันทึกไว้
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 w-full bg-white" id="milestones-card">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <div className="p-2 bg-blue-100/80 rounded-lg">
                    <Flag className="h-5 w-5 text-blue-600" />
                  </div>
                  ไมล์สโตน (Milestones)
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[200px] pt-4">
                <div className="space-y-4">
                  {(milestones || []).slice(0, 5).map((m: any) => (
                    <div key={m.id} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {m.name}
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {Number(m.percentage || 0)}%
                        </span>
                      </div>
                      <Progress
                        value={Number(m.percentage || 0)}
                        className="h-2.5 bg-slate-100"
                      />
                    </div>
                  ))}
                  {(milestones || []).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">
                      ไม่มีไมล์สโตนที่กำหนดไว้
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
