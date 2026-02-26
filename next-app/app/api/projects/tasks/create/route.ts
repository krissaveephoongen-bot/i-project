import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import redis from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      milestoneId,
      name,
      weight = 0,
      startDate,
      endDate,
      progressPlan = 0,
      progressActual = 0,
      status = "Pending",
      phase,
    } = body || {};
    if (!projectId || !name) {
      return NextResponse.json(
        { error: "projectId and name required" },
        { status: 400 },
      );
    }
    const client = supabaseAdmin || supabase;
    const nowIso = new Date().toISOString();
    const snakePayload: any = {
      project_id: projectId,
      milestone_id: milestoneId || null,
      title: name,
      status,
      weight: Number(weight || 0),
      progress_plan: Number(progressPlan || 0),
      progress_actual: Number(progressActual || 0),
      start_date: startDate || null,
      end_date: endDate || null,
      phase: phase || null,
      created_at: nowIso,
      updated_at: nowIso,
    };
    const camelPayload: any = {
      projectId,
      milestoneId: milestoneId || null,
      title: name,
      status,
      weight: Number(weight || 0),
      progressPlan: Number(progressPlan || 0),
      progressActual: Number(progressActual || 0),
      startDate: startDate || null,
      endDate: endDate || null,
      phase: phase || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    let data: any = null;
    let error: any = null;
    for (const p of [snakePayload, camelPayload]) {
      const res = await client.from("tasks").insert(p).select("*").single();
      data = res.data;
      error = res.error;
      if (!error) break;
      const msg = `${error.message || ""}`;
      if (msg.includes("Could not find the") || msg.includes("schema cache"))
        continue;
      break;
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await redis.delPattern("tasks:*");
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "internal error" },
      { status: 500 },
    );
  }
}
