"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import {
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  User,
  Calendar as CalendarIcon,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";

interface TimesheetEntry {
  id: string;
  date: string;
  user_id: string;
  project_id: string | null;
  task_id: string | null;
  hours: number;
  description: string;
  billable_hours: boolean;
  status: "approved" | "rejected" | "pending";
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export default function AdminTimesheetsPage() {
  const [rows, setRows] = useState<TimesheetEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("*");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const json = await res.json();
      setUsers(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error("Failed to fetch users", e);
      toast.error("โหลดข้อมูลพนักงานไม่สำเร็จ");
    }
  };

  const fetchData = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ user_id: userId, start, end });
      const res = await fetch(`/api/timesheet/entries?${params.toString()}`, {
        cache: "no-store",
      });
      const json = res.ok ? await res.json() : [];
      setRows(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("โหลดข้อมูล Timesheet ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected" | "pending",
  ) => {
    try {
      const res = await fetch("/api/timesheet/entries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error("Update failed");

      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      toast.success(
        status === "approved" ? "อนุมัติรายการแล้ว" : "ปฏิเสธรายการแล้ว",
      );
    } catch (error) {
      console.error("Update error:", error);
      toast.error("อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const approveWeek = async () => {
    if (!start || !end) return;
    if (!confirm("คุณต้องการอนุมัติรายการทั้งหมดในช่วงเวลานี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch("/api/timesheet/batch-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          start,
          end,
          status: "approved",
        }),
      });

      if (!res.ok) throw new Error("Batch approve failed");

      toast.success("อนุมัติรายการทั้งหมดแล้ว");
      await fetchData();
    } catch (error) {
      console.error("Batch approve error:", error);
      toast.error("อนุมัติรายการไม่สำเร็จ");
    }
  };

  const exportCsv = () => {
    const header = [
      "Date",
      "User",
      "Project",
      "Task",
      "Hours",
      "Billable",
      "Status",
      "Description",
    ];
    const lines = [
      header.join(","),
      ...filteredRows.map((r) => {
        const user = users.find((u) => u.id === r.user_id);
        return [
          new Date(r.date).toISOString().split("T")[0],
          `"${user?.name || r.user_id}"`,
          `"${r.project_id || ""}"`,
          `"${r.task_id || ""}"`,
          r.hours,
          r.billable_hours ? "Yes" : "No",
          r.status,
          `"${(r.description || "").replace(/"/g, '""')}"`,
        ].join(",");
      }),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheets_${start}_to_${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    setStart(weekAgo.toISOString().split("T")[0]);
    setEnd(today.toISOString().split("T")[0]);
    fetchUsers();
  }, []);

  // Filter rows based on status locally
  const filteredRows = rows.filter(
    (r) => statusFilter === "all" || r.status === statusFilter,
  );

  const totalHours = filteredRows.reduce((sum, r) => sum + Number(r.hours), 0);
  const pendingCount = filteredRows.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="จัดการ Timesheet"
        breadcrumbs={[
          { label: "แดชบอร์ด", href: "/" },
          { label: "ผู้ดูแลระบบ", href: "/admin" },
          { label: "Timesheet" },
        ]}
      />
      
      <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-6">
        
        {/* Filter Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-base font-semibold">ตัวกรองข้อมูล</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" /> พนักงาน
                </label>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="เลือกพนักงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">ทั้งหมด</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> ช่วงวันที่
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="bg-white"
                  />
                  <span className="text-slate-400">-</span>
                  <Input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">สถานะ</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="สถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="pending">รออนุมัติ</SelectItem>
                    <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                    <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={fetchData} 
                  disabled={loading} 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  <Search className="w-4 h-4 mr-2" /> ค้นหา
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCsv}
                  disabled={filteredRows.length === 0}
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">ชั่วโมงรวม</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalHours.toFixed(1)} ชม.</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">รออนุมัติ</p>
                <h3 className="text-2xl font-bold text-slate-900">{pendingCount} รายการ</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200 flex flex-col justify-center">
             <CardContent className="p-6 py-4">
               <Button 
                  variant="outline" 
                  onClick={approveWeek} 
                  disabled={loading || pendingCount === 0}
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> อนุมัติทั้งหมดในสัปดาห์นี้
                </Button>
             </CardContent>
          </Card>
        </div>

        {/* Entries Table */}
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">รายการลงเวลา</CardTitle>
              <CardDescription>
                แสดง {filteredRows.length} รายการ
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">วันที่</th>
                    <th className="px-6 py-3">พนักงาน</th>
                    <th className="px-6 py-3">โครงการ / งาน</th>
                    <th className="px-6 py-3">รายละเอียด</th>
                    <th className="px-6 py-3 text-center">ชั่วโมง</th>
                    <th className="px-6 py-3 text-center">สถานะ</th>
                    <th className="px-6 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        ไม่พบข้อมูลในช่วงเวลาที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r) => {
                      const user = users.find((u) => u.id === r.user_id);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-slate-700">
                              {new Date(r.date).toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user?.avatar_url} />
                                <AvatarFallback className="text-[10px]">
                                  {user?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-slate-700 truncate max-w-[120px]">
                                {user?.name || r.user_id}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col max-w-[180px]">
                              <span className="font-medium text-slate-800 truncate" title={r.project_id || "-"}>
                                {r.project_id || "-"}
                              </span>
                              <span className="text-xs text-slate-500 truncate" title={r.task_id || "-"}>
                                {r.task_id || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-600 truncate max-w-[200px]" title={r.description}>
                              {r.description || "-"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center font-medium">
                            {r.hours}
                            {r.billable_hours && (
                              <span className="ml-1 text-[10px] text-green-600 font-normal bg-green-50 px-1 rounded">
                                $
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge
                              variant={
                                r.status === "approved"
                                  ? "default"
                                  : r.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={
                                r.status === "approved"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : r.status === "rejected"
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              }
                            >
                              {r.status === "approved"
                                ? "อนุมัติ"
                                : r.status === "rejected"
                                ? "ปฏิเสธ"
                                : "รออนุมัติ"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {r.status === "pending" && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateStatus(r.id, "approved")}
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    title="อนุมัติ"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateStatus(r.id, "rejected")}
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="ปฏิเสธ"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {r.status !== "pending" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateStatus(r.id, "pending")}
                                  className="h-8 px-2 text-slate-400 hover:text-slate-600"
                                >
                                  รีเซ็ต
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
