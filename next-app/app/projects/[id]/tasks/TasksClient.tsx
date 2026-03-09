"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  LayoutList,
  Kanban as KanbanIcon,
  CalendarRange,
  TrendingDown,
  Activity,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";

import ProjectTabs from "@/app/components/ProjectTabs";
import KanbanBoard from "@/app/components/kanban/KanbanBoard";
import ProjectGantt from "@/app/components/gantt/ProjectGantt";
import BurndownChart from "@/app/components/charts/BurndownChart";
import TaskSheet from "@/app/components/TaskSheet";
import SCurveChart from "../SCurveChart";
import { Task } from "../../../../lib/tasks";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
} from "../../actions";

interface TasksClientProps {
  projectId: string;
  initialTasks: Task[];
  users: Array<{ id: string; name: string }>;
  milestones: Array<{ id: string; title: string }>;
  projects: Array<{ id: string; name: string }>;
}

export default function TasksClient({
  projectId,
  initialTasks,
  users,
  milestones,
  projects,
}: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [filter, setFilter] = useState<
    "all" | "completed" | "in_progress" | "pending"
  >("all");
  const [viewMode, setViewMode] = useState<
    "list" | "board" | "gantt" | "burndown" | "scurve"
  >("list");
  
  // Sheet & Modal State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [progressOpen, setProgressOpen] = useState<{ id: string; value: number; status: string } | null>(null);
  const [parentOpen, setParentOpen] = useState<{ id: string; parentId: string | null } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [statusQuery, setStatusQuery] = useState<string>("all");
  const [assigneeQuery, setAssigneeQuery] = useState<string>("");
  const [milestoneQuery, setMilestoneQuery] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const s = searchParams?.get("status") || "all";
    const a = searchParams?.get("assignee") || "";
    const m = searchParams?.get("milestone") || "";
    setStatusQuery(s);
    setAssigneeQuery(a);
    setMilestoneQuery(m);
    // sync list filter button highlight
    setFilter((s as any) || "all");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const pushQuery = (patch: Partial<{ status: string; assignee: string; milestone: string }>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (typeof patch.status !== "undefined") {
      if (!patch.status || patch.status === "all") params.delete("status");
      else params.set("status", patch.status);
    }
    if (typeof patch.assignee !== "undefined") {
      if (!patch.assignee) params.delete("assignee");
      else params.set("assignee", patch.assignee);
    }
    if (typeof patch.milestone !== "undefined") {
      if (!patch.milestone) params.delete("milestone");
      else params.set("milestone", patch.milestone);
    }
    router.push(`?${params.toString()}`);
  };

  // Create/Update Handler
  const handleSaveTask = async (data: any) => {
    if (selectedTask) {
      // Update
      const result = await updateTaskAction(selectedTask.id, data);
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === selectedTask.id ? { ...t, ...result.data } : t))
        );
        toast.success("อัปเดตงานสำเร็จ");
      }
    } else {
      // Create
      const result = await createTaskAction({
        ...data,
        projectId,
        progressPlan: 0,
        progressActual: 0,
      });
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        const newTask = result.data;
        // Optimistically add to list (revalidation will happen on server but we update local state for speed)
        setTasks((prev) => [
          {
            id: newTask.id,
            title: newTask.title,
            status: newTask.status,
            priority: newTask.priority,
            projectId: newTask.project_id,
            milestoneId: newTask.milestone_id,
            assignedTo: newTask.assigned_to,
            weight: newTask.weight,
            progressPlan: newTask.progress_plan,
            progressActual: newTask.progress_actual,
            startDate: newTask.start_date,
            endDate: newTask.end_date,
            // Add display fields
            projects: { id: projectId, name: "Project" },
            assigned_user: users.find(u => u.id === newTask.assigned_to) || { id: "", name: "Unassigned" },
            assigned_to: users.find(u => u.id === newTask.assigned_to)?.name || "Unassigned",
          } as any, // Cast to avoid strict type mismatch with legacy fields
          ...prev,
        ]);
        toast.success("สร้างงานสำเร็จ");
      }
    }
    setIsSheetOpen(false);
  };

  const openCreateSheet = () => {
    setSelectedTask(null);
    setIsSheetOpen(true);
  };

  const openEditSheet = (task: Task) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  const createRiskFromTask = async (task: Task) => {
    try {
      const res = await fetch("/api/projects/risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title: `Task: ${task.title}`,
          severity: "Medium",
          status: "Open",
        }),
      });
      const json = await res.json();
      if (!json?.id) {
        toast.error("บันทึกความเสี่ยงไม่สำเร็จ");
        return;
      }
      toast.success("บันทึกความเสี่ยงจากงานนี้แล้ว");
    } catch {
      toast.error("บันทึกความเสี่ยงไม่สำเร็จ");
    }
  };

  const openParent = (task: Task) => {
    setParentOpen({ id: task.id, parentId: (task as any).parentId || null });
  };

  const saveParent = async () => {
    if (!parentOpen) return;
    const { id, parentId } = parentOpen;
    // Prevent setting parent to itself or its descendants
    if (parentId && parentId === id) {
      toast.error("ไม่สามารถตั้ง Parent เป็นตัวเองได้");
      return;
    }
    if (parentId && isDescendant(parentId, id)) {
      toast.error("ไม่สามารถตั้ง Parent เป็นลูกหลานของงานนี้ได้");
      return;
    }
    const res = await updateTaskAction(id, { parentId: parentId || null } as any);
    if (res?.error) {
      toast.error("ปรับโครงสร้างงานไม่สำเร็จ");
      return;
    }
    setTasks(prev => prev.map(t => t.id === id ? ({ ...t, parentId: parentId || null } as any) : t));
    toast.success("อัปเดตโครงสร้างงานสำเร็จ");
    setParentOpen(null);
  };

  const isDescendant = (candidateId: string, ancestorId: string) => {
    // Walk up from candidateId to root; if we meet ancestorId then candidate is descendant of ancestor
    const byId: Record<string, any> = {};
    tasks.forEach(t => { byId[t.id] = t; });
    let cur: any = byId[candidateId];
    const guard = new Set<string>();
    while (cur && cur.parentId && !guard.has(cur.parentId)) {
      if (cur.parentId === ancestorId) return true;
      guard.add(cur.parentId);
      cur = byId[cur.parentId];
    }
    return false;
  };

  const deleteTask = async (id: string) => {
    try {
      const result = await deleteTaskAction(id);
      if (result.error) {
        toast.error(`ลบงานไม่สำเร็จ: ${result.error}`);
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("ลบงานสำเร็จ");
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("เกิดข้อผิดพลาดในการลบงาน");
    }
  };

  const handleBoardUpdate = async (taskId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "completed") {
      updates.progressActual = 100;
    } else if (newStatus === "pending") {
      updates.progressActual = 0;
    }
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    
    const result = await updateTaskAction(taskId, updates);
    if (result.error) {
      toast.error("Failed to update status");
      // Revert if needed, but for now simple toast
    }
  };

  const openProgress = (task: Task) => {
    setProgressOpen({ id: task.id, value: task.progressActual || 0, status: task.status });
  };

  const saveProgress = async () => {
    if (!progressOpen) return;
    const { id, value } = progressOpen;
    const status =
      value >= 100 ? "completed" : value <= 0 ? "pending" : "in_progress";
    // optimistic
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    const res = await updateTaskAction(id, { status });
    if (res.error) {
      toast.error("บันทึกความคืบหน้าไม่สำเร็จ");
      return;
    }
    toast.success("บันทึกความคืบหน้าสำเร็จ");
    setProgressOpen(null);
  };

  // CSV Upload Logic (Simplified)
  const parseCSV = (text: string) => {
    const rows = text.split("\n").map(r => r.trim()).filter(r => r);
    if (rows.length < 2) return [];
    const headers = rows[0].split(",").map(h => h.toLowerCase().trim());
    return rows.slice(1).map(row => {
      const values = row.split(",");
      const obj: any = {};
      headers.forEach((h, i) => obj[h] = values[i]?.trim());
      return obj;
    });
  };

  const handleWbsFile = async (file: File) => {
    try {
      setUploading(true);
      const text = await file.text();
      const rows = parseCSV(text);
      let count = 0;
      
      for (const r of rows) {
        const title = r["title"] || r["name"] || "Task";
        await createTaskAction({
          title,
          projectId,
          status: "todo",
          priority: "medium",
          weight: Number(r["weight"]) || 1,
          progressPlan: 0,
          progressActual: 0,
        });
        count++;
      }
      toast.success(`Imported ${count} tasks. Refreshing...`);
      router.refresh(); // Refresh server data
    } catch (e) {
      toast.error("Import failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Helpers
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "in_progress": return <Clock className="w-5 h-5 text-blue-500" />;
      case "pending": return <Circle className="w-5 h-5 text-slate-400" />;
      default: return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      default: return "outline";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "completed": return "เสร็จสิ้น";
      case "in_progress": return "กำลังดำเนินการ";
      case "pending": return "รอดำเนินการ";
      case "todo": return "ต้องทำ";
      default: return status;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const totalWeight = tasks.reduce((sum, t) => sum + (t.weight || 0), 0);
  const completedWeight = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.weight || 0), 0);
  const inProgressWeight = tasks
    .filter((t) => t.status === "in_progress")
    .reduce((sum, t) => sum + ((t.weight || 0) * (t.progressActual || 0)) / 100, 0);

  return (
    <div className="pt-24 px-4 md:px-6 pb-6 container mx-auto space-y-6 max-w-7xl">
      <ProjectTabs />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <CardTitle>โครงสร้างการแตกงาน (WBS)</CardTitle>
              <div className="flex bg-muted p-1 rounded-lg">
                {[
                  { id: "list", icon: LayoutList, label: "รายการ" },
                  { id: "board", icon: KanbanIcon, label: "บอร์ด" },
                  { id: "gantt", icon: CalendarRange, label: "Gantt" },
                  { id: "burndown", icon: TrendingDown, label: "Burn-down" },
                  { id: "scurve", icon: Activity, label: "S-Curve" },
                ].map((v) => (
                  <Button
                    key={v.id}
                    variant={viewMode === v.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(v.id as any)}
                    className="gap-2"
                  >
                    <v.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{v.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Root drop zone */}
              <div
                className={`hidden md:flex items-center px-3 py-2 border rounded text-xs ${hoverId === "__root__" ? "bg-blue-50 border-blue-300" : "bg-white"}`}
                onDragOver={(e) => { e.preventDefault(); setHoverId("__root__"); }}
                onDragLeave={() => setHoverId(null)}
                onDrop={async (e) => {
                  e.preventDefault();
                  const src = e.dataTransfer.getData("text/plain") || dragId;
                  setHoverId(null);
                  if (!src) return;
                  if (tasks.find(t => t.id === src && !(t as any).parentId)) return; // already root
                  const res = await updateTaskAction(src, { parentId: null } as any);
                  if ((res as any)?.error) {
                    toast.error("ตั้งค่าเป็น Root ไม่สำเร็จ");
                    return;
                  }
                  setTasks(prev => prev.map(t => t.id === src ? ({ ...t, parentId: null } as any) : t));
                  toast.success("ตั้งค่าเป็น Root แล้ว");
                  setDragId(null);
                }}
              >
                ปล่อยที่นี่เพื่อตั้งเป็น Root
              </div>
              {/* Filters: Status / Assignee / Milestone (sync URL) */}
              <select
                className="px-2 py-1 border rounded text-sm"
                value={statusQuery}
                onChange={(e) => {
                  setStatusQuery(e.target.value);
                  pushQuery({ status: e.target.value });
                }}
              >
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="todo">ต้องทำ</option>
              </select>
              <select
                className="px-2 py-1 border rounded text-sm"
                value={assigneeQuery}
                onChange={(e) => {
                  setAssigneeQuery(e.target.value);
                  pushQuery({ assignee: e.target.value });
                }}
              >
                <option value="">ผู้รับผิดชอบ: ทั้งหมด</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <select
                className="px-2 py-1 border rounded text-sm"
                value={milestoneQuery}
                onChange={(e) => {
                  setMilestoneQuery(e.target.value);
                  pushQuery({ milestone: e.target.value });
                }}
              >
                <option value="">ไมล์สโตน: ทั้งหมด</option>
                {milestones.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusQuery("all");
                  setAssigneeQuery("");
                  setMilestoneQuery("");
                  pushQuery({ status: "all", assignee: "", milestone: "" });
                }}
              >
                ล้างตัวกรอง
              </Button>
              <Button onClick={openCreateSheet} className="gap-2 flex-1 md:flex-none">
                <Plus className="w-4 h-4" /> เพิ่มงาน
              </Button>
              <Button
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 flex-1 md:flex-none"
              >
                <Upload className="w-4 h-4" /> CSV
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleWbsFile(f);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="hidden"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">ความคืบหน้าภาพรวม</span>
              <span className="text-sm font-medium">{Math.round(completedWeight + inProgressWeight)}%</span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completedWeight + inProgressWeight}%` }}
              />
            </div>
          </div>

          {/* Filters */}
          {viewMode === "list" && (
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {[
                { id: "all", label: "งานทั้งหมด" },
                { id: "completed", label: "เสร็จสิ้น" },
                { id: "in_progress", label: "กำลังดำเนินการ" },
                { id: "pending", label: "รอดำเนินการ" },
              ].map((f) => (
                <Button
                  key={f.id}
                  variant={filter === f.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f.id as any)}
                  className="whitespace-nowrap"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          )}

          {/* View Content */}
          {viewMode === "list" ? (
            <div className="space-y-2">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">ไม่พบข้อมูลงาน</div>
              ) : (
                filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`overflow-hidden hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary ${hoverId === task.id ? "ring-2 ring-blue-300" : ""}`}
                    onClick={() => toggleExpand(task.id)}
                    draggable
                    onDragStart={(e) => {
                      setDragId(task.id);
                      try { e.dataTransfer.setData("text/plain", task.id); } catch {}
                    }}
                    onDragOver={(e) => { e.preventDefault(); setHoverId(task.id); }}
                    onDragLeave={() => setHoverId((h) => (h === task.id ? null : h))}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const src = e.dataTransfer.getData("text/plain") || dragId;
                      setHoverId(null);
                      if (!src || src === task.id) return;
                      if (isDescendant(task.id, src)) {
                        toast.error("ไม่สามารถย้ายไปยังลูกหลานของตัวเองได้");
                        return;
                      }
                      const res = await updateTaskAction(src, { parentId: task.id } as any);
                      if ((res as any)?.error) {
                        toast.error("ย้ายงานไม่สำเร็จ");
                        return;
                      }
                      setTasks(prev => prev.map(t => t.id === src ? ({ ...t, parentId: task.id } as any) : t));
                      toast.success("ย้ายงานสำเร็จ");
                      setDragId(null);
                    }}
                  >
                    <div className={`p-4 flex items-center gap-4 ${task.parentId ? "pl-8" : ""}`}>
                      {expandedTasks.includes(task.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="col-span-6 flex items-center gap-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <div className="font-medium truncate">{task.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {task.startDate ? `${task.startDate} - ${task.endDate}` : "No dates"}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-6 flex items-center justify-between md:justify-end gap-4">
                          <Badge variant={getStatusBadgeVariant(task.status) as any}>
                            {translateStatus(task.status)}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openProgress(task); }}>บันทึกความคืบหน้า</Button>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); createRiskFromTask(task); }}>บันทึกความเสี่ยง</Button>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openParent(task); }}>ตั้ง Parent</Button>
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); openEditSheet(task); }}>แก้ไข</Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(task.id); }}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : viewMode === "board" ? (
            <KanbanBoard tasks={tasks} onTaskUpdate={handleBoardUpdate} onTaskClick={openEditSheet} />
          ) : viewMode === "scurve" ? (
            <SCurveChart tasks={tasks} />
          ) : viewMode === "burndown" ? (
            <BurndownChart tasks={tasks} />
          ) : (
            <div className="w-full overflow-x-auto py-6">
              <ProjectGantt tasks={tasks} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <TaskSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        task={selectedTask}
        projectId={projectId}
        onSave={handleSaveTask}
        projects={projects}
        users={users}
        milestones={milestones}
      />
      {/* Quick Progress Modal */}
      {progressOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>บันทึกความคืบหน้า</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ความคืบหน้าจริง</span>
                  <span className="text-sm font-medium">{progressOpen.value}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progressOpen.value}
                  onChange={(e) => setProgressOpen(p => p ? { ...p, value: Number(e.target.value) } : p)}
                  className="w-full"
                />
                <div className="grid grid-cols-4 gap-2">
                  {[0,25,50,75,100].map(v => (
                    <Button key={v} variant="outline" onClick={() => setProgressOpen(p => p ? ({ ...p, value: v }) : p)}>{v}%</Button>
                  ))}
                </div>
                <div className="mt-2">
                  <label className="text-sm text-muted-foreground">สถานะ</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    value={progressOpen.status}
                    onChange={(e) => setProgressOpen(p => p ? ({ ...p, status: e.target.value }) : p)}
                  >
                    <option value="pending">รอดำเนินการ</option>
                    <option value="in_progress">กำลังดำเนินการ</option>
                    <option value="completed">เสร็จสิ้น</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setProgressOpen(null)}>ยกเลิก</Button>
                  <Button onClick={saveProgress}>บันทึก</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Set Parent Modal */}
      {parentOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>ตั้งงานแม่ (Parent)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="text-sm text-muted-foreground">เลือกงานแม่</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={parentOpen.parentId || ""}
                  onChange={(e) => setParentOpen(p => p ? ({ ...p, parentId: e.target.value || null }) : p)}
                >
                  <option value="">— ไม่มี —</option>
                  {tasks.filter(t => t.id !== parentOpen.id).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setParentOpen(null)}>ยกเลิก</Button>
                  <Button onClick={saveParent}>บันทึก</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>ยืนยันการลบ</CardTitle></CardHeader>
            <CardContent>คุณต้องการลบงานนี้หรือไม่?</CardContent>
            <div className="p-6 pt-0 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>ยกเลิก</Button>
              <Button variant="destructive" onClick={() => { deleteTask(deleteConfirmId); setDeleteConfirmId(null); }}>ลบ</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
