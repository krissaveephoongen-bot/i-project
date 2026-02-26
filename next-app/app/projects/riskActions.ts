"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const riskSchema = z.object({
  projectId: z.string().uuid("Invalid Project ID"),
  title: z.string().min(1, "Title is required"),
  impact: z.number().min(1).max(5),
  likelihood: z.number().min(1).max(5),
  severity: z.string().optional(),
});

const issueSchema = z.object({
  projectId: z.string().uuid("Invalid Project ID"),
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"]),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

export type RiskInput = z.infer<typeof riskSchema>;
export type IssueInput = z.infer<typeof issueSchema>;

// --- Risk Actions ---

export async function createRiskAction(input: RiskInput) {
  const result = riskSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("risks")
    .insert({
      project_id: input.projectId,
      title: input.title,
      impact: input.impact,
      likelihood: input.likelihood,
      severity: input.severity || "Medium",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create Risk Error:", error);
    return { error: "Database error: Failed to create risk" };
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { data };
}

export async function updateRiskAction(id: string, input: Partial<RiskInput>) {
  const supabase = createClient(cookies());
  
  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updates.title = input.title;
  if (input.impact !== undefined) updates.impact = input.impact;
  if (input.likelihood !== undefined) updates.likelihood = input.likelihood;
  if (input.severity !== undefined) updates.severity = input.severity;

  const { data, error } = await supabase
    .from("risks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Risk Error:", error);
    return { error: "Database error: Failed to update risk" };
  }

  if (data?.project_id) {
    revalidatePath(`/projects/${data.project_id}`);
  }
  return { data };
}

export async function deleteRiskAction(id: string) {
  const supabase = createClient(cookies());
  
  const { data: risk } = await supabase.from("risks").select("project_id").eq("id", id).single();
  
  const { error } = await supabase
    .from("risks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Risk Error:", error);
    return { error: "Database error: Failed to delete risk" };
  }

  if (risk?.project_id) {
    revalidatePath(`/projects/${risk.project_id}`);
  }
  return { success: true };
}

// --- Issue Actions ---

export async function createIssueAction(input: IssueInput) {
  const result = issueSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("issues")
    .insert({
      project_id: input.projectId,
      title: input.title,
      priority: input.priority,
      status: input.status,
      assigned_to: input.assignedTo || null,
      due_date: input.dueDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create Issue Error:", error);
    return { error: "Database error: Failed to create issue" };
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { data };
}

export async function updateIssueAction(id: string, input: Partial<IssueInput>) {
  const supabase = createClient(cookies());
  
  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updates.title = input.title;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.status !== undefined) updates.status = input.status;
  if (input.assignedTo !== undefined) updates.assigned_to = input.assignedTo;
  if (input.dueDate !== undefined) updates.due_date = input.dueDate;

  const { data, error } = await supabase
    .from("issues")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Issue Error:", error);
    return { error: "Database error: Failed to update issue" };
  }

  if (data?.project_id) {
    revalidatePath(`/projects/${data.project_id}`);
  }
  return { data };
}
