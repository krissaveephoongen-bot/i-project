import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import redis from "@/lib/redis";
import { apiResponse, apiError, toCamelCase } from "@/app/lib/api-utils";

async function anyRecordExists(table: string, columns: string[], id: string) {
  let lastError: any = null;
  for (const col of columns) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("id")
      .eq(col, id)
      .limit(1);
    if (!error) return (data || []).length > 0;
    lastError = error;
    const msg = `${error.message || ""}`;
    if (msg.includes("Could not find the") || msg.includes("schema cache"))
      continue;
    break;
  }
  if (lastError) {
    const msg = `${lastError.message || ""}`;
    if (!(msg.includes("Could not find the") || msg.includes("schema cache")))
      throw lastError;
  }
  return false;
}

// GET: Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!supabaseAdmin) return apiError("Supabase is not configured", 500);

    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return apiError(error.message, 404);

    return apiResponse(toCamelCase(data));
  } catch (e: any) {
    return apiError(e?.message || "Internal server error", 500);
  }
}

// PUT: Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!supabaseAdmin) return apiError("Supabase is not configured", 500);

    const body = await request.json();
    const updatedFields = body.updatedFields || body; // Support both structures
    const nowIso = new Date().toISOString();

    const toSnake: Record<string, string> = {
      startDate: "start_date",
      endDate: "end_date",
      managerId: "manager_id",
      clientId: "client_id",
      progressPlan: "progress_plan",
      riskLevel: "risk_level",
      hourlyRate: "hourly_rate",
      isArchived: "is_archived",
      warrantyStartDate: "warranty_start_date",
      warrantyEndDate: "warranty_end_date",
      closureChecklist: "closure_checklist",
    };

    const allowedSnake = new Set([
      "name", "code", "description", "status", "progress", "progress_plan",
      "budget", "spent", "spi", "cpi", "start_date", "end_date",
      "manager_id", "client_id", "category", "is_archived",
      "risk_level", "hourly_rate", "warranty_start_date", "warranty_end_date", "closure_checklist"
    ]);

    const payload: any = {};
    for (const [k, v] of Object.entries(updatedFields)) {
      const sk = toSnake[k] ?? k;
      if (!allowedSnake.has(sk)) continue;
      payload[sk] = v;
    }
    payload.updated_at = nowIso;

    if (Object.keys(payload).length === 1 && "updated_at" in payload) {
      return apiError("No valid fields to update", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return apiError(error.message, 500);

    // Track Progress History
    if ("progress" in updatedFields || "progress" in payload) {
      const progress = Number(payload.progress);
      if (!isNaN(progress)) {
        await supabaseAdmin
          .from("project_progress_history")
          .insert({
            project_id: id,
            progress,
            week_date: nowIso,
            created_at: nowIso,
          } as any);
      }
    }

    await redis.del("projects:all");
    return apiResponse(toCamelCase(data));
  } catch (e: any) {
    return apiError(e?.message || "Internal server error", 500);
  }
}

// DELETE: Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) return apiError("Supabase is not configured", 500);

    const { id } = params;
    const hasDeps =
      (await anyRecordExists("tasks", ["project_id"], id)) ||
      (await anyRecordExists("time_entries", ["project_id"], id)) ||
      (await anyRecordExists("expenses", ["project_id"], id)) ||
      (await anyRecordExists("documents", ["project_id"], id));

    if (hasDeps) {
      // Archive
      const nowIso = new Date().toISOString();
      const { error: updErr } = await supabaseAdmin
        .from("projects")
        .update({ is_archived: true, updated_at: nowIso } as any)
        .eq("id", id);
      
      if (updErr) return apiError(updErr.message, 500);
      
      await redis.del("projects:all");
      return apiResponse({ mode: "archived" });
    } else {
      // Delete
      const { error: delErr } = await supabaseAdmin
        .from("projects")
        .delete()
        .eq("id", id);
      
      if (delErr) return apiError(delErr.message, 500);
      
      await redis.del("projects:all");
      return apiResponse({ mode: "deleted" });
    }
  } catch (e: any) {
    return apiError(e?.message || "error", 500);
  }
}
