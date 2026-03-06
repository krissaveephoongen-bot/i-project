"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getProjectOverview(projectId: string) {
  const supabase = createClient(cookies());

  // 1. Project Details
  let { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  // Fallback: Admin Client if project not found (RLS)
  if (!project) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
          if (profile && ["admin", "manager"].includes(profile.role)) {
              const adminSupabase = createAdminClient();
              const { data: adminProject } = await adminSupabase
                .from("projects")
                .select("*")
                .eq("id", projectId)
                .single();
              if (adminProject) {
                  project = adminProject;
              }
          }
      }
  }

  if (!project) return null;

  // Use the same client strategy for related data
  // If we fell back to admin for project, we should use admin for relations too
  // Or simply use admin for relations if user is admin, to be safe.
  // But let's stick to standard flow: try user, fallback if needed.
  // Actually, for simplicity in this specific detailed view, if the user couldn't see the project initially,
  // they definitely need admin rights to see its details.
  
  // So if we used fallback, let's switch client for subsequent calls.
  let clientToUse = supabase;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) { // Re-check role to be sure for relations
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
      if (profile && ["admin", "manager"].includes(profile.role)) {
          // If admin, just use admin client to ensure we see EVERYTHING (tasks, risks, etc.)
          // This avoids partial data issues where user sees project but not tasks due to complex RLS.
          clientToUse = createAdminClient();
      }
  }

  // 2. Tasks
  const { data: tasks } = await clientToUse
    .from("tasks")
    .select("*")
    .eq("project_id", projectId);

  // 3. Milestones
  const { data: milestones } = await clientToUse
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true });

  // 4. Risks
  const { data: risks } = await clientToUse
    .from("risks")
    .select("*")
    .eq("project_id", projectId)
    .order("severity", { ascending: false });

  // 5. Team
  const { data: contacts } = await clientToUse
    .from("contacts")
    .select("*")
    .eq("project_id", projectId);

  // 6. Expenses
  const { data: expenses } = await clientToUse
    .from("expenses")
    .select("amount, status")
    .eq("project_id", projectId);

  // Calculations
  const totalTasks = tasks?.length || 0;
  
  // Progress (Simple Average or Weighted)
  let totalWeight = 0;
  let earnedValue = 0;
  let plannedValue = 0;

  tasks?.forEach((t: any) => {
    const w = t.weight || 1;
    totalWeight += w;
    earnedValue += w * (t.progress_actual || 0);
    plannedValue += w * (t.progress_plan || 0);
  });

  const progressActual = totalWeight > 0 ? (earnedValue / totalWeight) : 0;
  const progressPlan = totalWeight > 0 ? (plannedValue / totalWeight) : 0;

  // Budget
  const budget = project.budget || 0;
  const actualCost = expenses?.filter((e: any) => e.status === "approved" || e.status === "paid").reduce((sum: any, e: any) => sum + (e.amount || 0), 0) || 0;
  const committedCost = expenses?.filter((e: any) => e.status === "pending").reduce((sum: any, e: any) => sum + (e.amount || 0), 0) || 0;
  const remainingBudget = budget - actualCost;

  return {
    project: {
      ...project,
      progress: progressActual, // Calculated live
      progressPlan: progressPlan,
    },
    tasks: tasks || [],
    milestones: (milestones || []).map((m: any) => ({
      ...m,
      dueDate: m.due_date,
      actualDate: m.actual_date,
    })),
    risks: risks || [],
    team: (contacts || []).map((c: any) => ({
      ...c,
      role: c.position,
    })),
    summary: {
      totalBudget: budget,
      actualCost,
      committedCost,
      remainingBudget,
    }
  };
}
