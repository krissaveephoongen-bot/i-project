import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageKey = searchParams.get("pageKey") || "";
    const userId = searchParams.get("userId") || "";
    if (!supabase) return NextResponse.json({ views: [] }, { status: 200 });
    if (!pageKey || !userId)
      return NextResponse.json({ views: [] }, { status: 200 });

    const { data, error } = await supabase
      .from("saved_views")
      .select("*")
      .eq("pageKey", pageKey)
      .eq("userId", userId)
      .order("updatedAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ views: data || [] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { views: [], error: e?.message || "error" },
      { status: 200 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = String(body?.userId || "");
    const pageKey = String(body?.pageKey || "");
    const name = String(body?.name || "");
    const filters = body?.filters ?? {};
    if (!supabase) return NextResponse.json({ ok: false }, { status: 200 });
    if (!userId || !pageKey || !name)
      return NextResponse.json({ ok: false }, { status: 200 });

    const id = body?.id || crypto.randomUUID();
    const { error } = await supabase
      .from("saved_views")
      .upsert(
        {
          id,
          userId,
          pageKey,
          name,
          filters,
          updatedAt: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

    if (error) throw error;
    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "error" },
      { status: 200 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || "";
    const userId = searchParams.get("userId") || "";
    if (!supabase) return NextResponse.json({ ok: false }, { status: 200 });
    if (!id || !userId)
      return NextResponse.json({ ok: false }, { status: 200 });

    const { error } = await supabase
      .from("saved_views")
      .delete()
      .eq("id", id)
      .eq("userId", userId);

    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "error" },
      { status: 200 },
    );
  }
}
