import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET(request: NextRequest) {
  try {
    // Get dashboard statistics
    const [usersResult, clientsResult] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("count", { count: "exact" })
        .eq("is_active", true)
        .eq("is_deleted", false),
      
      supabaseAdmin
        .from("clients")
        .select("count", { count: "exact" })
    ]);

    const userCount = usersResult.count || 0;
    const clientCount = clientsResult.count || 0;

    // Get recent activities
    const { data: recentUsers, error: recentUsersError } = await supabaseAdmin
      .from("users")
      .select("name, role, created_at")
      .eq("is_active", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          totalUsers: userCount,
          totalClients: clientCount,
          activeProjects: 0, // Will be updated when projects table is fixed
        },
        recentUsers: recentUsers || [],
        systemHealth: {
          database: "Connected",
          api: "Operational",
          lastUpdate: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
