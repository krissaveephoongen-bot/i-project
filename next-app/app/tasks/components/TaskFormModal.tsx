"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  createTaskAction,
  updateTaskAction,
  getProjectsForDropdown,
  getUsersForDropdown,
  type Task,
} from "../actions";
import { Label } from "@/app/components/ui/label";
import {
  validateRequired,
  validatePositiveNumber,
  validateDateIsInFuture,
} from "@/lib/validation";
import {
  toastCreateSuccess,
  toastUpdateSuccess,
  toastError,
  toastValidationError,
} from "@/lib/toast-utils";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSuccess: () => void;
}

export default function TaskFormModal({
  isOpen,
  onClose,
  task,
  onSuccess,
}: TaskFormModalProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Partial<Task>>();

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getProjectsForDropdown()
      .then(setProjects)
      .catch(() => {});
    getUsersForDropdown()
      .then(setUsers)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (task) {
      setValue("title", task.title);
      setValue("description", task.description);
      setValue("status", task.status);
      setValue("priority", task.priority);
      setValue(
        "dueDate",
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      );
      setValue("estimatedHours", task.estimatedHours);
      setValue("projectId", task.projectId);
      setValue("assignedTo", task.assignedTo);
    } else {
      reset({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        estimatedHours: 0,
        projectId: "",
        assignedTo: "",
      });
    }
  }, [task, isOpen, reset, setValue]);

  const onSubmit = async (data: Partial<Task>) => {
    try {
      setLoading(true);

      // Validation
      const titleError = validateRequired(data.title || "", "Task Title");
      if (titleError) {
        toastValidationError(undefined, titleError);
        return;
      }

      const projectError = validateRequired(data.projectId || "", "Project");
      if (projectError) {
        toastValidationError(undefined, projectError);
        return;
      }

      if (data.dueDate) {
        const dueDateError = validateDateIsInFuture(data.dueDate, "Due Date");
        if (dueDateError) {
          toastValidationError(undefined, dueDateError);
          return;
        }
      }

      if (data.estimatedHours) {
        const hoursError = validatePositiveNumber(
          data.estimatedHours,
          "Estimated Hours",
        );
        if (hoursError) {
          toastValidationError(undefined, hoursError);
          return;
        }
      }

      if (task?.id) {
        await updateTaskAction(task.id, data);
        toastUpdateSuccess("Task");
      } else {
        await createTaskAction(data as any);
        toastCreateSuccess("Task");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toastError("save", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update task details."
              : "Create a new task under a project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Task Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
              })}
              placeholder="Task Name"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">
                Project <span className="text-red-500">*</span>
              </Label>
              <select
                id="projectId"
                {...register("projectId", { required: "Project is required" })}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-sm text-red-500">
                  {errors.projectId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assignee</Label>
              <select
                id="assignedTo"
                {...register("assignedTo")}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register("status")}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                {...register("priority")}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Est. Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                {...register("estimatedHours", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Hours cannot be negative" },
                })}
              />
              {errors.estimatedHours && (
                <p className="text-sm text-red-500">
                  {errors.estimatedHours.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register("description")}
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[100px] bg-white dark:bg-slate-950"
              placeholder="Task details..."
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
