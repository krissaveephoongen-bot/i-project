import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "admin client missing" },
        { status: 500 },
      );
    }

    // Direct query to projects table
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select(
        "id, name, status, progress, budget, spent, spi, cpi, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      projects: data || [],
      count: data?.length || 0,
      query: "Direct SELECT from projects table",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
