/**
 * Expense Service - Business logic for expense operations
 */

import { db } from "../../../shared/database/connection";
import {
  expenses,
  projects,
  tasks,
  users,
} from "../../../shared/database/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import {
  Expense,
  ExpenseWithRelations,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ApproveExpenseDTO,
  RejectExpenseDTO,
  ExpenseFilters,
  ExpensePagination,
  ExpenseListResult,
  ExpenseStatus,
} from "../types/expenseTypes";

export class ExpenseService {
  /**
   * Get all expenses with filtering and pagination
   */
  async getExpenses(
    filters: ExpenseFilters,
    pagination: ExpensePagination,
  ): Promise<ExpenseListResult> {
    const {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
    } = pagination;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any[] = [];

    if (filters.userId) {
      whereConditions.push(eq(expenses.userId, filters.userId));
    }
    if (filters.projectId) {
      whereConditions.push(eq(expenses.projectId, filters.projectId));
    }
    if (filters.category) {
      whereConditions.push(eq(expenses.category, filters.category));
    }
    if (filters.status) {
      whereConditions.push(eq(expenses.status, filters.status));
    }
    if (filters.startDate) {
      whereConditions.push(gte(expenses.date, filters.startDate));
    }
    if (filters.endDate) {
      whereConditions.push(lte(expenses.date, filters.endDate));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Fetch total count
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(expenses)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    // Fetch data with relations
    const expenseList = await db
      .select({
        id: expenses.id,
        date: expenses.date,
        projectId: expenses.projectId,
        taskId: expenses.taskId,
        userId: expenses.userId,
        amount: expenses.amount,
        category: expenses.category,
        description: expenses.description,
        receiptUrl: expenses.receiptUrl,
        notes: expenses.notes,
        status: expenses.status,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        project: {
          id: projects.id,
          name: projects.name,
          code: projects.code,
        },
        task: {
          id: tasks.id,
          title: tasks.title,
        },
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.userId, users.id))
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .leftJoin(tasks, eq(expenses.taskId, tasks.id))
      .where(whereClause)
      .orderBy(
        sortBy === "date"
          ? sortOrder === "asc"
            ? expenses.date
            : desc(expenses.date)
          : sortOrder === "asc"
            ? expenses.amount
            : desc(expenses.amount),
      )
      .limit(limit)
      .offset(offset);

    return {
      expenses: expenseList as ExpenseWithRelations[],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get expense by ID with relations
   */
  async getExpenseById(id: string): Promise<ExpenseWithRelations> {
    const result = await db
      .select({
        id: expenses.id,
        date: expenses.date,
        projectId: expenses.projectId,
        taskId: expenses.taskId,
        userId: expenses.userId,
        amount: expenses.amount,
        category: expenses.category,
        description: expenses.description,
        receiptUrl: expenses.receiptUrl,
        notes: expenses.notes,
        status: expenses.status,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        project: {
          id: projects.id,
          name: projects.name,
          code: projects.code,
        },
        task: {
          id: tasks.id,
          title: tasks.title,
        },
      })
      .from(expenses)
      .leftJoin(users, eq(expenses.userId, users.id))
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .leftJoin(tasks, eq(expenses.taskId, tasks.id))
      .where(eq(expenses.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new Error("Expense not found");
    }

    return result[0] as ExpenseWithRelations;
  }

  /**
   * Create new expense
   */
  async createExpense(data: CreateExpenseDTO): Promise<ExpenseWithRelations> {
    // Validate project exists
    const projectExists = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.projectId))
      .limit(1);

    if (projectExists.length === 0) {
      throw new Error("Invalid project ID");
    }

    // Validate task if provided
    if (data.taskId) {
      const taskExists = await db
        .select()
        .from(tasks)
        .where(
          and(eq(tasks.id, data.taskId), eq(tasks.projectId, data.projectId)),
        )
        .limit(1);

      if (taskExists.length === 0) {
        throw new Error("Invalid task ID for the specified project");
      }
    }

    // Create expense
    const result = await db
      .insert(expenses)
      .values({
        ...data,
        status: "pending" as ExpenseStatus,
      })
      .returning();

    if (result.length === 0) {
      throw new Error("Failed to create expense");
    }

    return this.getExpenseById(result[0].id);
  }

  /**
   * Update expense
   */
  async updateExpense(
    id: string,
    data: UpdateExpenseDTO,
  ): Promise<ExpenseWithRelations> {
    // Check if expense exists
    const existing = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Expense not found");
    }

    // Validate task/project relationship if updating
    if (data.projectId || data.taskId !== undefined) {
      const projectId = data.projectId || existing[0].projectId;

      if (data.taskId && projectId) {
        const taskExists = await db
          .select()
          .from(tasks)
          .where(and(eq(tasks.id, data.taskId), eq(tasks.projectId, projectId)))
          .limit(1);

        if (taskExists.length === 0) {
          throw new Error("Invalid task ID for the project");
        }
      }
    }

    // Update expense
    const result = await db
      .update(expenses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Failed to update expense");
    }

    return this.getExpenseById(id);
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: string): Promise<void> {
    const result = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Expense not found");
    }
  }

  /**
   * Approve expense
   */
  async approveExpense(
    id: string,
    data: ApproveExpenseDTO,
  ): Promise<ExpenseWithRelations> {
    const result = await db
      .update(expenses)
      .set({
        status: "approved" as ExpenseStatus,
        approvedBy: data.approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Expense not found");
    }

    return this.getExpenseById(id);
  }

  /**
   * Reject expense
   */
  async rejectExpense(
    id: string,
    data: RejectExpenseDTO,
  ): Promise<ExpenseWithRelations> {
    const result = await db
      .update(expenses)
      .set({
        status: "rejected" as ExpenseStatus,
        approvedBy: data.approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Expense not found");
    }

    return this.getExpenseById(id);
  }

  /**
   * Get expense categories
   */
  getCategories(): string[] {
    return ["travel", "supplies", "equipment", "training", "other"];
  }

  /**
   * Get expense summary by category
   */
  async getExpenseSummaryByCategory(
    filters: ExpenseFilters,
  ): Promise<Array<{ category: string; total: number; count: number }>> {
    const whereConditions: any[] = [eq(expenses.status, "approved")];

    if (filters.userId) {
      whereConditions.push(eq(expenses.userId, filters.userId));
    }
    if (filters.projectId) {
      whereConditions.push(eq(expenses.projectId, filters.projectId));
    }
    if (filters.startDate) {
      whereConditions.push(gte(expenses.date, filters.startDate));
    }
    if (filters.endDate) {
      whereConditions.push(lte(expenses.date, filters.endDate));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    return db
      .select({
        category: expenses.category,
        total: sql<number>`SUM(${expenses.amount})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(whereClause)
      .groupBy(expenses.category);
  }
}
