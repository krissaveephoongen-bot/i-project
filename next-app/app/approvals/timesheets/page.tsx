"use client";

import { useState, useMemo } from "react";
import Header from "@/app/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  User,
  Calendar as CalendarIcon,
  CheckSquare,
  MoreVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getPendingTimesheets,
  updateTimesheetApproval,
} from "@/app/lib/approvals";
import ApprovalModal from "../components/ApprovalModal";
import PageTransition from "@/app/components/PageTransition";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function TimesheetApprovalsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["approvals:timesheets"],
    queryFn: getPendingTimesheets,
  });

  const [selected, setSelected] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  // Derived Data for Filters
  const projects = useMemo(() => {
    const unique = new Set(data.map((r: any) => r.project?.name).filter(Boolean));
    return Array.from(unique);
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((row: any) => {
      const matchesSearch =
        (row.user?.name || row.userId).toLowerCase().includes(search.toLowerCase()) ||
        (row.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesProject =
        projectFilter === "all" || row.project?.name === projectFilter;
      return matchesSearch && matchesProject;
    });
  }, [data, search, projectFilter]);

  const totalHours = filteredData.reduce((sum: number, row: any) => sum + Number(row.hours || 0), 0);
  const pendingUsers = new Set(filteredData.map((r: any) => r.userId)).size;

  const mutate = useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: "approve" | "reject";
      reason?: string;
    }) => updateTimesheetApproval(id, action, { reason }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["approvals:timesheets"] });
      setOpen(false);
      setSelected(null);
      toast.success(
        variables.action === "approve" ? "อนุมัติเรียบร้อยแล้ว" : "ปฏิเสธเรียบร้อยแล้ว"
      );
    },
    onError: () => {
      toast.error("ทำรายการไม่สำเร็จ");
    },
  });

  const openModal = (
    id: string,
    label: string,
    action: "approve" | "reject",
  ) => {
    setSelected({ id, label });
    setMode(action);
    setOpen(true);
  };

  const handleApproveAll = async () => {
    if (!confirm(`คุณต้องการอนุมัติรายการทั้งหมด ${filteredData.length} รายการใช่หรือไม่?`)) return;
    
    // Simple batch implementation (can be optimized with a real batch API)
    let successCount = 0;
    for (const row of filteredData) {
      try {
        await updateTimesheetApproval(row.id, "approve", {});
        successCount++;
      } catch (e) {
        console.error(e);
      }
    }
    qc.invalidateQueries({ queryKey: ["approvals:timesheets"] });
    toast.success(`อนุมัติสำเร็จ ${successCount} รายการ`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="อนุมัติเวลาทำงาน (Timesheets)"
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "อนุมัติ", href: "/approvals" },
            { label: "Timesheets" },
          ]}
        />
        
        <div className="pt-24 px-4 md:px-8 pb-8 container mx-auto max-w-7xl space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">รออนุมัติทั้งหมด</p>
                  <h3 className="text-2xl font-bold text-slate-900">{filteredData.length} รายการ</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">ชั่วโมงรวม</p>
                  <h3 className="text-2xl font-bold text-slate-900">{totalHours.toFixed(2)} ชม.</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">พนักงานที่รอ</p>
                  <h3 className="text-2xl font-bold text-slate-900">{pendingUsers} คน</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Actions */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4 w-full md:w-auto items-center">
                  <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="ค้นหาชื่อ, รายละเอียด..."
                      className="pl-9 bg-white"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-[200px] bg-white">
                      <SelectValue placeholder="ทุกโครงการ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกโครงการ</SelectItem>
                      {projects.map((p: any) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleApproveAll}
                  disabled={filteredData.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                >
                  <CheckSquare className="w-4 h-4 mr-2" /> อนุมัติทั้งหมด ({filteredData.length})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <CardTitle className="text-lg font-semibold">รายการรออนุมัติ</CardTitle>
              <CardDescription>ตรวจสอบและอนุมัติเวลาทำงานของทีม</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">วันที่</th>
                      <th className="px-6 py-3">พนักงาน</th>
                      <th className="px-6 py-3">โครงการ / งาน</th>
                      <th className="px-6 py-3 text-center">ชั่วโมง</th>
                      <th className="px-6 py-3">รายละเอียด</th>
                      <th className="px-6 py-3">สถานะการอนุมัติ</th>
                      <th className="px-6 py-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12">
                           <div className="space-y-4">
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                           </div>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                            <CheckCircle2 className="w-12 h-12 opacity-20" />
                            <p className="text-lg font-medium text-slate-600">ไม่มีรายการรออนุมัติ</p>
                            <p className="text-sm">คุณจัดการทุกอย่างเรียบร้อยแล้ว!</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row: any) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {new Date(row.date).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-slate-200">
                                <AvatarImage src={row.user?.avatar_url} />
                                <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">
                                  {row.user?.name?.charAt(0) || row.userId?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-slate-900">{row.user?.name || row.userId}</div>
                                <div className="text-xs text-slate-500">{row.user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col max-w-[200px]">
                              <span className="font-medium text-slate-800 truncate" title={row.project?.name}>
                                {row.project?.name || "-"}
                              </span>
                              <span className="text-xs text-slate-500 truncate" title={row.task?.title}>
                                {row.task?.title || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-slate-900">
                            {Number(row.hours || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-600 truncate max-w-[200px]" title={row.description}>
                              {row.description || "-"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">PM:</span>
                                    <Badge 
                                        variant="outline" 
                                        className={
                                            row.projectManagerApprovalStatus === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                                            row.projectManagerApprovalStatus === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                                            "bg-amber-50 text-amber-700 border-amber-200"
                                        }
                                    >
                                        {row.projectManagerApprovalStatus || "Pending"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Sup:</span>
                                    <Badge 
                                        variant="outline" 
                                        className={
                                            row.supervisorApprovalStatus === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                                            row.supervisorApprovalStatus === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                                            "bg-amber-50 text-amber-700 border-amber-200"
                                        }
                                    >
                                        {row.supervisorApprovalStatus || "Pending"}
                                    </Badge>
                                </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openModal(row.id, `${row.user?.name} - ${row.hours} ชม.`, "approve")}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                                title="อนุมัติ"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openModal(row.id, `${row.user?.name} - ${row.hours} ชม.`, "reject")}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                title="ปฏิเสธ"
                              >
                                <XCircle className="w-5 h-5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <ApprovalModal
          isOpen={open}
          mode={mode}
          label={selected?.label}
          onClose={() => setOpen(false)}
          onConfirm={(reason?: string) => {
            if (!selected) return;
            mutate.mutate({ id: selected.id, action: mode, reason });
          }}
        />
      </div>
    </PageTransition>
  );
}
