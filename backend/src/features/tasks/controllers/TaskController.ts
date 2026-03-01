import { Request, Response, NextFunction } from "express";
import {
  ApiResponse,
  PaginatedResponse,
} from "../../../shared/types/ApiResponse";

export class TaskController {
  getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, status, projectId } = req.query;

      // Mock tasks data - in real app, this would come from database
      const tasks = [
        {
          id: "1",
          title: "Setup project structure",
          description: "Create the basic project structure and configuration",
          status: "completed",
          priority: "high",
          projectId: "1",
          assigneeId: "1",
          dueDate: "2024-01-15",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Implement authentication",
          description: "Add JWT-based authentication system",
          status: "in_progress",
          priority: "high",
          projectId: "1",
          assigneeId: "2",
          dueDate: "2024-01-20",
          createdAt: new Date().toISOString(),
        },
      ];

      const response: PaginatedResponse<any> = {
        success: true,
        message: "Tasks retrieved successfully",
        data: tasks,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: tasks.length,
          totalPages: Math.ceil(tasks.length / parseInt(limit as string)),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Mock task data - in real app, this would come from database
      const task = {
        id,
        title: "Setup project structure",
        description: "Create the basic project structure and configuration",
        status: "completed",
        priority: "high",
        projectId: "1",
        assigneeId: "1",
        dueDate: "2024-01-15",
        createdAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        message: "Task retrieved successfully",
        data: task,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskData = req.body;

      // Mock create - in real app, this would create in database
      const newTask = {
        id: "3",
        ...taskData,
        status: "todo",
        createdAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        message: "Task created successfully",
        data: newTask,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Mock update - in real app, this would update database
      const updatedTask = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        message: "Task updated successfully",
        data: updatedTask,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Mock delete - in real app, this would delete from database
      const response: ApiResponse = {
        success: true,
        message: "Task deleted successfully",
        data: null,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getTasksByProject = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { projectId } = req.params;

      // Mock tasks by project - in real app, this would come from database
      const tasks = [
        {
          id: "1",
          title: "Setup project structure",
          description: "Create the basic project structure and configuration",
          status: "completed",
          priority: "high",
          projectId,
          assigneeId: "1",
          dueDate: "2024-01-15",
          createdAt: new Date().toISOString(),
        },
      ];

      const response: ApiResponse = {
        success: true,
        message: `Tasks for project ${projectId} retrieved successfully`,
        data: tasks,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getTasksByAssignee = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId } = req.params;

      // Mock tasks by assignee - in real app, this would come from database
      const tasks = [
        {
          id: "1",
          title: "Setup project structure",
          description: "Create the basic project structure and configuration",
          status: "completed",
          priority: "high",
          projectId: "1",
          assigneeId: userId,
          dueDate: "2024-01-15",
          createdAt: new Date().toISOString(),
        },
      ];

      const response: ApiResponse = {
        success: true,
        message: `Tasks for user ${userId} retrieved successfully`,
        data: tasks,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
