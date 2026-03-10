import { pgTable, text, timestamp, decimal, boolean, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { clients } from './clients';

// ============================================================
// PROJECT CORE TABLE
// ============================================================

export const projects = pgTable('projects', {
  id: text('id').primaryKey().defaultRandom().unique(),
  name: text('name').notNull(),
  code: text('code').unique(),
  description: text('description'),
  status: text('status').default('planning'), // planning, active, on_hold, completed, cancelled
  progress: integer('progress').default(0), // 0-100
  progressPlan: integer('progressPlan').default(0), // planned progress
  spi: decimal('spi', { precision: 5, scale: 2 }).default('1.00'), // Schedule Performance Index
  riskLevel: text('riskLevel').default('low'), // low, medium, high, critical
  
  // Timeline
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  actualStartDate: timestamp('actual_start_date'),
  actualEndDate: timestamp('actual_end_date'),
  
  // Financial
  budget: decimal('budget', { precision: 12, scale: 2 }),
  spent: decimal('spent', { precision: 12, scale: 2 }).default('0'),
  remaining: decimal('remaining', { precision: 12, scale: 2 }),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).default('0'),
  
  // Management
  managerId: text('manager_id').references(() => users.id, 'manager'),
  clientId: text('client_id').references(() => clients.id, 'client'),
  priority: text('priority').default('medium'), // low, medium, high, urgent
  category: text('category'),
  
  // Project Lifecycle
  isArchived: boolean('is_archived').default(false),
  warrantyStartDate: timestamp('warranty_start_date'),
  warrantyEndDate: timestamp('warranty_end_date'),
  closureChecklist: text('closure_checklist').$type('json'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_projects_status',
      columns: [table.status],
    },
    {
      name: 'idx_projects_manager',
      columns: [table.managerId],
    },
    {
      name: 'idx_projects_client',
      lines: [table.clientId],
    },
    {
      name: 'idx_projects_dates',
      columns: [table.startDate, table.endDate],
    },
    {
      name: 'idx_projects_progress',
      columns: [table.progress],
    },
  ],
}));

// ============================================================
// PROJECT MEMBERS (Many-to-Many)
// ============================================================

export const projectMembers = pgTable('project_members', {
  id: text('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull().references(() => projects.id, 'onDelete: cascade'),
  userId: text('user_id').notNull().references(() => users.id, 'onDelete: cascade'),
  role: text('role').default('member'), // owner, manager, member, viewer
  joinedAt: timestamp('joined_at').defaultNow(),
  assignedBy: text('assigned_by').references(() => users.id),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_project_members_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_project_members_user',
      columns: [table.userId],
    },
    {
      name: 'idx_project_members_role',
      columns: [table.role],
    },
  ],
}));

// ============================================================
// PROJECT PHASES (Phase Management)
// ============================================================

export const projectPhases = pgTable('project_phases', {
  id: text('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull().references(() => projects.id),
  
  phase: text('phase').notNull(), // initiation, execution, financials, delivery, warranty
  status: text('status').default('not_started'), // not_started, in_progress, completed, blocked
  progress: integer('progress').default(0), // 0-100
  
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  actualStartDate: timestamp('actual_start_date'),
  actualEndDate: timestamp('actual_end_date'),
  
  description: text('description'),
  notes: text('notes'),
  
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_project_phases_project_phase',
      columns: [table.projectId, table.phase],
    },
    {
      name: 'idx_project_phases_status',
      columns: [table.status],
    },
  ],
}));

// ============================================================
// MILESTONES (Payment Terms)
// ============================================================

export const milestones = pgTable('milestones', {
  id: text('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull().references(() => projects.id),
  
  title: text('title').notNull(),
  description: text('description'),
  
  // Financial Details
  amount: decimal('amount', { precision: 12, scale: 2 }),
  currency: text('currency').default('THB'),
  paymentTerms: text('payment_terms'), // 30_days, 60_days, 90_days, upon_completion
  
  // Timeline
  dueDate: timestamp('due_date'),
  actualDate: timestamp('actual_date'),
  invoiceDate: timestamp('invoice_date'),
  receiptDate: timestamp('receipt_date'),
  planReceivedDate: timestamp('plan_received_date'),
  
  // Status
  status: text('status').default('pending'), // pending, invoiced, paid, overdue
  
  // WBS Reference
  wbsCode: text('wbs_code'), // Work Breakdown Structure reference
  
  // Dependencies
  dependencies: text('dependencies').$type('json'), // Array of milestone IDs
  
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_milestones_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_milestones_due_date',
      columns: [table.dueDate],
    },
    {
      name: 'idx_milestones_status',
      columns: [table.status],
    },
    {
      name: 'idx_milestones_wbs',
      columns: [table.wbsCode],
    },
  ],
}));

