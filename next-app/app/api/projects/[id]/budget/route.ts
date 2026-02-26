import { ok, err } from "../../../_lib/db";
import { supabase } from "@/app/lib/supabaseClient";
import {
  firstOk,
  PROJECT_ID_COLUMNS,
  USER_ID_COLUMNS,
  isSchemaColumnError,
} from "../../../_lib/supabaseCompat";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    if (!projectId) return err("projectId required", 400);

    const pRes = await supabase
      .from("projects")
      .select("id,name,budget,spent")
      .eq("id", projectId)
      .limit(1)
      .single();
    const proj = pRes.data || { budget: 0, spent: 0 };
    const budget = Number((proj as any).budget || 0);
    const spent = Number((proj as any).spent || 0);

    const msRes = await firstOk(PROJECT_ID_COLUMNS, (col) =>
      supabase
        .from("milestones")
        .select("id,name,title,amount,percentage,due_date,dueDate,status")
        .eq(col, projectId),
    );
    const milestones = ((msRes as any)?.data || [])
      .map((m: any) => ({
        id: m.id,
        name: m.name ?? m.title ?? "",
        amount: Number(m.amount || 0),
        percentage: Number(m.percentage || 0),
        dueDate: m.due_date ?? m.dueDate ?? null,
        status: m.status || "Pending",
      }))
      .sort((a: any, b: any) =>
        String(a.dueDate || "").localeCompare(String(b.dueDate || "")),
      );
    const paidAmount = milestones
      .filter((m) => String(m.status).toLowerCase() === "paid")
      .reduce((s, m) => s + Number(m.amount || 0), 0);
    const approvedAmount = milestones
      .filter((m) => String(m.status).toLowerCase() === "approved")
      .reduce((s, m) => s + Number(m.amount || 0), 0);
    const pendingAmount = Math.max(0, budget - paidAmount);

    const teRes = await firstOk(PROJECT_ID_COLUMNS, (col) =>
      supabase
        .from("time_entries")
        .select("date,hours,user_id,userId,userid")
        .eq(col, projectId),
    );
    const entries = ((teRes as any)?.data || []).map((r: any) => ({
      day: r.date,
      hours: Number(r.hours || 0),
      userId: r.user_id ?? r.userId ?? r.userid ?? null,
    }));

    const userIds = Array.from(
      new Set(entries.map((e: any) => e.userId).filter(Boolean)),
    );
    let rateMap: Record<string, number> = {};
    if (userIds.length) {
      const candidates = ["id,hourly_rate", "id,hourlyRate", "id"] as const;
      let uRows: any[] = [];
      let lastErr: any = null;
      for (const sel of candidates) {
        const r = await supabase
          .from("users")
          .select(sel)
          .in("id", userIds as any);
        if (!r.error) {
          uRows = r.data || [];
          lastErr = null;
          break;
        }
        lastErr = r.error;
        if (isSchemaColumnError(r.error)) continue;
        break;
      }
      if (lastErr && !isSchemaColumnError(lastErr))
        return err(lastErr.message, 500);
      for (const u of uRows) {
        rateMap[String(u.id)] = Number(u.hourly_rate ?? u.hourlyRate ?? 0) || 0;
      }
    }
    const monthlyMap: Record<string, { revenue: number; cost: number }> = {};
    for (const m of milestones) {
      if (!m.dueDate) continue;
      const d = new Date(m.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = monthlyMap[key] || { revenue: 0, cost: 0 };
      monthlyMap[key].revenue += Number(m.amount || 0);
    }
    for (const r of entries) {
      const d = new Date(r.day);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = monthlyMap[key] || { revenue: 0, cost: 0 };
      const rate = rateMap[String(r.userId)] || 0;
      monthlyMap[key].cost += Number(r.hours || 0) * rate;
    }
    const monthly = Object.entries(monthlyMap)
      .map(([k, v]) => ({
        month: k,
        revenue: v.revenue.toFixed(2),
        cost: v.cost.toFixed(2),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const summary = {
      approvedBudget: budget,
      actualCost:
        spent > 0 ? spent : monthly.reduce((s, x) => s + Number(x.cost), 0),
      committedCost: milestones.reduce((s, x) => s + Number(x.amount || 0), 0),
      remainingBudget: Math.max(
        0,
        budget -
          (spent > 0 ? spent : monthly.reduce((s, x) => s + Number(x.cost), 0)),
      ),
      paidAmount,
      approvedAmount,
      pendingAmount,
      totalBudget: budget,
    };

    return ok({ summary, monthly, milestones }, 200);
  } catch (e: any) {
    return err(e?.message || "error", 500);
  }
}
