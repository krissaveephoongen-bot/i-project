import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import redis from "@/lib/redis";
import { apiResponse, apiError, toCamelCase } from "@/app/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return apiResponse(toCamelCase(data));
  } catch (e: any) {
    return apiError(e?.message || "error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const nowIso = new Date().toISOString();

    const allowed = new Set([
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "estimatedHours",
      "actualHours",
      "assignedTo",
      "projectId",
      "milestoneId",
    ]);

    const toSnake: Record<string, string> = {
      dueDate: "due_date",
      estimatedHours: "estimated_hours",
      actualHours: "actual_hours",
      assignedTo: "assigned_to",
      projectId: "project_id",
      milestoneId: "milestone_id",
    };

    const payload: any = {};
    for (const k of Object.keys(body)) {
      if (!allowed.has(k)) continue;
      payload[toSnake[k] ?? k] = body[k];
    }
    payload.updated_at = nowIso;

    if (Object.keys(payload).length === 1) {
      return apiError("No valid fields to update", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await redis.delPattern("tasks:*");
    return apiResponse(toCamelCase(data));
  } catch (e: any) {
    return apiError(e?.message || "error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check dependencies
    const { data: entries, error: entriesErr } = await supabaseAdmin
      .from("time_entries")
      .select("id")
      .eq("task_id", id)
      .limit(1);

    if (entriesErr) throw entriesErr;

    if (entries && entries.length > 0) {
      // Soft Delete
      const { error } = await supabaseAdmin
        .from("tasks")
        .update({ status: "inactive", updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
      return apiResponse({ mode: "soft_inactive" });
    } else {
      // Hard Delete
      const { error } = await supabaseAdmin
        .from("tasks")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      await redis.delPattern("tasks:*");
      return apiResponse({ mode: "deleted" });
    }
  } catch (e: any) {
    return apiError(e?.message || "error", 500);
  }
}
