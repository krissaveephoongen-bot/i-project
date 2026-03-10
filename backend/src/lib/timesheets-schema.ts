import { pgTable, text, timestamp, boolean, integer, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, tasks, projects } from './schema';

// ============================================================
// TIMESHEETS TABLE
// ============================================================

export const timesheets = pgTable('timesheets', {
  id: text('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  
  // Time Entry Details
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  workType: text('work_type').default('project'), // project, office, training, leave, overtime, other
  startTime: text('start_time'), // ISO time string (HH:mm)
  endTime: text('end_time'), // ISO time string (HH:mm)
  hours: decimal('hours', { precision: 5, scale: 2 }).notNull(),
  breakMinutes: integer('break_minutes').default(0), // Break time in minutes
  
  // Description & Notes
  description: text('description').notNull(),
  notes: text('notes'),
  accomplishments: text('accomplishments'), // What was accomplished during this time
  
  // Cost Calculation
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).notNull(), // User's rate at time of entry
  laborCost: decimal('labor_cost', { precision: 12, scale: 2 }).notNull(), // hours * hourlyRate
  currency: text('currency').default('THB'),
  billable: boolean('billable').default(true),
  billableHours: decimal('billable_hours', { precision: 5, scale: 2 }).default('0'),
  chargeAmount: decimal('charge_amount', { precision: 12, scale: 2 }).default('0'),
  
  // Approval Workflow
  status: text('status').default('pending'), // pending, approved, rejected
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  rejectedBy: text('rejected_by').references(() => users.id, { onDelete: 'set null' }),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_timesheets_user',
      columns: [table.userId],
    },
    {
      name: 'idx_timesheets_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_timesheets_task',
      columns: [table.taskId],
    },
    {
      name: 'idx_timesheets_date',
      columns: [table.date],
    },
    {
      name: 'idx_timesheets_status',
      columns: [table.status],
    },
    {
      name: 'idx_timesheets_approved',
      columns: [table.approvedBy],
    },
    {
      name: 'idx_timesheets_user_date',
      columns: [table.userId, table.date],
    },
    {
      name: 'idx_timesheets_project_date',
      columns: [table.projectId, table.date],
    },
    {
      name: 'idx_timesheets_created',
      columns: [table.createdAt],
    },
  ],
}));

// ============================================================
// ACTUAL LABOR COST TABLE (Generated from approved timesheets)
// ============================================================

export const actualLaborCosts = pgTable('actual_labor_costs', {
  id: text('id').primaryKey().defaultRandom(),
  timesheetId: text('timesheet_id').notNull().references(() => timesheets.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  
  // Cost Details
  date: text('date').notNull(),
  hours: decimal('hours', { precision: 5, scale: 2 }).notNull(),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  laborCost: decimal('labor_cost', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('THB'),
  
  // Billing Details
  billable: boolean('billable').default(true),
  billableHours: decimal('billable_hours', { precision: 5, scale: 2 }).default('0'),
  chargeAmount: decimal('charge_amount', { precision: 12, scale: 2 }).default('0'),
  
  // Period Information
  weekStartDate: text('week_start_date'), // Start of the week this entry belongs to
  monthStartDate: text('month_start_date'), // Start of the month this entry belongs to
  quarterStartDate: text('quarter_start_date'), // Start of the quarter this entry belongs to
  yearStartDate: text('year_start_date'), // Start of the year this entry belongs to
  
  // Approval Information
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at').notNull(),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_actual_labor_costs_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_actual_labor_costs_user',
      columns: [table.userId],
    },
    {
      name: 'idx_actual_labor_costs_task',
      columns: [table.taskId],
    },
    {
      name: 'idx_actual_labor_costs_date',
      columns: [table.date],
    },
    {
      name: 'idx_actual_labor_costs_week',
      columns: [table.weekStartDate],
    },
    {
      name: 'idx_actual_labor_costs_month',
      columns: [table.monthStartDate],
    },
    {
      name: 'idx_actual_labor_costs_quarter',
      columns: [table.quarterStartDate],
    },
    {
      name: 'idx_actual_labor_costs_year',
      columns: [table.yearStartDate],
    },
    {
      name: 'idx_actual_labor_costs_approved',
      columns: [table.approvedBy],
    },
    {
      name: 'idx_actual_labor_costs_created',
      columns: [table.createdAt],
    },
  ],
}));

// ============================================================
// TIMESHEET TEMPLATES TABLE (Recurring time entries)
// ============================================================

export const timesheetTemplates = pgTable('timesheet_templates', {
  id: text('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  
  // Template Details
  name: text('name').notNull(),
  description: text('description'),
  workType: text('work_type').default('project'),
  hours: decimal('hours', { precision: 5, scale: 2 }).notNull(),
  billable: boolean('billable').default(true),
  
  // Recurrence Pattern
  recurrenceType: text('recurrence_type'), // daily, weekly, monthly
  recurrenceInterval: integer('recurrence_interval').default(1), // Every X days/weeks/months
  recurrenceDays: text('recurrence_days').$type('json'), // Array of days for weekly recurrence
  recurrenceEndDate: text('recurrence_end_date'), // When recurrence should stop
  
  // Status
  isActive: boolean('is_active').default(true),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_timesheet_templates_user',
      columns: [table.userId],
    },
    {
      name: 'idx_timesheet_templates_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_timesheet_templates_active',
      columns: [table.isActive],
    },
  ],
}));

