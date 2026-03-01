import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { getDbClient } from "../../../shared/database";
import {
  projects,
  users,
  clients,
  statusEnum,
  priorityEnum,
} from "../../../shared/database/schema";
import type {
  ProjectEntity,
  ProjectWithRelations,
  CreateProjectData,
  UpdateProjectData,
  ProjectFilters,
  ClientEntity,
  UserEntity,
} from "../types";

export class ProjectRepository {
  private db = getDbClient().db;

  /**
   * Find all projects with optional filters and pagination
   */
  async findAll(
    filters: ProjectFilters = {},
    page = 1,
    limit = 50,
  ): Promise<{
    projects: ProjectWithRelations[];
    total: number;
  }> {
    if (!this.db) throw new Error("Database not configured");

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (filters.status) {
      whereConditions.push(eq(projects.status, filters.status as any));
    }

    if (filters.managerId) {
      whereConditions.push(eq(projects.managerId, filters.managerId));
    }

    if (filters.clientId) {
      whereConditions.push(eq(projects.clientId, filters.clientId));
    }

    if (filters.priority) {
      whereConditions.push(eq(projects.priority, filters.priority as any));
    }

    if (filters.isArchived !== undefined) {
      whereConditions.push(eq(projects.isArchived, filters.isArchived));
    }

    if (filters.search) {
      whereConditions.push(
        or(
          like(projects.name, `%${filters.search}%`),
          like(projects.code, `%${filters.search}%`),
          like(projects.description, `%${filters.search}%`),
        ),
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Get projects with relations
    const projectsResult = await this.db
      .select({
        // Project fields
        id: projects.id,
        name: projects.name,
        code: projects.code,
        description: projects.description,
        status: projects.status,
        startDate: projects.startDate,
        endDate: projects.endDate,
        budget: projects.budget,
        spent: projects.spent,
        remaining: projects.remaining,
        managerId: projects.managerId,
        clientId: projects.clientId,
        hourlyRate: projects.hourlyRate,
        priority: projects.priority,
        category: projects.category,
        isArchived: projects.isArchived,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        // Manager fields
        managerName: users.name,
        managerEmail: users.email,
        managerRole: users.role,
        // Client fields
        clientName: clients.name,
      })
      .from(projects)
      .leftJoin(users, eq(projects.managerId, users.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(whereClause)
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform to ProjectWithRelations
    const projectsWithRelations: ProjectWithRelations[] = projectsResult.map(
      (row) => ({
        id: row.id,
        name: row.name,
        code: row.code || undefined,
        description: row.description || undefined,
        status: row.status,
        startDate: row.startDate || undefined,
        endDate: row.endDate || undefined,
        budget: row.budget ? Number(row.budget) : undefined,
        spent: Number(row.spent),
        remaining: Number(row.remaining),
        managerId: row.managerId || undefined,
        clientId: row.clientId || undefined,
        hourlyRate: Number(row.hourlyRate),
        priority: row.priority,
        category: row.category || undefined,
        isArchived: row.isArchived,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        manager: row.managerName
          ? {
              id: row.managerId!,
              name: row.managerName,
              email: row.managerEmail,
              role: row.managerRole || "employee",
            }
          : undefined,
        client: row.clientName
          ? {
              id: row.clientId!,
              name: row.clientName,
            }
          : undefined,
      }),
    );

    return {
      projects: projectsWithRelations,
      total,
    };
  }

  /**
   * Find project by ID with relations
   */
  async findById(id: string): Promise<ProjectWithRelations | null> {
    if (!this.db) throw new Error("Database not configured");

    const result = await this.db
      .select({
        // Project fields
        id: projects.id,
        name: projects.name,
        code: projects.code,
        description: projects.description,
        status: projects.status,
        startDate: projects.startDate,
        endDate: projects.endDate,
        budget: projects.budget,
        spent: projects.spent,
        remaining: projects.remaining,
        managerId: projects.managerId,
        clientId: projects.clientId,
        hourlyRate: projects.hourlyRate,
        priority: projects.priority,
        category: projects.category,
        isArchived: projects.isArchived,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        // Manager fields
        managerName: users.name,
        managerEmail: users.email,
        managerRole: users.role,
        // Client fields
        clientName: clients.name,
      })
      .from(projects)
      .leftJoin(users, eq(projects.managerId, users.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      code: row.code || undefined,
      description: row.description || undefined,
      status: row.status,
      startDate: row.startDate || undefined,
      endDate: row.endDate || undefined,
      budget: row.budget ? Number(row.budget) : undefined,
      spent: Number(row.spent),
      remaining: Number(row.remaining),
      managerId: row.managerId || undefined,
      clientId: row.clientId || undefined,
      hourlyRate: Number(row.hourlyRate),
      priority: row.priority,
      category: row.category || undefined,
      isArchived: row.isArchived,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      manager: row.managerName
        ? {
            id: row.managerId!,
            name: row.managerName,
            email: row.managerEmail,
            role: row.managerRole || "employee",
          }
        : undefined,
      client: row.clientName
        ? {
            id: row.clientId!,
            name: row.clientName,
          }
        : undefined,
    };
  }

  /**
   * Create new project
   */
  async create(data: CreateProjectData): Promise<ProjectEntity> {
    if (!this.db) throw new Error("Database not configured");

    const result = await this.db
      .insert(projects)
      .values({
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status || "todo",
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        managerId: data.managerId,
        clientId: data.clientId,
        hourlyRate: data.hourlyRate || 0,
        priority: data.priority || "medium",
        category: data.category,
        isArchived: false,
      })
      .returning();

    return result[0];
  }

  /**
   * Update project
   */
  async update(
    id: string,
    data: UpdateProjectData,
  ): Promise<ProjectEntity | null> {
    if (!this.db) throw new Error("Database not configured");

    const result = await this.db
      .update(projects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete project
   */
  async delete(id: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not configured");

    const result = await this.db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Get project statistics
   */
  async getStats(): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    overdueProjects: number;
  }> {
    if (!this.db) throw new Error("Database not configured");

    const stats = await this.db
      .select({
        status: projects.status,
        endDate: projects.endDate,
        count: sql<number>`count(*)`,
      })
      .from(projects)
      .where(eq(projects.isArchived, false))
      .groupBy(projects.status, projects.endDate);

    let totalProjects = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let overdueProjects = 0;

    const now = new Date();

    stats.forEach((stat) => {
      totalProjects += stat.count;

      if (stat.status === "Completed") {
        completedProjects += stat.count;
      } else if (stat.status === "Active" || stat.status === "Planning") {
        activeProjects += stat.count;
      }

      // Check for overdue projects
      if (stat.endDate && stat.endDate < now && stat.status !== "Completed") {
        overdueProjects += stat.count;
      }
    });

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
    };
  }

  /**
   * Check if project code exists
   */
  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not configured");

    const whereConditions = [eq(projects.code, code)];
    if (excludeId) {
      whereConditions.push(sql`${projects.id} != ${excludeId}`);
    }

    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(and(...whereConditions))
      .limit(1);

    return (result[0]?.count || 0) > 0;
  }

  /**
   * Get all managers (users with manager role or isProjectManager flag)
   */
  async getManagers(): Promise<UserEntity[]> {
    if (!this.db) throw new Error("Database not configured");

    const result = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        department: users.department,
        position: users.position,
      })
      .from(users)
      .where(or(eq(users.role, "manager"), eq(users.isProjectManager, true)))
      .orderBy(users.name);

    return result;
  }

  /**
   * Get all clients
   */
  async getClients(): Promise<ClientEntity[]> {
    if (!this.db) throw new Error("Database not configured");

    const result = await this.db.select().from(clients).orderBy(clients.name);

    return result;
  }
}
