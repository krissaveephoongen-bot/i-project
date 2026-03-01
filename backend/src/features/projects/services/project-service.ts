import { ProjectRepository } from "../repositories/project-repository";
import type {
  ProjectWithRelations,
  CreateProjectData,
  UpdateProjectData,
  ProjectFilters,
  ProjectStats,
  ValidationResult,
  ValidationError,
} from "../types";

export class ProjectService {
  private repository: ProjectRepository;

  constructor() {
    this.repository = new ProjectRepository();
  }

  /**
   * Get all projects with filters and pagination
   */
  async getProjects(
    filters: ProjectFilters = {},
    page = 1,
    limit = 50,
  ): Promise<{
    projects: ProjectWithRelations[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.repository.findAll(filters, page, limit);
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<ProjectWithRelations | null> {
    return this.repository.findById(id);
  }

  /**
   * Create new project
   */
  async createProject(data: CreateProjectData): Promise<ProjectWithRelations> {
    // Validate input
    const validation = await this.validateCreateProjectData(data);
    if (!validation.isValid) {
      throw new Error(
        `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`,
      );
    }

    // Check for duplicate code
    if (data.code) {
      const codeExists = await this.repository.codeExists(data.code);
      if (codeExists) {
        throw new Error("Project code already exists");
      }
    }

    // Create project
    const project = await this.repository.create(data);

    // Return with relations
    return this.repository.findById(
      project.id,
    ) as Promise<ProjectWithRelations>;
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    data: UpdateProjectData,
  ): Promise<ProjectWithRelations> {
    // Check if project exists
    const existingProject = await this.repository.findById(id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    // Validate update data
    const validation = this.validateUpdateProjectData(data);
    if (!validation.isValid) {
      throw new Error(
        `Validation failed: ${validation.errors.map((e) => e.message).join(", ")}`,
      );
    }

    // Check for duplicate code (excluding current project)
    if (data.code && data.code !== existingProject.code) {
      const codeExists = await this.repository.codeExists(data.code, id);
      if (codeExists) {
        throw new Error("Project code already exists");
      }
    }

    // Update project
    const updatedProject = await this.repository.update(id, data);
    if (!updatedProject) {
      throw new Error("Failed to update project");
    }

    // Return with relations
    return this.repository.findById(id) as Promise<ProjectWithRelations>;
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    // Check if project exists
    const project = await this.repository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Delete project
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error("Failed to delete project");
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(): Promise<ProjectStats> {
    const stats = await this.repository.getStats();

    return {
      ...stats,
      // Could add more computed stats here
    };
  }

  /**
   * Get managers for project assignment
   */
  async getManagers() {
    return this.repository.getManagers();
  }

  /**
   * Get clients for project assignment
   */
  async getClients() {
    return this.repository.getClients();
  }

  /**
   * Recalculate project data (SPI, progress, etc.)
   * This is a placeholder for future implementation
   */
  async recalculateProjectData(id: string): Promise<void> {
    // This would typically recalculate SPI, progress, etc.
    // For now, just update the updatedAt timestamp
    const project = await this.repository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    await this.repository.update(id, {});
  }

  /**
   * Validate create project data
   */
  private async validateCreateProjectData(
    data: CreateProjectData,
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required fields
    if (!data.name?.trim()) {
      errors.push({ field: "name", message: "Project name is required" });
    }

    // Date validation
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      errors.push({
        field: "endDate",
        message: "End date must be after start date",
      });
    }

    // Budget validation
    if (data.budget !== undefined && data.budget < 0) {
      errors.push({ field: "budget", message: "Budget cannot be negative" });
    }

    // Hourly rate validation
    if (data.hourlyRate !== undefined && data.hourlyRate < 0) {
      errors.push({
        field: "hourlyRate",
        message: "Hourly rate cannot be negative",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate update project data
   */
  private validateUpdateProjectData(data: UpdateProjectData): ValidationResult {
    const errors: ValidationError[] = [];

    // Name validation
    if (data.name !== undefined && !data.name.trim()) {
      errors.push({ field: "name", message: "Project name cannot be empty" });
    }

    // Date validation
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      errors.push({
        field: "endDate",
        message: "End date must be after start date",
      });
    }

    // Budget validation
    if (data.budget !== undefined && data.budget < 0) {
      errors.push({ field: "budget", message: "Budget cannot be negative" });
    }

    // Hourly rate validation
    if (data.hourlyRate !== undefined && data.hourlyRate < 0) {
      errors.push({
        field: "hourlyRate",
        message: "Hourly rate cannot be negative",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
