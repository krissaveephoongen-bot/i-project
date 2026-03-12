"use client";

import { useState } from "react";
import { X, Save, AlertCircle, Calendar, Clock, User, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types";

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onSave?: (task: Task) => void;
  isLoading?: boolean;
}

const statusOptions = [
  { value: "todo", label: "To Do", color: "bg-gray-100 text-gray-700" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "in_review", label: "In Review", color: "bg-yellow-100 text-yellow-700" },
  { value: "done", label: "Done", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function TaskDetailModal({
  task,
  onClose,
  onSave,
  isLoading = false,
}: TaskDetailModalProps) {
  const [formData, setFormData] = useState(task || {});
  const [isDirty, setIsDirty] = useState(false);

  if (!task) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (isDirty && onSave) {
      onSave(formData as Task);
      setIsDirty(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
            {task.wbsCode && (
              <p className="text-sm text-gray-500 mt-1">WBS: {task.wbsCode}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status || "todo"}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority || "medium"}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                value={
                  task.startDate
                    ? new Date(task.startDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="date"
                value={
                  task.dueDate
                    ? new Date(task.dueDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Estimation Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estimated Hours
              </label>
              <input
                type="number"
                value={formData.estimatedHours || 0}
                onChange={(e) => handleChange("estimatedHours", parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Progress
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={formData.progressActual || 0}
                  onChange={(e) => handleChange("progressActual", parseInt(e.target.value))}
                  className="flex-1"
                  min="0"
                  max="100"
                />
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {formData.progressActual || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Category
            </label>
            <input
              type="text"
              value={formData.category || ""}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="e.g., development, design, testing"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Assigned To
            </label>
            <input
              type="text"
              value={formData.assignedTo || ""}
              placeholder="User ID or name"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Assign users from the team panel</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-sm">
            {isDirty && (
              <div className="flex items-center gap-1 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              className={cn(
                "px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2",
                isDirty && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
