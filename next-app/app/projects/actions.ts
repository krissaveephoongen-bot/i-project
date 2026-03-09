"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

// Schema Validation (Zero Trust)
export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["Active", "Completed", "Planning", "On Hold", "Cancelled"]).default("Planning"),
  managerId: z.string().uuid().optional().nullable(),
  budget: z.number().min(0).default(0),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  // Add other fields as necessary
});

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed", "pending"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  projectId: z.string().uuid("Invalid Project ID"),
  milestoneId: z.string().uuid().optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  weight: z.number().min(0).max(100).default(1),
  progressPlan: z.number().min(0).max(100).default(0),
  progressActual: z.number().min(0).max(100).default(0),
  estimatedHours: z.number().min(0).optional().nullable(),
  actualHours: z.number().min(0).optional().nullable(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;

// --- Projects Actions ---

export async function createProjectAction(input: ProjectInput) {
  const result = projectSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  
  // Map camelCase to snake_case for DB
  const dbInput = {
    name: input.name,
    // project_code: input.code, // Column likely missing
    description: input.description,
    status: input.status,
    manager_id: input.managerId,
    budget: input.budget,
    start_date: input.startDate,
    end_date: input.endDate,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(dbInput)
    .select()
    .single();

  if (error) {
    console.error("Create Project Error:", error);
    return { error: "Database error: Failed to create project" };
  }

  revalidatePath("/projects");
  return { data };
}

export async function updateProjectAction(id: string, input: Partial<ProjectInput>) {
  const partialSchema = projectSchema.partial();
  const result = partialSchema.safeParse(input);
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  
  // Map updates
  const updates: any = {};
  if (input.name !== undefined) updates.name = input.name;
  // if (input.code !== undefined) updates.project_code = input.code;
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.managerId !== undefined) updates.manager_id = input.managerId;
  if (input.budget !== undefined) updates.budget = input.budget;
  if (input.startDate !== undefined) updates.start_date = input.startDate;
  if (input.endDate !== undefined) updates.end_date = input.endDate;
  
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Project Error:", error);
    return { error: "Database error: Failed to update project" };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  
  return { data };
}

export async function deleteProjectAction(id: string) {
  const supabase = createClient(cookies());
  
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Project Error:", error);
    return { error: "Database error: Failed to delete project" };
  }

  revalidatePath("/projects");
  return { success: true };
}

// --- Tasks Actions ---

export async function createTaskAction(input: TaskInput) {
  const result = taskSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title, // DB column: title
      description: input.description,
      status: input.status,
      priority: input.priority,
      project_id: input.projectId, // DB column: project_id
      milestone_id: input.milestoneId,
      assigned_to: input.assignedTo,
      parent_id: input.parentId || null,
      start_date: input.startDate,
      end_date: input.endDate,
      estimated_hours: input.estimatedHours,
      actual_hours: input.actualHours,
      progress_plan: input.progressPlan,
      progress_actual: input.progressActual,
      weight: input.weight,
    })
    .select()
    .single();

  if (error) {
    console.error("Create Task Error:", error);
    return { error: "Database error: Failed to create task" };
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { data };
}

export async function updateTaskAction(id: string, input: Partial<TaskInput>) {
  // Validate only the provided fields
  const partialSchema = taskSchema.partial();
  const result = partialSchema.safeParse(input);
  
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  
  // Map camelCase to snake_case for DB
  const updates: any = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.projectId !== undefined) updates.project_id = input.projectId;
  if (input.milestoneId !== undefined) updates.milestone_id = input.milestoneId;
  if (input.assignedTo !== undefined) updates.assigned_to = input.assignedTo;
  if (input.parentId !== undefined) updates.parent_id = input.parentId;
  if (input.startDate !== undefined) updates.start_date = input.startDate;
  if (input.endDate !== undefined) updates.end_date = input.endDate;
  if (input.estimatedHours !== undefined) updates.estimated_hours = input.estimatedHours;
  if (input.actualHours !== undefined) updates.actual_hours = input.actualHours;
  if (input.weight !== undefined) updates.weight = input.weight;
  if (input.progressPlan !== undefined) updates.progress_plan = input.progressPlan;
  if (input.progressActual !== undefined) updates.progress_actual = input.progressActual;
  // Derive status from hours when provided (advanced step)
  if (
    typeof input.actualHours !== "undefined" ||
    typeof input.estimatedHours !== "undefined"
  ) {
    const est = typeof input.estimatedHours === "number" ? input.estimatedHours : undefined;
    const act = typeof input.actualHours === "number" ? input.actualHours : undefined;
    if (typeof act === "number") {
      if (typeof est === "number" && est > 0) {
        if (act >= est) updates.status = "completed";
        else if (act > 0) updates.status = "in_progress";
        else updates.status = "pending";
      } else {
        // Without estimate, base on actual only
        updates.status = act > 0 ? "in_progress" : "pending";
      }
    }
  }
  
  updates.updated_at = new Date().toISOString();

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

  // If we have projectId, revalidate that path
  if (data?.project_id) {
    revalidatePath(`/projects/${data.project_id}`);
  }
  
  return { data };
}

export async function deleteTaskAction(id: string) {
  const supabase = createClient(cookies());
  
  // Get project ID first for revalidation
  const { data: task } = await supabase.from("tasks").select("project_id").eq("id", id).single();
  
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Task Error:", error);
    return { error: "Database error: Failed to delete task" };
  }

  if (task?.project_id) {
    revalidatePath(`/projects/${task.project_id}`);
  }
  
  return { success: true };
}
