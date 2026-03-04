"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Project, WeeklyData } from "../types";
import { useThaiLocale } from "@/lib/hooks/useThaiLocale";

interface WeeklyViewProps {
  weekly: WeeklyData | null;
  weeklyStart: string;
  setWeeklyStart: (date: string) => void;
  weeklyProject: string;
  setWeeklyProject: (projectId: string) => void;
  projects: Project[];
  onSearch: () => void;
}

export default function WeeklyView({
  weekly,
  weeklyStart,
  setWeeklyStart,
  weeklyProject,
  setWeeklyProject,
  projects,
  onSearch,
}: WeeklyViewProps) {
  const { formatThaiDate, formatNumber, isThaiLanguage } = useThaiLocale();

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>สรุปรายสัปดาห์</CardTitle>
        <CardDescription>ดูชั่วโมงรวมรายบุคคลต่อวัน</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            type="date"
            className="w-auto rounded-xl"
            value={weeklyStart}
            onChange={(e) => setWeeklyStart(e.target.value)}
          />
          <Select value={weeklyProject} onValueChange={setWeeklyProject}>
            <SelectTrigger className="w-[200px] rounded-xl">
              <SelectValue placeholder="ทุกโครงการ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกโครงการ</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onSearch} className="rounded-xl">
            ค้นหา
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>พนักงาน</TableHead>
                {(weekly?.days || []).map((d) => (
                  <TableHead key={d} className="text-center">
                    {new Date(d).toLocaleDateString("th-TH", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(weekly?.data || []).map((row) => (
                <TableRow key={row.userId}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  {(weekly?.days || []).map((d) => (
                    <TableCell key={d} className="text-center">
                      <span
                        className={
                          Number(row.dailyHours[d] || 0) > 0
                            ? "text-blue-600 font-bold"
                            : "text-slate-300"
                        }
                      >
                        {row.dailyHours[d]
                          ? Number(row.dailyHours[d]).toFixed(1)
                          : "-"}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {(!weekly?.data || weekly.data.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={(weekly?.days?.length || 0) + 1}
                    className="h-24 text-center text-muted-foreground"
                  >
                    ไม่พบข้อมูลสำหรับสัปดาห์นี้
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
