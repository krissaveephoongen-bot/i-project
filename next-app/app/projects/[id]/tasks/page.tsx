"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import ProjectTabs from "@/app/components/ProjectTabs";
import PageTransition from "@/app/components/PageTransition";
import { Skeleton } from "@/app/components/ui/Skeleton";
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
} from "lucide-react";
import { clsx } from "clsx";
import KanbanBoard from "@/app/components/kanban/KanbanBoard";
import ProjectGantt from "@/app/components/gantt/ProjectGantt";
import BurndownChart from "@/app/components/charts/BurndownChart";
import { Task } from "@/lib/tasks";

export default function ProjectTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [filter, setFilter] = useState<
    "all" | "completed" | "in-progress" | "pending"
  >("all");
  const [viewMode, setViewMode] = useState<
    "list" | "board" | "gantt" | "burndown"
  >("list");
  const [dbProjectId, setDbProjectId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const params = useParams() as Record<
    string,
    string | string[] | undefined
  > | null;
  const projectId =
    typeof params?.id === "string"
      ? params!.id
      : Array.isArray(params?.id)
        ? (params!.id as string[])[0]
        : "";
  const router = useRouter();

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        setLoading(true);

        setDbProjectId(projectId);
        const res = await fetch(`/api/projects/tasks?projectId=${projectId}`);
        const rows = res.ok ? await res.json() : [];
        const transformedTasks = (rows || []).map((task: any) => ({
          id: task.id,
          title: task.title || task.name || "Untitled Task",
          description: task.description,
          status: task.status,
          priority: task.priority || "medium",
          dueDate: task.dueDate,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          projectId: task.projectId || projectId,
          milestoneId: task.milestoneId,
          assignedTo: task.assignedTo,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          // Kanban-specific fields
          phase: task.phase,
          weight: task.weight || 5,
          progressPlan: task.progressPlan || 0,
          progressActual: task.progressActual || 0,
          startDate: task.startDate,
          endDate: task.endDate,
          assigned_to: task.assignedTo || "Unassigned",
          vendor: task.vendor || "",
          // Relations
          projects: { id: projectId, name: task.project_name || "Unknown" },
          assigned_user: task.assigned_user || {
            id: task.assignedTo || "",
            name: task.assigned_user?.name || "Unassigned",
          },
        }));
        setTasks(transformedTasks);
        setError(null);
      } catch (err) {
        setError(`โหลดข้อมูลงานไม่สำเร็จ: ${(err as Error).message}`);
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [projectId]);

  const addTask = async () => {
    const pid = dbProjectId || projectId;
    if (!pid) {
      try {
        alert("ไม่พบรหัสโครงการ");
      } catch {}
      return;
    }

    try {
      // Primary: use /api/tasks (schema-flexible)
      const primary = await fetch(`/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "งานใหม่",
          projectId: pid,
          status: "todo",
        }),
      });
      let data: any = null;
      if (!primary.ok) {
        // Fallback: try generic /api/tasks which is schema-flexible
        const fbRes = await fetch(`/api/projects/tasks/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: pid,
            name: "งานใหม่",
            status: "Pending",
            phase: "Development",
            weight: 5,
            progressPlan: 0,
            progressActual: 0,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        });
        if (!fbRes.ok) {
          const msg = (() => {
            try {
              return (fbRes as any)?.statusText || "สร้างงานไม่สำเร็จ";
            } catch {
              return "สร้างงานไม่สำเร็จ";
            }
          })();
          try {
            alert(msg);
          } catch {}
          return;
        }
        data = await fbRes.json();
      } else {
        data = await primary.json();
      }
      if (data) {
        setTasks((prev) => [
          ...prev,
          {
            id: data.id,
            title: data.name || "งานใหม่",
            status: data.status,
            projectId: data.projectId || projectId,
            milestoneId: data.milestoneId,
            // Kanban-specific fields
            phase: data.phase,
            weight: data.weight,
            progressPlan: data.progressPlan,
            progressActual: data.progressActual,
            startDate: data.startDate,
            endDate: data.endDate,
            // Relations
            projects: { id: projectId, name: "Project" },
            assigned_user: {
              id: "",
              name: "Unassigned",
            },
          },
        ]);
        const id = data.id;
        if (id && projectId) {
          const url = `/projects/${projectId}/tasks/${id}/edit`;
          window.location.assign(url);
        }
      }
    } catch (err) {
      console.error("Error adding task:", err);
      try {
        alert("เพิ่มงานไม่สำเร็จ");
      } catch {}
      setError("เพิ่มงานไม่สำเร็จ");
    }
  };

  const parseCSV = (text: string) => {
    const rows: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "\n" && !inQuotes) {
        rows.push(cur.trimEnd());
        cur = "";
      } else if (ch === "\r") {
      } else {
        cur += ch;
      }
    }
    if (cur.length) rows.push(cur.trimEnd());
    const split = (line: string) => {
      const cols: string[] = [];
      let c = "";
      let q = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (q && line[i + 1] === '"') {
            c += '"';
            i++;
          } else {
            q = !q;
          }
        } else if (ch === "," && !q) {
          cols.push(c.trim());
          c = "";
        } else {
          c += ch;
        }
      }
      cols.push(c.trim());
      return cols;
    };
    if (rows.length === 0) return [];
    const header = split(rows[0]).map((h) => h.toLowerCase());
    const items: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const line = rows[i];
      if (!line.trim()) continue;
      const cols = split(line);
      const rec: any = {};
      header.forEach((h, idx) => {
        rec[h] = cols[idx] ?? "";
      });
      items.push(rec);
    }
    return items;
  };

  const triggerUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleWbsFile = async (file: File) => {
    const pid = dbProjectId || projectId;
    if (!pid) {
      try {
        alert("ไม่พบรหัสโครงการ");
      } catch {}
      return;
    }
    try {
      setUploading(true);
      const text = await file.text();
      const rows = parseCSV(text);
      let okCount = 0;
      let failCount = 0;
      for (const r of rows) {
        const title = r["title"] || r["name"] || r["งาน"] || "Task";
        const status =
          r["status"] ||
          r["สถานะ"] ||
          "todo";
        const weightRaw = r["weight"] || r["น้ำหนัก"] || "";
        const weight = Number(weightRaw || 0) || 0;
        const startDate = r["startdate"] || r["start_date"] || r["วันที่เริ่ม"] || "";
        const endDate = r["enddate"] || r["end_date"] || r["วันที่สิ้นสุด"] || "";
        const body: any = { title, projectId: pid, status };
        if (weight) body.estimatedHours = weight;
        if (startDate) body.dueDate = endDate || startDate;
        const res = await fetch(`/api/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          okCount++;
          setTasks((prev) => [
            ...prev,
            {
              id: data.id,
              title: data.title || title,
              status: data.status || "todo",
              projectId: pid,
              milestoneId: null,
              phase: null,
              weight: weight || 0,
              progressPlan: 0,
              progressActual: 0,
              startDate: startDate || null,
              endDate: endDate || null,
              projects: { id: pid, name: "Project" },
              assigned_user: { id: "", name: "Unassigned" },
            } as any,
          ]);
        } else {
          failCount++;
        }
      }
      try {
        alert(`นำเข้าเสร็จสิ้น: สำเร็จ ${okCount} รายการ, ล้มเหลว ${failCount} รายการ`);
      } catch {}
    } catch (e) {
      try {
        alert("นำเข้าไม่สำเร็จ");
      } catch {}
    } finally {
      setUploading(false);
    }
  };

  const updateTask = async (id: string, updatedFields: any) => {
    const res = await fetch(`/api/projects/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updatedFields }),
    });
    if (res.ok) {
      // No need to await json if we just trust it worked, but better to update local state
      // const data = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)),
      );
    }
  };

  const handleBoardUpdate = async (taskId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "Completed") {
      updates.progress_actual = 100;
      updates.progressActual = 100;
    } else if (newStatus === "Pending") {
      updates.progress_actual = 0;
      updates.progressActual = 0;
    }
    await updateTask(taskId, updates);
  };

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/projects/tasks?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "In Progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "Pending":
        return <Circle className="w-5 h-5 text-slate-400" />;
      default:
        return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "Completed":
        return "เสร็จสิ้น";
      case "In Progress":
        return "กำลังดำเนินการ";
      case "Pending":
        return "รอดำเนินการ";
      default:
        return status;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status.toLowerCase().replace(" ", "-") === filter;
  });

  const totalWeight = tasks.reduce((sum, t) => sum + (t.weight || 0), 0);
  const completedWeight = tasks
    .filter((t) => t.status === "Completed")
    .reduce((sum, t) => sum + (t.weight || 0), 0);
  const inProgressWeight = tasks
    .filter((t) => t.status === "In Progress")
    .reduce(
      (sum, t) =>
        sum +
        ((t.weight || 0) * (t.progressActual || t.progress_actual || 0)) / 100,
      0,
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="กำลังโหลดงาน..."
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "โครงการ", href: "/projects" },
            { label: "กำลังโหลด..." },
          ]}
        />
        <div className="pt-24 px-6 pb-6 container mx-auto">
          <Skeleton className="h-12 w-full mb-6 rounded-xl" />
          <Skeleton className="h-40 w-full mb-6 rounded-xl" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="งานในโครงการ (WBS)"
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "โครงการ", href: "/projects" },
            { label: "รายละเอียดโครงการ", href: `/projects/${projectId}` },
            { label: "งาน" },
          ]}
        />

        <div className="pt-24 px-6 pb-6 container mx-auto space-y-6 w-full max-w-full">
          <ProjectTabs />

          {/* Progress Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  โครงสร้างการแตกงาน (WBS)
                </h2>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode("list")}
                    className={clsx(
                      "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                      viewMode === "list"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <LayoutList className="w-4 h-4" />
                    รายการ
                  </button>
                  <button
                    onClick={() => setViewMode("board")}
                    className={clsx(
                      "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                      viewMode === "board"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <KanbanIcon className="w-4 h-4" />
                    บอร์ด
                  </button>
                  <button
                    onClick={() => setViewMode("gantt")}
                    className={clsx(
                      "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                      viewMode === "gantt"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <CalendarRange className="w-4 h-4" />
                    Gantt
                  </button>
                  <button
                    onClick={() => setViewMode("burndown")}
                    className={clsx(
                      "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                      viewMode === "burndown"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <TrendingDown className="w-4 h-4" />
                    Burn-down
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={addTask}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm w-full md:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" /> เพิ่มงาน
                </button>
                <button
                  disabled={uploading}
                  onClick={triggerUpload}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm w-full md:w-auto justify-center disabled:opacity-70"
                >
                  อัปโหลด WBS (CSV)
                </button>
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

            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  ความคืบหน้าภาพรวม
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {Math.round(completedWeight + inProgressWeight)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                  style={{ width: `${completedWeight + inProgressWeight}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>น้ำหนักรวม: {totalWeight}%</span>
                <span>
                  เสร็จสิ้น: {completedWeight}% | กำลังดำเนินการ:{" "}
                  {inProgressWeight.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Filter Tabs (Only show in List view usually, but helpful in board too) */}
            {viewMode === "list" && (
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                {[
                  { id: "all", label: "งานทั้งหมด" },
                  { id: "completed", label: "เสร็จสิ้น" },
                  { id: "in-progress", label: "กำลังดำเนินการ" },
                  { id: "pending", label: "รอดำเนินการ" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                      filter === f.id
                        ? "bg-[#2563EB] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content Area */}
            {viewMode === "list" ? (
              /* Task Tree List View */
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow transition-shadow"
                  >
                    <div
                      className="flex items-center gap-3 p-4 bg-slate-50/50 hover:bg-slate-100/80 cursor-pointer transition-colors"
                      onClick={() => toggleExpand(task.id)}
                    >
                      {expandedTasks.includes(task.id) ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      {getStatusIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 truncate">
                            {task.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {task.phase} • {task.startDate} - {task.endDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span
                          className={clsx(
                            "px-2 py-1 rounded text-xs font-medium hidden sm:inline-block",
                            getStatusColor(task.status),
                          )}
                        >
                          {translateStatus(task.status)}
                        </span>
                        <div className="w-24 hidden md:block">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">
                              Progress
                            </span>
                            <span className="text-xs font-medium text-slate-700">
                              {task.progressActual}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                "h-full rounded-full",
                                task.progressActual === 100
                                  ? "bg-green-500"
                                  : "bg-[#2563EB]",
                              )}
                              style={{ width: `${task.progressActual}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-slate-900 w-12 text-right hidden sm:inline-block">
                          {task.weight}%
                        </span>
                        <span className="text-sm text-slate-500 w-24 truncate hidden lg:block">
                          {task.assigned_to}
                        </span>
                        <button
                          className="px-3 py-1 bg-[#2563EB] text-white rounded text-xs hover:bg-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/projects/${projectId}/tasks/${task.id}/edit`,
                            );
                          }}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(task.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Task Details */}
                    {expandedTasks.includes(task.id) && (
                      <div className="p-4 bg-white border-t border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              ผู้รับผิดชอบ
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {task.assigned_to}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              ผู้ขาย/ผู้รับเหมา
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {task.vendor || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              แผนความคืบหน้า
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {task.progressPlan}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              ระยะเวลา
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {task.endDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : viewMode === "board" ? (
              /* Kanban Board View */
              <div className="min-h-[600px] w-full overflow-auto">
                <KanbanBoard
                  tasks={tasks}
                  onTaskUpdate={handleBoardUpdate}
                  onTaskClick={(task) =>
                    router.push(`/projects/${projectId}/tasks/${task.id}/edit`)
                  }
                />
              </div>
            ) : viewMode === "burndown" ? (
              /* Burn-down Chart View */
              <div className="w-full py-6">
                <BurndownChart tasks={tasks} />
              </div>
            ) : (
              /* Gantt Chart View */
              <div className="w-full overflow-x-auto py-6">
                <ProjectGantt tasks={tasks} />
              </div>
            )}
          </div>

          {/* Task Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[120px]">
              <p className="text-sm text-slate-600 mb-1">งานทั้งหมด</p>
              <p className="text-2xl font-bold text-slate-900">
                {tasks.length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[120px]">
              <p className="text-sm text-slate-600 mb-1">เสร็จสิ้น</p>
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter((t) => t.status === "Completed").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[120px]">
              <p className="text-sm text-slate-600 mb-1">กำลังดำเนินการ</p>
              <p className="text-2xl font-bold text-blue-600">
                {tasks.filter((t) => t.status === "In Progress").length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[120px]">
              <p className="text-sm text-slate-600 mb-1">รอดำเนินการ</p>
              <p className="text-2xl font-bold text-slate-600">
                {tasks.filter((t) => t.status === "Pending").length}
              </p>
            </div>
          </div>
        </div>

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  ยืนยันการลบงาน
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  คุณต้องการลบงานนี้หรือไม่
                </p>
              </div>
              <div className="p-4 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    await deleteTask(deleteConfirmId!);
                    setDeleteConfirmId(null);
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
