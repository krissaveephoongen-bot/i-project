import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    // Auth check
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // 1. Get all active projects
    // Filter by status NOT completed/cancelled
    const { data: projects, error: projError } = await supabase
      .from("projects")
      .select("id, name, project_code, status")
      .neq("status", "Completed")
      .neq("status", "Cancelled")
      .order("name");

    if (projError) throw projError;

    // 2. Get active tasks for these projects
    const projectIds = (projects || []).map((p: any) => p.id);
    let tasks: any[] = [];
    
    if (projectIds.length > 0) {
      const { data: t, error: taskError } = await supabase
        .from("tasks")
        .select("id, title, project_id, status")
        .in("project_id", projectIds)
        .neq("status", "completed")
        .neq("status", "cancelled");
        
      if (taskError) console.error("Error fetching tasks", taskError);
      tasks = t || [];
    }

    // 3. Map tasks to projects
    const tasksMap: Record<string, Array<{ id: string; name: string }>> = {};
    for (const t of tasks) {
      const name = t.title || t.id;
      const pid = t.project_id;
      if (!tasksMap[pid]) tasksMap[pid] = [];
      tasksMap[pid].push({ id: t.id, name });
    }

    // 4. Construct response
    const rows = (projects || []).map((p: any) => ({
      id: p.id,
      name: p.name || p.project_code || "Untitled Project",
      is_billable: false, // Default
      tasks: tasksMap[p.id] || [],
    }));

    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error("Timesheet projects error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
