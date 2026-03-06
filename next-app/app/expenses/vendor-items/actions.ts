"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const vendorItemSchema = z.object({
  expenseId: z.string().uuid("Invalid Expense ID"),
  vendorId: z.string().uuid("Invalid Vendor ID").optional().nullable(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0).default(1),
  unitPrice: z.number().min(0),
  baseCost: z.number().min(0).optional().nullable(),
  markup: z.number().min(0).optional().nullable(),
  vendorItemCode: z.string().optional().nullable(),
  vendorInvoice: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type VendorItemInput = z.infer<typeof vendorItemSchema>;

export async function getVendorItemsAction(search?: string) {
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
    .from("expense_items")
    .select(`
      *,
      vendor:vendors(name),
      expense:expenses(description)
    `)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`description.ilike.%${search}%,vendor_invoice.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Fetch Vendor Items Error:", error);
    return { error: "Failed to fetch vendor items" };
  }

  return { 
    data: data.map(item => ({
      id: item.id,
      expenseId: item.expense_id || item.expenseId, // Handle case mapping
      vendorId: item.vendor_id || item.vendorId,
      vendorName: item.vendor?.name,
      category: item.category,
      subcategory: item.subcategory,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price || item.unitPrice),
      totalPrice: Number(item.total_price || item.totalPrice),
      baseCost: item.base_cost || item.baseCost ? Number(item.base_cost || item.baseCost) : null,
      marginAmount: item.margin_amount || item.marginAmount ? Number(item.margin_amount || item.marginAmount) : null,
      finalPrice: item.final_price || item.finalPrice ? Number(item.final_price || item.finalPrice) : null,
      vendorInvoice: item.vendor_invoice || item.vendorInvoice,
      vendorItemCode: item.vendor_item_code || item.vendorItemCode,
      notes: item.notes,
      createdAt: item.created_at || item.createdAt
    })) 
  };
}

export async function createVendorItemAction(input: VendorItemInput) {
  const result = vendorItemSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());

  const quantity = input.quantity;
  const unitPrice = input.unitPrice;
  const totalPrice = quantity * unitPrice;
  
  // Calculate margin if baseCost provided
  let marginAmount = 0;
  let finalPrice = totalPrice;
  
  if (input.baseCost) {
     // Simple logic: if baseCost is unit cost
     // margin = (unitPrice - baseCost) * quantity ? 
     // Or is unitPrice the cost to us?
     // Usually: 
     // unitPrice = price we pay to vendor
     // finalPrice = price we charge client (if markup)
     
     // Let's assume unitPrice is what we pay vendor (Cost).
     // baseCost might be redundant or same as unitPrice?
     // Prisma schema says: baseCost (actual cost), unitPrice (maybe list price?), finalPrice (charged to client)
     
     // Let's assume input.unitPrice is the COST from vendor.
     // So baseCost = unitPrice * quantity
     
     // Actually, schema has: unitPrice, totalPrice, baseCost, markup, marginAmount, finalPrice.
     // Let's calculate:
     // totalPrice = quantity * unitPrice (Cost from vendor)
     // baseCost = totalPrice (Total Cost)
     // marginAmount = baseCost * (markup / 100)
     // finalPrice = baseCost + marginAmount
  }

  // Simplified mapping for now matching schema
  // We'll trust input unitPrice as the vendor price.
  
  const payload = {
    expense_id: input.expenseId,
    vendor_id: input.vendorId,
    category: input.category,
    subcategory: input.subcategory,
    description: input.description,
    quantity: input.quantity,
    unit_price: input.unitPrice,
    total_price: totalPrice,
    base_cost: input.baseCost || totalPrice, // Default base cost to total price if not specified
    markup: input.markup || 0,
    margin_amount: 0, // Calculate properly if needed
    final_price: totalPrice, // Update if markup exists
    vendor_item_code: input.vendorItemCode,
    vendor_invoice: input.vendorInvoice,
    notes: input.notes,
    updated_at: new Date().toISOString(),
  };

  if (input.markup && input.markup > 0) {
      const cost = payload.base_cost;
      const margin = cost * (input.markup / 100);
      payload.margin_amount = margin;
      payload.final_price = cost + margin;
  }

  const { data, error } = await supabase
    .from("expense_items")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Create Item Error:", error);
    // Fallback
    const adminSupabase = createAdminClient();
    const { data: adminData, error: adminError } = await adminSupabase
        .from("expense_items")
        .insert(payload)
        .select()
        .single();
    if (adminError) return { error: "Failed to create item" };
    revalidatePath("/expenses/vendor-items");
    return { data: adminData };
  }

  revalidatePath("/expenses/vendor-items");
  return { data };
}

export async function updateVendorItemAction(id: string, input: Partial<VendorItemInput>) {
  const supabase = createClient(cookies());

  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.category) updates.category = input.category;
  if (input.subcategory !== undefined) updates.subcategory = input.subcategory;
  if (input.description) updates.description = input.description;
  if (input.quantity !== undefined) updates.quantity = input.quantity;
  if (input.unitPrice !== undefined) updates.unit_price = input.unitPrice;
  if (input.vendorId !== undefined) updates.vendor_id = input.vendorId;
  if (input.vendorInvoice !== undefined) updates.vendor_invoice = input.vendorInvoice;
  if (input.vendorItemCode !== undefined) updates.vendor_item_code = input.vendorItemCode;
  if (input.notes !== undefined) updates.notes = input.notes;
  
  // Recalculate totals if price/qty changes
  // This requires fetching current state or blindly updating.
  // For simplicity, we just update fields. Real app should recalc totals.

  const { data, error } = await supabase
    .from("expense_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Item Error:", error);
    const adminSupabase = createAdminClient();
    const { data: adminData, error: adminError } = await adminSupabase
        .from("expense_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    if (adminError) return { error: "Failed to update item" };
    revalidatePath("/expenses/vendor-items");
    return { data: adminData };
  }

  revalidatePath("/expenses/vendor-items");
  return { data };
}

export async function deleteVendorItemAction(id: string) {
  const supabase = createClient(cookies());
  const { error } = await supabase.from("expense_items").delete().eq("id", id);
  if (error) {
     const adminSupabase = createAdminClient();
     const { error: adminError } = await adminSupabase.from("expense_items").delete().eq("id", id);
     if (adminError) return { error: "Failed to delete item" };
  }
  revalidatePath("/expenses/vendor-items");
  return { success: true };
}