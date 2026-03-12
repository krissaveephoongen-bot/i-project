"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import WBSTreeView, { TreeNode } from "@/app/components/WBSTreeView";
import TaskDetailModal from "@/app/components/TaskDetailModal";
import { useTaskWBS } from "@/hooks/useTaskWBS";
import { Task } from "@/types";

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tasks, isLoading, error } = useTaskWBS(projectId || undefined);

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleTaskCreate = (parentId?: string, level?: number) => {
    // Navigate to task creation modal or form
    setSelectedTask(null);
    setIsDetailOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    try {
      const method = selectedTask?.id ? "PUT" : "POST";
      const url = selectedTask?.id
        ? `/api/projects/${projectId}/tasks/${selectedTask.id}`
        : `/api/projects/${projectId}/tasks`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      if (!response.ok) throw new Error("Failed to save task");

      // Refresh task list
      router.refresh();
      setIsDetailOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600 mt-2">Manage project tasks and work breakdown structure</p>
            </div>
            {projectId && (
              <button
                onClick={() => handleTaskCreate()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!projectId ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-800">
              Select a project to view and manage tasks
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Failed to load tasks. Please try again.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* WBS Tree View */}
            <WBSTreeView
              tasks={filteredTasks || []}
              onTaskSelect={handleTaskSelect}
              onTaskCreate={handleTaskCreate}
            />
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={isDetailOpen ? selectedTask : null}
        onClose={() => setIsDetailOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
}
