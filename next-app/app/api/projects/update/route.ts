import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import redis from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin)
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 },
      );

    const body = await request.json();

    const { id, updatedFields = {} } = body || {};
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

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
    };

    const allowedSnake = new Set([
      "name",
      "code",
      "description",
      "status",
      "progress",
      "progress_plan",
      "budget",
      "spent",
      "spi",
      "cpi",
      "start_date",
      "end_date",
      "manager_id",
      "client_id",
      "category",
      "is_archived",
    ]);

    const payload: any = {};
    for (const [k, v] of Object.entries(updatedFields || {})) {
      const sk = toSnake[k] ?? k;
      if (!allowedSnake.has(sk)) continue;
      payload[sk] = v;
    }
    payload.updated_at = nowIso;

    if (Object.keys(payload).length === 1 && "updated_at" in payload) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(payload)
      .eq("id", id)
      .select("*")
      .limit(1);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    // Track Progress History if progress changed
    if ("progress" in updatedFields) {
      const progress = Number(updatedFields.progress);
      if (!isNaN(progress)) {
        for (const h of [
          { project_id: id, progress, week_date: nowIso, created_at: nowIso },
          { projectId: id, progress, weekDate: nowIso, createdAt: nowIso },
        ]) {
          const { error: hErr } = await supabaseAdmin
            .from("project_progress_history")
            .insert(h as any);
          if (!hErr) break;
          const msg = `${hErr.message || ""}`;
          if (
            msg.includes("Could not find the") ||
            msg.includes("schema cache")
          )
            continue;
          break;
        }
      }
    }

    await redis.del("projects:all");
    return NextResponse.json((data || [])[0] || {}, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
