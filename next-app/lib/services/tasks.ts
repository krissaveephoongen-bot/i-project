import { supabase } from "../supabaseClient";
import {
  Task,
  TaskInsert,
  TaskUpdate,
  TaskWithProject,
} from "../../types/database.types";

export class TaskService {
  // Fetch all tasks with project and assignee details
  static async fetchTasks(): Promise<TaskWithProject[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        project:projects(id, name, status),
        assignee:users(id, name, email, role),
        comments:comments(*, user:users(id, name, email))
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      throw new Error("Failed to fetch tasks");
    }

    return data as TaskWithProject[];
  }

  // Fetch tasks for a specific project
  static async fetchTasksByProject(
    projectId: string,
  ): Promise<TaskWithProject[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        project:projects(id, name, status),
        assignee:users(id, name, email, role),
        comments:comments(*, user:users(id, name, email))
      `,
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching project tasks:", error);
      throw new Error("Failed to fetch project tasks");
    }

    return data as TaskWithProject[];
  }

  // Fetch tasks assigned to a specific user
  static async fetchTasksByAssignee(
    assigneeId: string,
  ): Promise<TaskWithProject[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        project:projects(id, name, status),
        assignee:users(id, name, email, role),
        comments:comments(*, user:users(id, name, email))
      `,
      )
      .eq("assigned_to", assigneeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching assignee tasks:", error);
      throw new Error("Failed to fetch assignee tasks");
    }

    return data as TaskWithProject[];
  }

  // Fetch a single task by ID with related data
  static async fetchTaskById(id: string): Promise<TaskWithProject | null> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        project:projects(id, name, status, manager_id),
        assignee:users(id, name, email, role),
        comments:comments(*, user:users(id, name, email))
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching task:", error);
      throw new Error("Failed to fetch task");
    }

    return data as TaskWithProject;
  }

  // Create a new task
  static async createTask(task: TaskInsert): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      throw new Error("Failed to create task");
    }

    return data as Task;
  }

  // Update an existing task
  static async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      throw new Error("Failed to update task");
    }

    return data as Task;
  }

  // Delete a task
  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task");
    }
  }

  // Update task status
  static async updateTaskStatus(id: string, status: string): Promise<Task> {
    return this.updateTask(id, { status });
  }

  // Assign task to user
  static async assignTask(id: string, assigneeId: string): Promise<Task> {
    return this.updateTask(id, { assigned_to: assigneeId } as any);
  }

  // Update task hours
  static async updateTaskHours(id: string, actualHours: number): Promise<Task> {
    return this.updateTask(id, { actual_hours: actualHours });
  }

  // Fetch tasks by status
  static async fetchTasksByStatus(status: string): Promise<TaskWithProject[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        project:projects(id, name, status),
        assignee:users(id, name, email, role),
        comments:comments(*, user:users(id, name, email))
      `,
      )
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks by status:", error);
      throw new Error("Failed to fetch tasks by status");
    }

    return data as TaskWithProject[];
  }

  // Fetch tasks by priority
  static async fetchTasksByPriority(
    priority: string,
  ): Promise<TaskWithProject[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        project:projects(id, name, status),
        assignee:users(id, name, email, role),
        comments:comments(*, user:users(id, name, email))
      `,
      )
      .eq("priority", priority)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks by priority:", error);
      throw new Error("Failed to fetch tasks by priority");
    }

    return data as TaskWithProject[];
  }
}
