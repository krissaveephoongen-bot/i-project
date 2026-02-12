import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiResponse } from '../../../shared/types/ApiResponse';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const result = await this.authService.register(userData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Registration successful',
        data: result,
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const user = await this.authService.getUserById(userId);
      
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

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a real app, you might want to invalidate the token
      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        data: null,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      
      const response: ApiResponse = {
        success: true,
        message: 'Password reset email sent',
        data: null,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);
      
      const response: ApiResponse = {
        success: true,
        message: 'Password reset successful',
        data: null,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const updateData = req.body;
      const user = await this.authService.updateProfile(userId, updateData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: user,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(userId, currentPassword, newPassword);
      
      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        data: null,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
