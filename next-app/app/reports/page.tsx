'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import PageTransition from '@/app/components/PageTransition';
import { Skeleton } from '@/app/components/ui/Skeleton';

export const dynamic = 'force-dynamic';

import { 
  Printer, 
  Download, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Briefcase,
  FileText,
  BarChart2,
  CheckCircle2
} from 'lucide-react';

// Shadcn UI
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';

export default function ReportsPage() {
  const [execReport, setExecReport] = useState<any>(null);
  const [weeklySummary, setWeeklySummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [minSpi, setMinSpi] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const er = await fetch('/api/projects/executive-report', { cache: 'no-store' });
        const erJson = await er.json();
        if (!er.ok) throw new Error(erJson?.error || 'executive error');
        setExecReport(erJson);
        const ws = await fetch('/api/projects/weekly-summary', { cache: 'no-store' });
        const wsJson = await ws.json();
        if (!ws.ok) throw new Error(wsJson?.error || 'weekly error');
        setWeeklySummary(wsJson?.summary || []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const printPdf = () => {
    window.print();
  };

  const filteredWeekly = weeklySummary.filter((w: any) => {
    const okName = search ? String(w.name || '').toLowerCase().includes(search.toLowerCase()) : true;
    const okSpi = Number(w.spi || 0) >= Number(minSpi || 0);
    return okName && okSpi;
  });

  const exportWeeklyCsv = () => {
    const cols = ['id','name','progressActual','progressPlan','spi','weeklyDelta'];
    const header = cols.join(',');
    const rowsCsv = filteredWeekly.map((r:any)=>cols.map(c => String(r[c] ?? '')).join(',')).join('\n');
    const csv = header + '\n' + rowsCsv;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weekly-summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="กำลังสร้างรายงาน..."
        breadcrumbs={[
          { label: 'แดชบอร์ด', href: '/' },
          { label: 'กำลังโหลด...' }
        ]}
      />
      <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
            <Skeleton className="h-full rounded-xl" />
            <Skeleton className="h-full rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-600">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 mb-4 mx-auto" />
        <p className="text-lg font-medium">เกิดข้อผิดพลาดในการโหลดรายงาน</p>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            ลองใหม่
        </Button>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="รายงาน"
          breadcrumbs={[
            { label: 'แดชบอร์ด', href: '/' },
            { label: 'รายงาน' }
          ]}
        />
        
        <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
          
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">ศูนย์รวมรายงาน</h1>
              <p className="text-slate-500 mt-1">สรุปผู้บริหารและตัวชี้วัดประสิทธิภาพโครงการ</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => window.open('/api/projects/executive-report', '_blank')} className="gap-2 hover:bg-slate-100">
                <FileText className="h-4 w-4" /> JSON
              </Button>
              <Button variant="outline" onClick={printPdf} className="gap-2 hover:bg-slate-100">
                <Printer className="h-4 w-4" /> พิมพ์ PDF
              </Button>
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
              <BarChart2 className="h-5 w-5 text-blue-600" />
              สรุปผู้บริหาร (Executive Summary)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">โครงการทั้งหมด</CardTitle>
                  <Briefcase className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{execReport?.summary?.totalProjects ?? '-'}</div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">ค่าเฉลี่ย SPI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{execReport?.summary?.avgSpi ?? '-'}</div>
                  <p className="text-xs text-muted-foreground">ดัชนีประสิทธิภาพแผนงาน</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">ไมล์สโตนล่าช้า</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{execReport?.summary?.overdueMilestones ?? '-'}</div>
                  <p className="text-xs text-muted-foreground">ต้องตรวจสอบ</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">งบประมาณรวม</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">฿{Number(execReport?.summary?.budgetTotals?.totalBudget || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">จากทุกโครงการ</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* High Risk Projects */}
              <Card className="h-full shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">โครงการที่มีความเสี่ยงสูง (5 อันดับแรก)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(execReport?.summary?.highRiskProjects || []).length > 0 ? (
                      (execReport?.summary?.highRiskProjects || []).map((h: any) => (
                        <div key={h.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                          <span className="font-medium text-sm text-red-900">{h.name}</span>
                          <Badge variant="destructive">ความเสี่ยงสูง ({h.high})</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                        <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
                        <p>ไม่พบโครงการที่มีความเสี่ยงสูง</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Budget Breakdown */}
              <Card className="h-full shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">รายละเอียดงบประมาณ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">ค่าใช้จ่ายผูกพัน (Committed)</span>
                        <span className="font-medium">฿{Number(execReport?.summary?.budgetTotals?.committed || 0).toLocaleString()}</span>
                      </div>
                      <Progress value={(Number(execReport?.summary?.budgetTotals?.committed || 0) / Number(execReport?.summary?.budgetTotals?.totalBudget || 1)) * 100} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">ค่าใช้จ่ายจริง (Actual)</span>
                        <span className="font-medium">฿{Number(execReport?.summary?.budgetTotals?.actualCost || 0).toLocaleString()}</span>
                      </div>
                      <Progress value={(Number(execReport?.summary?.budgetTotals?.actualCost || 0) / Number(execReport?.summary?.budgetTotals?.totalBudget || 1)) * 100} className="h-2 bg-red-100" indicatorClassName="bg-red-600" />
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-900">งบประมาณคงเหลือ</span>
                      <span className="text-lg font-bold text-green-600">฿{Number(execReport?.summary?.budgetTotals?.remaining || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Weekly Summary Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                สรุปรายสัปดาห์ (Weekly Summary)
              </h2>
              
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input 
                    placeholder="ค้นหาโครงการ..." 
                    className="pl-9 w-[200px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 bg-white border rounded-md px-3 py-2 shadow-sm">
                  <span className="text-sm text-slate-600 whitespace-nowrap">Min SPI:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={minSpi}
                    onChange={(e) => setMinSpi(parseFloat(e.target.value) || 0)}
                    className="w-16 text-sm border-none focus:ring-0 p-0 text-right"
                  />
                </div>
                <Button variant="outline" onClick={exportWeeklyCsv} className="gap-2 hover:bg-slate-100">
                  <Download className="h-4 w-4" /> ส่งออก CSV
                </Button>
              </div>
            </div>

            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">ชื่อโครงการ</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">คืบหน้าจริง</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">แผนงาน</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">SPI</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">เปลี่ยนแปลงรายสัปดาห์ (Δ)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWeekly.length > 0 ? (
                      filteredWeekly.map((w: any) => (
                        <TableRow key={w.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-medium text-slate-900">{w.name}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="font-mono">{Number(w.progressActual || 0).toFixed(1)}%</Badge>
                          </TableCell>
                          <TableCell className="text-right text-slate-500 font-mono">
                            {Number(w.progressPlan || 0).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-bold font-mono ${Number(w.spi || 1) < 0.9 ? 'text-red-600' : 'text-green-600'}`}>
                              {Number(w.spi || 1).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`flex items-center justify-end gap-1 font-mono ${Number(w.weeklyDelta || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Number(w.weeklyDelta || 0) > 0 ? <TrendingUp className="h-3 w-3" /> : null}
                              {Number(w.weeklyDelta || 0).toFixed(2)}%
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          ไม่พบโครงการที่ตรงกับเงื่อนไข
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
