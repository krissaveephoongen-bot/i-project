import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../../shared/types/ApiResponse';

export class DashboardController {
  getKpiData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Mock KPI data - in real app, this would come from database
      const kpiData = {
        totalRevenue: 125000,
        totalExpenses: 85000,
        activeProjects: 12,
        totalUsers: 48,
        revenueGrowth: 12.5,
        expenseGrowth: -5.2,
      };

      const response: ApiResponse = {
        success: true,
        message: 'KPI data retrieved successfully',
        data: kpiData,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getProjectsOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Mock projects overview data
      const projectsOverview = {
        total: 15,
        active: 12,
        completed: 3,
        onHold: 0,
        planning: 0,
      };

      const response: ApiResponse = {
        success: true,
        message: 'Projects overview retrieved successfully',
        data: projectsOverview,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getTeamPerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Mock team performance data
      const teamPerformance = [
        { name: 'Team A', utilization: 85, efficiency: 92 },
        { name: 'Team B', utilization: 92, efficiency: 88 },
        { name: 'Team C', utilization: 78, efficiency: 95 },
        { name: 'Team D', utilization: 65, efficiency: 89 },
        { name: 'Team E', utilization: 88, efficiency: 91 },
      ];

      const response: ApiResponse = {
        success: true,
        message: 'Team performance retrieved successfully',
        data: teamPerformance,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getFinancialSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Mock financial summary data
      const financialSummary = {
        totalBudget: 500000,
        totalSpent: 325000,
        totalRevenue: 450000,
        profit: 125000,
        budgetUtilization: 65,
      };

      const response: ApiResponse = {
        success: true,
        message: 'Financial summary retrieved successfully',
        data: financialSummary,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
