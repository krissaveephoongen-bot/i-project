import { supabase } from "../supabaseClient";
import {
  Project,
  ProjectInsert,
  ProjectUpdate,
  ProjectWithManager,
} from "../../types/database.types";

export class ProjectService {
  // Fetch all projects with manager and client details
  static async fetchProjects(): Promise<ProjectWithManager[]> {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        manager:users(id, name, email, role),
        client:clients(id, name, email, phone),
        tasks:tasks(id, title, status, priority, assignee_id),
        risks:risks(id, title, probability, impact, status),
        milestones:milestones(id, title, due_date, status)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      throw new Error("Failed to fetch projects");
    }

    return data as ProjectWithManager[];
  }

  // Fetch a single project by ID with related data
  static async fetchProjectById(
    id: string,
  ): Promise<ProjectWithManager | null> {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        manager:users(id, name, email, role),
        client:clients(id, name, email, phone),
        tasks:tasks(*, assignee:users(id, name, email)),
        risks:risks(*),
        milestones:milestones(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      throw new Error("Failed to fetch project");
    }

    return data as ProjectWithManager;
  }

  // Create a new project
  static async createProject(project: ProjectInsert): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      throw new Error("Failed to create project");
    }

    return data as Project;
  }

  // Update an existing project
  static async updateProject(
    id: string,
    updates: ProjectUpdate,
  ): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      throw new Error("Failed to update project");
    }

    return data as Project;
  }

  // Delete a project
  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      console.error("Error deleting project:", error);
      throw new Error("Failed to delete project");
    }
  }

  // Fetch projects for a specific manager
  static async fetchProjectsByManager(
    managerId: string,
  ): Promise<ProjectWithManager[]> {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        manager:users(id, name, email, role),
        client:clients(id, name, email, phone)
      `,
      )
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manager projects:", error);
      throw new Error("Failed to fetch manager projects");
    }

    return data as ProjectWithManager[];
  }

  // Fetch projects for a specific client
  static async fetchProjectsByClient(
    clientId: string,
  ): Promise<ProjectWithManager[]> {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        manager:users(id, name, email, role),
        client:clients(id, name, email, phone)
      `,
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching client projects:", error);
      throw new Error("Failed to fetch client projects");
    }

    return data as ProjectWithManager[];
  }

  // Update project status
  static async updateProjectStatus(
    id: string,
    status: string,
  ): Promise<Project> {
    return this.updateProject(id, { status });
  }

  // Update project budget
  static async updateProjectBudget(
    id: string,
    budget: number,
  ): Promise<Project> {
    return this.updateProject(id, { budget });
  }
}
