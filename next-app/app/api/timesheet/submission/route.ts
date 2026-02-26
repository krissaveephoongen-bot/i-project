import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const start = searchParams.get("start"); // YYYY-MM-DD

    if (!userId || !start) {
      return NextResponse.json(
        { error: "userId and start are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("timesheet_submissions")
      .select("status")
      .eq("user_id", userId)
      .eq("period_start_date", start)
      .limit(1);

    if (error) {
      console.error("Error fetching submission status:", error);
      return NextResponse.json({ status: "Draft" }, { status: 200 }); // Default to Draft on error to avoid blocking UI
    }

    const status = (data || [])[0]?.status || "Draft";
    return NextResponse.json({ status }, { status: 200 });
  } catch (error) {
    console.error("Timesheet submission error:", error);
    return NextResponse.json({ status: "Draft" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, period_start_date, period_end_date, total_hours } = body;

    if (!user_id || !period_start_date) {
      return NextResponse.json(
        { error: "user_id and period_start_date are required" },
        { status: 400 },
      );
    }

    // Use a composite ID or let DB handle it.
    // Assuming 'id' is a string PK, we generate it deterministically.
    const id = `${user_id}-${period_start_date}`;

    const payload = {
      id,
      user_id,
      period_start_date,
      period_end_date: period_end_date || null,
      total_hours: Number(total_hours || 0),
      status: "Submitted",
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("timesheet_submissions")
      .upsert(payload, { onConflict: "id" })
      .select("status")
      .single();

    if (error) {
      console.error("Error submitting timesheet:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { status: data?.status || "Submitted" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("POST Submission Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
