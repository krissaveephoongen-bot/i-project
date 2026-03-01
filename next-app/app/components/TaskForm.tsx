"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Calendar, User, Flag, Clock } from "lucide-react";
import { Task } from "../../lib/tasks";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { useToast } from "@/hooks/useToast";

interface TaskFormProps {
  task?: Task | null;
  isOpen?: boolean; // Kept for compatibility but unused
  onClose: () => void;
  onSave: (task: any) => Promise<void>;
  projects: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
  milestones: Array<{ id: string; title: string }>;
  projectId?: string;
}

export default function TaskForm({
  task,
  onClose,
  onSave,
  projects,
  users,
  milestones,
  projectId,
}: TaskFormProps) {
  const { language } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    estimatedHours: "",
    projectId: projectId || "",
    milestoneId: "",
    assignedTo: "",
    weight: "1",
  });

  const labels = {
    title: language === "th" ? "ชื่องาน" : "Task Title",
    description: language === "th" ? "รายละเอียด" : "Description",
    status: language === "th" ? "สถานะ" : "Status",
    priority: language === "th" ? "ลำดับความสำคัญ" : "Priority",
    dueDate: language === "th" ? "วันครบกำหนด" : "Due Date",
    estimatedHours: language === "th" ? "ชั่วโมงที่ประเมิน" : "Estimated Hours",
    project: language === "th" ? "โครงการ" : "Project",
    milestone: language === "th" ? "ระยะงาน" : "Milestone",
    assignee: language === "th" ? "ผู้รับผิดชอบ" : "Assignee",
    save: language === "th" ? "บันทึก" : "Save",
    cancel: language === "th" ? "ยกเลิก" : "Cancel",
    weight: language === "th" ? "น้ำหนักงาน (%)" : "Weight (%)",
  };

  const statusOptions = [
    { value: "todo", label: language === "th" ? "ทำ" : "To Do" },
    {
      value: "in_progress", // Fixed to match DB/Zod
      label: language === "th" ? "กำลังทำ" : "In Progress",
    },
    { value: "completed", label: language === "th" ? "เสร็จ" : "Completed" }, // Fixed to match DB/Zod
    { value: "pending", label: language === "th" ? "รอดำเนินการ" : "Pending" },
  ];

  const priorityOptions = [
    { value: "low", label: language === "th" ? "ต่ำ" : "Low" },
    { value: "medium", label: language === "th" ? "ปานกลาง" : "Medium" },
    { value: "high", label: language === "th" ? "สูง" : "High" },
    { value: "critical", label: language === "th" ? "วิกฤต" : "Critical" }, // Fixed to match Zod
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : task.endDate
          ? new Date(task.endDate).toISOString().split("T")[0]
          : "",
        estimatedHours: task.estimatedHours?.toString() || "",
        projectId: task.projectId || projectId || "",
        milestoneId: task.milestoneId || "",
        assignedTo: task.assignedTo || "",
        weight: task.weight?.toString() || "1",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        estimatedHours: "",
        projectId: projectId || "",
        milestoneId: "",
        assignedTo: "",
        weight: "1",
      });
    }
  }, [task, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showError(
        language === "th" ? "กรุณากรอกชื่องาน" : "Please enter task title",
      );
      return;
    }

    if (!formData.projectId) {
      showError(
        language === "th" ? "กรุณาเลือกโครงการ" : "Please select a project",
      );
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        endDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined, // Map dueDate to endDate for DB
        weight: Number(formData.weight) || 1,
        projectId: formData.projectId,
        milestoneId: formData.milestoneId || undefined,
        assignedTo: formData.assignedTo || undefined,
      };

      await onSave(payload);
      // Success is handled by parent or actions
    } catch (error: any) {
      console.error(error);
      showError(
        error.message ||
          (language === "th" ? "เกิดข้อผิดพลาด" : "An error occurred"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          {labels.title} <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder={
            language === "th" ? "กรอกชื่องาน..." : "Enter task title..."
          }
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {labels.description}
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder={
            language === "th"
              ? "กรอกรายละเอียดงาน..."
              : "Enter task description..."
          }
          rows={3}
        />
      </div>

      {/* Project, Milestone and Assignee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {labels.project}{" "}
            <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.projectId}
            onValueChange={(value) =>
              setFormData({ ...formData, projectId: value })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  language === "th" ? "เลือกโครงการ" : "Select project"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <User className="w-4 h-4" /> {labels.assignee}
          </label>
          <Select
            value={formData.assignedTo || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, assignedTo: value || "" })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  language === "th"
                    ? "เลือกผู้รับผิดชอบ"
                    : "Select assignee"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{labels.status}</label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Flag className="w-4 h-4" /> {labels.priority}
          </label>
          <Select
            value={formData.priority}
            onValueChange={(value) =>
              setFormData({ ...formData, priority: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Due Date and Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {labels.dueDate}
          </label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" /> {labels.weight}
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            step="1"
            value={formData.weight}
            onChange={(e) =>
              setFormData({ ...formData, weight: e.target.value })
            }
            placeholder="1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          {labels.cancel}
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading
            ? language === "th"
              ? "กำลังบันทึก..."
              : "Saving..."
            : labels.save}
        </Button>
      </div>
    </form>
  );
}
