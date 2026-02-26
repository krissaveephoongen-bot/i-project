"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  projectId: z.string().uuid("Project is required"),
  status: z.string().default("todo"),
  priority: z.string().default("medium"),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  estimatedHours: z.number().optional().nullable(),
  milestoneId: z.string().optional().nullable(),
});

export type TaskInput = z.infer<typeof taskSchema>;

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: string;
  priority: string;
  assignedTo?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  milestoneId?: string;
  projects?: { id: string; name: string };
  assigned_user?: { id: string; name: string };
}

export async function getTasksAction(params?: { q?: string }) {
  const supabase = createClient(cookies());
  let query = supabase.from("tasks").select(`
    *,
    projects (id, name),
    assigned_user:users!assigned_to (id, name)
  `).order("created_at", { ascending: false });

  if (params?.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Get Tasks Error:", error);
    return [];
  }
  
  return (data || []).map(t => ({
    ...t,
    dueDate: t.due_date || t.dueDate, 
    projectId: t.project_id || t.projectId,
    assignedTo: t.assigned_to || t.assignedTo,
    estimatedHours: t.estimated_hours || t.estimatedHours,
    actualHours: t.actual_hours || t.actualHours,
    milestoneId: t.milestone_id || t.milestoneId,
    // Add relations
    projects: t.projects,
    assigned_user: t.assigned_user,
  }));
}

export async function createTaskAction(input: TaskInput) {
  const result = taskSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description,
      project_id: input.projectId,
      status: input.status,
      priority: input.priority,
      assigned_to: input.assignedTo,
      due_date: input.dueDate, 
      estimated_hours: input.estimatedHours,
      milestone_id: input.milestoneId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create Task Error:", error);
    return { error: "Database error: Failed to create task" };
  }

  revalidatePath("/tasks");
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
  
  return { data };
}

export async function updateTaskAction(id: string, input: Partial<TaskInput>) {
  const partialSchema = taskSchema.partial();
  const result = partialSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const updates: any = { updated_at: new Date().toISOString() };
  
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.projectId !== undefined) updates.project_id = input.projectId;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.assignedTo !== undefined) updates.assigned_to = input.assignedTo;
  if (input.dueDate !== undefined) updates.due_date = input.dueDate;
  if (input.estimatedHours !== undefined) updates.estimated_hours = input.estimatedHours;
  if (input.milestoneId !== undefined) updates.milestone_id = input.milestoneId;

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Task Error:", error);
    return { error: "Database error: Failed to update task" };
  }

  revalidatePath("/tasks");
  if (data?.project_id) revalidatePath(`/projects/${data.project_id}`);
  
  return { data };
}

export async function deleteTaskAction(id: string) {
  const supabase = createClient(cookies());
  
  const { data: task } = await supabase.from("tasks").select("project_id").eq("id", id).single();
  
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    console.error("Delete Task Error:", error);
    return { error: "Database error: Failed to delete task" };
  }

  revalidatePath("/tasks");
  if (task?.project_id) revalidatePath(`/projects/${task.project_id}`);
  
  return { success: true };
}

// Dropdown Helpers
export async function getProjectsForDropdown() {
  const supabase = createClient(cookies());
  const { data } = await supabase.from("projects").select("id, name").eq("isArchived", false).order("name");
  return data || [];
}

export async function getUsersForDropdown() {
  const supabase = createClient(cookies());
  const { data } = await supabase.from("users").select("id, name").eq("is_active", true).eq("is_deleted", false).order("name");
  return data || [];
}

export async function getMilestonesForDropdown() {
  const supabase = createClient(cookies());
  const { data } = await supabase.from("milestones").select("id, name").order("name"); // Could filter by project if needed but generic for now
  return data || [];
}
