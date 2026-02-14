/**
 * Expense Controller - Handles HTTP requests for expense endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from '../services/ExpenseService';
import { ApiResponse, PaginatedResponse } from '../../../shared/types/ApiResponse';
import { ExpenseFilters, ExpensePagination } from '../types/expenseTypes';

export class ExpenseController {
  private expenseService: ExpenseService;

  constructor() {
    this.expenseService = new ExpenseService();
  }

  /**
   * GET /api/expenses - List all expenses with filtering and pagination
   */
  getExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'desc',
        userId,
        projectId,
        category,
        status,
        startDate,
        endDate,
      } = req.query;

      const filters: ExpenseFilters = {
        userId: userId as string,
        projectId: projectId as string,
        category: category as any,
        status: status as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const pagination: ExpensePagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await this.expenseService.getExpenses(filters, pagination);

      const response: PaginatedResponse<any> = {
        success: true,
        message: 'Expenses retrieved successfully',
        data: result.expenses,
        pagination: result.pagination,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/expenses/:id - Get expense by ID
   */
  getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const expense = await this.expenseService.getExpenseById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Expense retrieved successfully',
        data: expense,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/expenses - Create new expense
   */
  createExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expenseData = {
        ...req.body,
        date: new Date(req.body.date),
      };

      const expense = await this.expenseService.createExpense(expenseData);

      const response: ApiResponse = {
        success: true,
        message: 'Expense created successfully',
        data: expense,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/expenses/:id - Update expense
   */
  updateExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        ...(req.body.date && { date: new Date(req.body.date) }),
      };

      const expense = await this.expenseService.updateExpense(id, updateData);

      const response: ApiResponse = {
        success: true,
        message: 'Expense updated successfully',
        data: expense,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/expenses/:id - Delete expense
   */
  deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await this.expenseService.deleteExpense(id);

      const response: ApiResponse = {
        success: true,
        message: 'Expense deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/expenses/:id/approve - Approve expense
   */
  approveExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body;

      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'Approver ID is required',
        });
      }

      const expense = await this.expenseService.approveExpense(id, { approvedBy });

      const response: ApiResponse = {
        success: true,
        message: 'Expense approved successfully',
        data: expense,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/expenses/:id/reject - Reject expense
   */
  rejectExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { approvedBy, reason } = req.body;

      if (!approvedBy) {
        return res.status(400).json({
          success: false,
          message: 'Approver ID is required',
        });
      }

      const expense = await this.expenseService.rejectExpense(id, { approvedBy, reason });

      const response: ApiResponse = {
        success: true,
        message: 'Expense rejected successfully',
        data: expense,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/expenses/categories/list - Get expense categories
   */
  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = this.expenseService.getCategories();

      const response: ApiResponse = {
        success: true,
        message: 'Expense categories retrieved successfully',
        data: categories,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/expenses/summary/by-category - Get expense summary by category
   */
  getSummaryByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, projectId, startDate, endDate } = req.query;

      const filters = {
        userId: userId as string,
        projectId: projectId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const summary = await this.expenseService.getExpenseSummaryByCategory(filters);

      const response: ApiResponse = {
        success: true,
        message: 'Expense summary retrieved successfully',
        data: summary,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
