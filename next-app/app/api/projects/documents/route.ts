import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import crypto from "node:crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) return NextResponse.json([], { status: 200 });
    const { data } = await supabase
      .from("documents")
      .select("id,projectId,name,url,created_at,updated_at")
      .eq("projectId", projectId)
      .order("updated_at", { ascending: false });
    return NextResponse.json(data || [], { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, name, type, size, url, milestone, uploaded_by } =
      body || {};
    const payload = {
      id: crypto.randomUUID(),
      projectId: project_id,
      name,
      url: url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("documents")
      .insert(payload)
      .select("id,projectId,name,url,created_at,updated_at")
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
    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (typeof updatedFields.name !== "undefined")
      payload.name = updatedFields.name;
    if (typeof updatedFields.url !== "undefined")
      payload.url = updatedFields.url;
    const { data, error } = await supabase
      .from("documents")
      .update(payload)
      .eq("id", id)
      .select("id,projectId,name,url,created_at,updated_at")
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
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return NextResponse.json({ ok: false }, { status: 200 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