// ============================================================
// TIMESHEET APPROVAL WORKFLOW TABLE
// ============================================================

export const timesheetApprovals = pgTable('timesheet_approvals', {
  id: text('id').primaryKey().defaultRandom(),
  timesheetId: text('timesheet_id').notNull().references(() => timesheets.id, { onDelete: 'cascade' }),
  
  // Approval Details
  approverId: text('approver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // approved, rejected, returned_for_revision
  comments: text('comments'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_timesheet_approvals_timesheet',
      columns: [table.timesheetId],
    },
    {
      name: 'idx_timesheet_approvals_approver',
      columns: [table.approverId],
    },
    {
      name: 'idx_timesheet_approvals_action',
      columns: [table.action],
    },
    {
      name: 'idx_timesheet_approvals_created',
      columns: [table.createdAt],
    },
  ],
}));

// ============================================================
// RELATIONSHIPS
// ============================================================

export const timesheetsRelations = relations(timesheets, ({ one, many }) => ({
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
  approvedByUser: one(users, {
    fields: [timesheets.approvedBy],
    references: [users.id],
  }),
  rejectedByUser: one(users, {
    fields: [timesheets.rejectedBy],
    references: [users.id],
  }),
  actualLaborCost: one(actualLaborCosts, {
    fields: [actualLaborCosts.timesheetId],
    references: [timesheets.id],
  }),
  approvals: many(timesheetApprovals, {
    relationName: 'timesheet_approvals',
  }),
}));

export const actualLaborCostsRelations = relations(actualLaborCosts, ({ one }) => ({
  timesheet: one(timesheets, {
    fields: [actualLaborCosts.timesheetId],
    references: [timesheets.id],
  }),
  project: one(projects, {
    fields: [actualLaborCosts.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [actualLaborCosts.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [actualLaborCosts.taskId],
    references: [tasks.id],
  }),
  approvedByUser: one(users, {
    fields: [actualLaborCosts.approvedBy],
    references: [users.id],
  }),
}));

export const timesheetTemplatesRelations = relations(timesheetTemplates, ({ one }) => ({
  user: one(users, {
    fields: [timesheetTemplates.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [timesheetTemplates.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [timesheetTemplates.taskId],
    references: [tasks.id],
  }),
}));

export const timesheetApprovalsRelations = relations(timesheetApprovals, ({ one }) => ({
  timesheet: one(timesheets, {
    fields: [timesheetApprovals.timesheetId],
    references: [timesheets.id],
  }),
  approver: one(users, {
    fields: [timesheetApprovals.approverId],
    references: [users.id],
  }),
}));

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type Timesheet = typeof timesheets.$inferSelect;
export type ActualLaborCost = typeof actualLaborCosts.$inferSelect;
export type TimesheetTemplate = typeof timesheetTemplates.$inferSelect;
export type TimesheetApproval = typeof timesheetApprovals.$inferSelect;

export type TimesheetWithRelations = Timesheet & {
  user?: any;
  project?: any;
  task?: any;
  approvedByUser?: any;
  rejectedByUser?: any;
  actualLaborCost?: ActualLaborCost;
  approvals?: (TimesheetApproval & { approver: any })[];
};

export type CreateTimesheetInput = Omit<Timesheet, 'id' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedAt' | 'rejectedBy' | 'rejectedAt'>;
export type UpdateTimesheetInput = Partial<CreateTimesheetInput>;

export type CreateActualLaborCostInput = Omit<ActualLaborCost, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateActualLaborCostInput = Partial<CreateActualLaborCostInput>;

export type CreateTimesheetTemplateInput = Omit<TimesheetTemplate, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTimesheetTemplateInput = Partial<CreateTimesheetTemplateInput>;

// ============================================================
// CONSTANTS
// ============================================================

export const WORK_TYPES = {
  PROJECT: 'project',
  OFFICE: 'office',
  TRAINING: 'training',
  LEAVE: 'leave',
  OVERTIME: 'overtime',
  OTHER: 'other',
  NON_BILLABLE: 'non_billable',
} as const;

export const TIMESHEET_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const APPROVAL_ACTIONS = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RETURNED_FOR_REVISION: 'returned_for_revision',
} as const;

export const RECURRENCE_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

export const RECURRENCE_DAYS = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
} as const;

// ============================================================
// CALCULATION HELPERS
// ============================================================

export const calculateLaborCost = (hours: number, hourlyRate: number): number => {
  return hours * hourlyRate;
};

export const calculateBillableHours = (hours: number, breakMinutes: number, billable: boolean): number => {
  if (!billable) return 0;
  const breakHours = breakMinutes / 60;
  return Math.max(0, hours - breakHours);
};

export const getWeekStartDate = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

export const getMonthStartDate = (date: Date): string => {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split('T')[0];
};

export const getQuarterStartDate = (date: Date): string => {
  const d = new Date(date);
  const month = d.getMonth();
  const quarter = Math.floor(month / 3);
  d.setMonth(quarter * 3, 1);
  return d.toISOString().split('T')[0];
};

export const getYearStartDate = (date: Date): string => {
  const d = new Date(date);
  d.setMonth(0, 1);
  return d.toISOString().split('T')[0];
};
