import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin)
      return NextResponse.json(
        { error: "admin client missing" },
        { status: 500 },
      );

    // 1. Fetch all projects
    const { data: projects, error: projError } = await supabaseAdmin
      .from("projects")
      .select("id, name, spi, budget, status, is_internal, internal_category");

    if (projError) throw projError;

    // Exclude internal/department projects from executive metrics
    const filtered = (projects || []).filter((p: any) => {
      const isInternal = p.is_internal === true;
      const cat = String(p.internal_category || "").toLowerCase();
      return !(isInternal || cat === "internal" || cat.includes("department"));
    });
    const ids = filtered.map((p: any) => p.id);

    // 2. Fetch High Risks
    let risks: any[] = [];
    if (ids.length) {
      const r1 = await supabaseAdmin
        .from("risks")
        .select("*")
        .in("project_id", ids as any);
      if (!r1.error) {
        risks = r1.data || [];
      } else {
        const msg = `${r1.error.message || ""}`;
        if (
          msg.includes("Could not find the") ||
          msg.includes("schema cache")
        ) {
          const r2 = await supabaseAdmin
            .from("risks")
            .select("*")
            .in("projectId", ids as any);
          risks = r2.data || [];
        } else {
          throw r1.error;
        }
      }
    }

    // 3. Fetch Overdue Milestones
    const today = new Date().toISOString().slice(0, 10);
    let milestones: any[] = [];
    if (ids.length) {
      const m1 = await supabaseAdmin
        .from("milestones")
        .select("*")
        .in("project_id", ids as any)
        .lt("due_date", today);
      if (!m1.error) {
        milestones = m1.data || [];
      } else {
        const msg = `${m1.error.message || ""}`;
        if (
          msg.includes("Could not find the") ||
          msg.includes("schema cache")
        ) {
          const m2 = await supabaseAdmin
            .from("milestones")
            .select("*")
            .in("projectId", ids as any)
            .lt("dueDate", today);
          milestones = m2.data || [];
        } else {
          throw m1.error;
        }
      }
    }

    // --- Calculations ---

    // A. High Risk Projects
    const riskCounts: Record<string, number> = {};
    (risks || []).forEach((r: any) => {
      if (
        (r.severity || "").toLowerCase() === "high" &&
        (r.status || "").toLowerCase() !== "closed"
      ) {
        const pid = r.project_id ?? r.projectId;
        if (pid) riskCounts[pid] = (riskCounts[pid] || 0) + 1;
      }
    });

    const highRiskProjects = filtered
      .filter((p: any) => riskCounts[p.id] > 0)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        highRiskCount: riskCounts[p.id],
      }));

    // B. Overdue Milestones Count (Global)
    const overdueCount = (milestones || []).filter((m: any) => {
      const st = (m.status || "").toLowerCase();
      return st !== "paid" && st !== "completed";
    }).length;

    // C. Avg SPI
    const totalSpi = filtered.reduce(
      (sum: number, p: any) => sum + Number(p.spi || 1),
      0,
    );
    const avgSpi = filtered.length ? totalSpi / filtered.length : 1;

    // D. Watchlist (Lowest SPI)
    const watchlist = [...filtered]
      .sort((a: any, b: any) => Number(a.spi || 1) - Number(b.spi || 1))
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        spi: Number(p.spi || 1),
      }));

    const report = {
      title: "Executive Project Report",
      date: today,
      summary: {
        totalProjects: filtered.length || 0,
        avgSpi: avgSpi.toFixed(2),
        highRiskProjects,
        overdueMilestones: overdueCount,
        // budgetTotals: ... (optional, if needed)
      },
      watchlist,
      // statusCounts: ...
    };

    return NextResponse.json(report, { status: 200 });
  } catch (e: any) {
    console.error("Executive Report Error:", e);
    return NextResponse.json(
      { error: e?.message || "executive report error" },
      { status: 500 },
    );
  }
}
