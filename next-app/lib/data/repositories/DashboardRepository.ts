// ============================================================
// DashboardRepository — server-side dashboard data access
// ============================================================
// Centralises every DB query that feeds the executive dashboard.
// All reads go through the Supabase service-role admin client so
// Row-Level Security is bypassed and callers get the full data set.
//
// Consumers (Next.js API route handlers):
//   • app/api/dashboard/kpi/route.ts
//   • app/api/dashboard/teamload/route.ts
//
// Add new dashboard queries here — keep route handlers thin.
// ============================================================

import { supabaseAdmin } from "../../../app/lib/supabaseAdmin";

// ----------------------------------------------------------
// Types
// ----------------------------------------------------------

export interface KpiData {
  /** Sum of all project budgets. */
  totalValue: number;
  /** Number of risks / issues that are not "closed". */
  activeIssues: number;
  /** Sum of all project `remaining` fields (billing forecast). */
  billingForecast: number;
  /** Average SPI across all projects (defaults to 1 when no projects). */
  avgSpi: number;
}

export interface TeamLoadRow {
  id: string;
  name: string;
  /** Total hours logged by this user across all timesheets. */
  hours: number;
}

export interface ProjectOverviewStats {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  planning: number;
  overdue: number;
}

export interface FinancialSummaryData {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  /** Percentage of total budget consumed (0–100). */
  budgetUtilization: number;
}

// ----------------------------------------------------------
// Internal helper
// ----------------------------------------------------------

function getDb() {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase admin client is not initialised. " +
        "Check that SUPABASE_SERVICE_ROLE_KEY is set.",
    );
  }
  return supabaseAdmin;
}

// ----------------------------------------------------------
// DashboardRepository
// ----------------------------------------------------------

export class DashboardRepository {
  // --------------------------------------------------------
  // KPI
  // --------------------------------------------------------

  /**
   * Top-level KPI aggregates for the executive dashboard.
   *
   * Queries:
   *  • `projects`  — budget, remaining, spi
   *  • `risks`     — id, status
   */
  async getKpi(): Promise<KpiData> {
    const db = getDb();

    const [projRes, riskRes] = await Promise.all([
      db.from("projects").select("budget,remaining,spi"),
      db.from("risks").select("id,status"),
    ]);

    if (projRes.error) {
      console.error("[DashboardRepository.getKpi] projects:", projRes.error.message);
    }
    if (riskRes.error) {
      console.error("[DashboardRepository.getKpi] risks:", riskRes.error.message);
    }

    const projects = projRes.data ?? [];
    const risks = riskRes.data ?? [];

    const totalValue = projects.reduce(
      (sum, p) => sum + Number((p as any).budget ?? 0),
      0,
    );
    const billingForecast = projects.reduce(
      (sum, p) => sum + Number((p as any).remaining ?? 0),
      0,
    );
    const activeIssues = risks.filter(
      (r) => String((r as any).status ?? "").toLowerCase() !== "closed",
    ).length;
    const avgSpi =
      projects.length > 0
        ? projects.reduce((sum, p) => sum + Number((p as any).spi ?? 1), 0) /
          projects.length
        : 1;

    return { totalValue, billingForecast, activeIssues, avgSpi };
  }

  // --------------------------------------------------------
  // Team Load
  // --------------------------------------------------------

  /**
   * Returns per-user total logged hours sorted descending.
   *
   * Queries:
   *  • `users`      — id, name
   *  • `timesheets` — user_id, hours
   */
  async getTeamLoad(): Promise<TeamLoadRow[]> {
    const db = getDb();

    const [usersRes, timesheetsRes] = await Promise.all([
      db.from("users").select("id,name").eq("is_active", true),
      db.from("timesheets").select("user_id,hours"),
    ]);

    if (usersRes.error) {
      console.error(
        "[DashboardRepository.getTeamLoad] users:",
        usersRes.error.message,
      );
    }
    if (timesheetsRes.error) {
      console.error(
        "[DashboardRepository.getTeamLoad] timesheets:",
        timesheetsRes.error.message,
      );
    }

    // Aggregate hours per user_id
    const hoursMap: Record<string, number> = {};
    for (const row of timesheetsRes.data ?? []) {
      const uid = (row as any).user_id as string | undefined;
      if (!uid) continue;
      hoursMap[uid] = (hoursMap[uid] ?? 0) + Number((row as any).hours ?? 0);
    }

    return (usersRes.data ?? [])
      .map((u) => ({
        id: (u as any).id as string,
        name: (u as any).name as string,
        hours: hoursMap[(u as any).id] ?? 0,
      }))
      .sort((a, b) => b.hours - a.hours);
  }

  // --------------------------------------------------------
  // Projects overview
  // --------------------------------------------------------

  /**
   * High-level counts per status bucket (used in dashboard cards).
   */
  async getProjectsOverview(): Promise<ProjectOverviewStats> {
    const db = getDb();

    const { data, error } = await db
      .from("projects")
      .select("status,end_date")
      .eq("is_archived", false);

    if (error) {
      console.error(
        "[DashboardRepository.getProjectsOverview]:",
        error.message,
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    let total = 0;
    let active = 0;
    let completed = 0;
    let onHold = 0;
    let planning = 0;
    let overdue = 0;

    for (const row of data ?? []) {
      total++;
      const status = String((row as any).status ?? "").toLowerCase();

      if (status === "completed" || status === "done") {
        completed++;
      } else if (status === "in_progress" || status === "active") {
        active++;
      } else if (status === "on_hold") {
        onHold++;
      } else if (status === "planning" || status === "todo") {
        planning++;
      }

      // Mark overdue when past end date and not finished
      const endDate = (row as any).end_date as string | null;
      if (
        endDate &&
        endDate < today &&
        status !== "completed" &&
        status !== "done"
      ) {
        overdue++;
      }
    }

    return { total, active, completed, onHold, planning, overdue };
  }

  // --------------------------------------------------------
  // Financial summary
  // --------------------------------------------------------

  /**
   * Aggregate budget / spent across all non-archived projects.
   */
  async getFinancialSummary(): Promise<FinancialSummaryData> {
    const db = getDb();

    const { data, error } = await db
      .from("projects")
      .select("budget,spent,remaining")
      .eq("is_archived", false);

    if (error) {
      console.error(
        "[DashboardRepository.getFinancialSummary]:",
        error.message,
      );
    }

    let totalBudget = 0;
    let totalSpent = 0;
    let totalRemaining = 0;

    for (const row of data ?? []) {
      totalBudget += Number((row as any).budget ?? 0);
      totalSpent += Number((row as any).spent ?? 0);
      totalRemaining += Number((row as any).remaining ?? 0);
    }

    const budgetUtilization =
      totalBudget > 0
        ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
        : 0;

    return { totalBudget, totalSpent, totalRemaining, budgetUtilization };
  }
}

// ----------------------------------------------------------
// Singleton — import this in route handlers
// ----------------------------------------------------------
export const dashboardRepository = new DashboardRepository();
