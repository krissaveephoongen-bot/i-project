// ============================================================
// GET /api/dashboard/kpi
// ============================================================
// Thin route handler — all DB logic lives in DashboardRepository.
// ============================================================

import { dashboardRepository } from "../../../../lib/data";
import { ok } from "../../_lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const kpi = await dashboardRepository.getKpi();
    return ok(kpi, 200);
  } catch (error) {
    console.error("[GET /api/dashboard/kpi]", error);
    // Return safe defaults so the dashboard never hard-crashes
    return ok(
      { totalValue: 0, activeIssues: 0, billingForecast: 0, avgSpi: 1 },
      200,
    );
  }
}
