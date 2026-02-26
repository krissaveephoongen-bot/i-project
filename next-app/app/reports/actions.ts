"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// ============================================================================
// EXECUTIVE REPORT
// ============================================================================

export async function getExecutiveReportAction() {
  const supabase = createClient(cookies());

  // 1. Projects Summary
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, riskLevel, spi, progress, progressPlan, budget, spent")
    .neq("status", "Cancelled")
    .neq("isArchived", true);

  const allProjects = projects || [];
  const totalProjects = allProjects.length;
  
  // Calculate Avg SPI
  const spiSum = allProjects.reduce((sum, p) => sum + (Number(p.spi) || 1), 0);
  const avgSpi = totalProjects > 0 ? spiSum / totalProjects : 1;

  // High Risk Projects
  const highRiskProjects = allProjects
    .filter((p) => (p.riskLevel || "").toLowerCase() === "high")
    .map((p) => ({
      id: p.id,
      name: p.name,
      highRiskCount: 1, // Mock count or fetch from risks table if needed
    }));

  // Overdue Milestones (Mock logic or join)
  // Let's count pending milestones with due_date < now
  const { count: overdueMilestones } = await supabase
    .from("milestones")
    .select("id", { count: "exact", head: true })
    .eq("status", "Pending")
    .lt("dueDate", new Date().toISOString());

  // Watchlist (Low SPI)
  const watchlist = allProjects
    .filter((p) => (Number(p.spi) || 1) < 0.9)
    .sort((a, b) => (Number(a.spi) || 1) - (Number(b.spi) || 1))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      spi: Number(p.spi) || 1,
    }));

  return {
    summary: {
      totalProjects,
      avgSpi,
      overdueMilestones: overdueMilestones || 0,
      highRiskProjects,
    },
    watchlist,
  };
}

export async function getWeeklyProjectSummaryAction() {
  const supabase = createClient(cookies());
  
  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, spi, progress, progressPlan")
    .neq("status", "Cancelled")
    .neq("isArchived", true)
    .order("name");

  // In a real app, we'd fetch previous week's progress from a history table/snapshot
  // For now, we calculate delta as random or 0
  
  const summary = (projects || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    progressActual: p.progress || 0,
    progressPlan: p.progressPlan || 0,
    spi: p.spi || 1,
    weeklyDelta: 0, // Placeholder
  }));

  return { summary };
}

// ============================================================================
// PROJECTS REPORT
// ============================================================================

export async function getProjectsReportAction(includeInternal: boolean = false) {
  const supabase = createClient(cookies());

  let query = supabase
    .from("projects")
    .select("*")
    .neq("status", "Cancelled")
    .neq("isArchived", true);

  if (!includeInternal) {
    // Assuming 'Internal' category exists or filter by some logic
    // query = query.neq("category", "Internal");
  }

  const { data: projects } = await query.order("name");
  const all = projects || [];

  // KPIs
  const totalProjects = all.length;
  const avgProgress = totalProjects > 0 
    ? Math.round(all.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects) 
    : 0;
  
  const onTime = all.filter(p => (p.progress || 0) >= (p.progressPlan || 0)).length;
  const overBudget = all.filter(p => (p.spent || 0) > (p.budget || 0)).length;

  return {
    projects: all.map(p => ({
      ...p,
      progress: p.progress || 0,
      progressPlan: p.progressPlan || 0,
      budget: p.budget || 0,
      spent: p.spent || 0,
    })),
    kpis: {
      totalProjects,
      avgProgress,
      onTime,
      overBudget,
    }
  };
}

// ============================================================================
// FINANCIAL REPORT
// ============================================================================

export async function getFinancialReportAction() {
  const supabase = createClient(cookies());

  // 1. Projects Financials
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, budget, spent, status")
    .neq("isArchived", true);

  const all = projects || [];
  const totalBudget = all.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const totalSpent = all.reduce((sum, p) => sum + (Number(p.spent) || 0), 0);
  const remaining = totalBudget - totalSpent;

  // 2. Monthly Trends (Mock or aggregate from expenses)
  // We can query expenses grouped by month
  // For now, let's return a simple structure
  const trends = [
    { month: "Jan", revenue: 100000, cost: 80000 },
    { month: "Feb", revenue: 120000, cost: 90000 },
    { month: "Mar", revenue: 110000, cost: 85000 },
  ];

  return {
    summary: {
      totalBudget,
      totalSpent,
      remaining,
      profitMargin: totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget) * 100 : 0,
    },
    projects: all.map(p => ({
      id: p.id,
      name: p.name,
      budget: Number(p.budget) || 0,
      spent: Number(p.spent) || 0,
      variance: (Number(p.budget) || 0) - (Number(p.spent) || 0),
    })),
    trends,
  };
}

// ============================================================================
// RESOURCES REPORT
// ============================================================================

export async function getResourcesReportAction() {
  const supabase = createClient(cookies());

  // 1. Users & Tasks
  const { data: users } = await supabase
    .from("users")
    .select("id, name, role, department")
    .eq("is_active", true);

  // Calculate workload from active tasks
  // This is expensive, so we might want to use a view or optimized query
  // For now, simplified
  
  const resourceData = (users || []).map(u => ({
    id: u.id,
    name: u.name,
    role: u.role,
    department: u.department,
    allocation: Math.floor(Math.random() * 100), // Mock allocation %
    activeTasks: Math.floor(Math.random() * 5), // Mock count
  }));

  return {
    resources: resourceData,
    utilization: {
      avg: 75,
      overloaded: resourceData.filter(r => r.allocation > 100).length,
      underutilized: resourceData.filter(r => r.allocation < 50).length,
    }
  };
}

// ============================================================================
// INSIGHTS REPORT
// ============================================================================

export async function getInsightsReportAction(year?: number, month?: number, focus?: string, mode?: string) {
  // Return hierarchical data for Sunburst chart
  // Mock data for demonstration
  return {
    root: {
      name: "Total Work Hours",
      children: [
        {
          name: "Project Alpha",
          size: 450,
          children: [
            { name: "Development", size: 250 },
            { name: "Design", size: 100 },
            { name: "Testing", size: 100 }
          ]
        },
        {
          name: "Project Beta",
          size: 300,
          children: [
            { name: "Development", size: 150 },
            { name: "Marketing", size: 150 }
          ]
        },
        {
          name: "Internal",
          size: 120,
          children: [
            { name: "Meeting", size: 60 },
            { name: "Training", size: 60 }
          ]
        }
      ]
    }
  };
}
