import { supabase } from "./supabaseClient";

export interface Project {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: string;
  progress: number;
  progressPlan: number;
  spi: number;
  riskLevel: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent: number;
  remaining: number;
  managerId?: string;
  clientId?: string;
  hourlyRate: number;
  priority: string;
  category?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  manager?: {
    name: string;
    email: string;
  };
  client?: {
    name: string;
  };
}

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch("/api/projects", { cache: "no-store" });
    if (!res.ok) {
      console.error(
        "Failed to fetch projects from API:",
        res.status,
        res.statusText,
      );
      // Fallback to Supabase direct query if API fails (client-side only)
      if (typeof window !== "undefined") {
        const { data, error } = await supabase
          .from("projects")
          .select("*, manager:users(name,email), client:clients(name)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (data) return data.map(mapDatabaseToProject);
      }
      return [];
    }
    const rows = await res.json();
    return (rows || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      code: p.code || null,
      description: p.description || null,
      status: p.status || "active",
      progress: Number(p.progress ?? 0),
      progressPlan: Number(p.progressPlan ?? p.progress_plan ?? 0),
      spi: Number(p.spi ?? 1),
      riskLevel: String(p.riskLevel ?? p.risk_level ?? "Medium"),
      startDate: p.startDate ?? p.start_date ?? null,
      endDate: p.endDate ?? p.end_date ?? null,
      budget: p.budget != null ? Number(p.budget) : undefined,
      spent: Number(p.spent ?? 0),
      remaining: Number(p.remaining ?? 0),
      managerId: p.managerId ?? p.manager_id ?? null,
      clientId: p.clientId ?? p.client_id ?? null,
      hourlyRate: Number(p.hourlyRate ?? p.hourly_rate ?? 0),
      priority: p.priority ?? "medium",
      category: p.category ?? null,
      isArchived: Boolean(p.isArchived ?? p.is_archived ?? false),
      createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
      updatedAt: p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
      manager: p.manager || null,
      client: p.client || null,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

function mapDatabaseToProject(p: any): Project {
  return {
    id: p.id,
    name: p.name,
    code: p.code || null,
    description: p.description || null,
    status: p.status || "active",
    progress: Number(p.progress ?? 0),
    progressPlan: Number(p.progress_plan ?? 0),
    spi: Number(p.spi ?? 1),
    riskLevel: String(p.risk_level ?? "Medium"),
    startDate: p.start_date ?? null,
    endDate: p.end_date ?? null,
    budget: p.budget != null ? Number(p.budget) : undefined,
    spent: Number(p.spent ?? 0),
    remaining: Number(p.remaining ?? 0),
    managerId: p.manager_id ?? null,
    clientId: p.client_id ?? null,
    hourlyRate: Number(p.hourly_rate ?? 0),
    priority: p.priority ?? "medium",
    category: p.category ?? null,
    isArchived: Boolean(p.is_archived ?? false),
    createdAt: p.created_at ?? new Date().toISOString(),
    updatedAt: p.updated_at ?? new Date().toISOString(),
    manager: p.manager
      ? { name: p.manager.name, email: p.manager.email }
      : undefined,
    client: p.client ? { name: p.client.name } : undefined,
  };
}

export async function createProject(
  projectData: Partial<Project>,
): Promise<Project> {
  const res = await fetch("/api/projects/create/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error("Failed to create project");
  const json = await res.json();
  return { ...(projectData as any), id: json.id } as Project;
}

export async function updateProject(
  id: string,
  projectData: Partial<Project>,
): Promise<Project> {
  const res = await fetch("/api/projects/update/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, updatedFields: projectData }),
  });
  if (!res.ok) throw new Error("Failed to update project");
  const json = await res.json();
  return json as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch("/api/projects/delete/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete project");
}

export async function recalculateProjectData(projectId: string): Promise<void> {
  // This would typically recalculate SPI, progress, etc.
  // For now, it's a placeholder implementation
  const { error } = await supabase
    .from("projects")
    .update({
      updatedAt: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw error;
}
