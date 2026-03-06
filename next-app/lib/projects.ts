// next-app/lib/projects.ts
import { supabase } from "./supabaseClient";

export interface Project {
  id: string;
  code: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  managerId: string;
  clientId: string;
  priority: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
  manager_name?: string;
  task_count?: number;
  description?: string;
}

// Helper function to map snake_case DB result to camelCase Project
const mapProjectFromDB = (data: any): Project => {
  return {
    id: data.id,
    code: data.code || data.project_code || "",
    name: data.name,
    status: data.status,
    progress: data.progress,
    budget: data.budget,
    spent: data.spent,
    startDate: data.start_date || data.startDate,
    endDate: data.end_date || data.endDate,
    managerId: data.manager_id || data.managerId,
    clientId: data.client_id || data.clientId,
    priority: data.priority,
    category: data.category,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    manager_name: data.users?.name || data.manager_name || null,
    description: data.description,
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

  return (projects || []).map(mapProjectFromDB);
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
  return data ? mapProjectFromDB(data) : null;
}

// Note: createProject and updateProject here are client-side helpers using supabase-js.
// However, the app seems to be moving to Server Actions (app/projects/actions.ts).
// If these are still used, they should map camelCase back to snake_case.

export async function createProject(
  newProject: Omit<
    Project,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "manager_name"
    | "task_count"
  >,
): Promise<Project> {
  const dbPayload = {
    name: newProject.name,
    code: newProject.code,
    description: newProject.description,
    status: newProject.status,
    progress: newProject.progress,
    budget: newProject.budget,
    start_date: newProject.startDate,
    end_date: newProject.endDate,
    manager_id: newProject.managerId,
    client_id: newProject.clientId,
    priority: newProject.priority,
    category: newProject.category,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(dbPayload)
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw error;
  }
  return mapProjectFromDB(data);
}

export async function updateProject(
  id: string,
  updatedFields: Partial<Project>,
): Promise<Project> {
  const dbPayload: any = {
      updated_at: new Date().toISOString(),
  };
  if (updatedFields.name !== undefined) dbPayload.name = updatedFields.name;
  if (updatedFields.code !== undefined) dbPayload.code = updatedFields.code;
  if (updatedFields.description !== undefined) dbPayload.description = updatedFields.description;
  if (updatedFields.status !== undefined) dbPayload.status = updatedFields.status;
  if (updatedFields.progress !== undefined) dbPayload.progress = updatedFields.progress;
  if (updatedFields.budget !== undefined) dbPayload.budget = updatedFields.budget;
  if (updatedFields.startDate !== undefined) dbPayload.start_date = updatedFields.startDate;
  if (updatedFields.endDate !== undefined) dbPayload.end_date = updatedFields.endDate;
  if (updatedFields.managerId !== undefined) dbPayload.manager_id = updatedFields.managerId;
  if (updatedFields.clientId !== undefined) dbPayload.client_id = updatedFields.clientId;
  if (updatedFields.priority !== undefined) dbPayload.priority = updatedFields.priority;
  if (updatedFields.category !== undefined) dbPayload.category = updatedFields.category;

  const { data, error } = await supabase
    .from("projects")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating project ${id}:`, error);
    throw error;
  }
  return mapProjectFromDB(data);
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw error;
  }
}
