"use client";

import { useState, useEffect } from "react";
import {
  BarChart2,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Briefcase,
  Search,
  Download,
  Printer,
  CheckCircle2,
  FileText,
} from "lucide-react";
import {
  getExecutiveReportAction,
  getWeeklyProjectSummaryAction,
} from "../actions";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

export default function ExecutiveTab() {
  const [execReport, setExecReport] = useState<any>(null);
  const [weeklySummary, setWeeklySummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [minSpi, setMinSpi] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [erJson, wsJson] = await Promise.all([
          getExecutiveReportAction(),
          getWeeklyProjectSummaryAction(),
        ]);

        setExecReport(erJson);
        setWeeklySummary(wsJson?.summary || []);
      } catch (e: any) {
        setError(e?.message || "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredWeekly = weeklySummary.filter((w: any) => {
    const okName = search
      ? String(w.name || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      : true;
    const okSpi = Number(w.spi || 0) >= Number(minSpi || 0);
    return okName && okSpi;
  });

  const exportWeeklyCsv = () => {
    const cols = [
      "id",
      "name",
      "progressActual",
      "progressPlan",
      "spi",
      "weeklyDelta",
    ];
    const header = cols.join(",");
    const rowsCsv = filteredWeekly
      .map((r: any) => cols.map((c) => String(r[c] ?? "")).join(","))
      .join("\n");
    const csv = header + "\n" + rowsCsv;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weekly-summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded-md bg-red-50">
        Error: {error}
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Executive Summary Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                โครงการทั้งหมด
              </CardTitle>
              <Briefcase className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {execReport?.summary?.totalProjects ?? "-"}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                ค่าเฉลี่ย SPI
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Number(execReport?.summary?.avgSpi || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                ดัชนีประสิทธิภาพแผนงาน
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                ไมล์สโตนล่าช้า
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {execReport?.summary?.overdueMilestones ?? "-"}
              </div>
              <p className="text-xs text-muted-foreground">ต้องตรวจสอบ</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                High Risk Projects
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {(execReport?.summary?.highRiskProjects || []).length}
              </div>
              <p className="text-xs text-muted-foreground">
                โครงการที่มีความเสี่ยงสูง
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="h-full shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">
                โครงการที่มีความเสี่ยงสูง (5 อันดับแรก)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(execReport?.summary?.highRiskProjects || []).length > 0 ? (
                  (execReport?.summary?.highRiskProjects || []).map(
                    (h: any) => (
                      <div
                        key={h.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <span className="font-medium text-sm text-red-900">
                          {h.name}
                        </span>
                        <Badge variant="destructive">
                          ความเสี่ยงสูง ({h.highRiskCount})
                        </Badge>
                      </div>
                    ),
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
                    <p>ไม่พบโครงการที่มีความเสี่ยงสูง</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="h-full shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">
                Watchlist (Lowest SPI)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(execReport?.watchlist || []).map((w: any) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <span className="font-medium text-sm text-slate-900">
                      {w.name}
                    </span>
                    <div
                      className={`font-bold ${w.spi < 0.9 ? "text-red-600" : "text-slate-900"}`}
                    >
                      SPI: {w.spi.toFixed(2)}
                    </div>
                  </div>
                ))}
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
              <span className="text-sm text-slate-600 whitespace-nowrap">
                Min SPI:
              </span>
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
            <Button
              variant="outline"
              onClick={exportWeeklyCsv}
              className="gap-2 hover:bg-slate-100"
            >
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">
                    ชื่อโครงการ
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    คืบหน้าจริง
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    แผนงาน
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    SPI
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    เปลี่ยนแปลง (Δ)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWeekly.length > 0 ? (
                  filteredWeekly.map((w: any) => (
                    <TableRow
                      key={w.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {w.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="font-mono">
                          {Number(w.progressActual || 0).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-500 font-mono">
                        {Number(w.progressPlan || 0).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-bold font-mono ${Number(w.spi || 1) < 0.9 ? "text-red-600" : "text-green-600"}`}
                        >
                          {Number(w.spi || 1).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className={`flex items-center justify-end gap-1 font-mono ${Number(w.weeklyDelta || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {Number(w.weeklyDelta || 0) > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : null}
                          {Number(w.weeklyDelta || 0).toFixed(2)}%
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
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
  );
}
