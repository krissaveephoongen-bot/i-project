import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [users, projects, logs] = await Promise.all([
      supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("projects").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("activity_log").select("*", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      usersCount: users.count || 0,
      projectsCount: projects.count || 0,
      logsCount: logs.count || 0,
      status: "online",
      version: "1.0.0",
      uptime: process.uptime(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, status: "offline" },
      { status: 500 }
    );
  }
}
