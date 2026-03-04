import { ok, err } from "../_lib/db";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(cookies());
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("name");

    if (error) {
      throw error;
    }

    // Transform field names to camelCase for consistency
    const enrichedProjects = (projects || []).map((p: any) => ({
      ...p,
      // Transform snake_case to camelCase for consistency
      managerId: p.manager_id,
      clientId: p.client_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      startDate: p.start_date,
      endDate: p.end_date,
      hourlyRate: p.hourly_rate,
      isArchived: p.is_archived, // might be undefined if column missing
      warrantyStartDate: p.warranty_start_date,
      warrantyEndDate: p.warranty_end_date,
      closureChecklist: p.closure_checklist,
    }));

    return ok(enrichedProjects, 200);
  } catch (e: any) {
    console.error("Projects API error:", e);
    return err(e?.message || "error", 500);
  }
}
