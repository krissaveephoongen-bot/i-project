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
    const payload = {
      projectId,
      milestoneId: milestoneId || null,
      name,
      title: name,
      weight: Number(weight || 0),
      progressPlan: Number(progressPlan || 0),
      progressActual: Number(progressActual || 0),
      startDate: startDate || null,
      endDate: endDate || null,
      status,
      phase: phase || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const client = supabaseAdmin || supabase;
    const { data, error } = await client.from("tasks").insert(payload).select("*").single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    await redis.delPattern("tasks:*");
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "internal error" },
      { status: 500 },
    );
  }
}
