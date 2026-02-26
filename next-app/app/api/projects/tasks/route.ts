import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
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
    const mapKey = (k: string) => {
      const m: Record<string, string> = {
        progress_plan: "progressPlan",
        progress_actual: "progressActual",
        start_date: "startDate",
        end_date: "endDate",
        milestone_id: "milestoneId",
        project_id: "projectId",
      };
      return m[k] || k;
    };
    const payload: Record<string, any> = {};
    Object.entries(updatedFields || {}).forEach(([k, v]) => {
      payload[mapKey(k)] = v;
    });
    payload["updated_at"] = new Date().toISOString();
    const { data, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "internal error" },
      { status: 500 },
    );
  }
}
