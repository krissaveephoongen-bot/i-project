"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { PermissionGuard } from "@/app/components/PermissionGuard";
import { UserRole } from "@/lib/auth";
import PageTransition from "@/app/components/PageTransition";
import { Skeleton } from "@/app/components/ui/skeleton";
import TaskForm from "@/app/components/TaskForm";
import {
  getTasksAction,
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  getProjectsForDropdown,
  getUsersForDropdown,
  getMilestonesForDropdown,
} from "./actions";
import { toast } from "react-hot-toast";
import { Task } from "../../lib/tasks";

export default function TasksPage() {
  const sp = useSearchParams();
  const query = (sp?.get("q") as string) || "";
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const labels = {
    title: language === "th" ? "งาน" : "Tasks",
    addNew: language === "th" ? "เพิ่มงานใหม่" : "Add New Task",
    search: language === "th" ? "ค้นหางาน..." : "Search tasks...",
    noTasks: language === "th" ? "ไม่มีงาน" : "No tasks found",
    taskName: language === "th" ? "ชื่องาน" : "Task Name",
    project: language === "th" ? "โครงการ" : "Project",
    assignee: language === "th" ? "ผู้รับผิดชอบ" : "Assignee",
    status: language === "th" ? "สถานะ" : "Status",
    priority: language === "th" ? "ลำดับความสำคัญ" : "Priority",
    dueDate: language === "th" ? "วันครบกำหนด" : "Due Date",
    actions: language === "th" ? "การกระทำ" : "Actions",
    edit: language === "th" ? "แก้ไข" : "Edit",
    delete: language === "th" ? "ลบ" : "Delete",
    loading: language === "th" ? "กำลังโหลด..." : "Loading...",
  };

  // Fetch tasks with real API
  const tasksQuery = useQuery({
    queryKey: ["tasks", query],
    queryFn: () => getTasksAction({ q: query }),
  });

  // Fetch projects for dropdown
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjectsForDropdown(),
  });

  // Fetch users for assignee dropdown
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsersForDropdown(),
  });

  // Fetch milestones for dropdown
  const milestonesQuery = useQuery({
    queryKey: ["milestones"],
    queryFn: () => getMilestonesForDropdown(),
  });

  const tasks = tasksQuery.data || [];
  const projects = projectsQuery.data || [];
  const users = usersQuery.data || [];
  const milestones = milestonesQuery.data || [];

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (task: any) => {
      const result = await createTaskAction(task);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(
        language === "th" ? "สร้างงานสำเร็จ" : "Task created successfully",
      );
    },
    onError: (error: any) => {
      toast.error(
        error.message ||
          (language === "th" ? "สร้างงานไม่สำเร็จ" : "Failed to create task"),
      );
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const result = await updateTaskAction(id, data);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(
        language === "th" ? "อัปเดตงานสำเร็จ" : "Task updated successfully",
      );
    },
    onError: (error: any) => {
      toast.error(
        error.message ||
          (language === "th" ? "อัปเดตงานไม่สำเร็จ" : "Failed to update task"),
      );
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTaskAction(id);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(
        language === "th" ? "ลบงานสำเร็จ" : "Task deleted successfully",
      );
    },
    onError: (error: any) => {
      toast.error(
        error.message ||
          (language === "th" ? "ลบงานไม่สำเร็จ" : "Failed to delete task"),
      );
    },
  });

  const handleOpenModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (task: any) => {
    // Optimistic update or wait for invalidation
    if (editingTask) {
      await updateTaskMutation.mutateAsync({ id: editingTask.id, data: task });
    } else {
      await createTaskMutation.mutateAsync(task);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteClick = (task: Task) => {
    setDeleteConfirm({ id: task.id, title: task.title });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deleteTaskMutation.mutate(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  if (
    tasksQuery.isLoading ||
    projectsQuery.isLoading ||
    usersQuery.isLoading ||
    milestonesQuery.isLoading
  ) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title={labels.loading}
          breadcrumbs={[
            { label: language === "th" ? "แดชบอร์ด" : "Dashboard", href: "/" },
            { label: labels.title },
          ]}
        />
        <div className="pt-24 px-6 pb-6 container mx-auto space-y-6 w-full max-w-full">
          <Skeleton className="h-12 w-32 rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title={labels.title}
          breadcrumbs={[
            { label: language === "th" ? "แดชบอร์ด" : "Dashboard", href: "/" },
            { label: labels.title },
          ]}
        />

        <div className="pt-24 px-6 pb-6 container mx-auto space-y-6 w-full max-w-full">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {labels.title}
              </h1>
              <p className="text-slate-500 mt-1">
                {language === "th"
                  ? "จัดการงานและการมอบหมายของโครงการ"
                  : "Manage project tasks and assignments."}
              </p>
            </div>

            <PermissionGuard
              roles={[UserRole.ADMIN, UserRole.MANAGER]}
              fallback={
                <div className="text-center py-8 w-full">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">
                    {language === "th"
                      ? "ต้องการสิทธิ์ Admin/Manager"
                      : "Admin/Manager access required"}
                  </h3>
                  <p className="text-slate-600">
                    {language === "th"
                      ? "หน้านี้สำหรับเฉพาะผู้ดูแลและจัดการงานเท่านั้น"
                      : "This page is for admins and managers only."}
                  </p>
                </div>
              }
            >
              <Button
                onClick={() => handleOpenModal()}
                className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" /> {labels.addNew}
              </Button>
            </PermissionGuard>
          </div>

          {/* Task List Card */}
          <Card className="shadow-sm border-slate-200 w-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {language === "th" ? "งานทั้งหมด" : "All Tasks"}
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    {tasks.length}{" "}
                    {language === "th" ? "งานที่พบ" : "tasks found"}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-slate-600 w-1/3">
                        {labels.taskName}
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">
                        {labels.project}
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">
                        {labels.assignee}
                      </th>
                      <th className="text-center py-3 px-6 text-sm font-medium text-slate-600">
                        {labels.status}
                      </th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">
                        {labels.dueDate}
                      </th>
                      <th className="text-right py-3 px-6 text-sm font-medium text-slate-600">
                        {labels.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 px-6 text-center text-slate-500"
                        >
                          {labels.noTasks}
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-6">
                            <div className="font-medium text-slate-900">
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-xs text-slate-500 truncate max-w-[200px]">
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-6 text-sm">
                            {task.projects ? (
                              <a
                                href={`/projects/${task.projects.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {task.projects.name}
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3 px-6 text-sm text-slate-600">
                            {task.assigned_user?.name ||
                              (language === "th"
                                ? "ไม่ได้มอบหมาย"
                                : "Unassigned")}
                          </td>
                          <td className="py-3 px-6 text-sm text-center">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-sm text-slate-600">
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString(
                                  "th-TH",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "-"}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>
                                  {labels.actions}
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleOpenModal(task)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {labels.edit}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer"
                                  onClick={() => handleDeleteClick(task)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {labels.delete}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Task Form Modal */}
          <TaskForm
            task={editingTask}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(null);
            }}
            onSave={handleSaveTask}
            projects={projects}
            users={users}
            milestones={milestones.map((m: any) => ({
              id: m.id,
              title: m.name || m.title || "",
            }))}
          />

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <DeleteConfirmationDialog
              open={true}
              title={
                language === "th" ? "ยืนยันการลบงาน" : "Confirm Delete Task"
              }
              description={
                language === "th"
                  ? "เมื่อลบงานนี้ จะไม่สามารถกู้คืนข้อมูลได้"
                  : "This action cannot be undone."
              }
              entityName={deleteConfirm?.title}
              isLoading={deleteTaskMutation.isPending}
              onConfirm={handleConfirmDelete}
              onCancel={() => setDeleteConfirm(null)}
              isDangerous={true}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
