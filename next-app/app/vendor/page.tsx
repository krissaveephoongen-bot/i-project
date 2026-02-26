"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Upload,
  X,
  CheckCircle2,
  Clock,
  FileUp,
  Menu,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";
import { useVendorAuth } from "../../hooks/useAuth";

interface Task {
  id: string;
  taskName: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
  project: string;
  projectId: string;
  projectCode?: string;
  estimatedHours?: number;
  actualHours?: number;
}

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, progress: number, evidence: File | null) => void;
}

function TaskUpdateModal({ task, onClose, onUpdate }: TaskModalProps) {
  const [progress, setProgress] = useState(task.progress);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [evidenceName, setEvidenceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidence(file);
      setEvidenceName(file.name);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onUpdate(task.id, progress, evidence);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Update Progress
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Task
            </label>
            <p className="text-slate-900">{task.taskName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project
            </label>
            <p className="text-slate-600 text-sm">{task.project}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Progress: <span className="text-[#2563EB]">{progress}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Evidence <span className="text-red-500">*</span>
            </label>
            <div
              className={clsx(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                evidence
                  ? "border-green-300 bg-green-50"
                  : "border-slate-300 hover:border-[#2563EB]",
              )}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                {evidence ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                    <div className="text-left">
                      <p className="font-medium">{evidenceName}</p>
                      <p className="text-xs">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500">
                    <Upload className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
            {!evidence && (
              <p className="text-xs text-red-500 mt-1">Evidence is required</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!evidence || isLoading}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              evidence && !isLoading
                ? "bg-[#2563EB] text-white hover:bg-blue-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed",
            )}
          >
            {isLoading ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorPortalPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks">(
    "dashboard",
  );
  const router = useRouter();

  const { user, signOut } = useVendorAuth();

  // Use real database hooks
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push("/vendor/login");
      return;
    }
  }, [user, router]);

  const handleUpdate = async (
    taskId: string,
    progress: number,
    evidence: File | null,
  ) => {
    // This would be implemented with a real API call
    console.log("Updating task:", { taskId, progress, evidence });
  };

  const handleLogout = () => {
    signOut();
    router.push("/vendor/login");
  };

  const completedTasks =
    tasks?.filter((t: any) => t.progress === 100).length || 0;
  const inProgressTasks =
    tasks?.filter((t: any) => t.status === "in_progress").length || 0;

  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading vendor portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Vendor Portal Sidebar - Desktop */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-[260px] md:bg-[#0F172A] md:text-white md:flex md:flex-col md:z-50">
        <div className="h-[64px] flex items-center px-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">i-Project</h1>
        </div>
        <div className="p-4 border-b border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
            Vendor Portal
          </p>
        </div>
        <nav className="flex-1 py-4 px-3">
          <div className="px-4 py-2 bg-[#2563EB] rounded-lg text-sm font-medium">
            My Tasks
          </div>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || "V"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {user?.name || "Vendor"}
              </p>
              <p className="text-xs text-slate-400">
                {user?.email || "vendor@company.com"}
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
            <div className="mt-4">
              <div className="px-4 py-2 bg-[#2563EB] rounded-lg text-sm font-medium">
                My Tasks
              </div>
            </div>
            <div className="mt-4 p-4 bg-[#1E293B] rounded-lg">
              <p className="text-sm font-medium">{user?.name || "Vendor"}</p>
              <p className="text-xs text-slate-400">
                {user?.email || "vendor@company.com"}
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
          <h2 className="text-lg font-semibold text-slate-900">
            Vendor Portal
          </h2>
        </header>

        <div className="p-4 md:p-6">
          {tasksError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600">{tasksError}</p>
            </div>
          )}

          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-xl p-6 mb-6 text-white">
            <h1 className="text-xl md:text-2xl font-bold mb-2">
              สวัสดี, {user?.name || "Vendor"}!
            </h1>
            <p className="text-blue-100 text-sm">
              นี่คือรายการงานที่ได้รับมอบหมายสำหรับงวดงานนี้
            </p>
          </div>

          {/* Task Stats - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {tasks.length}
              </p>
              <p className="text-xs text-slate-500">งานทั้งหมด</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {inProgressTasks}
              </p>
              <p className="text-xs text-slate-500">กำลังดำเนินการ</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {completedTasks}
              </p>
              <p className="text-xs text-slate-500">เสร็จสิ้น</p>
            </div>
          </div>

          {/* Assigned Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-4 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">My Tasks</h3>
            </div>
            {tasks.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  ไม่มีงานที่ได้รับมอบหมายในขณะนี้
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium text-slate-900">
                            {task.taskName}
                          </h4>
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded text-xs",
                              task.status === "Work in Progress"
                                ? "bg-blue-100 text-blue-700"
                                : task.status === "Submitted"
                                  ? "bg-purple-100 text-purple-700"
                                  : task.status === "Approved"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-700",
                            )}
                          >
                            {task.status === "Work in Progress"
                              ? "กำลังดำเนินการ"
                              : task.status === "Submitted"
                                ? "ส่งแล้ว"
                                : task.status === "Approved"
                                  ? "อนุมัติแล้ว"
                                  : "รอดำเนินการ"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {task.project}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {task.dueDate}
                          </span>
                        </div>
                        {/* Progress Bar */}
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
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="ml-4 flex-shrink-0 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        อัปเดต
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Update Modal */}
      {selectedTask && (
        <TaskUpdateModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
