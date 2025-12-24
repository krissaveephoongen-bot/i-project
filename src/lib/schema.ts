import { pgTable, serial, text, timestamp, integer, pgEnum, jsonb, numeric, time, uuid, boolean } from 'drizzle-orm/pg-core';

// Enums
export const statusEnum = pgEnum('status', ['todo', 'in_progress', 'in_review', 'done', 'pending', 'approved', 'rejected', 'active', 'inactive']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);
export const activityTypeEnum = pgEnum('activity_type', [
  'create',
  'update',
  'delete',
  'comment',
  'assign',
  'status_change',
]);

export const workTypeEnum = pgEnum('work_type', ['project', 'office', 'other']);
export const expenseCategoryEnum = pgEnum('expense_category', ['travel', 'supplies', 'equipment', 'training', 'other']);
export const expenseStatusEnum = pgEnum('expense_status', ['pending', 'approved', 'rejected', 'reimbursed']);

export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'employee']);

// Tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  objectId: text('object_id').unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: userRoleEnum('role').notNull().default('employee'),
  avatar: text('avatar'),
  department: text('department'),
  position: text('position'),
  employeeCode: text('employee_code'),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }).default('0.00'),
  phone: text('phone'),
  status: text('status').default('active'),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lastLogin: timestamp('last_login'),
  lockedUntil: timestamp('locked_until'),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').unique(),
  description: text('description'),
  status: statusEnum('status').notNull().default('todo'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  budget: numeric('budget', { precision: 12, scale: 2 }),
  spent: numeric('spent', { precision: 12, scale: 2 }).default('0.00'),
  remaining: numeric('remaining', { precision: 12, scale: 2 }).default('0.00'),
  managerId: integer('manager_id').references(() => users.id),
  clientId: integer('client_id').references(() => clients.id),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }).default('0.00'),
  priority: text('priority').default('medium'),
  category: text('category'),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tasks table with self-referential relationship
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: statusEnum('status').notNull().default('todo'),
  priority: priorityEnum('priority').notNull().default('medium'),
  dueDate: timestamp('due_date'),
  estimatedHours: numeric('estimated_hours', { precision: 6, scale: 2 }),
  actualHours: numeric('actual_hours', { precision: 6, scale: 2 }).default('0.00'),
  weight: numeric('weight', { precision: 10, scale: 2 }).default('1.00'),
  completedAt: timestamp('completed_at'),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  assignedTo: integer('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  parentTaskId: integer('parent_task_id').references((): any => ({ name: 'tasks' }), { onDelete: 'cascade' }),
  category: text('category'),
  storyPoints: integer('story_points'),
  sprintId: uuid('sprint_id'),
  blockedBy: uuid('blocked_by'),
  blockedReason: text('blocked_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Timesheet Entries
export const timeEntries = pgTable('time_entries', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  workType: workTypeEnum('work_type').notNull(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time'),
  hours: numeric('hours', { precision: 5, scale: 2 }).notNull(),
  description: text('description'),
  status: statusEnum('status').notNull().default('pending'),
  approvedBy: integer('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Expenses
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: expenseCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  receiptUrl: text('receipt_url'),
  status: expenseStatusEnum('status').notNull().default('pending'),
  approvedBy: integer('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Budget Tracking
export const budgetRevisions = pgTable('budget_revisions', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  previousBudget: numeric('previous_budget', { precision: 12, scale: 2 }).notNull(),
  newBudget: numeric('new_budget', { precision: 12, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  changedBy: integer('changed_by').references(() => users.id, { onDelete: 'set null' }).notNull(),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
});

// Clients
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxId: text('tax_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Use interface for Task to allow circular references
interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  estimatedHours: string | null;
  actualHours: string;
  weight: string;
  completedAt: Date | null;
  projectId: number;
  assignedTo: number | null;
  createdBy: number;
  parentTaskId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType = Task;
export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type NewTimeEntry = typeof timeEntries.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type BudgetRevision = typeof budgetRevisions.$inferSelect;
export type NewBudgetRevision = typeof budgetRevisions.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

// Activity Logging Table
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'project', 'task', 'user', etc.
  entityId: integer('entity_id').notNull(),
  type: activityTypeEnum('type').notNull(),
  action: text('action').notNull(), // Human-readable description
  description: text('description'),
  userId: integer('user_id').references(() => users.id).notNull(),
  changes: jsonb('changes'), // JSON object with before/after values
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;

// Comments Table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
