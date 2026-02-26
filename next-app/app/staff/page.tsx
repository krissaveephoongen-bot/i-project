"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Menu,
  LogOut,
  User,
  BarChart3,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import {
  useTasks,
  useProjects,
  useTimesheets,
} from "../../hooks/useSupabaseData";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date: string;
  progress: number;
  project_id: string;
  projects?: {
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  start_date: string;
  end_date?: string;
  budget?: number;
  clients?: {
    name: string;
  };
}

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  description: string;
  status: string;
  projects?: {
    name: string;
  };
  tasks?: {
    title: string;
  };
}

export default function StaffPortalPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "tasks" | "timesheet" | "projects"
  >("dashboard");
  const router = useRouter();

  // Use real database hooks
  const {
    data: tasks,
    loading: tasksLoading,
    error: tasksError,
  } = useTasks(user?.id);
  const { data: projects, loading: projectsLoading } = useProjects();
  const { data: timeEntries, loading: timesheetsLoading } = useTimesheets(
    user?.id,
  );

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("staffToken");
    const userData = localStorage.getItem("staffUser");

    if (!token || !userData) {
      router.push("/staff/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffUser");
    router.push("/staff/login");
  };

  const completedTasks =
    tasks?.filter((t) => t.status === "completed").length || 0;
  const inProgressTasks =
    tasks?.filter((t) => t.status === "in_progress").length || 0;
  const pendingTasks = tasks?.filter((t) => t.status === "todo").length || 0;
  const overdueTasks =
    tasks?.filter((t) => {
      const dueDate = new Date(t.due_date);
      return dueDate < new Date() && t.status !== "completed";
    }).length || 0;

  const totalHoursThisWeek =
    timeEntries
      ?.filter((entry) => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      })
      .reduce((sum, entry) => sum + entry.hours, 0) || 0;

  const isLoading = tasksLoading || projectsLoading || timesheetsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading staff portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Staff Portal Sidebar - Desktop */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-[260px] md:bg-[#0F172A] md:text-white md:flex md:flex-col md:z-50">
        <div className="h-[64px] flex items-center px-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">i-Project</h1>
        </div>
        <div className="p-4 border-b border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
            Staff Portal
          </p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={clsx(
              "w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left",
              activeTab === "dashboard"
                ? "bg-[#2563EB]"
                : "text-slate-300 hover:bg-slate-700",
            )}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={clsx(
              "w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left",
              activeTab === "tasks"
                ? "bg-[#2563EB]"
                : "text-slate-300 hover:bg-slate-700",
            )}
          >
            My Tasks
          </button>
          <button
            onClick={() => setActiveTab("timesheet")}
            className={clsx(
              "w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left",
              activeTab === "timesheet"
                ? "bg-[#2563EB]"
                : "text-slate-300 hover:bg-slate-700",
            )}
          >
            Timesheet
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={clsx(
              "w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left",
              activeTab === "projects"
                ? "bg-[#2563EB]"
                : "text-slate-300 hover:bg-slate-700",
            )}
          >
            Projects
          </button>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {user?.name || "Staff"}
              </p>
              <p className="text-xs text-slate-400">
                {user?.email || "staff@company.com"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-[64px] bg-[#0F172A] text-white flex items-center justify-between px-4 z-50">
        <h1 className="text-lg font-bold">i-Project</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 h-screen w-[260px] bg-[#0F172A] text-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-1">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setMobileMenuOpen(false);
                }}
                className={clsx(
                  "w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === "dashboard"
                    ? "bg-[#2563EB]"
                    : "text-slate-300 hover:bg-slate-700",
                )}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab("tasks");
                  setMobileMenuOpen(false);
                }}
                className={clsx(
                  "w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === "tasks"
                    ? "bg-[#2563EB]"
                    : "text-slate-300 hover:bg-slate-700",
                )}
              >
                My Tasks
              </button>
              <button
                onClick={() => {
                  setActiveTab("timesheet");
                  setMobileMenuOpen(false);
                }}
                className={clsx(
                  "w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === "timesheet"
                    ? "bg-[#2563EB]"
                    : "text-slate-300 hover:bg-slate-700",
                )}
              >
                Timesheet
              </button>
              <button
                onClick={() => {
                  setActiveTab("projects");
                  setMobileMenuOpen(false);
                }}
                className={clsx(
                  "w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === "projects"
                    ? "bg-[#2563EB]"
                    : "text-slate-300 hover:bg-slate-700",
                )}
              >
                Projects
              </button>
            </div>
            <div className="mt-4 p-4 bg-[#1E293B] rounded-lg">
              <p className="text-sm font-medium">{user?.name || "Staff"}</p>
              <p className="text-xs text-slate-400">
                {user?.email || "staff@company.com"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="md:ml-[260px] pt-[64px] md:pt-0 min-h-screen">
        <header className="hidden md:h-[64px] md:flex md:items-center md:px-6 md:border-b md:border-slate-200 md:bg-white">
          <h2 className="text-lg font-semibold text-slate-900">Staff Portal</h2>
        </header>

        <div className="p-4 md:p-6">
          {tasksError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{tasksError}</p>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div>
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-xl p-6 mb-6 text-white">
                <h1 className="text-xl md:text-2xl font-bold mb-2">
                  สวัสดี, {user?.name || "Staff"}!
                </h1>
                <p className="text-blue-100 text-sm">
                  นี่คือภาพรวมของงานและโปรเจคของคุณ
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {tasks?.length || 0}
                      </p>
                      <p className="text-xs text-slate-500">งานทั้งหมด</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {inProgressTasks}
                      </p>
                      <p className="text-xs text-slate-500">กำลังทำ</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {completedTasks}
                      </p>
                      <p className="text-xs text-slate-500">เสร็จแล้ว</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {overdueTasks}
                      </p>
                      <p className="text-xs text-slate-500">เกินกำหนด</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="px-4 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Recent Tasks
                    </h3>
                  </div>
                  <div className="p-4">
                    {tasks?.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {task.project}
                          </p>
                        </div>
                        <span
                          className={clsx(
                            "px-2 py-1 rounded text-xs",
                            task.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700",
                          )}
                        >
                          {task.status === "completed"
                            ? "เสร็จ"
                            : task.status === "in_progress"
                              ? "กำลังทำ"
                              : "รอดำเนินการ"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="px-4 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Time Tracking
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold text-slate-900">
                        {totalHoursThisWeek}
                      </p>
                      <p className="text-sm text-slate-600">
                        ชั่วโมงที่ทำสัปดาห์นี้
                      </p>
                    </div>
                    <div className="space-y-2">
                      {timeEntries?.slice(0, 3).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {entry.task}
                            </p>
                            <p className="text-xs text-slate-500">
                              {entry.project}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-900">
                              {entry.hours}h
                            </p>
                            <span
                              className={clsx(
                                "text-xs",
                                entry.status === "approved"
                                  ? "text-green-600"
                                  : entry.status === "pending"
                                    ? "text-yellow-600"
                                    : "text-red-600",
                              )}
                            >
                              {entry.status === "approved"
                                ? "อนุมัติ"
                                : entry.status === "pending"
                                  ? "รออนุมัติ"
                                  : "ปฏิเสธ"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-4 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  My Tasks
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {tasks?.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium text-slate-900">
                            {task.title}
                          </h4>
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded text-xs",
                              task.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : task.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-700",
                            )}
                          >
                            {task.status === "completed"
                              ? "เสร็จ"
                              : task.status === "in_progress"
                                ? "กำลังทำ"
                                : "รอดำเนินการ"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {task.projects?.name || "No Project"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due:{" "}
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : "No due date"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                "h-full rounded-full transition-all",
                                task.progress === 100
                                  ? "bg-green-500"
                                  : "bg-[#2563EB]",
                              )}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 w-10">
                            {task.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "timesheet" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Timesheet
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Add Time Entry
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {timeEntries?.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-slate-900">
                            {entry.tasks?.title || "No Task"}
                          </h4>
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded text-xs",
                              entry.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : entry.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700",
                            )}
                          >
                            {entry.status === "approved"
                              ? "อนุมัติ"
                              : entry.status === "pending"
                                ? "รออนุมัติ"
                                : "ปฏิเสธ"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {entry.projects?.name || "No Project"}
                          </span>
                          <span>{entry.description}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">
                          {entry.hours}h
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects?.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {project.name}
                    </h3>
                    <span
                      className={clsx(
                        "px-2 py-1 rounded text-xs",
                        project.status === "active"
                          ? "bg-green-100 text-green-700"
                          : project.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700",
                      )}
                    >
                      {project.status === "active"
                        ? "Active"
                        : project.status === "completed"
                          ? "Completed"
                          : "On Hold"}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-slate-600 mb-4">
                      {project.description}
                    </p>
                  )}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Progress</span>
                        <span className="text-xs font-medium text-slate-900">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2563EB] rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Start:{" "}
                        {project.start_date
                          ? new Date(project.start_date).toLocaleDateString()
                          : "No start date"}
                      </span>
                      {project.end_date && (
                        <span>
                          End: {new Date(project.end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
