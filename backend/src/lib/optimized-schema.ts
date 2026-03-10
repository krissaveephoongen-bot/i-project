import { pgTable, text, timestamp, boolean, integer, decimal, index, json, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// ============================================================
// ENHANCED DATABASE SCHEMA WITH OPTIMIZATION
// ============================================================

// ============================================================
// USERS TABLE WITH OPTIMIZATION
// ============================================================

export const users = pgTable('users', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  phone: text('phone'),
  department: text('department'),
  position: text('position'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  emailVerifiedAt: timestamp('email_verified_at'),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => ({
  // Primary indexes for frequently queried columns
  idx_users_email: uniqueIndex('idx_users_email').on(table.email),
  idx_users_active: index('idx_users_active').on(table.isActive),
  idx_users_department: index('idx_users_department').on(table.department),
  idx_users_created_at: index('idx_users_created_at').on(table.createdAt),
  idx_users_deleted_at: index('idx_users_deleted_at').on(table.deletedAt), // Soft delete filter
  // Composite indexes for common queries
  idx_users_active_department: index('idx_users_active_department').on(table.isActive, table.department),
}));

// ============================================================
// PROJECTS TABLE WITH OPTIMIZATION
// ============================================================

export const projects = pgTable('projects', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  projectCode: text('project_code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  clientId: text('client_id').references(() => users.id, { onDelete: 'set null' }),
  managerId: text('manager_id').references(() => users.id, { onDelete: 'set null' }),
  status: text('status').default('planning'),
  priority: text('priority').default('medium'),
  category: text('category').default('software'),
  torSummary: text('tor_summary'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  actualStartDate: timestamp('actual_start_date'),
  actualEndDate: timestamp('actual_end_date'),
  budget: decimal('budget', { precision: 15, scale: 2 }).default('0'),
  actualCost: decimal('actual_cost', { precision: 15, scale: 2 }).default('0'),
  progress: decimal('progress', { precision: 5, scale: 2 }).default('0'),
  health: text('health').default('unknown'),
  isActive: boolean('is_active').default(true),
  archivedAt: timestamp('archived_at'),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => ({
  // Primary indexes
  idx_projects_code: uniqueIndex('idx_projects_code').on(table.projectCode),
  idx_projects_client: index('idx_projects_client').on(table.clientId),
  idx_projects_manager: index('idx_projects_manager').on(table.managerId),
  idx_projects_status: index('idx_projects_status').on(table.status),
  idx_projects_priority: index('idx_projects_priority').on(table.priority),
  idx_projects_category: index('idx_projects_category').on(table.category),
  idx_projects_health: index('idx_projects_health').on(table.health),
  idx_projects_active: index('idx_projects_active').on(table.isActive),
  idx_projects_dates: index('idx_projects_dates').on(table.startDate, table.endDate),
  idx_projects_deleted_at: index('idx_projects_deleted_at').on(table.deletedAt), // Soft delete filter
  
  // Composite indexes for dashboard queries
  idx_projects_status_active: index('idx_projects_status_active').on(table.status, table.isActive),
  idx_projects_client_status: index('idx_projects_client_status').on(table.clientId, table.status),
  idx_projects_manager_status: index('idx_projects_manager_status').on(table.managerId, table.status),
  idx_projects_priority_health: index('idx_projects_priority_health').on(table.priority, table.health),
  
  // Financial aggregation indexes
  idx_projects_budget_cost: index('idx_projects_budget_cost').on(table.budget, table.actualCost),
  idx_projects_progress_health: index('idx_projects_progress_health').on(table.progress, table.health),
}));

// ============================================================
// TASKS TABLE WITH OPTIMIZATION
// ============================================================

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  parentId: text('parent_id').references(() => tasks.id, { onDelete: 'set null' }),
  milestoneId: text('milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
  wbsCode: text('wbs_code').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  status: text('status').default('todo'),
  priority: text('priority').default('medium'),
  estimatedHours: decimal('estimated_hours', { precision: 8, scale: 2 }).default('0'),
  actualHours: decimal('actual_hours', { precision: 8, scale: 2 }).default('0'),
  progress: decimal('progress', { precision: 5, scale: 2 }).default('0'),
  startDate: text('start_date'),
  dueDate: text('due_date'),
  completedAt: timestamp('completed_at'),
  tags: text('tags').$type('json'),
  dependencies: text('dependencies').$type('json'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => ({
  // Primary indexes
  idx_tasks_project: index('idx_tasks_project').on(table.projectId),
  idx_tasks_parent: index('idx_tasks_parent').on(table.parentId),
  idx_tasks_milestone: index('idx_tasks_milestone').on(table.milestoneId),
  idx_tasks_assigned: index('idx_tasks_assigned').on(table.assignedTo),
  idx_tasks_status: index('idx_tasks_status').on(table.status),
  idx_tasks_priority: index('idx_tasks_priority').on(table.priority),
  idx_tasks_wbs: index('idx_tasks_wbs').on(table.wbsCode),
  idx_tasks_active: index('idx_tasks_active').on(table.isActive),
  idx_tasks_deleted_at: index('idx_tasks_deleted_at').on(table.deletedAt), // Soft delete filter
  
  // Composite indexes for dashboard queries
  idx_tasks_project_status: index('idx_tasks_project_status').on(table.projectId, table.status),
  idx_tasks_assigned_status: index('idx_tasks_assigned_status').on(table.assignedTo, table.status),
  idx_tasks_project_priority: index('idx_tasks_project_priority').on(table.projectId, table.priority),
  idx_tasks_milestone_status: index('idx_tasks_milestone_status').on(table.milestoneId, table.status),
  
  // Time and progress indexes
  idx_tasks_dates: index('idx_tasks_dates').on(table.startDate, table.dueDate),
  idx_tasks_progress: index('idx_tasks_progress').on(table.progress),
  idx_tasks_hours: index('idx_tasks_hours').on(table.estimatedHours, table.actualHours),
}));

// ============================================================
// TIMESHEETS TABLE WITH OPTIMIZATION
// ============================================================

export const timesheets = pgTable('timesheets', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  workDate: text('work_date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  breakTime: integer('break_time').default('0'),
  totalHours: decimal('total_hours', { precision: 8, scale: 2 }).notNull(),
  billableHours: decimal('billable_hours', { precision: 8, scale: 2 }).notNull(),
  workType: text('work_type').default('development'),
  description: text('description'),
  hourlyRate: decimal('hourly_rate', { precision: 8, scale: 2 }).notNull(),
  laborCost: decimal('labor_cost', { precision: 15, scale: 2 }).notNull(),
  status: text('status').default('pending'),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => ({
  // Primary indexes
  idx_timesheets_user: index('idx_timesheets_user').on(table.userId),
  idx_timesheets_project: index('idx_timesheets_project').on(table.projectId),
  idx_timesheets_task: index('idx_timesheets_task').on(table.taskId),
  idx_timesheets_date: index('idx_timesheets_date').on(table.workDate),
  idx_timesheets_status: index('idx_timesheets_status').on(table.status),
  idx_timesheets_work_type: index('idx_timesheets_work_type').on(table.workType),
  idx_timesheets_approved_by: index('idx_timesheets_approved_by').on(table.approvedBy),
  idx_timesheets_active: index('idx_timesheets_active').on(table.isActive),
  idx_timesheets_deleted_at: index('idx_timesheets_deleted_at').on(table.deletedAt), // Soft delete filter
  
  // Composite indexes for financial queries
  idx_timesheets_project_date: index('idx_timesheets_project_date').on(table.projectId, table.workDate),
  idx_timesheets_user_date: index('idx_timesheets_user_date').on(table.userId, table.workDate),
  idx_timesheets_project_status: index('idx_timesheets_project_status').on(table.projectId, table.status),
  idx_timesheets_user_status: index('idx_timesheets_user_status').on(table.userId, table.status),
  
  // Cost aggregation indexes
  idx_timesheets_cost: index('idx_timesheets_cost').on(table.laborCost, table.billableHours),
  idx_timesheets_hours: index('idx_timesheets_hours').on(table.totalHours, table.billableHours),
  idx_timesheets_rate: index('idx_timesheets_rate').on(table.hourlyRate, table.laborCost),
}));

// ============================================================
// MILESTONES TABLE WITH OPTIMIZATION
// ============================================================

export const milestones = pgTable('milestones', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  targetDate: text('target_date').notNull(),
  actualDate: timestamp('actual_date'),
  status: text('status').default('pending'),
  priority: text('priority').default('medium'),
  progress: decimal('progress', { precision: 5, scale: 2 }).default('0'),
  deliverables: text('deliverables').$type('json'),
  dependencies: text('dependencies').$type('json'),
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => ({
  // Primary indexes
  idx_milestones_project: index('idx_milestones_project').on(table.projectId),
  idx_milestones_status: index('idx_milestones_status').on(table.status),
  idx_milestones_priority: index('idx_milestones_priority').on(table.priority),
  idx_milestones_assigned: index('idx_milestones_assigned').on(table.assignedTo),
  idx_milestones_target_date: index('idx_milestones_target_date').on(table.targetDate),
  idx_milestones_active: index('idx_milestones_active').on(table.isActive),
  idx_milestones_deleted_at: index('idx_milestones_deleted_at').on(table.deletedAt), // Soft delete filter
  
  // Composite indexes
  idx_milestones_project_status: index('idx_milestones_project_status').on(table.projectId, table.status),
  idx_milestones_project_priority: index('idx_milestones_project_priority').on(table.projectId, table.priority),
  idx_milestones_assigned_status: index('idx_milestones_assigned_status').on(table.assignedTo, table.status),
}));

// ============================================================
// VENDOR CONTRACTS TABLE WITH OPTIMIZATION
// ============================================================

export const vendorContracts = pgTable('vendor_contracts', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  contractNumber: text('contract_number').notNull().unique(),
  contractName: text('contract_name').notNull(),
  contractType: text('contract_type').notNull(),
  vendorName: text('vendor_name').notNull(),
  totalValue: decimal('total_value', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0'),
  currency: text('currency').default('THB'),
  paymentTerms: text('payment_terms').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').default('draft'),
  riskLevel: text('risk_level').default('medium'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at').default(sql`now()`),
  deletedAt: timestamp('deleted_at'), // Soft delete
}, (table) => ({
  // Primary indexes
  idx_vendor_contracts_project: index('idx_vendor_contracts_project').on(table.projectId),
  idx_vendor_contracts_number: uniqueIndex('idx_vendor_contracts_number').on(table.contractNumber),
  idx_vendor_contracts_type: index('idx_vendor_contracts_type').on(table.contractType),
  idx_vendor_contracts_vendor: index('idx_vendor_contracts_vendor').on(table.vendorName),
  idx_vendor_contracts_status: index('idx_vendor_contracts_status').on(table.status),
  idx_vendor_contracts_risk: index('idx_vendor_contracts_risk').on(table.riskLevel),
  idx_vendor_contracts_active: index('idx_vendor_contracts_active').on(table.isActive),
  idx_vendor_contracts_deleted_at: index('idx_vendor_contracts_deleted_at').on(table.deletedAt), // Soft delete filter
  
  // Composite indexes
  idx_vendor_contracts_project_status: index('idx_vendor_contracts_project_status').on(table.projectId, table.status),
  idx_vendor_contracts_project_type: index('idx_vendor_contracts_project_type').on(table.projectId, table.contractType),
  
  // Financial indexes
  idx_vendor_contracts_value: index('idx_vendor_contracts_value').on(table.totalValue, table.paidAmount),
  idx_vendor_contracts_dates: index('idx_vendor_contracts_dates').on(table.startDate, table.endDate),
}));

// ============================================================
// RELATIONSHIPS WITH OPTIMIZATION
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  projectsManaged: many(projects),
  projectsAsClient: many(projects),
  tasksAssigned: many(tasks),
  timesheets: many(timesheets),
  milestonesAssigned: many(milestones),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
  manager: one(users, {
    fields: [projects.managerId],
    references: [users.id],
  }),
  tasks: many(tasks),
  timesheets: many(timesheets),
  milestones: many(milestones),
  vendorContracts: many(vendorContracts),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  parent: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
  }),
  children: many(tasks),
  milestone: one(milestones, {
    fields: [tasks.milestoneId],
    references: [milestones.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  timesheets: many(timesheets),
}));

export const timesheetsRelations = relations(timesheets, ({ one }) => ({
  user: one(users, {
    fields: [timesheets.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [timesheets.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [timesheets.taskId],
    references: [tasks.id],
  }),
  approvedBy: one(users, {
    fields: [timesheets.approvedBy],
    references: [users.id],
  }),
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
  assignedTo: one(users, {
    fields: [milestones.assignedTo],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const vendorContractsRelations = relations(vendorContracts, ({ one, many }) => ({
  project: one(projects, {
    fields: [vendorContracts.projectId],
    references: [projects.id],
  }),
}));

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Timesheet = typeof timesheets.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type VendorContract = typeof vendorContracts.$inferSelect;

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTaskInput = Partial<CreateTaskInput>;

export type CreateTimesheetInput = Omit<Timesheet, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTimesheetInput = Partial<CreateTimesheetInput>;

export type CreateMilestoneInput = Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMilestoneInput = Partial<CreateMilestoneInput>;

export type CreateVendorContractInput = Omit<VendorContract, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVendorContractInput = Partial<CreateVendorContractInput>;

// ============================================================
// SOFT DELETE HELPERS
// ============================================================

export const softDeleteProject = async (projectId: string) => {
  return await db.update(projects)
    .set({ deletedAt: new Date(), isActive: false })
    .where(eq(projects.id, projectId));
};

export const softDeleteTask = async (taskId: string) => {
  return await db.update(tasks)
    .set({ deletedAt: new Date(), isActive: false })
    .where(eq(tasks.id, taskId));
};

export const softDeleteTimesheet = async (timesheetId: string) => {
  return await db.update(timesheets)
    .set({ deletedAt: new Date(), isActive: false })
    .where(eq(timesheets.id, timesheetId));
};

// ============================================================
// AGGREGATION VIEWS FOR OPTIMIZED DASHBOARD QUERIES
// ============================================================

// Project Financial Summary View
export const projectFinancialSummary = sql`
  CREATE OR REPLACE VIEW project_financial_summary AS
  SELECT 
    p.id as project_id,
    p.name as project_name,
    p.status,
    p.priority,
    p.health,
    p.budget,
    COALESCE(SUM(t.labor_cost), 0) as total_labor_cost,
    COALESCE(SUM(vc.total_value), 0) as total_vendor_cost,
    COALESCE(SUM(t.labor_cost), 0) + COALESCE(SUM(vc.total_value), 0) as total_actual_cost,
    p.budget - (COALESCE(SUM(t.labor_cost), 0) + COALESCE(SUM(vc.total_value), 0)) as remaining_budget,
    CASE 
      WHEN p.budget > 0 THEN ((COALESCE(SUM(t.labor_cost), 0) + COALESCE(SUM(vc.total_value), 0)) / p.budget) * 100
      ELSE 0 
    END as budget_utilization_percentage,
    COUNT(DISTINCT t.id) as total_timesheets,
    COUNT(DISTINCT vc.id) as total_contracts,
    COUNT(DISTINCT task.id) as total_tasks,
    COUNT(DISTINCT task.id) FILTER (WHERE task.status = 'completed') as completed_tasks,
    CASE 
      WHEN COUNT(DISTINCT task.id) > 0 THEN (COUNT(DISTINCT task.id) FILTER (WHERE task.status = 'completed') * 100.0 / COUNT(DISTINCT task.id))
      ELSE 0 
    END as task_completion_percentage
  FROM projects p
  LEFT JOIN timesheets t ON p.id = t.project_id AND t.deleted_at IS NULL AND t.status = 'approved'
  LEFT JOIN vendor_contracts vc ON p.id = vc.project_id AND vc.deleted_at IS NULL
  LEFT JOIN tasks task ON p.id = task.project_id AND task.deleted_at IS NULL
  WHERE p.deleted_at IS NULL AND p.is_active = true
  GROUP BY p.id, p.name, p.status, p.priority, p.health, p.budget
`;

// User Performance Summary View
export const userPerformanceSummary = sql`
  CREATE OR REPLACE VIEW user_performance_summary AS
  SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.department,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as completed_projects,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    COUNT(DISTINCT ts.id) as total_timesheets,
    COALESCE(SUM(ts.total_hours), 0) as total_hours_logged,
    COALESCE(SUM(ts.labor_cost), 0) as total_labor_cost,
    COALESCE(AVG(ts.labor_cost), 0) as average_labor_cost,
    COUNT(DISTINCT m.id) as total_milestones,
    COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'completed') as completed_milestones
  FROM users u
  LEFT JOIN projects p ON (u.id = p.manager_id OR u.id = p.client_id) AND p.deleted_at IS NULL
  LEFT JOIN tasks t ON u.id = t.assigned_to AND t.deleted_at IS NULL
  LEFT JOIN timesheets ts ON u.id = ts.user_id AND ts.deleted_at IS NULL AND ts.status = 'approved'
  LEFT JOIN milestones m ON u.id = m.assigned_to AND m.deleted_at IS NULL
  WHERE u.deleted_at IS NULL AND u.is_active = true
  GROUP BY u.id, u.name, u.email, u.department
`;

// Task Progress Summary View
export const taskProgressSummary = sql`
  CREATE OR REPLACE VIEW task_progress_summary AS
  SELECT 
    p.id as project_id,
    p.name as project_name,
    COUNT(t.id) as total_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'todo') as todo_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'urgent') as urgent_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'high') as high_priority_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'medium') as medium_priority_tasks,
    COUNT(t.id) FILTER (WHERE t.priority = 'low') as low_priority_tasks,
    COALESCE(SUM(t.estimated_hours), 0) as total_estimated_hours,
    COALESCE(SUM(t.actual_hours), 0) as total_actual_hours,
    COALESCE(AVG(t.progress), 0) as average_progress,
    CASE 
      WHEN COUNT(t.id) > 0 THEN (COUNT(t.id) FILTER (WHERE t.status = 'completed') * 100.0 / COUNT(t.id))
      ELSE 0 
    END as completion_percentage
  FROM projects p
  LEFT JOIN tasks t ON p.id = t.project_id AND t.deleted_at IS NULL
  WHERE p.deleted_at IS NULL AND p.is_active = true
  GROUP BY p.id, p.name
`;

// Timesheet Analysis View
export const timesheetAnalysis = sql`
  CREATE OR REPLACE VIEW timesheet_analysis AS
  SELECT 
    p.id as project_id,
    p.name as project_name,
    u.id as user_id,
    u.name as user_name,
    u.department,
    DATE_TRUNC('month', ts.work_date) as month,
    COUNT(ts.id) as total_timesheets,
    COALESCE(SUM(ts.total_hours), 0) as total_hours,
    COALESCE(SUM(ts.billable_hours), 0) as billable_hours,
    COALESCE(SUM(ts.labor_cost), 0) as total_cost,
    COUNT(DISTINCT DATE(ts.work_date)) as working_days,
    COALESCE(AVG(ts.total_hours), 0) as average_daily_hours,
    ts.work_type,
    ts.status
  FROM projects p
  JOIN timesheets ts ON p.id = ts.project_id AND ts.deleted_at IS NULL
  JOIN users u ON ts.user_id = u.id AND u.deleted_at IS NULL
  WHERE p.deleted_at IS NULL AND p.is_active = true
  GROUP BY p.id, p.name, u.id, u.name, u.department, DATE_TRUNC('month', ts.work_date), ts.work_type, ts.status
`;

// Milestone Tracking View
export const milestoneTracking = sql`
  CREATE OR REPLACE VIEW milestone_tracking AS
  SELECT 
    p.id as project_id,
    p.name as project_name,
    m.id as milestone_id,
    m.title as milestone_title,
    m.target_date,
    m.actual_date,
    m.status,
    m.priority,
    m.progress,
    m.assigned_to,
    u.name as assigned_to_name,
    CASE 
      WHEN m.actual_date IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (m.actual_date - m.target_date)) / 86400
      ELSE NULL
    END as days_variance,
    CASE 
      WHEN m.status = 'completed' AND m.actual_date IS NOT NULL THEN
        CASE 
          WHEN m.actual_date <= m.target_date THEN 'on_time'
          ELSE 'delayed'
        END
      WHEN m.target_date < CURRENT_DATE AND m.status != 'completed' THEN 'overdue'
      ELSE 'on_track'
    END as timeliness_status
  FROM projects p
  LEFT JOIN milestones m ON p.id = m.project_id AND m.deleted_at IS NULL
  LEFT JOIN users u ON m.assigned_to = u.id AND u.deleted_at IS NULL
  WHERE p.deleted_at IS NULL AND p.is_active = true
`;

// Vendor Contract Analysis View
export const vendorContractAnalysis = sql`
  CREATE OR REPLACE VIEW vendor_contract_analysis AS
  SELECT 
    p.id as project_id,
    p.name as project_name,
    vc.id as contract_id,
    vc.contract_number,
    vc.contract_name,
    vc.contract_type,
    vc.vendor_name,
    vc.total_value,
    vc.paid_amount,
    (vc.total_value - vc.paid_amount) as remaining_amount,
    (vc.paid_amount / vc.total_value * 100) as payment_percentage,
    vc.status,
    vc.risk_level,
    vc.start_date,
    vc.end_date,
    CASE 
      WHEN CURRENT_DATE > vc.end_date AND vc.status != 'completed' THEN 'expired'
      WHEN vc.status = 'completed' THEN 'completed'
      WHEN CURRENT_DATE BETWEEN vc.start_date AND vc.end_date THEN 'active'
      ELSE 'pending'
    END as contract_status
  FROM projects p
  LEFT JOIN vendor_contracts vc ON p.id = vc.project_id AND vc.deleted_at IS NULL
  WHERE p.deleted_at IS NULL AND p.is_active = true
`;

// ============================================================
// DATABASE CONNECTION POOLING CONFIGURATION
// ============================================================

export const dbConfig = {
  // Connection pool settings
  max: 20, // Maximum number of connections in pool
  min: 5,  // Minimum number of connections in pool
  idle: 10000, // Idle timeout for connections (10 seconds)
  acquire: 30000, // Timeout for acquiring connection (30 seconds)
  evict: 1000, // Eviction check interval (1 second)
  
  // Query optimization
  statement_timeout: 30000, // Query timeout (30 seconds)
  query_timeout: 25000, // Query timeout (25 seconds)
  
  // Connection settings
  connectionTimeoutMillis: 2000, // Connection timeout (2 seconds)
  idleTimeoutMillis: 30000, // Idle timeout (30 seconds)
  reapIntervalMillis: 1000, // Reap interval (1 second)
  
  // SSL and security
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Logging
  logging: process.env.NODE_ENV === 'development',
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warn'
};

// ============================================================
// MIGRATION HELPERS
// ============================================================

export const migrationHelpers = {
  // Create indexes for performance
  createPerformanceIndexes: async () => {
    const queries = [
      // Project dashboard indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_dashboard ON projects(status, priority, health, is_active, deleted_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_financial ON projects(budget, actual_cost, is_active, deleted_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_dates_dashboard ON projects(start_date, end_date, is_active, deleted_at)',
      
      // Task dashboard indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_dashboard ON tasks(project_id, status, priority, is_active, deleted_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_dashboard ON tasks(assigned_to, status, is_active, deleted_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_progress_dashboard ON tasks(progress, status, is_active, deleted_at)',
      
      // Timesheet financial indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheets_financial ON timesheets(project_id, status, work_date, labor_cost, is_active, deleted_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheets_user_financial ON timesheets(user_id, status, work_date, labor_cost, is_active, deleted_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheets_cost_analysis ON timesheets(labor_cost, billable_hours, work_type, is_active, deleted_at)',
      
      // User performance indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_performance ON users(department, is_active, deleted_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_projects ON users(id, is_active, deleted_at) WHERE id IN (SELECT manager_id FROM projects UNION SELECT client_id FROM projects)',
      
      // Milestone tracking indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_tracking ON milestones(project_id, status, target_date, is_active, deleted_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_assigned_tracking ON milestones(assigned_to, status, target_date, is_active, deleted_at)',
      
      // Vendor contract indexes
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendor_contracts_analysis ON vendor_contracts(project_id, status, risk_level, total_value, is_active, deleted_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendor_contracts_financial ON vendor_contracts(total_value, paid_amount, is_active, deleted_at)'
    ];
    
    for (const query of queries) {
      try {
        await db.execute(sql.raw(query));
        console.log(`Created index: ${query}`);
      } catch (error) {
        console.error(`Failed to create index: ${query}`, error);
      }
    }
  },
  
  // Create materialized views for complex aggregations
  createMaterializedViews: async () => {
    const views = [
      // Project portfolio summary
      `CREATE MATERIALIZED VIEW IF NOT EXISTS project_portfolio_summary AS
       SELECT 
         p.id,
         p.name,
         p.status,
         p.priority,
         p.health,
         p.budget,
         COALESCE(pfs.total_actual_cost, 0) as total_actual_cost,
         p.budget - COALESCE(pfs.total_actual_cost, 0) as remaining_budget,
         COALESCE(pfs.task_completion_percentage, 0) as task_completion_percentage,
         COALESCE(pfs.budget_utilization_percentage, 0) as budget_utilization_percentage,
         COUNT(DISTINCT CASE WHEN m.status = 'overdue' THEN m.id END) as overdue_milestones,
         COUNT(DISTINCT CASE WHEN vc.contract_status = 'expired' THEN vc.id END) as expired_contracts
       FROM projects p
       LEFT JOIN project_financial_summary pfs ON p.id = pfs.project_id
       LEFT JOIN milestone_tracking m ON p.id = m.project_id
       LEFT JOIN vendor_contract_analysis vc ON p.id = vc.project_id
       WHERE p.deleted_at IS NULL AND p.is_active = true
       GROUP BY p.id, p.name, p.status, p.priority, p.health, p.budget, pfs.total_actual_cost, pfs.task_completion_percentage, pfs.budget_utilization_percentage`,
      
      // User performance dashboard
      `CREATE MATERIALIZED VIEW IF NOT EXISTS user_performance_dashboard AS
       SELECT 
         u.id,
         u.name,
         u.email,
         u.department,
         ups.total_projects,
         ups.completed_projects,
         ups.total_tasks,
         ups.completed_tasks,
         ups.total_hours_logged,
         ups.total_labor_cost,
         ups.average_labor_cost,
         ups.total_milestones,
         ups.completed_milestones,
         CASE 
           WHEN ups.total_tasks > 0 THEN (ups.completed_tasks * 100.0 / ups.total_tasks)
           ELSE 0 
         END as task_completion_rate,
         CASE 
           WHEN ups.total_projects > 0 THEN (ups.completed_projects * 100.0 / ups.total_projects)
           ELSE 0 
         END as project_completion_rate
       FROM users u
       LEFT JOIN user_performance_summary ups ON u.id = ups.user_id
       WHERE u.deleted_at IS NULL AND u.is_active = true
       GROUP BY u.id, u.name, u.email, u.department, ups.total_projects, ups.completed_projects, ups.total_tasks, ups.completed_tasks, ups.total_hours_logged, ups.total_labor_cost, ups.average_labor_cost, ups.total_milestones, ups.completed_milestones`,
      
      // Financial S-Curve data
      `CREATE MATERIALIZED VIEW IF NOT EXISTS financial_s_curve_data AS
       SELECT 
         p.id as project_id,
         p.name as project_name,
         DATE_TRUNC('month', ts.work_date) as month,
         COALESCE(SUM(ts.labor_cost), 0) as monthly_labor_cost,
         COALESCE(SUM(vc.total_value), 0) as monthly_vendor_cost,
         COALESCE(SUM(ts.labor_cost), 0) + COALESCE(SUM(vc.total_value), 0) as monthly_total_cost,
         COALESCE(SUM(CASE WHEN ts.work_date <= p.end_date THEN ts.labor_cost END), 0) as cumulative_labor_cost,
         COALESCE(SUM(CASE WHEN ts.end_date <= DATE_TRUNC('month', ts.work_date) THEN vc.total_value END), 0) as cumulative_vendor_cost,
         COALESCE(SUM(CASE WHEN ts.work_date <= p.end_date THEN ts.labor_cost END), 0) + COALESCE(SUM(CASE WHEN ts.end_date <= DATE_TRUNC('month', ts.work_date) THEN vc.total_value END), 0) as cumulative_total_cost,
         p.budget as planned_budget,
         p.budget * 0.25 as q1_budget,
         p.budget * 0.50 as q2_budget,
         p.budget * 0.75 as q3_budget,
         p.budget as q4_budget
       FROM projects p
       LEFT JOIN timesheets ts ON p.id = ts.project_id AND ts.deleted_at IS NULL AND ts.status = 'approved'
       LEFT JOIN vendor_contracts vc ON p.id = vc.project_id AND vc.deleted_at IS NULL
       WHERE p.deleted_at IS NULL AND p.is_active = true
       GROUP BY p.id, p.name, p.budget, DATE_TRUNC('month', ts.work_date)
       ORDER BY p.id, DATE_TRUNC('month', ts.work_date)`
    ];
    
    for (const view of views) {
      try {
        await db.execute(sql.raw(view));
        console.log(`Created materialized view: ${view.substring(0, 50)}...`);
      } catch (error) {
        console.error(`Failed to create materialized view: ${view.substring(0, 50)}...`, error);
      }
    }
  },
  
  // Refresh materialized views
  refreshMaterializedViews: async () => {
    const views = [
      'project_portfolio_summary',
      'user_performance_dashboard',
      'financial_s_curve_data'
    ];
    
    for (const view of views) {
      try {
        await db.execute(sql.raw(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`));
        console.log(`Refreshed materialized view: ${view}`);
      } catch (error) {
        console.error(`Failed to refresh materialized view: ${view}`, error);
      }
    }
  },
  
  // Create triggers for automatic view refresh
  createViewRefreshTriggers: async () => {
    const triggers = [
      // Trigger for project_portfolio_summary
      `CREATE OR REPLACE FUNCTION refresh_project_portfolio_summary()
       RETURNS TRIGGER AS $$
       BEGIN
         REFRESH MATERIALIZED VIEW CONCURRENTLY project_portfolio_summary;
         RETURN COALESCE(NEW, OLD);
       END;
       $$ LANGUAGE plpgsql;
       
       DROP TRIGGER IF EXISTS trigger_refresh_project_portfolio_summary ON projects;
       CREATE TRIGGER trigger_refresh_project_portfolio_summary
         AFTER INSERT OR UPDATE OR DELETE ON projects
         FOR EACH ROW EXECUTE FUNCTION refresh_project_portfolio_summary();
       
       DROP TRIGGER IF EXISTS trigger_refresh_project_portfolio_summary_tasks ON tasks;
       CREATE TRIGGER trigger_refresh_project_portfolio_summary_tasks
         AFTER INSERT OR UPDATE OR DELETE ON tasks
         FOR EACH ROW EXECUTE FUNCTION refresh_project_portfolio_summary();
       
       DROP TRIGGER IF EXISTS trigger_refresh_project_portfolio_summary_timesheets ON timesheets;
       CREATE TRIGGER trigger_refresh_project_portfolio_summary_timesheets
         AFTER INSERT OR UPDATE OR DELETE ON timesheets
         FOR EACH ROW EXECUTE FUNCTION refresh_project_portfolio_summary();
       
       DROP TRIGGER IF EXISTS trigger_refresh_project_portfolio_summary_vendor_contracts ON vendor_contracts;
       CREATE TRIGGER trigger_refresh_project_portfolio_summary_vendor_contracts
         AFTER INSERT OR UPDATE OR DELETE ON vendor_contracts
         FOR EACH ROW EXECUTE FUNCTION refresh_project_portfolio_summary();`,
      
      // Trigger for user_performance_dashboard
      `CREATE OR REPLACE FUNCTION refresh_user_performance_dashboard()
       RETURNS TRIGGER AS $$
       BEGIN
         REFRESH MATERIALIZED VIEW CONCURRENTLY user_performance_dashboard;
         RETURN COALESCE(NEW, OLD);
       END;
       $$ LANGUAGE plpgsql;
       
       DROP TRIGGER IF EXISTS trigger_refresh_user_performance_dashboard_users ON users;
       CREATE TRIGGER trigger_refresh_user_performance_dashboard_users
         AFTER INSERT OR UPDATE OR DELETE ON users
         FOR EACH ROW EXECUTE FUNCTION refresh_user_performance_dashboard();
       
       DROP TRIGGER IF EXISTS trigger_refresh_user_performance_dashboard_projects ON projects;
       CREATE TRIGGER trigger_refresh_user_performance_dashboard_projects
         AFTER INSERT OR UPDATE OR DELETE ON projects
         FOR EACH ROW EXECUTE FUNCTION refresh_user_performance_dashboard();
       
       DROP TRIGGER IF EXISTS trigger_refresh_user_performance_dashboard_tasks ON tasks;
       CREATE TRIGGER trigger_refresh_user_performance_dashboard_tasks
         AFTER INSERT OR UPDATE OR DELETE ON tasks
         FOR EACH ROW EXECUTE FUNCTION refresh_user_performance_dashboard();
       
       DROP TRIGGER IF EXISTS trigger_refresh_user_performance_dashboard_timesheets ON timesheets;
       CREATE TRIGGER trigger_refresh_user_performance_dashboard_timesheets
         AFTER INSERT OR UPDATE OR DELETE ON timesheets
         FOR EACH ROW EXECUTE FUNCTION refresh_user_performance_dashboard();
       
       DROP TRIGGER IF EXISTS trigger_refresh_user_performance_dashboard_milestones ON milestones;
       CREATE TRIGGER trigger_refresh_user_performance_dashboard_milestones
         AFTER INSERT OR UPDATE OR DELETE ON milestones
         FOR EACH ROW EXECUTE FUNCTION refresh_user_performance_dashboard();`,
      
      // Trigger for financial_s_curve_data
      `CREATE OR REPLACE FUNCTION refresh_financial_s_curve_data()
       RETURNS TRIGGER AS $$
       BEGIN
         REFRESH MATERIALIZED VIEW CONCURRENTLY financial_s_curve_data;
         RETURN COALESCE(NEW, OLD);
       END;
       $$ LANGUAGE plpgsql;
       
       DROP TRIGGER IF EXISTS trigger_refresh_financial_s_curve_data_projects ON projects;
       CREATE TRIGGER trigger_refresh_financial_s_curve_data_projects
         AFTER INSERT OR UPDATE OR DELETE ON projects
         FOR EACH ROW EXECUTE FUNCTION refresh_financial_s_curve_data();
       
       DROP TRIGGER IF EXISTS trigger_refresh_financial_s_curve_data_timesheets ON timesheets;
       CREATE TRIGGER trigger_refresh_financial_s_curve_data_timesheets
         AFTER INSERT OR UPDATE OR DELETE ON timesheets
         FOR EACH ROW EXECUTE FUNCTION refresh_financial_s_curve_data();
       
       DROP TRIGGER IF EXISTS trigger_refresh_financial_s_curve_data_vendor_contracts ON vendor_contracts;
       CREATE TRIGGER trigger_refresh_financial_s_curve_data_vendor_contracts
         AFTER INSERT OR UPDATE OR DELETE ON vendor_contracts
         FOR EACH ROW EXECUTE FUNCTION refresh_financial_s_curve_data();`
    ];
    
    for (const trigger of triggers) {
      try {
        await db.execute(sql.raw(trigger));
        console.log(`Created trigger: ${trigger.substring(0, 50)}...`);
      } catch (error) {
        console.error(`Failed to create trigger: ${trigger.substring(0, 50)}...`, error);
      }
    }
  }
};

// ============================================================
// PERFORMANCE MONITORING
// ============================================================

export const performanceMonitoring = {
  // Query performance analysis
  analyzeSlowQueries: async () => {
    const slowQueries = await db.execute(sql`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements
      WHERE mean_time > 100 -- Queries taking more than 100ms
      ORDER BY mean_time DESC
      LIMIT 10
    `);
    
    return slowQueries;
  },
  
  // Index usage analysis
  analyzeIndexUsage: async () => {
    const indexUsage = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        CASE 
          WHEN idx_scan = 0 THEN 'UNUSED'
          WHEN idx_scan < 10 THEN 'LOW_USAGE'
          WHEN idx_scan < 100 THEN 'MEDIUM_USAGE'
          ELSE 'HIGH_USAGE'
        END as usage_category
      FROM pg_stat_user_indexes
      ORDER BY idx_scan DESC
    `);
    
    return indexUsage;
  },
  
  // Table size analysis
  analyzeTableSizes: async () => {
    const tableSizes = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes,
        pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename) AS index_size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);
    
    return tableSizes;
  }
};

export default {
  users,
  projects,
  tasks,
  timesheets,
  milestones,
  vendorContracts,
  dbConfig,
  migrationHelpers,
  performanceMonitoring,
  softDeleteProject,
  softDeleteTask,
  softDeleteTimesheet
};
