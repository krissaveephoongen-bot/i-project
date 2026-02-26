"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const documentSchema = z.object({
  projectId: z.string().uuid("Invalid Project ID"),
  name: z.string().min(1, "Name is required"),
  type: z.string().optional(),
  size: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")).or(z.null()),
  milestone: z.string().optional(),
  uploadedBy: z.string().optional(),
});

export type DocumentInput = z.infer<typeof documentSchema>;

export async function createDocumentAction(input: DocumentInput) {
  const result = documentSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("documents")
    .insert({
      project_id: input.projectId,
      name: input.name,
      type: input.type,
      size: input.size,
      url: input.url,
      milestone: input.milestone,
      uploaded_by: input.uploadedBy,
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create Document Error:", error);
    return { error: "Database error: Failed to create document" };
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { data };
}

export async function updateDocumentAction(id: string, input: Partial<DocumentInput>) {
  const supabase = createClient(cookies());
  
  const updates: any = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.type !== undefined) updates.type = input.type;
  if (input.size !== undefined) updates.size = input.size;
  if (input.url !== undefined) updates.url = input.url;
  if (input.milestone !== undefined) updates.milestone = input.milestone;

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Document Error:", error);
    return { error: "Database error: Failed to update document" };
  }

  if (data?.project_id) {
    revalidatePath(`/projects/${data.project_id}`);
  }
  return { data };
}

export async function deleteDocumentAction(id: string) {
  const supabase = createClient(cookies());
  
  const { data: doc } = await supabase.from("documents").select("project_id").eq("id", id).single();
  
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Document Error:", error);
    return { error: "Database error: Failed to delete document" };
  }

  if (doc?.project_id) {
    revalidatePath(`/projects/${doc.project_id}`);
  }
  return { success: true };
}
