"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/Select";
import { Button } from "@/app/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Project, ActivityData } from "../types";
import { useThaiLocale } from "@/lib/hooks/useThaiLocale";

interface ActivityLogProps {
  activities: ActivityData | null;
  weeklyStart: string;
  setWeeklyStart: (date: string) => void;
  weeklyProject: string;
  setWeeklyProject: (projectId: string) => void;
  activityUser: string;
  setActivityUser: (userId: string) => void;
  projects: Project[];
  userOptions: Array<{ id: string; name: string }>;
  onSearch: () => void;
}

export default function ActivityLog({
  activities,
  weeklyStart,
  setWeeklyStart,
  weeklyProject,
  setWeeklyProject,
  activityUser,
  setActivityUser,
  projects,
  userOptions,
  onSearch,
}: ActivityLogProps) {
  const { formatThaiDateWithDay, formatNumber, isThaiLanguage } =
    useThaiLocale();

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>ประวัติกิจกรรม (Activity Log)</CardTitle>
        <CardDescription>รายละเอียดการบันทึกเวลาทั้งหมด</CardDescription>
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
            <SelectTrigger className="w-[180px] rounded-xl">
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
          <Select value={activityUser} onValueChange={setActivityUser}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="ทุกคน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกคน</SelectItem>
              {userOptions.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onSearch} className="rounded-xl">
            ค้นหา
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>พนักงาน</TableHead>
                <TableHead>โครงการ</TableHead>
                <TableHead>งาน (Task)</TableHead>
                <TableHead className="text-center">ชั่วโมง</TableHead>
                <TableHead>เวลา</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(activities?.rows || []).map((r, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {formatThaiDateWithDay(new Date(r.date))}
                  </TableCell>
                  <TableCell>{r.user}</TableCell>
                  <TableCell>{r.project}</TableCell>
                  <TableCell>{r.task}</TableCell>
                  <TableCell className="text-center font-bold text-blue-600">
                    {formatNumber(Number(r.hours || 0), {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.start
                      ? `${new Date(r.start).toLocaleTimeString(isThaiLanguage ? "th-TH" : "en-US")} - ${r.end ? new Date(r.end).toLocaleTimeString(isThaiLanguage ? "th-TH" : "en-US") : "?"}`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {(!activities?.rows || activities.rows.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    ไม่พบกิจกรรม
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
