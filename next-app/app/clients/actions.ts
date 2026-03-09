"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
}

export async function getClients() {
  const supabase = createClient(cookies());
  
  // 1. Try User Session
  let { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  // 2. Fallback to Admin Client if RLS blocks access or no data found
  if (error || !data || data.length === 0) {
      const adminSupabase = createAdminClient();
      const adminRes = await adminSupabase
        .from("clients")
        .select("*")
        .order("name");
      
      if (adminRes.data) {
          data = adminRes.data;
          error = null;
      }
  }
    
  if (error) {
    console.error("Get Clients Error:", error);
    return [];
  }
  
  return (data || []).map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    taxId: c.tax_id,
    address: c.address,
    notes: c.notes,
  }));
}

export async function createClientAction(input: ClientInput) {
  const result = clientSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      tax_id: input.taxId || null,
      address: input.address || null,
      notes: input.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create Client Error:", error);
    return { error: "Database error: Failed to create client" };
  }

  revalidatePath("/clients");
  return { data };
}

export async function updateClientAction(id: string, input: Partial<ClientInput>) {
  const supabase = createClient(cookies());
  
  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.name) updates.name = input.name;
  if (input.email !== undefined) updates.email = input.email;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.taxId !== undefined) updates.tax_id = input.taxId;
  if (input.address !== undefined) updates.address = input.address;
  if (input.notes !== undefined) updates.notes = input.notes;

  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Client Error:", error);
    return { error: "Database error: Failed to update client" };
  }

  revalidatePath("/clients");
  return { data };
}

export async function deleteClientAction(id: string) {
  const supabase = createClient(cookies());
  
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Client Error:", error);
    return { error: "Database error: Failed to delete client" };
  }

  revalidatePath("/clients");
  return { success: true };
}
