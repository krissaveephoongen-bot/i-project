import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const projects = (searchParams.get("projects") || "")
      .split(",")
      .filter(Boolean);

    if (!user_id || !start || !end) {
      return NextResponse.json(
        { error: "user_id, start, end are required" },
        { status: 400 },
      );
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Query time_entries
    let q = supabase
      .from("time_entries")
      .select("*")
      .gte("date", start)
      .lte("date", end);

    if (user_id !== "*") {
      q = q.eq("user_id", user_id);
    }
    if (projects.length > 0) {
      q = q.in("project_id", projects);
    }
    const { data, error } = await q.order("date", { ascending: true });

    if (error) {
      console.error("Error fetching time_entries:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error: any) {
    console.error("Timesheet entries error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      project_id,
      task_id,
      date,
      hours,
      start_time,
      end_time,
      description,
      activity_type,
      billable,
    } = body || {};

    if (!user_id || !date) {
      return NextResponse.json(
        { error: "user_id and date required" },
        { status: 400 },
      );
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const payload: any = {
      // id: crypto.randomUUID(), // Let DB handle ID generation if possible, or keep it
      user_id: user_id,
      project_id: project_id || null,
      task_id: task_id || null,
      date,
      hours: Number(hours || 0),
      start_time: start_time || null,
      end_time: end_time || null,
      description: description || null,
      work_type: activity_type || "project",
      billable_hours: billable ? Number(hours || 0) : 0,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("time_entries")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error inserting time_entries:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error("POST Timesheet Error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      hours,
      task_id,
      start_time,
      end_time,
      description,
      activity_type,
      billable,
      status,
    } = body || {};

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const payload: any = { updated_at: new Date().toISOString() };
    if (typeof hours !== "undefined") payload.hours = Number(hours || 0);
    if (typeof task_id !== "undefined") payload.task_id = task_id || null;
    if (typeof start_time !== "undefined")
      payload.start_time = start_time || null;
    if (typeof end_time !== "undefined") payload.end_time = end_time || null;
    if (typeof description !== "undefined")
      payload.description = description || null;
    if (typeof activity_type !== "undefined") payload.work_type = activity_type;
    if (typeof billable !== "undefined")
      payload.billable_hours = billable ? Number(hours || 0) : 0;
    if (typeof status !== "undefined") payload.status = status;

    const { data, error } = await supabase
      .from("time_entries")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating time_entries:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error("PUT Timesheet Error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) {
      console.error("Error deleting time_entries:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE Timesheet Error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
