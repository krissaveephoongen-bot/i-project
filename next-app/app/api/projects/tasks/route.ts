import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import redis from "@/lib/redis";
import {
  firstOk,
  MILESTONE_ID_COLUMNS,
  PROJECT_ID_COLUMNS,
} from "../../_lib/supabaseCompat";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const milestoneId = searchParams.get("milestoneId");
    let data: any[] | null = null;
    let error: any = null;

    if (projectId && milestoneId) {
      const res = await firstOk(PROJECT_ID_COLUMNS, async (pCol) =>
        firstOk(MILESTONE_ID_COLUMNS, (mCol) =>
          supabase
            .from("tasks")
            .select("*")
            .eq(pCol, projectId)
            .eq(mCol, milestoneId),
        ),
      );
      data = (res as any)?.data ?? null;
      error = (res as any)?.error ?? null;
    } else if (projectId) {
      const res = await firstOk(PROJECT_ID_COLUMNS, (pCol) =>
        supabase.from("tasks").select("*").eq(pCol, projectId),
      );
      data = (res as any).data;
      error = (res as any).error;
    } else if (milestoneId) {
      const res = await firstOk(MILESTONE_ID_COLUMNS, (mCol) =>
        supabase.from("tasks").select("*").eq(mCol, milestoneId),
      );
      data = (res as any).data;
      error = (res as any).error;
    } else {
      const res = await supabase.from("tasks").select("*");
      data = res.data;
      error = res.error;
    }
    if (error) return NextResponse.json([], { status: 200 });
    const rows = (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      phase: t.phase ?? null,
      milestoneId: t.milestoneId ?? null,
      projectId: t.projectId ?? t.project_id ?? null,
      weight: Number(t.weight ?? t.estimatedHours ?? t.estimated_hours ?? 0),
      progressPlan: Number(t.progressPlan ?? t.progress_plan ?? 0),
      progressActual: Number(t.progressActual ?? t.progress_actual ?? 0),
      startDate: t.startDate ?? t.start_date ?? null,
      endDate: t.endDate ?? t.end_date ?? null,
      status: t.status ?? "Pending",
    }));
    return NextResponse.json(rows, { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updatedFields } = body || {};
    if (!id || !updatedFields) {
      return NextResponse.json(
        { error: "id and updatedFields required" },
        { status: 400 },
      );
    }
    const toSnake: Record<string, string> = {
      progressPlan: "progress_plan",
      progressActual: "progress_actual",
      startDate: "start_date",
      endDate: "end_date",
      milestoneId: "milestone_id",
      projectId: "project_id",
      // passthrough: title, status, phase, weight
    };
    const nowIso = new Date().toISOString();
    const snakePayload: any = { updated_at: nowIso };
    const camelPayload: any = { updatedAt: nowIso };
    for (const [k, v] of Object.entries(updatedFields || {})) {
      const snakeKey =
        toSnake[k] ||
        k // if already snake
          ;
      snakePayload[snakeKey] = v;
      camelPayload[k] = v;
    }
    const client = supabaseAdmin || supabase;
    let data: any = null;
    let error: any = null;
    for (const p of [snakePayload, camelPayload]) {
      const res = await client
        .from("tasks")
        .update(p)
        .eq("id", id)
        .select("*")
        .single();
      data = res.data;
      error = res.error;
      if (!error) break;
      const msg = `${error?.message || ""}`;
      if (msg.includes("Could not find the") || msg.includes("schema cache"))
        continue;
      break;
    }
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    await redis.delPattern("tasks:*");
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "internal error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const client = supabaseAdmin || supabase;
    const { error } = await client.from("tasks").delete().eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    await redis.delPattern("tasks:*");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "internal error" },
      { status: 500 },
    );
  }
}
