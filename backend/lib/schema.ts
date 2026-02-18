import { pgTable, text, timestamp, integer, pgEnum, jsonb, numeric, time, uuid, boolean, date, real } from 'drizzle-orm/pg-core';

// ============================================================
// USER RELATED ENUMS
// ============================================================

export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'employee']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive']);

// ============================================================
// PROJECT RELATED ENUMS
// ============================================================

export const projectStatusEnum = pgEnum('project_status', ['planning', 'active', 'on_hold', 'completed', 'cancelled']);
export const projectPriorityEnum = pgEnum('project_priority', ['low', 'medium', 'high', 'urgent']);
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high', 'critical']);

// ============================================================
// TASK RELATED ENUMS
// ============================================================

export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'in_review', 'done', 'cancelled']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);
export const taskCategoryEnum = pgEnum('task_category', ['development', 'design', 'testing', 'documentation', 'maintenance', 'other']);

// ============================================================
// TIMESHEET & TIME ENTRY ENUMS
// ============================================================

export const workTypeEnum = pgEnum('work_type', ['project', 'office', 'training', 'leave', 'overtime', 'other']);
export const timeEntryStatusEnum = pgEnum('time_entry_status', ['pending', 'approved', 'rejected']);

// ============================================================
// LEAVE MANAGEMENT ENUMS
// ============================================================

export const leaveTypeEnum = pgEnum('leave_type', ['annual', 'sick', 'personal', 'maternity', 'unpaid']);
export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'rejected', 'cancelled']);

// ============================================================
// EXPENSE ENUMS
// ============================================================

export const expenseCategoryEnum = pgEnum('expense_category', ['travel', 'supplies', 'equipment', 'training', 'other']);
export const expenseStatusEnum = pgEnum('expense_status', ['pending', 'approved', 'rejected', 'reimbursed']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'credit_card', 'bank_transfer', 'check', 'other']);

// ============================================================
// CLIENT ENUMS
// ============================================================

export const clientStatusEnum = pgEnum('client_status', ['active', 'inactive', 'archived']);
export const clientTypeEnum = pgEnum('client_type', ['individual', 'company', 'government']);

// ============================================================
// SALES ENUMS
// ============================================================

export const salesStatusEnum = pgEnum('sales_status', ['prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']);
export const salesStageEnum = pgEnum('sales_stage', ['lead', 'contact', 'meeting', 'demo', 'proposal', 'contract', 'won', 'lost']);

// ============================================================
// STAKEHOLDER ENUMS
// ============================================================

export const stakeholderRoleEnum = pgEnum('stakeholder_role', ['executive', 'manager', 'team_member', 'client', 'vendor', 'consultant', 'other']);
export const stakeholderTypeEnum = pgEnum('stakeholder_type', ['internal', 'external', 'partner']);
export const involvementLevelEnum = pgEnum('involvement_level', ['high', 'medium', 'low', 'minimal']);

// ============================================================
// RESOURCE ENUMS
// ============================================================

export const resourceTypeEnum = pgEnum('resource_type', ['human', 'equipment', 'material', 'software', 'facility', 'other']);
export const resourceStatusEnum = pgEnum('resource_status', ['available', 'in_use', 'maintenance', 'retired', 'archived']);
export const allocationStatusEnum = pgEnum('allocation_status', ['requested', 'approved', 'allocated', 'deallocated', 'rejected']);

// ============================================================
// AUDIT & ACTIVITY ENUMS
// ============================================================

export const activityTypeEnum = pgEnum('activity_type', ['create', 'update', 'delete', 'comment', 'assign', 'status_change']);
export const auditEventTypeEnum = pgEnum('audit_event_type', [
  'login', 'logout', 'login_failed', 'password_reset', 'password_change',
  'user_create', 'user_update', 'user_delete', 'user_role_change',
  'project_create', 'project_update', 'project_delete', 'project_status_change',
  'task_create', 'task_update', 'task_delete', 'task_assign',
  'data_export', 'data_import', 'data_bulk_delete',
  'system_config_change', 'system_backup', 'system_restore'
]);
export const auditSeverityEnum = pgEnum('audit_severity', ['low', 'medium', 'high', 'critical']);

