"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const contactSchema = z.object({
  projectId: z.string().uuid("Invalid Project ID"),
  name: z.string().min(1, "Name is required"),
  position: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["internal", "client"]),
  isKeyPerson: z.boolean().default(false),
});

export type ContactInput = z.infer<typeof contactSchema>;

export async function createContactAction(input: ContactInput) {
  const result = contactSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      project_id: input.projectId,
      name: input.name,
      position: input.position,
      email: input.email,
      phone: input.phone,
      type: input.type,
      is_key_person: input.isKeyPerson,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create Contact Error:", error);
    return { error: "Database error: Failed to create contact" };
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { data };
}

export async function updateContactAction(id: string, input: Partial<ContactInput>) {
  const supabase = createClient(cookies());
  
  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updates.name = input.name;
  if (input.position !== undefined) updates.position = input.position;
  if (input.email !== undefined) updates.email = input.email;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.isKeyPerson !== undefined) updates.is_key_person = input.isKeyPerson;

  const { data, error } = await supabase
    .from("contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Contact Error:", error);
    return { error: "Database error: Failed to update contact" };
  }

  if (data?.project_id) {
    revalidatePath(`/projects/${data.project_id}`);
  }
  return { data };
}

export async function deleteContactAction(id: string) {
  const supabase = createClient(cookies());
  
  const { data: contact } = await supabase.from("contacts").select("project_id").eq("id", id).single();
  
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Contact Error:", error);
    return { error: "Database error: Failed to delete contact" };
  }

  if (contact?.project_id) {
    revalidatePath(`/projects/${contact.project_id}`);
  }
  return { success: true };
}
