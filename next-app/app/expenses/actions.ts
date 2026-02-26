"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const expenseSchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid("Invalid Project ID"),
  taskId: z.string().uuid().optional().nullable(),
  date: z.string(),
  amount: z.number().min(0.01, "Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export async function createExpenseAction(input: ExpenseInput) {
  const result = expenseSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: input.userId,
      project_id: input.projectId,
      task_id: input.taskId || null,
      date: input.date,
      amount: input.amount,
      category: input.category,
      description: input.description,
      receiptUrl: input.receiptUrl || null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create Expense Error:", error);
    return { error: "Database error: Failed to create expense" };
  }

  revalidatePath("/expenses");
  return { data };
}

export async function updateExpenseAction(id: string, input: Partial<ExpenseInput>) {
  const supabase = createClient(cookies());
  
  // Check if editable
  const { data: existing } = await supabase
    .from("expenses")
    .select("status")
    .eq("id", id)
    .single();

  if (existing && existing.status !== "pending" && existing.status !== "rejected") {
    return { error: "Cannot edit processed expense" };
  }

  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.projectId) updates.project_id = input.projectId;
  if (input.taskId !== undefined) updates.task_id = input.taskId;
  if (input.date) updates.date = input.date;
  if (input.amount) updates.amount = input.amount;
  if (input.category) updates.category = input.category;
  if (input.description !== undefined) updates.description = input.description;
  if (input.receiptUrl !== undefined) updates.receiptUrl = input.receiptUrl;
  
  // Reset status if rejected
  if (existing?.status === "rejected") {
    updates.status = "pending";
    updates.rejected_reason = null;
  }

  const { data, error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Expense Error:", error);
    return { error: "Database error: Failed to update expense" };
  }

  revalidatePath("/expenses");
  return { data };
}

export async function deleteExpenseAction(id: string) {
  const supabase = createClient(cookies());
  
  // Check if deletable
  const { data: existing } = await supabase
    .from("expenses")
    .select("status")
    .eq("id", id)
    .single();

  if (existing && existing.status !== "pending" && existing.status !== "rejected") {
    return { error: "Cannot delete processed expense" };
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Expense Error:", error);
    return { error: "Database error: Failed to delete expense" };
  }

  revalidatePath("/expenses");
  return { success: true };
}
