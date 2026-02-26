import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from("expenses")
      .select(
        `
        id,
        user_id,
        project_id,
        task_id,
        date,
        amount,
        category,
        description,
        rejected_reason,
        status,
        approved_by,
        approved_at,
        user:users(id,name),
        project:projects(id,name),
        task:tasks(id,title)
      `
      )
      .eq("status", "pending")
      .order("date", { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      projectId: d.project_id,
      taskId: d.task_id,
      date: d.date,
      amount: d.amount,
      category: d.category,
      description: d.description,
      rejectedReason: d.rejected_reason,
      status: d.status,
      approvedBy: d.approved_by,
      approvedAt: d.approved_at,
      user: d.user,
      project: d.project,
      task: d.task,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (e: any) {
    console.error("Approvals expenses error:", e);
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
