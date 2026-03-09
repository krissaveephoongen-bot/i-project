import React from "react";
import TasksClient from "./TasksClient";
import Header from "@/app/components/Header";
import PageTransition from "@/app/components/PageTransition";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Task } from "../../../../lib/tasks";

export const metadata = {
  title: "Tasks | i-Project",
};

export default async function ProjectTasksPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { status?: string; assignee?: string; milestone?: string };
}) {
  const projectId = params.id;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch Project Details
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  // 2. Fetch Tasks
  let tq = supabase
    .from("tasks")
    .select(`
      *,
      assigned_user:users(id, name),
      projects:projects(id, name)
    `)
    .eq("project_id", projectId) as any;
  if (searchParams?.status) {
    tq = tq.eq("status", searchParams.status);
  }
  if (searchParams?.assignee) {
    tq = tq.eq("assigned_to", searchParams.assignee);
  }
  if (searchParams?.milestone) {
    tq = tq.eq("milestone_id", searchParams.milestone);
  }
  const { data: tasksData } = await tq.order("created_at", { ascending: false });

  // 3. Fetch Users (for assignment dropdown)
  const { data: usersData } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  // 4. Fetch Milestones
  const { data: milestonesData } = await supabase
    .from("milestones")
    .select("id, title")
    .eq("project_id", projectId)
    .order("due_date");

  // Transform Tasks to match interface
  const tasks: Task[] = (tasksData || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    projectId: t.project_id,
    milestoneId: t.milestone_id,
    assignedTo: t.assigned_to,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    weight: t.weight || 1,
    progressPlan: t.progress_plan || 0,
    progressActual: t.progress_actual || 0,
    startDate: t.start_date,
    endDate: t.end_date,
    dueDate: t.end_date, // Map for compatibility
    parentId: t.parent_id || null,
    projects: t.projects ? { id: t.projects.id, name: t.projects.name } : undefined,
    assigned_user: t.assigned_user ? { id: t.assigned_user.id, name: t.assigned_user.name } : undefined,
    assigned_to: t.assigned_user?.name || "Unassigned", // Display name
  }));

  const users = (usersData || []).map((u: any) => ({
    id: u.id,
    name: u.name,
  }));

  const milestones = (milestonesData || []).map((m: any) => ({
    id: m.id,
    title: m.title,
  }));

  const projectsList = project ? [{ id: projectId, name: project.name }] : [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title={`งานในโครงการ: ${project?.name || "..."}`}
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "โครงการ", href: "/projects" },
            { label: project?.name || "รายละเอียด", href: `/projects/${projectId}` },
            { label: "งาน (Tasks)" },
          ]}
        />
        <TasksClient 
          projectId={projectId} 
          initialTasks={tasks}
          users={users}
          milestones={milestones}
          projects={projectsList}
        />
      </div>
    </PageTransition>
  );
}
