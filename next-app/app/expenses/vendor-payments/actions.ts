"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const vendorPaymentSchema = z.object({
  vendorId: z.string().uuid("Invalid Vendor ID"),
  projectId: z.string().uuid("Invalid Project ID").optional().nullable(),
  contractId: z.string().uuid("Invalid Contract ID").optional().nullable(),
  paymentType: z.string().min(1, "Payment Type is required"),
  amount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string().min(1, "Due Date is required"),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().default("pending"),
});

export type VendorPaymentInput = z.infer<typeof vendorPaymentSchema>;

export async function getVendorPaymentsAction(search?: string) {
  const supabase = createClient(cookies());
  let clientToUse = supabase;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
      if (profile && ["admin", "manager"].includes(profile.role)) {
          clientToUse = createAdminClient();
      }
  }

  let query = clientToUse
    .from("vendor_payments")
    .select(`
      *,
      vendor:vendors(name),
      project:projects(name)
    `)
    .order("due_date", { ascending: true });

  if (search) {
     // Search is tricky with relations. Maybe just description?
     query = query.or(`description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Fetch Vendor Payments Error:", error);
    return { error: "Failed to fetch vendor payments" };
  }

  return { 
    data: (data || []).map(p => ({
      id: p.id,
      vendorId: p.vendor_id || p.vendorId,
      vendorName: p.vendor?.name,
      projectId: p.project_id || p.projectId,
      projectName: p.project?.name,
      contractId: p.contract_id || p.contractId,
      paymentType: p.payment_type || p.paymentType,
      amount: Number(p.amount),
      dueDate: p.due_date || p.dueDate,
      paidDate: p.paid_date || p.paidDate,
      status: p.status,
      description: p.description,
      notes: p.notes,
      createdAt: p.created_at || p.createdAt
    })) 
  };
}

export async function createVendorPaymentAction(input: VendorPaymentInput) {
  const result = vendorPaymentSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());

  const payload = {
    vendor_id: input.vendorId,
    project_id: input.projectId || null,
    contract_id: input.contractId || null,
    payment_type: input.paymentType, // Ensure enum matches DB if strict
    amount: input.amount,
    due_date: input.dueDate,
    status: input.status,
    description: input.description,
    notes: input.notes,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("vendor_payments")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Create Payment Error:", error);
    const adminSupabase = createAdminClient();
    const { data: adminData, error: adminError } = await adminSupabase
        .from("vendor_payments")
        .insert(payload)
        .select()
        .single();
    if (adminError) return { error: "Failed to create payment" };
    revalidatePath("/expenses/vendor-payments");
    return { data: adminData };
  }

  revalidatePath("/expenses/vendor-payments");
  return { data };
}

export async function updateVendorPaymentAction(id: string, input: Partial<VendorPaymentInput>) {
  const supabase = createClient(cookies());

  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.vendorId) updates.vendor_id = input.vendorId;
  if (input.projectId !== undefined) updates.project_id = input.projectId;
  if (input.contractId !== undefined) updates.contract_id = input.contractId;
  if (input.paymentType) updates.payment_type = input.paymentType;
  if (input.amount !== undefined) updates.amount = input.amount;
  if (input.dueDate) updates.due_date = input.dueDate;
  if (input.status) updates.status = input.status;
  if (input.description !== undefined) updates.description = input.description;
  if (input.notes !== undefined) updates.notes = input.notes;

  const { data, error } = await supabase
    .from("vendor_payments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Payment Error:", error);
    const adminSupabase = createAdminClient();
    const { data: adminData, error: adminError } = await adminSupabase
        .from("vendor_payments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    if (adminError) return { error: "Failed to update payment" };
    revalidatePath("/expenses/vendor-payments");
    return { data: adminData };
  }

  revalidatePath("/expenses/vendor-payments");
  return { data };
}

export async function deleteVendorPaymentAction(id: string) {
  const supabase = createClient(cookies());
  const { error } = await supabase.from("vendor_payments").delete().eq("id", id);
  if (error) {
     const adminSupabase = createAdminClient();
     const { error: adminError } = await adminSupabase.from("vendor_payments").delete().eq("id", id);
     if (adminError) return { error: "Failed to delete payment" };
  }
  revalidatePath("/expenses/vendor-payments");
  return { success: true };
}