// ============================================================
// TASKS (Work Breakdown Structure)
// ============================================================

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull().references(() => projects.id),
  
  // Basic Information
  title: text('title').notNull(),
  description: text('description'),
  
  // WBS Structure
  wbsCode: text('wbs_code'), // e.g., "1.1.2"
  parentTaskId: text('parent_task_id').references(() => tasks.id, 'parent_task'),
  level: integer('level').default(1), // WBS hierarchy level
  
  // Classification
  category: text('category'), // development, design, testing, documentation, etc.
  priority: text('priority').default('medium'), // low, medium, high, urgent
  
  // Timeline
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  
  // Effort Estimation
  estimatedHours: decimal('estimated_hours', { precision: 6, scale: 2 }),
  weight: decimal('weight', { precision: 10, scale: 2 }).default('1.00'),
  storyPoints: integer('story_points'),
  
  // Assignment
   assignedTo: text('assigned_to').references(() => users.id),
   createdBy: text('created_by').references(() => users.id),
  
  // Status
  status: text('status').default('todo'), // todo, in_progress, in_review, done, cancelled
  
  // Progress Tracking
  progressActual: integer('progress_actual').default(0), // 0-100
  progressPlan: integer('progress_plan').default(0), // 0-100
  
  // Relationships
  milestoneId: text('milestone_id').references(() => milestones.id, 'milestone'),
  
  // Metadata
  tags: text('tags').$type('json'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_tasks_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_tasks_assigned_to',
      columns: [table.assignedTo],
    },
    {
      name: 'idx_tasks_status',
      columns: [table.status],
    },
    {
      name: 'idx_tasks_wbs',
      columns: [table.wbsCode],
    },
    {
      name: 'idx_tasks_milestone',
      columns: [table.milestoneId],
    },
    {
      name: 'idx_tasks_dates',
      columns: [table.startDate, table.endDate, table.dueDate],
    },
    {
      name: 'idx_tasks_parent',
      columns: [table.parentTaskId],
    },
    {
      name: 'idx_tasks_priority',
      columns: [table.priority],
    },
  ],
}));

// ============================================================
// TIMESHEETS (Time Tracking)
// ============================================================

export const timesheets = pgTable('timesheets', {
  id: text('id').primaryKey().defaultRandom(),
  projectId: text('project_id').references(() => projects.id),
  taskId: text('task_id').references(() => tasks.id),
  
  // Time Entry Details
  date: timestamp('date').notNull(),
  workType: text('work_type').notNull(), // project, office, training, leave, overtime, other
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  hours: decimal('hours', { precision: 5, scale: 2 }).notNull(),
  
  // Description
  description: text('description'),
  
  // Status
  status: text('status').default('pending'), // pending, approved, rejected
  
  // Approval
  approvedBy: text('approved_by').references(() => users.id, 'approved_by'),
  approvedAt: timestamp('approved_at'),
  
  // Billing
  billable: boolean('billable').default(true),
  chargeAmount: decimal('charge_amount', { precision: 12, scale: 2 }),
  billableHours: decimal('billable_hours', { precision: 5, scale: 2 }),
  
  // User
  userId: text('user_id').notNull().references(() => users.id, 'user_id'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_timesheets_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_timesheets_task',
      columns: [table.taskId],
    },
    {
      name: 'idx_timesheets_user_date',
      columns: [table.userId, table.date],
    },
    {
      name: 'idx_timesheets_status',
      columns: [table.status],
    },
    {
      name: 'idx_timesheets_billable',
      columns: [table.billable],
    },
    {
      name: 'idx_timesheets_date',
      columns: [table.date],
    },
  ],
}));

// ============================================================
// EXPENSES (Cost Tracking)
// ============================================================

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull().references(() => projects.id),
  taskId: text('task_id').references(() => tasks.id),
  
  // Expense Details
   date: timestamp('date').notNull(),
   amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
   category: text('category').notNull(), // travel, supplies, equipment, training, other
   
   // Description
   description: text('description').notNull(),
   receiptUrl: text('receipt_url'),
   
   // Status
   status: text('status').default('pending'), // pending, approved, rejected
   
   // Approval
   approvedBy: text('approved_by').references(() => users.id),
   approvedAt: timestamp('approved_at'),
   rejectedReason: text('rejected_reason'),
   
   // User
   userId: text('user_id').notNull().references(() => users.id),
  
  // Additional Details
  details: text('details').$type('json'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_expenses_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_expenses_task',
      columns: [table.taskId],
    },
    {
      name: 'idx_expenses_user',
      columns: [table.userId],
    },
    {
      name: 'idx_expenses_date',
      columns: [table.date],
    },
    {
      name: 'idx_expenses_category',
      columns: [table.category],
    },
    {
      name: 'idx_expenses_status',
      columns: [table.status],
    },
  ],
}));

// ============================================================
// PROJECT PROGRESS HISTORY (For S-Curve)
// ============================================================

