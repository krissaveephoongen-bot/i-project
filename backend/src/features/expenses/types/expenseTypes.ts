/**
 * Expense Types and Interfaces
 */

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';
export type ExpenseCategory = 'travel' | 'supplies' | 'equipment' | 'training' | 'other';

export interface Expense {
  id: string;
  date: Date;
  projectId: string;
  taskId?: string | null;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  receiptUrl?: string | null;
  notes?: string | null;
  status: ExpenseStatus;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseWithRelations extends Expense {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    code?: string;
  };
  task?: {
    id: string;
    title: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateExpenseDTO {
  date: Date;
  projectId: string;
  taskId?: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateExpenseDTO {
  date?: Date;
  projectId?: string;
  taskId?: string | null;
  amount?: number;
  category?: ExpenseCategory;
  description?: string;
  receiptUrl?: string | null;
  notes?: string;
  status?: ExpenseStatus;
}

export interface ApproveExpenseDTO {
  approvedBy: string;
}

export interface RejectExpenseDTO {
  approvedBy: string;
  reason?: string;
}

export interface ExpenseFilters {
  userId?: string;
  projectId?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface ExpensePagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseListResult {
  expenses: ExpenseWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
