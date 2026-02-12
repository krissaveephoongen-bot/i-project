import { db, schema } from '../../../shared/database/connection';
import { eq, and, or, ilike, desc, asc } from 'drizzle-orm';
import { AppError } from '../../../shared/errors/AppError';

interface ProjectFilters {
  status?: string;
  managerId?: string;
  search?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface CreateProjectData {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  managerId: string;
  clientId?: string;
  teamMembers?: string[];
}

interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: string;
  progress?: number;
  actualCost?: number;
}

export class ProjectService {
  async getProjects(filters: ProjectFilters, pagination: PaginationParams) {
    const { page, limit, sortBy, sortOrder } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (filters.status) {
      whereConditions.push(eq(schema.projects.status, filters.status as any));
    }
    
    if (filters.managerId) {
      whereConditions.push(eq(schema.projects.managerId, filters.managerId));
    }
    
    if (filters.search) {
      whereConditions.push(
        or(
          ilike(schema.projects.name, `%${filters.search}%`),
          ilike(schema.projects.description, `%${filters.search}%`)
        )
      );
    }

    // Build order by
    const orderBy = sortOrder === 'desc' ? desc : asc;
    const orderByColumn = this.getOrderByColumn(sortBy);

    // Get total count
    const [{ count }] = await db
      .select({ count: schema.projects.id })
      .from(schema.projects)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Get projects
    const projects = await db
      .select({
        id: schema.projects.id,
        name: schema.projects.name,
        code: schema.projects.code,
        description: schema.projects.description,
        status: schema.projects.status,
        startDate: schema.projects.startDate,
        endDate: schema.projects.endDate,
        budget: schema.projects.budget,
        spent: schema.projects.spent,
        remaining: schema.projects.remaining,
        priority: schema.projects.priority,
        category: schema.projects.category,
        isArchived: schema.projects.isArchived,
        createdAt: schema.projects.createdAt,
        updatedAt: schema.projects.updatedAt,
        manager: {
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
        },
      })
      .from(schema.projects)
      .leftJoin(schema.users, eq(schema.projects.managerId, schema.users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(orderBy(orderByColumn))
      .limit(limit)
      .offset(offset);

    return {
      projects,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async getProjectById(id: string) {
    const [project] = await db
      .select({
        id: schema.projects.id,
        name: schema.projects.name,
        code: schema.projects.code,
        description: schema.projects.description,
        status: schema.projects.status,
        startDate: schema.projects.startDate,
        endDate: schema.projects.endDate,
        budget: schema.projects.budget,
        spent: schema.projects.spent,
        remaining: schema.projects.remaining,
        priority: schema.projects.priority,
        category: schema.projects.category,
        isArchived: schema.projects.isArchived,
        createdAt: schema.projects.createdAt,
        updatedAt: schema.projects.updatedAt,
        manager: {
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
        },
        client: {
          id: schema.clients.id,
          name: schema.clients.name,
          email: schema.clients.email,
        },
      })
      .from(schema.projects)
      .leftJoin(schema.users, eq(schema.projects.managerId, schema.users.id))
      .leftJoin(schema.clients, eq(schema.projects.clientId, schema.clients.id))
      .where(eq(schema.projects.id, id))
      .limit(1);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }

  async createProject(data: CreateProjectData) {
    const [project] = await db
      .insert(schema.projects)
      .values({
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget ? data.budget.toString() : null,
        managerId: data.managerId,
        clientId: data.clientId || null,
        remaining: data.budget ? data.budget.toString() : '0.00',
      })
      .returning();

    return this.getProjectById(project.id);
  }

  async updateProject(id: string, data: UpdateProjectData) {
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }

    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    if (data.budget !== undefined) {
      updateData.budget = data.budget.toString();
      // Recalculate remaining if budget changed
      const currentProject = await this.getProjectById(id);
      const spent = parseFloat(currentProject.spent || '0');
      updateData.remaining = (data.budget - spent).toString();
    }

    if (data.actualCost !== undefined) {
      updateData.spent = data.actualCost.toString();
      // Recalculate remaining if actual cost changed
      const currentProject = await this.getProjectById(id);
      const budget = parseFloat(currentProject.budget || '0');
      updateData.remaining = (budget - data.actualCost).toString();
    }

    const [updatedProject] = await db
      .update(schema.projects)
      .set(updateData)
      .where(eq(schema.projects.id, id))
      .returning();

    if (!updatedProject) {
      throw new AppError('Project not found', 404);
    }

    return this.getProjectById(id);
  }

  async deleteProject(id: string) {
    const [deletedProject] = await db
      .delete(schema.projects)
      .where(eq(schema.projects.id, id))
      .returning();

    if (!deletedProject) {
      throw new AppError('Project not found', 404);
    }
  }

  async getProjectTasks(projectId: string) {
    // This would be implemented when we have tasks table
    // For now, return empty array
    return [];
  }

  async getProjectTeam(projectId: string) {
    // This would be implemented when we have project_team table
    // For now, return empty array
    return [];
  }

  async addTeamMember(projectId: string, userId: string) {
    // This would be implemented when we have project_team table
    // For now, return success message
    return { projectId, userId, added: true };
  }

  async removeTeamMember(projectId: string, userId: string) {
    // This would be implemented when we have project_team table
    // For now, just return success
    return;
  }

  private getOrderByColumn(sortBy: string): any {
    switch (sortBy) {
      case 'name':
        return schema.projects.name;
      case 'status':
        return schema.projects.status;
      case 'startDate':
        return schema.projects.startDate;
      case 'endDate':
        return schema.projects.endDate;
      case 'budget':
        return schema.projects.budget;
      case 'createdAt':
      default:
        return schema.projects.createdAt;
    }
  }
}
