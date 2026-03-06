"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional().nullable(),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  status: z.string().default("active"),
});

export type VendorInput = z.infer<typeof vendorSchema>;

export async function getVendorsAction(query?: string) {
  const supabase = createClient(cookies());
  let clientToUse = supabase;

  // Check admin role for robust access
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
      if (profile && ["admin", "manager"].includes(profile.role)) {
          clientToUse = createAdminClient();
      }
  }

  let dbQuery = clientToUse.from("vendors").select("*").order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,code.ilike.%${query}%,contact_person.ilike.%${query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error("Fetch Vendors Error:", error);
    return { error: "Failed to fetch vendors" };
  }

  return { 
    data: data.map(v => ({
      id: v.id,
      name: v.name,
      code: v.code,
      type: v.type,
      category: v.category,
      status: v.status,
      contactPerson: v.contact_person,
      email: v.email,
      phone: v.phone,
      createdAt: v.created_at
    })) 
  };
}

export async function createVendorAction(input: VendorInput) {
  const result = vendorSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  
  // Use admin client for creation if needed, or stick to RLS
  // Usually admins create vendors
  
  const payload = {
    name: input.name,
    code: input.code || null,
    type: input.type,
    category: input.category,
    contact_person: input.contactPerson || null,
    email: input.email || null,
    phone: input.phone || null,
    status: input.status,
  };

  const { data, error } = await supabase
    .from("vendors")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Create Vendor Error:", error);
    // Fallback
    const adminSupabase = createAdminClient();
    const { data: adminData, error: adminError } = await adminSupabase
        .from("vendors")
        .insert(payload)
        .select()
        .single();
        
    if (adminError) return { error: "Failed to create vendor" };
    revalidatePath("/admin/vendors");
    return { data: adminData };
  }

  revalidatePath("/admin/vendors");
  return { data };
}

export async function updateVendorAction(id: string, input: Partial<VendorInput>) {
  const supabase = createClient(cookies());
  
  const updates: any = {};
  if (input.name) updates.name = input.name;
  if (input.code !== undefined) updates.code = input.code;
  if (input.type) updates.type = input.type;
  if (input.category) updates.category = input.category;
  if (input.contactPerson !== undefined) updates.contact_person = input.contactPerson;
  if (input.email !== undefined) updates.email = input.email;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.status) updates.status = input.status;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("vendors")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Vendor Error:", error);
    // Fallback
    const adminSupabase = createAdminClient();
    const { data: adminData, error: adminError } = await adminSupabase
        .from("vendors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
        
    if (adminError) return { error: "Failed to update vendor" };
    revalidatePath("/admin/vendors");
    return { data: adminData };
  }

  revalidatePath("/admin/vendors");
  return { data };
}

export async function deleteVendorAction(id: string) {
  const supabase = createClient(cookies());

  const { error } = await supabase.from("vendors").delete().eq("id", id);

  if (error) {
    console.error("Delete Vendor Error:", error);
    // Fallback
    const adminSupabase = createAdminClient();
    const { error: adminError } = await adminSupabase.from("vendors").delete().eq("id", id);
    if (adminError) return { error: "Failed to delete vendor" };
  }

  revalidatePath("/admin/vendors");
  return { success: true };
}