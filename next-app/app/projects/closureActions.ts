"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const closureSchema = z.object({
  projectId: z.string().uuid("Invalid Project ID"),
  closureChecklist: z.array(z.any()).optional(),
  warrantyStartDate: z.string().optional(),
  warrantyEndDate: z.string().optional(),
  status: z.string().optional(),
});

export type ClosureInput = z.infer<typeof closureSchema>;

export async function getProjectClosure(projectId: string) {
    const supabase = createClient(cookies());
    let { data, error } = await supabase
        .from("projects")
        .select("id, status, progress, closure_checklist, warranty_start_date, warranty_end_date")
        .eq("id", projectId)
        .single();

    if (!data) {
        // Admin fallback
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
            if (profile && ["admin", "manager"].includes(profile.role)) {
                const adminSupabase = createAdminClient();
                const adminRes = await adminSupabase
                    .from("projects")
                    .select("id, status, progress, closure_checklist, warranty_start_date, warranty_end_date")
                    .eq("id", projectId)
                    .single();
                if (adminRes.data) {
                    data = adminRes.data;
                    error = null;
                }
            }
        }
    }

    if (error) {
        console.error("Fetch Closure Error:", error);
        return { error: "Failed to fetch project closure details" };
    }

    return {
        id: data.id,
        status: data.status,
        progress: data.progress,
        closureChecklist: data.closure_checklist,
        warrantyStartDate: data.warranty_start_date,
        warrantyEndDate: data.warranty_end_date,
    };
}

export async function updateProjectClosureAction(input: ClosureInput) {
  const result = closureSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  
  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.closureChecklist) updates.closure_checklist = input.closureChecklist;
  if (input.warrantyStartDate) updates.warranty_start_date = input.warrantyStartDate;
  if (input.warrantyEndDate) updates.warranty_end_date = input.warrantyEndDate;
  if (input.status) updates.status = input.status;

  let { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", input.projectId)
    .select()
    .single();

  // Admin Fallback for Update (if regular user permission fails but logic allows)
  if (error) {
      // Check if user is admin/manager, try admin client
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
          if (profile && ["admin", "manager"].includes(profile.role)) {
               const adminSupabase = createAdminClient();
               const adminRes = await adminSupabase
                .from("projects")
                .update(updates)
                .eq("id", input.projectId)
                .select()
                .single();
               
               if (adminRes.data) {
                   data = adminRes.data;
                   error = null;
               } else if (adminRes.error) {
                   error = adminRes.error;
               }
          }
      }
  }

  if (error) {
    console.error("Update Closure Error:", error);
    return { error: "Database error: Failed to update project closure" };
  }

  revalidatePath(`/projects/${input.projectId}`);
  return { data };
}
