import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) return NextResponse.json([], { status: 200 });
    const supabase = createClient(cookies());
    const { data } = await supabase
      .from("risks")
      .select("id,name,severity,status,owner,target_date,action_plan,impact,likelihood,projectId,project_id,title")
      .eq("projectId", projectId)
      .order("id", { ascending: true });
    return NextResponse.json(data || [], { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      title,
      severity = "Medium",
      status = "Open",
    } = body || {};
    const payload = {
      id: crypto.randomUUID(),
      projectId: project_id,
      name: title || "Risk",
      severity,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from("risks")
      .insert(payload)
      .select("id,name,severity,status,projectId")
      .limit(1);
    if (error) return NextResponse.json({}, { status: 200 });
    return NextResponse.json((data || [])[0] || {}, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updatedFields = {} } = body || {};
    if (!id) return NextResponse.json({}, { status: 200 });
    const payload: any = { updated_at: new Date().toISOString() };
    if (typeof updatedFields.title !== "undefined")
      payload.name = updatedFields.title;
    if (typeof updatedFields.severity !== "undefined")
      payload.severity = updatedFields.severity;
    if (typeof updatedFields.status !== "undefined")
      payload.status = updatedFields.status;
    if (typeof updatedFields.owner !== "undefined")
      payload.owner = updatedFields.owner;
    if (typeof updatedFields.target_date !== "undefined")
      payload.target_date = updatedFields.target_date;
    if (typeof updatedFields.action_plan !== "undefined")
      payload.action_plan = updatedFields.action_plan;
    if (typeof updatedFields.impact !== "undefined")
      payload.impact = updatedFields.impact;
    if (typeof updatedFields.likelihood !== "undefined")
      payload.likelihood = updatedFields.likelihood;
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from("risks")
      .update(payload)
      .eq("id", id)
      .select("id,name,severity,status,owner,target_date,action_plan,impact,likelihood,projectId")
      .limit(1);
    if (error) return NextResponse.json({}, { status: 200 });
    return NextResponse.json((data || [])[0] || {}, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false }, { status: 200 });
    const supabase = createClient(cookies());
    const { error } = await supabase.from("risks").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false }, { status: 200 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
