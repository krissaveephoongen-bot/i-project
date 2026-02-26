import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import {
  firstOk,
  USER_ID_COLUMNS,
  isSchemaColumnError,
} from "../../_lib/supabaseCompat";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let start = searchParams.get("start");
    let end = searchParams.get("end");

    // Default to current week (Monday to Sunday) if not provided
    if (!start || !end) {
      const now = new Date();
      const day = now.getDay(); // 0 is Sunday
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(now.setDate(diff));
      const sunday = new Date(now.setDate(monday.getDate() + 6));
      start = monday.toISOString().slice(0, 10);
      end = sunday.toISOString().slice(0, 10);
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase Admin not initialized" },
        { status: 500 },
      );
    }

    // 1. Fetch Users
    const userSelects = [
      "id,name,avatar",
      "id,name,avatar_url",
      "id,name",
    ] as const;
    let users: any[] = [];
    let userErr: any = null;
    for (const sel of userSelects) {
      const res = await supabaseAdmin.from("users").select(sel).order("name");
      if (!res.error) {
        users = res.data || [];
        userErr = null;
        break;
      }
      userErr = res.error;
      if (isSchemaColumnError(res.error)) continue;
      break;
    }
    if (userErr) throw userErr;

    // 2. Fetch Time Entries for the period
    const entryRes = await firstOk(USER_ID_COLUMNS, (col) =>
      supabaseAdmin
        .from("time_entries")
        .select(`${col},date,hours`)
        .gte("date", start)
        .lte("date", end),
    );
    if ((entryRes as any).error) throw (entryRes as any).error;
    const entries = (entryRes as any).data || [];

    // 3. Aggregate Data
    const loadMap: Record<string, Record<string, number>> = {};

    // Initialize map for all users
    users?.forEach((u: any) => {
      loadMap[u.id] = {
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0,
      };
    });

    entries?.forEach((e: any) => {
      const uid = e.user_id ?? e.userId ?? e.userid ?? null;
      if (!uid || !loadMap[uid]) return; // Skip if user not found

      const date = new Date(e.date);
      const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const hours = Number(e.hours || 0);

      if (day === 1) loadMap[uid].mon += hours;
      else if (day === 2) loadMap[uid].tue += hours;
      else if (day === 3) loadMap[uid].wed += hours;
      else if (day === 4) loadMap[uid].thu += hours;
      else if (day === 5) loadMap[uid].fri += hours;
      else if (day === 6) loadMap[uid].sat += hours;
      else if (day === 0) loadMap[uid].sun += hours;
    });

    // 4. Format for Frontend
    const result =
      users?.map((u: any) => {
        const load = loadMap[u.id];
        return {
          id: u.id,
          name: u.name,
          avatar: u.avatar ?? u.avatar_url ?? null,
          mon: load.mon,
          tue: load.tue,
          wed: load.wed,
          thu: load.thu,
          fri: load.fri,
          total:
            load.mon +
            load.tue +
            load.wed +
            load.thu +
            load.fri +
            load.sat +
            load.sun,
        };
      }) || [];

    // Sort by total load descending
    result.sort((a: any, b: any) => b.total - a.total);

    return NextResponse.json({ data: result, start, end }, { status: 200 });
  } catch (error: any) {
    console.error("Team Load API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
