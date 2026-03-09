import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id = "*", start, end, status = "approved" } = body || {};
    if (!start || !end) {
      return NextResponse.json({ ok: false, error: "start,end required" });
    }
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    let q = supabase
      .from("time_entries")
      .update({ status, updated_at: new Date().toISOString() })
      .gte("date", start)
      .lte("date", end);
    if (user_id !== "*") {
      q = q.eq("user_id", user_id);
    }
    const { data, error, count } = await q.select("id");
    if (error) {
      return NextResponse.json({ ok: false, error: error.message });
    }
    return NextResponse.json({ ok: true, count: (data || []).length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" });
  }
}