export const projectProgressHistory = pgTable('project_progress_history', {
  id: text('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull().references(() => projects.id),
  
  // Week-based tracking
  weekDate: timestamp('week_date').notNull(),
  progress: integer('progress').notNull(), // 0-100
  progressPlan: integer('progress_plan').notNull(), // 0-100
  
  // Calculated metrics
  spi: decimal('spi', { precision: 5, scale: 2 }), // Schedule Performance Index
  cpi: decimal('cpi', { precision: 5, scale: 2 }), // Cost Performance Index
  
  // Task counts
  totalTasks: integer('total_tasks').default(0),
  completedTasks: integer('completed_tasks').default(0),
  inProgressTasks: integer('in_progress_tasks').default(0),
  
  // Financial metrics
  totalBudget: decimal('total_budget', { precision: 12, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 12, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_project_progress_history_project_week',
      columns: [table.projectId, table.weekDate],
    },
    {
      name: 'idx_project_progress_history_date',
      columns: [table.weekDate],
    },
  ],
}));

// ============================================================
// RELATIONSHIPS
// ============================================================

export const projectsRelations = relations(projects, ({ many }) => ({
  manager: one(users, {
    relationName: 'manager',
  }),
  client: one(clients, {
    relationName: 'client',
  }),
  members: many(projectMembers, {
    relationName: 'project_members',
  }),
  phases: many(projectPhases, {
      relationName: 'project_phases',
    }),
  milestones: many(milestones, {
      relationName: 'project_milestones',
    }),
  tasks: many(tasks, {
      relationName: 'project_tasks',
    }),
  timesheets: many(timesheets, {
      relationName: 'project_timesheets',
    }),
  expenses: many(expenses, {
      relationName: 'project_expenses',
    }),
  progressHistory: many(projectProgressHistory, {
      relationName: 'project_progress_history',
  }),
}));

export const milestonesRelations = relations(milestones, ({ many }) => ({
  project: one(projects, {
    relationName: 'project_milestones',
  }),
  tasks: many(tasks, {
    relationName: 'milestone_tasks',
  }),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  project: one(projects, {
    relationName: 'project_tasks',
  }),
  milestone: one(milestones, {
    relationName: 'milestone_tasks',
  }),
  parentTask: one(tasks, {
    field: [tasks.parentTaskId],
    relationName: 'parent_task',
  }),
  subtasks: many(tasks, {
    field: [tasks.parentTaskId],
    relationName: 'parent_task',
  }),
  assignedUser: one(users, {
    relationName: 'assigned_to',
  }),
  createdBy: one(users, {
    relationName: 'created_by',
  }),
  timesheets: many(timesheets, {
    relationName: 'task_timesheets',
  }),
  expenses: many(expenses, {
    relationName: 'task_expenses',
  }),
}));

export const timesheetsRelations = relations(timesheets, ({ many }) => ({
  project: one(projects, {
    relationName: 'project_timesheets',
  }),
  task: one(tasks, {
    relationName: 'task_timesheets',
  }),
  user: one(users, {
    relationName: 'user_id',
  }),
  approvedBy: one(users, {
    relationName: 'approved_by',
  }),
}));

export const expensesRelations = relations(expenses, ({ many }) => ({
  project: one(projects, {
    relationName: 'project_expenses',
  }),
  task: one(tasks, {
    relationName: 'task_expenses',
  }),
  user: one(users, {
    relationName: 'user_id',
  }),
  approvedBy: one(users, {
    relationName: 'approved_by',
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ many }) => ({
  project: one(projects, {
    relationName: 'project_members',
  }),
  user: one(users, {
    relationName: 'user_id',
  }),
  assignedBy: one(users, {
    relationName: 'assigned_by',
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  managedProjects: many(projects, {
    relationName: 'manager',
  }),
  projectMemberships: many(projectMembers, {
    relationName: 'user_id',
  }),
  assignedTasks: many(tasks, {
    relationName: 'assigned_to',
  }),
  createdProjects: many(projects, {
    relationName: 'created_by',
  }),
  timesheets: many(timesheets, {
    relationName: 'user_id',
  }),
  expenses: many(expenses, {
    relationName: 'user_id',
  }),
  approvedTimesheets: many(timesheets, {
    relationName: 'approved_by',
  }),
  approvedExpenses: many(expenses, {
    relationName: 'approved_by',
  }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects, {
    relationName: 'client',
  }),
}));

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type Project = typeof projects.$inferSelect;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type ProjectPhase = typeof projectPhases.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Timesheet = typeof timesheets.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ProjectProgressHistory = typeof projectProgressHistory.$inferSelect;

export type ProjectWithRelations = Project & {
  members: ProjectMember[];
  phases: ProjectPhase[];
  milestones: Milestone[];
  tasks: Task[];
  timesheets: Timesheet[];
  expenses: Expense[];
  progressHistory: ProjectProgressHistory[];
  manager: {
    id: string;
    name: string;
    email: string;
  } | null;
  client: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type TaskWithRelations = Task & {
  project: {
    id: string;
    name: string;
  };
  milestone: Milestone | null;
  parentTask: Task | null;
  subtasks: Task[];
  assignedUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  timesheets: Timesheet[];
  expenses: Expense[];
};

export type MilestoneWithRelations = Milestone & {
  project: {
    id: string;
    name: string;
  };
  tasks: Task[];
};

export type TimesheetWithRelations = Timesheet & {
  project: {
    id: string;
    name: string;
  };
  task: Task | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type ExpenseWithRelations = Expense & {
  project: {
    id: string;
    name: string;
  };
  task: Task | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};
