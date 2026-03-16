import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdminClient";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  // Add cache-busting headers
  const headers = new Headers({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  try {
    if (!supabaseAdmin)
      return NextResponse.json(
        {
          rows: [],
          cashflow: [],
          spiTrend: [],
          spiSnaps: [],
          vendorMetrics: {
            totalVendors: 0,
            activeContracts: 0,
            pendingPaymentsAmount: 0,
            topVendorName: "None",
            topVendorSpend: 0,
          },
          error: "admin client missing",
        },
        { status: 200, headers },
      );

    // Query real projects from DB — no fallback mock data allowed
    const { data: projectsData, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Projects query failed:", error.message);
      throw error;
    }

    const projects = projectsData || [];
    // Exclude internal / department-cost projects from portfolio
    const list: any[] = (projects || []).filter((p: any) => {
      const isInternal = p.is_internal === true;
      const cat = String(p.internal_category || p.category || "").toLowerCase();
      return !(isInternal || cat === "internal" || cat.includes("department"));
    });

    const managerIds = Array.from(
      new Set(list.map((p: any) => p.manager_id).filter(Boolean)),
    );
    const clientIds = Array.from(
      new Set(list.map((p: any) => p.client_id).filter(Boolean)),
    );
    const ids = list.map((p) => p.id);

    // Parallel fetch auxiliary data
    const [
      managersRes,
      clientsRes,
      milestonesRes,
      risksRes,
      snapsRes,
      vendorRes,
    ] = await Promise.all([
      // Managers
      managerIds.length
        ? supabaseAdmin.from("users").select("id,name").in("id", managerIds)
        : Promise.resolve({ data: [] }),
      // Clients
      clientIds.length
        ? supabaseAdmin.from("clients").select("id,name").in("id", clientIds)
        : Promise.resolve({ data: [] }),
      // Milestones
      (async () => {
        if (!ids.length) return { data: [] };
        const mRes1 = await supabaseAdmin
          .from("milestones")
          .select("*")
          .in("project_id", ids as any);
        if (!mRes1.error) return mRes1;

        // Fallback
        const msg = `${mRes1.error.message || ""}`;
        if (
          msg.includes("Could not find the") ||
          msg.includes("schema cache")
        ) {
          return await supabaseAdmin
            .from("milestones")
            .select("*")
            .in("projectId", ids as any);
        }
        throw mRes1.error;
      })(),
      // Risks
      (async () => {
        if (!ids.length) return { data: [] };
        const rRes1 = await supabaseAdmin
          .from("risks")
          .select("*")
          .in("project_id", ids as any);
        if (!rRes1.error) return rRes1;

        // Fallback
        const msg = `${rRes1.error.message || ""}`;
        if (
          msg.includes("Could not find the") ||
          msg.includes("schema cache")
        ) {
          return await supabaseAdmin
            .from("risks")
            .select("*")
            .in("projectId", ids as any);
        }
        throw rRes1.error;
      })(),
      // Snapshots
      (async () => {
        if (!ids.length) return { data: [] };
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const sinceStr = since.toISOString().slice(0, 10);
        return await supabaseAdmin
          .from("spi_cpi_daily_snapshot")
          .select("projectId,date,spi")
          .in("projectId", ids)
          .gte("date", sinceStr);
      })(),
      // Vendor Metrics
      (async () => {
        const [vCount, cCount, pPending, pPaid] = await Promise.all([
          supabaseAdmin
            .from("vendors")
            .select("*", { count: "exact", head: true }),
          supabaseAdmin
            .from("vendor_contracts")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabaseAdmin
            .from("vendor_payments")
            .select("amount")
            .eq("status", "pending"),
          supabaseAdmin
            .from("vendor_payments")
            .select("vendorId, amount")
            .eq("status", "paid"),
        ]);

        const pendingAmount = (pPending.data || []).reduce(
          (s: number, p: any) => s + Number(p.amount || 0),
          0,
        );

        // Top Vendor
        const vendorSpend: Record<string, number> = {};
        (pPaid.data || []).forEach((p: any) => {
          vendorSpend[p.vendorId] =
            (vendorSpend[p.vendorId] || 0) + Number(p.amount || 0);
        });
        let topVendorId = "";
        let maxSpend = 0;
        for (const [vid, amount] of Object.entries(vendorSpend)) {
          if (amount > maxSpend) {
            maxSpend = amount;
            topVendorId = vid;
          }
        }
        let topVendorName = "None";
        if (topVendorId) {
          const { data: v } = await supabaseAdmin
            .from("vendors")
            .select("name")
            .eq("id", topVendorId)
            .single();
          if (v) topVendorName = v.name;
        }

        return {
          totalVendors: vCount.count || 0,
          activeContracts: cCount.count || 0,
          pendingPaymentsAmount: pendingAmount,
          topVendorName,
          topVendorSpend: maxSpend,
        };
      })(),
    ]);

    const managers = managersRes.data || [];
    const clients = clientsRes.data || [];
    const milestones = milestonesRes.data || [];
    const risks = risksRes.data || [];
    const snaps = snapsRes.data || [];
    const vendorMetrics = vendorRes;

    const managersMap: Record<string, any> = {};
    const clientsMap: Record<string, any> = {};
    for (const m of managers) managersMap[m.id] = m;
    for (const c of clients) clientsMap[c.id] = c;

    const budgetByProject: Record<string, number> = {};
    for (const p of list) budgetByProject[p.id] = Number(p.budget || 0);

    // Pre-process milestones for all projects
    const milestonesByProject: Record<string, any[]> = {};
    const overdueCounts: Record<string, number> = {};
    const committedByProject: Record<string, number> = {};

    const today = new Date().toISOString().slice(0, 10);

    for (const m of milestones) {
      const pid = m.project_id ?? m.projectId;
      if (!milestonesByProject[pid]) milestonesByProject[pid] = [];
      milestonesByProject[pid].push(m);

      // Overdue check
      const d = m.due_date ?? m.dueDate;
      const st = String(m.status || "").toLowerCase();
      if (d && d < today && st !== "paid" && st !== "completed") {
        overdueCounts[pid] = (overdueCounts[pid] || 0) + 1;
      }

      // Committed check (approved status)
      if (st === "approved") {
        const budget = budgetByProject[pid] || 0;
        const pct = Number(m.percentage ?? m.progress ?? 0);
        const amt = (pct / 100) * budget;
        committedByProject[pid] = (committedByProject[pid] || 0) + amt;
      }
    }

    const linesByProject: Record<string, any[]> = {};
    for (const m of milestones) {
      const pid = m.project_id ?? m.projectId;
      const budget = budgetByProject[pid] || 0;
      const pct = Number(m.percentage ?? m.progress ?? 0);
      const amount = (pct / 100) * budget;
      const date = m.due_date ?? m.dueDate ?? null;
      const status = String(m.status || "").toLowerCase();
      const type =
        status === "paid" ? "paid" : status === "approved" ? "committed" : null;
      if (!type) continue;
      linesByProject[pid] = linesByProject[pid] || [];
      linesByProject[pid].push({ amount, date, type });
    }
    const monthly: Record<string, { committed: number; paid: number }> = {};
    for (const pid of Object.keys(linesByProject)) {
      for (const l of linesByProject[pid]) {
        const d = (l.date || "").slice(0, 7);
        if (!d) continue;
        monthly[d] = monthly[d] || { committed: 0, paid: 0 };
        if (l.type === "committed")
          monthly[d].committed += Number(l.amount || 0);
        if (l.type === "paid") monthly[d].paid += Number(l.amount || 0);
      }
    }
    const cashflow = Object.keys(monthly)
      .sort()
      .map((m) => ({
        month: m,
        committed: monthly[m].committed,
        paid: monthly[m].paid,
      }));

    const spiByDate: Record<string, { sum: number; count: number }> = {};
    for (const s of snaps) {
      const d = s.date;
      spiByDate[d] = spiByDate[d] || { sum: 0, count: 0 };
      spiByDate[d].sum += Number(s.spi || 1);
      spiByDate[d].count += 1;
    }
    const spiTrend = Object.keys(spiByDate)
      .sort()
      .map((d) => ({
        date: d,
        spi: spiByDate[d].count ? spiByDate[d].sum / spiByDate[d].count : 1,
      }));

    // Risk Aggregation
    const risksByProject: Record<
      string,
      { high: number; medium: number; low: number }
    > = {};
    for (const r of risks) {
      const pid = r.projectId ?? r.project_id;
      if (!risksByProject[pid])
        risksByProject[pid] = { high: 0, medium: 0, low: 0 };
      const sev = (r.severity || "").toLowerCase();
      if (sev === "high") risksByProject[pid].high++;
      else if (sev === "medium") risksByProject[pid].medium++;
      else if (sev === "low") risksByProject[pid].low++;
    }

    const rows = list.map((p: any) => {
      const budget = Number(p.budget || 0);
      const progress = Number(p.progress || 0);
      const actual = Number(p.spent || 0);
      const committed = committedByProject[p.id] || 0;
      const ev = budget * (progress / 100);

      // Better CPI calculation for projects with zero budget
      let cpi = 0;
      if (budget > 0) {
        cpi = actual > 0 ? ev / actual : progress > 0 ? 1 : 0;
      } else if (progress > 0) {
        // For projects with no budget, use progress as a proxy
        cpi = 1;
      }

      const riskCounts = risksByProject[p.id] || { high: 0, medium: 0, low: 0 };

      return {
        id: p.id,
        name: p.name,
        status: p.status || "Active",
        progress,
        spi: Number(p.spi ?? 1),
        cpi,
        weeklyDelta: 0,
        budget,
        committed,
        actual,
        remaining: Math.max(budget - actual - committed, 0),
        risks: riskCounts,
        overdueMilestones: overdueCounts[p.id] || 0,
        managerName: managersMap[p.manager_id]?.name || "Unassigned",
        clientName: clientsMap[p.client_id]?.name || "No Client",
      };
    });

    return NextResponse.json(
      { rows, cashflow, spiTrend, spiSnaps: snaps, vendorMetrics },
      { status: 200, headers },
    );
  } catch (e: any) {
    console.error("Dashboard API Error:", e);
    return NextResponse.json(
      {
        rows: [],
        cashflow: [],
        spiTrend: [],
        spiSnaps: [],
        vendorMetrics: {
          totalVendors: 0,
          activeContracts: 0,
          pendingPaymentsAmount: 0,
          topVendorName: "None",
          topVendorSpend: 0,
        },
        error: e?.message || "error",
      },
      { status: 200, headers },
    );
  }
}
