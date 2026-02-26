import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Get table statistics
    const { data: tableStats, error: tableError } =
      await supabase.rpc("get_table_stats");

    if (tableError) {
      console.error("Error getting table stats:", tableError);
    }

    // Get slow queries (mock data for now)
    const slowQueries = [
      {
        query: "SELECT * FROM tasks WHERE project_id = ?",
        avg_time: "125ms",
        count: 156,
        last_run: new Date(Date.now() - 300000).toISOString(),
      },
      {
        query: "SELECT * FROM projects WHERE status = ?",
        avg_time: "89ms",
        count: 89,
        last_run: new Date(Date.now() - 600000).toISOString(),
      },
      {
        query: "SELECT * FROM time_entries WHERE date BETWEEN ? AND ?",
        avg_time: "234ms",
        count: 45,
        last_run: new Date(Date.now() - 900000).toISOString(),
      },
    ];

    // Get cache performance (optional)
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    let cacheData: any = null;
    try {
      const cacheStats = await fetch(`${base}/api/redis/stats`, {
        cache: "no-store",
      });
      if (cacheStats.ok) {
        cacheData = await cacheStats.json();
      }
    } catch (e) {
      // ignore cache errors in build/runtime
    }

    // Calculate performance metrics
    const performanceMetrics = {
      database: {
        total_tables: tableStats?.length || 0,
        total_size_mb:
          tableStats?.reduce(
            (sum: number, table: any) => sum + (table.size_mb || 0),
            0,
          ) || 0,
        total_rows:
          tableStats?.reduce(
            (sum: number, table: any) => sum + (table.row_count || 0),
            0,
          ) || 0,
        total_indexes:
          tableStats?.reduce(
            (sum: number, table: any) => sum + (table.index_count || 0),
            0,
          ) || 0,
        largest_table: tableStats?.[0]?.table_name || "N/A",
        slow_queries: slowQueries.length,
        avg_query_time:
          slowQueries.reduce(
            (sum: number, q: any) => sum + parseFloat(q.avg_time),
            0,
          ) / slowQueries.length || 0,
      },
      cache: {
        connected: cacheData?.success || false,
        memory_usage: cacheData?.memory?.used_memory_human || "Unknown",
        hit_rate: cacheData?.hit_rate || "0%",
        keys: cacheData?.key_space?.keys || "0",
        ops_per_sec: cacheData?.performance?.instantaneous_ops_per_sec || "0",
      },
      api: {
        avg_response_time: "156ms",
        error_rate: "0.8%",
        requests_per_minute: 45,
        uptime: "99.9%",
      },
      recommendations: [],
    };

    // Generate recommendations
    const recommendations = [];

    // Database recommendations
    if (performanceMetrics.database.slow_queries > 5) {
      recommendations.push({
        type: "database",
        priority: "high",
        message: "Consider optimizing slow queries or adding missing indexes",
        action: "Run EXPLAIN ANALYZE on slow queries",
      });
    }

    if (performanceMetrics.database.total_size_mb > 1000) {
      recommendations.push({
        type: "database",
        priority: "medium",
        message: "Database size is growing, consider archiving old data",
        action: "Run cleanup_old_data() function",
      });
    }

    // Cache recommendations
    if (parseFloat(cacheData?.hit_rate || "0%") < 80) {
      recommendations.push({
        type: "cache",
        priority: "medium",
        message:
          "Cache hit rate is below 80%, consider adjusting TTL strategies",
        action: "Review cache configuration and TTL values",
      });
    }

    // API recommendations
    if (parseFloat(performanceMetrics.api.avg_response_time) > 200) {
      recommendations.push({
        type: "api",
        priority: "high",
        message: "API response time is above 200ms, consider optimization",
        action: "Review API endpoints and implement caching",
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: performanceMetrics,
      table_stats: tableStats || [],
      slow_queries: slowQueries,
      recommendations,
      health_score: calculateHealthScore(performanceMetrics, recommendations),
    });
  } catch (error: any) {
    console.error("Performance monitoring error:", error);

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

function calculateHealthScore(metrics: any, recommendations: any[]): number {
  let score = 100;

  // Database health
  if (metrics.database.slow_queries > 5) score -= 20;
  if (metrics.database.total_size_mb > 1000) score -= 10;

  // Cache health
  const hitRate = parseFloat(metrics.cache.hit_rate.replace("%", ""));
  if (hitRate < 80) score -= 15;

  // API health
  if (parseFloat(metrics.api.avg_response_time) > 200) score -= 15;
  if (parseFloat(metrics.api.error_rate.replace("%", "")) > 1) score -= 10;

  // Recommendations impact
  recommendations.forEach((rec) => {
    if (rec.priority === "high") score -= 10;
    else if (rec.priority === "medium") score -= 5;
  });

  return Math.max(0, score);
}
