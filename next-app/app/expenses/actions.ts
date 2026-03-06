"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
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
  receiptUrl: z.string().optional().or(z.literal("")), // Simplified: URL validation can be tricky with empty strings
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export async function createExpenseAction(input: any) { // Use any to bypass strict type check for now, validate manually or with zod
  const result = expenseSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  
  const payload = {
    user_id: input.userId,
    project_id: input.projectId,
    task_id: input.taskId || null,
    date: input.date,
    amount: input.amount,
    category: input.category,
    description: input.description,
    receipt_url: input.receiptUrl || null, // Map camelCase to snake_case
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert(payload)
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
  if (input.taskId !== undefined) updates.task_id = input.taskId || null;
  if (input.date) updates.date = input.date;
  if (input.amount) updates.amount = input.amount;
  if (input.category) updates.category = input.category;
  if (input.description !== undefined) updates.description = input.description;
  if (input.receiptUrl !== undefined) updates.receipt_url = input.receiptUrl || null;
  
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

export async function approveExpenseAction(id: string) {
  const supabase = createClient(cookies());
  
  // Verify permission (Admin/Manager only)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager"].includes(profile.role)) {
    return { error: "Insufficient permissions" };
  }

  // Use Admin Client to bypass RLS if needed (approving others' expenses)
  const adminSupabase = createClient(cookies()); // Try standard first
  // Actually, if we are admin, we should be able to update. 
  // But let's use standard update first.
  
  const { error } = await supabase
    .from("expenses")
    .update({ 
      status: "approved",
      updated_at: new Date().toISOString() 
    })
    .eq("id", id);

  if (error) {
    console.error("Approve Expense Error:", error);
    // Fallback to Admin Client
    const adminSupabase = createAdminClient();
    const { error: adminError } = await adminSupabase
      .from("expenses")
      .update({ 
        status: "approved",
        updated_at: new Date().toISOString() 
      })
      .eq("id", id);
      
    if (adminError) {
       console.error("Admin Approve Expense Error:", adminError);
       return { error: "Failed to approve expense" };
    }
  }

  revalidatePath("/expenses");
  return { success: true };
}

export async function rejectExpenseAction(id: string, reason: string) {
  const supabase = createClient(cookies());
  
  // Verify permission
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager"].includes(profile.role)) {
    return { error: "Insufficient permissions" };
  }

  const { error } = await supabase
    .from("expenses")
    .update({ 
      status: "rejected",
      rejected_reason: reason,
      updated_at: new Date().toISOString() 
    })
    .eq("id", id);

  if (error) {
    console.error("Reject Expense Error:", error);
    // Fallback
    const adminSupabase = createAdminClient();
    const { error: adminError } = await adminSupabase
      .from("expenses")
      .update({ 
        status: "rejected",
        rejected_reason: reason,
        updated_at: new Date().toISOString() 
      })
      .eq("id", id);
      
    if (adminError) {
       return { error: "Failed to reject expense" };
    }
  }

  revalidatePath("/expenses");
  return { success: true };
}
