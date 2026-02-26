"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getProjectOverview(projectId: string) {
  const supabase = createClient(cookies());

  // 1. Project Details
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) return null;

  // 2. Tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId);

  // 3. Milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true });

  // 4. Risks
  const { data: risks } = await supabase
    .from("risks")
    .select("*")
    .eq("project_id", projectId)
    .order("severity", { ascending: false }); // Show High first

  // 5. Team (Contacts + Internal Users if linked)
  // Fetch contacts for now
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("project_id", projectId);

  // 6. Expenses (for budget summary)
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, status")
    .eq("project_id", projectId);

  // Calculations
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === "completed").length || 0;
  
  // Progress (Simple Average or Weighted)
  // Let's use weighted if weight exists, else count
  let totalWeight = 0;
  let earnedValue = 0;
  let plannedValue = 0;

  tasks?.forEach(t => {
    const w = t.weight || 1;
    totalWeight += w;
    earnedValue += w * (t.progress_actual || 0);
    plannedValue += w * (t.progress_plan || 0);
  });

  const progressActual = totalWeight > 0 ? (earnedValue / totalWeight) : 0;
  const progressPlan = totalWeight > 0 ? (plannedValue / totalWeight) : 0;

  // Budget
  const budget = project.budget || 0;
  const actualCost = expenses?.filter(e => e.status === "approved" || e.status === "paid").reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const committedCost = expenses?.filter(e => e.status === "pending").reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const remainingBudget = budget - actualCost;

  return {
    project: {
      ...project,
      progress: progressActual, // Calculated live
      progressPlan: progressPlan,
    },
    tasks: tasks || [],
    milestones: (milestones || []).map(m => ({
      ...m,
      dueDate: m.due_date,
      actualDate: m.actual_date,
    })),
    risks: risks || [],
    team: (contacts || []).map(c => ({
      ...c,
      role: c.position, // Map position to role for UI
    })),
    summary: {
      totalBudget: budget,
      actualCost,
      committedCost,
      remainingBudget,
    }
  };
}
