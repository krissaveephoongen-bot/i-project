"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  projectId: z.string().uuid("Project is required"),
  status: z.string().default("todo"),
  priority: z.string().default("medium"),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  estimatedHours: z.number().optional().nullable(),
  milestoneId: z.string().optional().nullable(),
  weight: z.number().optional().default(1),
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

export async function getTasksAction(params?: { q?: string; projectId?: string }) {
  const supabase = createClient(cookies());
  
  const buildQuery = (client: any) => {
    let q = client.from("tasks").select(`
      *,
      projects (id, name),
      assigned_user:users!assigned_to (id, name)
    `).order("created_at", { ascending: false });

    if (params?.q) {
      q = q.ilike("title", `%${params.q}%`);
    }
    if (params?.projectId) {
      q = q.eq("project_id", params.projectId);
    }
    return q;
  };

  // 1. Try User Session
  let { data, error } = await buildQuery(supabase);

  // 2. Fallback to Admin Client if empty or error (and likely permission issue)
  if (!data || data.length === 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
          if (profile && ["admin", "manager"].includes(profile.role)) {
               const adminSupabase = createAdminClient();
               const adminRes = await buildQuery(adminSupabase);
               if (adminRes.data && adminRes.data.length > 0) {
                   data = adminRes.data;
                   error = null;
               }
          }
      }
  }

  if (error) {
    console.error("Get Tasks Error:", error);
    return [];
  }
  
  return (data || []).map((t: any) => ({
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
      weight: input.weight,
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
  if (input.weight !== undefined) updates.weight = input.weight;

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
  let { data } = await supabase.from("projects").select("id, name").neq("status", "cancelled").order("name");
  
  if (!data || data.length === 0) {
      const adminSupabase = createAdminClient();
      const adminRes = await adminSupabase.from("projects").select("id, name").neq("status", "cancelled").order("name");
      if (adminRes.data) data = adminRes.data;
  }
  
  return data || [];
}

export async function getUsersForDropdown() {
  const supabase = createClient(cookies());
  let { data } = await supabase.from("users").select("id, name").order("name"); 
  
  if (!data || data.length === 0) {
      const adminSupabase = createAdminClient();
      const adminRes = await adminSupabase.from("users").select("id, name").order("name");
      if (adminRes.data) data = adminRes.data;
  }

  return data || [];
}

export async function getMilestonesForDropdown() {
  const supabase = createClient(cookies());
  let { data } = await supabase.from("milestones").select("id, title").order("title");
  
  if (!data || data.length === 0) {
      const adminSupabase = createAdminClient();
      const adminRes = await adminSupabase.from("milestones").select("id, title").order("title");
      if (adminRes.data) data = adminRes.data;
  }

  return (data || []).map((m: any) => ({ id: m.id, title: m.title, name: m.title }));
}

// Projects with task counts for sidebar
export async function getProjectsWithCounts() {
  const supabase = createClient(cookies());
  // 1) Base projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, progress, progress_plan")
    .neq("status", "Cancelled")
    .neq("is_archived", true)
    .order("name");

  const list = projects || [];
  if (list.length === 0) return [];

  const ids = list.map((p: any) => p.id);

  // Helper to fetch tasks statuses limited to given projects
  const fetchTasksStatuses = async (client: any) => {
    const { data } = await client
      .from("tasks")
      .select("project_id, status")
      .in("project_id", ids);
    return data || [];
  };

  // 2) Try with user session (RLS)
  let tasks = await fetchTasksStatuses(supabase);

  // 3) Fallback to admin if user is admin/manager
  if (tasks.length === 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
      if (profile && ["admin", "manager"].includes(profile.role)) {
        const admin = createAdminClient();
        tasks = await fetchTasksStatuses(admin);
      }
    }
  }

  // 4) Reduce counts per project
  const counts: Record<string, { total: number; open: number; by: Record<string, number> }> = {};
  ids.forEach((id: string) => {
    counts[id] = { total: 0, open: 0, by: { todo: 0, in_progress: 0, pending: 0, completed: 0 } };
  });

  tasks.forEach((t: any) => {
    const pid = t.project_id;
    const st = t.status || "";
    if (!counts[pid]) {
      counts[pid] = { total: 0, open: 0, by: { todo: 0, in_progress: 0, pending: 0, completed: 0 } };
    }
    counts[pid].total += 1;
    if (st !== "completed") counts[pid].open += 1;
    if (st in counts[pid].by) counts[pid].by[st] += 1;
  });

  // 5) Compose response
  return list.map((p: any) => ({
    id: p.id,
    name: p.name,
    total: counts[p.id]?.total || 0,
    open: counts[p.id]?.open || 0,
    progress: Number(p.progress) || 0,
    progressPlan: Number(p.progress_plan) || Number(p.progressPlan) || 0,
    counts: counts[p.id]?.by || { todo: 0, in_progress: 0, pending: 0, completed: 0 },
  }));
}