// ============================================================
// MILESTONE ENUMS
// ============================================================

export const milestoneStatusEnum = pgEnum('milestone_status', ['pending', 'in_progress', 'completed', 'cancelled']);

// ============================================================
// RISK ENUMS
// ============================================================

export const riskImpactEnum = pgEnum('risk_impact', ['low', 'medium', 'high', 'critical']);
export const riskProbabilityEnum = pgEnum('risk_probability', ['low', 'medium', 'high', 'very_high']);
export const riskStatusEnum = pgEnum('risk_status', ['open', 'mitigated', 'closed', 'accepted']);

// ============================================================
// GENERIC STATUS ENUM (for backward compatibility)
// ============================================================

export const statusEnum = pgEnum('status', ['todo', 'in_progress', 'in_review', 'done', 'pending', 'approved', 'rejected', 'active', 'inactive']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'urgent']);

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
  isProjectManager: boolean('is_project_manager').default(false),
  isSupervisor: boolean('is_supervisor').default(false),
  notificationPreferences: jsonb('notification_preferences'),
  timezone: text('timezone').default('Asia/Bangkok'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').unique(),
  description: text('description'),
  status: statusEnum('status').notNull().default('todo'),
  progress: integer('progress').default(0), // Actual progress percentage
  progressPlan: integer('progress_plan').default(0), // Planned progress percentage
  spi: numeric('spi', { precision: 5, scale: 2 }).default('1.00'), // Schedule Performance Index
  riskLevel: text('risk_level').default('low'), // Risk level: low, medium, high, critical
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

// Tasks table with self-referential relationship
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
}) as any;

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

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Use interface for Task to allow circular references
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  estimatedHours: string | null;
  actualHours: string;
  weight: string;
  completedAt: Date | null;
  projectId: string;
  assignedTo: string | null;
  createdBy: string;
  parentTaskId: string | null;
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
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(), // 'project', 'task', 'user', etc.
  entityId: text('entity_id').notNull(),
  type: activityTypeEnum('type').notNull(),
  action: text('action').notNull(), // Human-readable description
  description: text('description'),
  userId: uuid('user_id').references(() => users.id).notNull(),
  changes: jsonb('changes'), // JSON object with before/after values
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;

// Comments Table
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// Project Progress History Table
export const projectProgressHistory = pgTable('project_progress_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  progress: integer('progress').notNull(),
  weekDate: timestamp('week_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Financial Data Table
export const financialData = pgTable('financial_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  month: timestamp('month').notNull().unique(),
  revenue: numeric('revenue', { precision: 15, scale: 2 }).default('0.00'),
  cost: numeric('cost', { precision: 15, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Milestones Table (with amount column)
export const milestones = pgTable('milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }),
  status: text('status').notNull().default('pending'),
  progress: integer('progress').default(0),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Risks Table (for dashboard)
export const risks = pgTable('risks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  impact: text('impact').notNull(),
  probability: text('probability').notNull(),
  riskScore: integer('risk_score'),
  mitigationPlan: text('mitigation_plan'),
  status: text('status').notNull().default('open'),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ProjectProgressHistory = typeof projectProgressHistory.$inferSelect;
export type NewProjectProgressHistory = typeof projectProgressHistory.$inferInsert;

export type FinancialData = typeof financialData.$inferSelect;
export type NewFinancialData = typeof financialData.$inferInsert;

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

export type Risk = typeof risks.$inferSelect;
export type NewRisk = typeof risks.$inferInsert;

// Documents Table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type'),
  size: text('size'),
  url: text('url'),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  milestone: text('milestone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Members Table
export const projectMembers = pgTable('project_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;
