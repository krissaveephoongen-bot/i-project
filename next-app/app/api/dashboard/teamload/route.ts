// ============================================================
// GET /api/dashboard/teamload
// ============================================================
// Returns per-user total logged hours, sorted descending.
//
// Previously used a raw pg Pool query against `users` + `timesheets`.
// Now delegates entirely to DashboardRepository which uses the
// Supabase admin client — keeping all DB access in the data layer.
// ============================================================

import { ok } from "../../_lib/db";
import { dashboardRepository } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await dashboardRepository.getTeamLoad();
    return ok(rows, 200);
  } catch (error) {
    console.error("[GET /api/dashboard/teamload]", error);
    // Return an empty array so the dashboard widget degrades gracefully
    return ok([], 200);
  }
}
