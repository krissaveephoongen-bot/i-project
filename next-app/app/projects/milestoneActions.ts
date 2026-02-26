"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  percentage: z.number().min(0).max(100),
  amount: z.number().min(0).optional(),
  status: z.string().optional(),
  projectId: z.string().uuid("Invalid Project ID"),
  dueDate: z.string().datetime().optional().nullable(),
  note: z.string().optional(),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

export async function createMilestoneAction(input: MilestoneInput) {
  const result = milestoneSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("milestones")
    .insert({
      title: input.title,
      percentage: input.percentage,
      amount: input.amount,
      status: input.status || "Pending",
      project_id: input.projectId,
      due_date: input.dueDate,
      notes: input.note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create Milestone Error:", error);
    return { error: "Database error: Failed to create milestone" };
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { data };
}

export async function updateMilestoneAction(id: string, input: Partial<MilestoneInput>) {
  const supabase = createClient(cookies());
  
  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updates.title = input.title;
  if (input.percentage !== undefined) updates.percentage = input.percentage;
  if (input.amount !== undefined) updates.amount = input.amount;
  if (input.status !== undefined) updates.status = input.status;
  if (input.dueDate !== undefined) updates.due_date = input.dueDate;
  if (input.note !== undefined) updates.notes = input.note;

  const { data, error } = await supabase
    .from("milestones")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Milestone Error:", error);
    return { error: "Database error: Failed to update milestone" };
  }

  if (data?.project_id) {
    revalidatePath(`/projects/${data.project_id}`);
  }
  return { data };
}

export async function deleteMilestoneAction(id: string) {
  const supabase = createClient(cookies());
  
  const { data: milestone } = await supabase.from("milestones").select("project_id").eq("id", id).single();
  
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Milestone Error:", error);
    return { error: "Database error: Failed to delete milestone" };
  }

  if (milestone?.project_id) {
    revalidatePath(`/projects/${milestone.project_id}`);
  }
  return { success: true };
}
