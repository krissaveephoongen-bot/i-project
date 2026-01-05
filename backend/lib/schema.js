import { pgTable, text, timestamp, integer, pgEnum, jsonb, numeric, time, uuid, boolean } from 'drizzle-orm/pg-core';

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
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').unique(),
  description: text('description'),
  status: statusEnum('status').notNull().default('todo'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  budget: numeric('budget', { precision: 12, scale: 2 }),
  spent: numeric('spent', { precision: 12, scale: 2 }).default('0.00'),
  remaining: numeric('remaining', { precision: 12, scale: 2 }).default('0.00'),
  managerId: uuid('manager_id').references(() => users.id),
  clientId: uuid('client_id').references(() => clients.id),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }).default('0.00'),
  priority: text('priority').default('medium'),
  category: text('category'),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  status: statusEnum('status').notNull().default('todo'),
  priority: priorityEnum('priority').notNull().default('medium'),
  dueDate: timestamp('due_date'),
  estimatedHours: numeric('estimated_hours', { precision: 6, scale: 2 }),
  actualHours: numeric('actual_hours', { precision: 6, scale: 2 }).default('0.00'),
  weight: numeric('weight', { precision: 10, scale: 2 }).default('1.00'),
  completedAt: timestamp('completed_at'),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  parentTaskId: uuid('parent_task_id').references(() => tasks.id, { onDelete: 'cascade' }),
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
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date').notNull(),
  workType: workTypeEnum('work_type').notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time'),
  hours: numeric('hours', { precision: 5, scale: 2 }).notNull(),
  description: text('description'),
  status: statusEnum('status').notNull().default('pending'),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Expenses
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date').notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: expenseCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  receiptUrl: text('receipt_url'),
  status: expenseStatusEnum('status').notNull().default('pending'),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Budget Tracking
export const budgetRevisions = pgTable('budget_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  previousBudget: numeric('previous_budget', { precision: 12, scale: 2 }).notNull(),
  newBudget: numeric('new_budget', { precision: 12, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  changedBy: uuid('changed_by').references(() => users.id, { onDelete: 'set null' }).notNull(),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
});

// Clients
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxId: text('tax_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activity Logging Table
export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  type: activityTypeEnum('type').notNull(),
  action: text('action').notNull(),
  description: text('description'),
  userId: uuid('user_id').references(() => users.id).notNull(),
  changes: jsonb('changes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Comments Table
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
