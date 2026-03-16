import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdminClient";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /api/dashboard/overview
 *
 * Returns real KPI counts for the home portal dashboard:
 *   - activeProjects   : projects where status is active / in_progress / planning / todo
 *   - tasksDueToday    : tasks whose due_date = today and status != done/completed/cancelled
 *   - pendingApprovals : expenses with status = 'pending'  +  time_entries with status = 'pending'
 *   - budgetUtilization: (sum spent / sum budget) * 100 across all non-archived projects
 *   - totalBudget      : raw sum
 *   - totalSpent       : raw sum
 *   - totalRemaining   : raw sum
 *   - recentActivity   : last 5 activity_log rows with user name
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not initialised" },
        { status: 503, headers },
      );
    }

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    // ── Run all queries in parallel ───────────────────────────────────────────
    const [
      activeProjectsRes,
      tasksDueTodayRes,
      pendingExpensesRes,
      pendingTimeEntriesRes,
      financialsRes,
      recentActivityRes,
    ] = await Promise.all([
      // 1. Active projects (not completed, not archived)
      supabaseAdmin
        .from("projects")
        .select("id", { count: "exact", head: true })
        .not("status", "in", '("done","completed","cancelled")')
        .or("is_archived.is.null,is_archived.eq.false"),

      // 2. Tasks due today that are not finished
      supabaseAdmin
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("due_date", today)
        .not("status", "in", '("done","completed","cancelled")'),

      // 3. Expenses pending approval
      supabaseAdmin
        .from("expenses")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),

      // 4. Time entries pending approval
      supabaseAdmin
        .from("time_entries")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),

      // 5. Financial aggregates across non-archived projects
      supabaseAdmin
        .from("projects")
        .select("budget,spent,remaining")
        .or("is_archived.is.null,is_archived.eq.false"),

      // 6. Recent activity log (last 5 items)
      supabaseAdmin
        .from("activity_log")
        .select("id,action,description,createdAt,entityType,users(name)")
        .order("createdAt", { ascending: false })
        .limit(5),
    ]);

    // ── Log any query errors but do NOT fall back to fake data ───────────────
    if (activeProjectsRes.error)
      console.error("[overview] activeProjects:", activeProjectsRes.error.message);
    if (tasksDueTodayRes.error)
      console.error("[overview] tasksDueToday:", tasksDueTodayRes.error.message);
    if (pendingExpensesRes.error)
      console.error("[overview] pendingExpenses:", pendingExpensesRes.error.message);
    if (pendingTimeEntriesRes.error)
      console.error("[overview] pendingTimeEntries:", pendingTimeEntriesRes.error.message);
    if (financialsRes.error)
      console.error("[overview] financials:", financialsRes.error.message);
    if (recentActivityRes.error)
      console.error("[overview] recentActivity:", recentActivityRes.error.message);

    // ── Compute financial aggregates ─────────────────────────────────────────
    const financialRows = financialsRes.data ?? [];
    let totalBudget = 0;
    let totalSpent = 0;
    let totalRemaining = 0;

    for (const row of financialRows) {
      totalBudget += Number((row as any).budget ?? 0);
      totalSpent += Number((row as any).spent ?? 0);
      totalRemaining += Number((row as any).remaining ?? 0);
    }

    const budgetUtilization =
      totalBudget > 0
        ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
        : 0;

    // ── Pending approvals = expenses + time entries ───────────────────────────
    const pendingApprovals =
      (pendingExpensesRes.count ?? 0) + (pendingTimeEntriesRes.count ?? 0);

    // ── Shape recent activity ─────────────────────────────────────────────────
    const recentActivity = (recentActivityRes.data ?? []).map((row: any) => ({
      id: row.id,
      action: row.action,
      description: row.description,
      entityType: row.entityType,
      createdAt: row.createdAt,
      userName: row.users?.name ?? "System",
    }));

    return NextResponse.json(
      {
        activeProjects: activeProjectsRes.count ?? 0,
        tasksDueToday: tasksDueTodayRes.count ?? 0,
        pendingApprovals,
        budgetUtilization,
        totalBudget,
        totalSpent,
        totalRemaining,
        recentActivity,
      },
      { status: 200, headers },
    );
  } catch (err: any) {
    console.error("[GET /api/dashboard/overview] unexpected error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500, headers },
    );
  }
}
