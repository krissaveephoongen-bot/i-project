"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getProjectBudgetSummary(projectId: string) {
  const supabase = createClient(cookies());

  // 1. Get Project Budget
  const { data: project } = await supabase
    .from("projects")
    .select("budget")
    .eq("id", projectId)
    .single();

  const approvedBudget = project?.budget || 0;

  // 2. Get Expenses (Actual Cost)
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, status, date")
    .eq("project_id", projectId);

  const actualCost = (expenses || [])
    .filter((e) => e.status === "approved" || e.status === "paid")
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const committedCost = (expenses || [])
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // 3. Get Milestones (Revenue / Invoicing)
  const { data: milestones } = await supabase
    .from("milestones")
    .select("amount, status, due_date")
    .eq("project_id", projectId);

  const totalContractValue = (milestones || []).reduce((sum, m) => sum + (m.amount || 0), 0);
  const paidAmount = (milestones || [])
    .filter((m) => m.status === "Paid")
    .reduce((sum, m) => sum + (m.amount || 0), 0);
  const pendingAmount = (milestones || [])
    .filter((m) => m.status === "Invoiced" || m.status === "Pending")
    .reduce((sum, m) => sum + (m.amount || 0), 0);

  // 4. Calculate Monthly Spend (Mock logic or aggregation)
  // For real implementation, group expenses by month
  const monthlyData: Record<string, { revenue: number; cost: number }> = {};
  
  (expenses || []).forEach(e => {
    if (!e.date) return;
    const month = e.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) monthlyData[month] = { revenue: 0, cost: 0 };
    if (e.status === "approved" || e.status === "paid") {
      monthlyData[month].cost += e.amount;
    }
  });

  // Convert to array and sort
  const monthly = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, val]) => ({
      month,
      revenue: val.revenue, // Revenue logic would come from milestones if they had dates
      cost: val.cost
    }))
    .slice(-6); // Last 6 months

  return {
    summary: {
      approvedBudget,
      actualCost,
      committedCost,
      remainingBudget: approvedBudget - actualCost,
      paidAmount,
      pendingAmount,
      totalBudget: totalContractValue,
    },
    monthly,
    milestones: (milestones || []).map((m: any) => ({
      ...m,
      dueDate: m.due_date, // Map snake_case
    })),
  };
}
