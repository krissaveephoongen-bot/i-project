// next-app/lib/projects.ts
import { supabase } from "./supabaseClient";

export interface Project {
  id: string;
  project_code: string;
  project_type: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  manager_id: string;
  created_at?: string;
  updated_at?: string;
  manager_name?: string;
  task_count?: number;
  total_duration?: number;
  elapsed_time?: number;
  remaining_time?: number;
  description?: string;
  payment_term?: string;
  payment_term_count?: number;
  payment_percentage?: number;
  payment_schedule?: {
    installment: number;
    percentage: number;
    amount?: number;
  }[];
}

// Helper function to recalculate project data (moved from projects/page.tsx)
export const recalculateProjectData = async (project: any) => {
  // Count tasks for this project
  const { count: taskCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("project_id", project.id);

  // Calculate three types of duration
  let totalDuration = null;
  let elapsedTime = null;
  let remainingTime = null;

  if (project.start_date && project.end_date) {
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    totalDuration =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    elapsedTime =
      Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
      1;

    remainingTime = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  return {
    ...project,
    task_count: taskCount || 0,
    total_duration: totalDuration,
    elapsed_time: elapsedTime,
    remaining_time: remainingTime,
  };
};

export async function getProjects(): Promise<Project[]> {
  const { data: projects, error: projectsError } = await supabase.from(
    "projects",
  ).select(`
      *,
      users!projects_manager_id_fkey (
        name
      )
    `);

  if (projectsError) {
    console.error("Projects fetch error:", projectsError);
    throw projectsError;
  }

  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      return {
        ...project,
        manager_name: (project.users as any)?.name || null, // Type assertion
      };
    }),
  );

  // Recalculate duration here or after initial fetch for all projects
  // For now, keep it in page.tsx if it depends on status for 'completed'
  // Or move the entire recalculateProjectData into this util and adapt to status filtering if needed here

  // For the initial fetch, we want all projects with base manager_name,
  // then filtering and duration calculation will happen in the client component
  return projectsWithCounts;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw error;
  }
  return data ? { ...data, manager_name: null } : null;
}

export async function createProject(
  newProject: Omit<
    Project,
    | "id"
    | "created_at"
    | "updated_at"
    | "manager_name"
    | "task_count"
    | "total_duration"
    | "elapsed_time"
    | "remaining_time"
  >,
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...newProject,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw error;
  }
  return data;
}

export async function updateProject(
  id: string,
  updatedFields: Partial<
    Omit<
      Project,
      | "id"
      | "created_at"
      | "updated_at"
      | "manager_name"
      | "task_count"
      | "total_duration"
      | "elapsed_time"
      | "remaining_time"
    >
  >,
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update({
      ...updatedFields,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating project ${id}:`, error);
    throw error;
  }
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw error;
  }
}
