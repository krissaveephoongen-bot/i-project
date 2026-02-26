import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST() {
  try {
    const startTime = Date.now();
    const results = {
      audit_logs: 0,
      notifications: 0,
      time_entries: 0,
      project_progress_snapshots: 0,
      spi_cpi_daily_snapshot: 0,
      total_deleted: 0,
      duration_ms: 0,
    };

    // Clean up audit logs older than 1 year
    const { data: auditResult, error: auditError } = await supabase
      .from("audit_logs")
      .delete()
      .lt(
        "created_at",
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (!auditError) {
      results.audit_logs = auditResult?.length || 0;
      results.total_deleted += results.audit_logs;
    }

    // Clean up old notifications (read and older than 30 days)
    const { data: notifResult, error: notifError } = await supabase
      .from("notifications")
      .delete()
      .eq("read", true)
      .lt(
        "created_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (!notifError) {
      results.notifications = notifResult?.length || 0;
      results.total_deleted += results.notifications;
    }

    // Clean up old time entries (older than 2 years)
    const { data: timeResult, error: timeError } = await supabase
      .from("time_entries")
      .delete()
      .lt(
        "date",
        new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (!timeError) {
      results.time_entries = timeResult?.length || 0;
      results.total_deleted += results.time_entries;
    }

    // Clean up old project progress snapshots (older than 1 year)
    const { data: progressResult, error: progressError } = await supabase
      .from("project_progress_snapshots")
      .delete()
      .lt(
        "date",
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (!progressError) {
      results.project_progress_snapshots = progressResult?.length || 0;
      results.total_deleted += results.project_progress_snapshots;
    }

    // Clean up old SPI/CPI snapshots (older than 6 months)
    const { data: spiResult, error: spiError } = await supabase
      .from("spi_cpi_daily_snapshot")
      .delete()
      .lt(
        "date",
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (!spiError) {
      results.spi_cpi_daily_snapshot = spiResult?.length || 0;
      results.total_deleted += results.spi_cpi_daily_snapshot;
    }

    results.duration_ms = Date.now() - startTime;

    // Refresh materialized views
    try {
      await supabase.rpc("refresh_project_summary");
    } catch (error) {
      console.error("Failed to refresh materialized view:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Database cleanup completed successfully",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Database cleanup error:", error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Get cleanup statistics
    const stats = await Promise.all([
      // Count audit logs older than 1 year
      supabase
        .from("audit_logs")
        .select("id", { count: "exact" })
        .lt(
          "created_at",
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        ),

      // Count old notifications
      supabase
        .from("notifications")
        .select("id", { count: "exact" })
        .eq("read", true)
        .lt(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        ),

      // Count old time entries
      supabase
        .from("time_entries")
        .select("id", { count: "exact" })
        .lt(
          "date",
          new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
        ),

      // Count old project progress snapshots
      supabase
        .from("project_progress_snapshots")
        .select("id", { count: "exact" })
        .lt(
          "date",
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        ),

      // Count old SPI/CPI snapshots
      supabase
        .from("spi_cpi_daily_snapshot")
        .select("id", { count: "exact" })
        .lt(
          "date",
          new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        ),
    ]);

    const cleanupStats = {
      audit_logs: stats[0].count || 0,
      notifications: stats[1].count || 0,
      time_entries: stats[2].count || 0,
      project_progress_snapshots: stats[3].count || 0,
      spi_cpi_daily_snapshot: stats[4].count || 0,
      total_deletable: stats.reduce((sum, stat) => sum + (stat.count || 0), 0),
    };

    return NextResponse.json({
      success: true,
      stats: cleanupStats,
      recommendations: [
        "Run cleanup to free up " +
          cleanupStats.total_deletable +
          " old records",
        "Consider setting up automatic cleanup schedule",
        "Monitor database size regularly",
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Cleanup stats error:", error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
