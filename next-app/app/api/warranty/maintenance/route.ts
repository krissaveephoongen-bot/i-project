import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { apiResponse, apiError, toCamelCase } from "@/app/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    // Fetch tasks that are part of Warranty/Maintenance phase
    let query = supabaseAdmin
      .from("tasks")
      .select(`
        *,
        project:projects(name)
      `)
      .or('phase.eq.Warranty,phase.eq.Maintenance') // Adjust phase names as needed
      .order("due_date", { ascending: true });

    if (projectId) query = query.eq("project_id", projectId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) throw error;

    return apiResponse(toCamelCase(data));
  } catch (e: any) {
    return apiError(e?.message || "Internal Server Error", 500);
  }
}
