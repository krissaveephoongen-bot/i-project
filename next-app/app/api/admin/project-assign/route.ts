import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: projects } = await supabase
      .from("projects")
      .select("id,name")
      .order("name");
    const { data: users } = await supabase
      .from("users")
      .select("id,name,department,position")
      .order("name");
    const { data: members } = await supabase
      .from("project_members")
      .select("id,project_id,user_id,role")
      .order("project_id");
    return NextResponse.json({
      projects: projects || [],
      users: users || [],
      members: members || [],
    });
  } catch (e: any) {
    return NextResponse.json({ projects: [], users: [], members: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_id, user_id, role = "member" } = body || {};
    if (!project_id || !user_id) {
      return NextResponse.json({ ok: false });
    }
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase
      .from("project_members")
      .upsert(
        {
          project_id,
          user_id,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id,user_id" as any },
      );
    if (error) return NextResponse.json({ ok: false });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false });
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("id", id);
    if (error) return NextResponse.json({ ok: false });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
