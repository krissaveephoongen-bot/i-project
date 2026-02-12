import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PaginatedResponse } from '../../../shared/types/ApiResponse';

export class UserController {
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      
      // Mock users data - in real app, this would come from database
      const users = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          department: 'IT',
          position: 'Developer',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'manager',
          department: 'Project Management',
          position: 'Project Manager',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      const response: PaginatedResponse<any> = {
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: users.length,
          totalPages: Math.ceil(users.length / parseInt(limit as string)),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      const response: ApiResponse = {
        success: true,
        message: 'User profile retrieved successfully',
        data: user,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const updateData = req.body;
      
      // Mock update - in real app, this would update database
      const updatedUser = {
        id: userId,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Mock user data - in real app, this would come from database
      const user = {
        id,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        department: 'IT',
        position: 'Developer',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Mock update - in real app, this would update database
      const updatedUser = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Mock delete - in real app, this would delete from database
      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
        data: null,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getUsersByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.params;
      
      // Mock users by role - in real app, this would come from database
      const users = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role,
          department: 'IT',
          position: 'Developer',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      const response: ApiResponse = {
        success: true,
        message: `Users with role ${role} retrieved successfully`,
        data: users,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
