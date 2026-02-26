"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Task } from "@/lib/tasks";

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

  const router = useRouter();

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
                    className="overflow-hidden hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                    onClick={() => toggleExpand(task.id)}
                  >
                    <div className="p-4 flex items-center gap-4">
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
