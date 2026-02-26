import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ExpensesClient from "./ExpensesClient";

export const metadata = {
  title: "Expenses | i-Project",
};

export default async function ExpensesPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8 text-center">Please log in to view expenses.</div>;
  }

  // 1. Fetch Expenses for current user
  const { data: expensesData, error: expError } = await supabase
    .from("expenses")
    .select(`
      id,
      user_id,
      project_id,
      task_id,
      date,
      amount,
      category,
      description,
      status,
      rejected_reason,
      receiptUrl,
      details,
      project:projects(name),
      task:tasks(title)
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (expError) {
    console.error("Error fetching expenses:", expError);
  }

  // 2. Fetch Projects (Active ones)
  // Ideally, filter by projects user is assigned to.
  // For simplicity, fetch all active projects for now, or join with team_members if schema exists.
  // The previous API used /api/timesheet/projects which filtered by status.
  const { data: projectsData, error: projError } = await supabase
    .from("projects")
    .select("id, name")
    .neq("status", "Completed")
    .neq("status", "Cancelled")
    .order("name");

  if (projError) {
    console.error("Error fetching projects:", projError);
  }

  // Transform data
  const expenses = (expensesData || []).map((e: any) => ({
    id: e.id,
    projectId: e.project_id,
    taskId: e.task_id,
    date: e.date,
    amount: e.amount,
    category: e.category,
    description: e.description,
    receiptUrl: e.receiptUrl,
    details: e.details,
    status: e.status,
    rejectedReason: e.rejected_reason,
    project: e.project,
    task: e.task,
  }));

  const projects = (projectsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <ExpensesClient 
      initialExpenses={expenses} 
      initialProjects={projects} 
    />
  );
}
