import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/ProjectService';
import { ApiResponse, PaginatedResponse } from '../../../shared/types/ApiResponse';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        managerId,
        search,
      } = req.query;

      const filters = {
        status: status as string,
        managerId: managerId as string,
        search: search as string,
      };

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await this.projectService.getProjects(filters, pagination);
      
      const response: PaginatedResponse<any> = {
        success: true,
        message: 'Projects retrieved successfully',
        data: result.projects,
        pagination: result.pagination,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Project retrieved successfully',
        data: project,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectData = {
        ...req.body,
        managerId: (req as any).user.id, // Use authenticated user as manager
      };
      
      const project = await this.projectService.createProject(projectData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Project created successfully',
        data: project,
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const project = await this.projectService.updateProject(id, updateData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Project updated successfully',
        data: project,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.projectService.deleteProject(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Project deleted successfully',
        data: null,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getProjectTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tasks = await this.projectService.getProjectTasks(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Project tasks retrieved successfully',
        data: tasks,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getProjectTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const team = await this.projectService.getProjectTeam(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Project team retrieved successfully',
        data: team,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  addTeamMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      const result = await this.projectService.addTeamMember(id, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Team member added successfully',
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  removeTeamMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, userId } = req.params;
      
      await this.projectService.removeTeamMember(id, userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Team member removed successfully',
        data: null,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
