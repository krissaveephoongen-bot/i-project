import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import crypto from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      project_id,
      id,
      name,
      title,
      percentage = 0,
      amount = 0,
      dueDate,
      due_date,
      status = "pending",
      note,
      notes,
    } = body || {};
    const pid = project_id ?? projectId;
    const nm = title ?? name;
    if (!pid || !nm)
      return NextResponse.json(
        { error: "projectId and name required" },
        { status: 400 },
      );
    const nowIso = new Date().toISOString();
    const mileId = id ?? crypto.randomUUID();
    const due = due_date ?? dueDate ?? null;

    const snakeRich: any = {
      id: mileId,
      project_id: pid,
      title: nm,
      status,
      due_date: due,
      created_at: nowIso,
      updated_at: nowIso,
    };
    if (Number(percentage || 0) !== 0)
      snakeRich.progress = Number(percentage || 0);
    if (Number(amount || 0) !== 0) snakeRich.amount = Number(amount || 0);
    if ((note ?? notes) != null && String(note ?? notes).length)
      snakeRich.notes = note ?? notes;

    const snakeMin: any = {
      id: mileId,
      project_id: pid,
      title: nm,
      status,
      due_date: due,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const camelRich: any = {
      id: mileId,
      projectId: pid,
      title: nm,
      status,
      dueDate: due,
      created_at: nowIso,
      updated_at: nowIso,
    };
    if (Number(percentage || 0) !== 0)
      camelRich.progress = Number(percentage || 0);
    if (Number(amount || 0) !== 0) camelRich.amount = Number(amount || 0);
    if ((note ?? notes) != null && String(note ?? notes).length)
      camelRich.notes = note ?? notes;

    const camelMin: any = {
      id: mileId,
      projectId: pid,
      title: nm,
      status,
      dueDate: due,
      created_at: nowIso,
      updated_at: nowIso,
    };

    let data: any = null;
    let error: any = null;
    for (const p of [snakeRich, snakeMin, camelRich, camelMin]) {
      const res = await supabase
        .from("milestones")
        .insert(p)
        .select("*")
        .limit(1);
      data = res.data;
      error = res.error;
      if (!error) break;
      const msg = `${error.message || ""}`;
      if (msg.includes("Could not find the") || msg.includes("schema cache"))
        continue;
      break;
    }
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data || [])[0], { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
