/**
 * Expense Routes - API endpoints for expense management
 */

import { Router } from "express";
import { ExpenseController } from "../controllers/ExpenseController";
import {
  authMiddleware,
  requireRole,
} from "../../../shared/middleware/authMiddleware";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import {
  createExpenseSchema,
  updateExpenseSchema,
  approveExpenseSchema,
  rejectExpenseSchema,
} from "../schemas/expenseSchemas";

const router = Router();
const expenseController = new ExpenseController();

// All expense routes require authentication
router.use(authMiddleware);

/**
 * GET /api/expenses - List all expenses with filtering and pagination
 * Query params: page, limit, sortBy, sortOrder, userId, projectId, category, status, startDate, endDate
 */
router.get("/", expenseController.getExpenses);

/**
 * GET /api/expenses/categories/list - Get available expense categories
 */
router.get("/categories/list", expenseController.getCategories);

/**
 * GET /api/expenses/summary/by-category - Get expense summary by category
 * Query params: userId, projectId, startDate, endDate
 */
router.get("/summary/by-category", expenseController.getSummaryByCategory);

/**
 * GET /api/expenses/:id - Get expense by ID
 */
router.get("/:id", expenseController.getExpenseById);

/**
 * POST /api/expenses - Create new expense
 * Body: date, projectId, taskId (optional), userId, amount, category, description, receiptUrl (optional), notes (optional)
 */
router.post(
  "/",
  validateRequest(createExpenseSchema),
  expenseController.createExpense,
);

/**
 * PUT /api/expenses/:id - Update expense
 * Body: date (optional), projectId (optional), taskId (optional), amount (optional), category (optional), description (optional), receiptUrl (optional), notes (optional), status (optional)
 */
router.put(
  "/:id",
  validateRequest(updateExpenseSchema),
  expenseController.updateExpense,
);

/**
 * DELETE /api/expenses/:id - Delete expense
 */
router.delete("/:id", expenseController.deleteExpense);

/**
 * POST /api/expenses/:id/approve - Approve expense (manager/admin only)
 * Body: approvedBy
 */
router.post(
  "/:id/approve",
  requireRole(["manager", "admin"]),
  validateRequest(approveExpenseSchema),
  expenseController.approveExpense,
);

/**
 * POST /api/expenses/:id/reject - Reject expense (manager/admin only)
 * Body: approvedBy, reason (optional)
 */
router.post(
  "/:id/reject",
  requireRole(["manager", "admin"]),
  validateRequest(rejectExpenseSchema),
  expenseController.rejectExpense,
);

export { router as expenseRoutes };
