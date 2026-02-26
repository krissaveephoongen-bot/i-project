import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import redis from "@/lib/redis";

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

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin)
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 500 },
      );

    const body = await request.json();
    const { id } = body || {};
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const nowIso = new Date().toISOString();
    const hasDeps =
      (await anyRecordExists(
        "tasks",
        ["project_id", "projectId", "projectid"],
        id,
      )) ||
      (await anyRecordExists(
        "time_entries",
        ["project_id", "projectId", "projectid"],
        id,
      )) ||
      (await anyRecordExists(
        "expenses",
        ["project_id", "projectId", "projectid"],
        id,
      )) ||
      (await anyRecordExists(
        "documents",
        ["project_id", "projectId", "projectid"],
        id,
      ));

    if (hasDeps) {
      const { error: updErr } = await supabaseAdmin
        .from("projects")
        .update({ is_archived: true, updated_at: nowIso } as any)
        .eq("id", id);
      if (updErr)
        return NextResponse.json({ error: updErr.message }, { status: 500 });
      await redis.del("projects:all");
      return NextResponse.json({ ok: true, mode: "archived" }, { status: 200 });
    }

    const { error: delErr } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("id", id);
    if (delErr)
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    await redis.del("projects:all");
    return NextResponse.json({ ok: true, mode: "deleted" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
