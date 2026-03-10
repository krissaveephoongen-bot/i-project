import { pgTable, text, timestamp, boolean, integer, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects, users, milestones } from './schema';

// ============================================================
// TASKS TABLE (WBS - Work Breakdown Structure)
// ============================================================

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  milestoneId: text('milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
  
  // Task Details
  title: text('title').notNull(),
  description: text('description'),
  wbsCode: text('wbs_code'), // Work Breakdown Structure code (e.g., 1.1.1, 1.2.3)
  parentTaskId: text('parent_task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  level: integer('level').default(1), // Hierarchy level (1, 2, 3, etc.)
  
  // Classification
  category: text('category'), // e.g., 'development', 'design', 'testing', 'documentation'
  priority: text('priority').default('medium'), // low, medium, high, urgent
  tags: text('tags').$type('json'), // Array of tag strings
  
  // Timeline
  startDate: text('start_date'), // ISO date string
  endDate: text('end_date'), // ISO date string
  dueDate: text('due_date'), // ISO date string
  completedAt: text('completed_at'), // ISO timestamp
  
  // Effort Estimation
  estimatedHours: decimal('estimated_hours', { precision: 5, scale: 2 }).default('0.00'),
  actualHours: decimal('actual_hours', { precision: 5, scale: 2 }).default('0.00'),
  weight: decimal('weight', { precision: 3, scale: 2 }).default('1.00'), // Task weight for progress calculation
  storyPoints: integer('story_points'), // Agile story points
  
  // Assignment
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  
  // Status Tracking
  status: text('status').default('todo'), // todo, in_progress, in_review, done, cancelled, blocked
  progressActual: integer('progress_actual').default(0), // 0-100
  progressPlan: integer('progress_plan').default(0), // 0-100
  
  // Dependencies
  dependencies: text('dependencies').$type('json'), // Array of task IDs this task depends on
  blockers: text('blockers').$type('json'), // Array of task IDs blocking this task
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_tasks_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_tasks_milestone',
      columns: [table.milestoneId],
    },
    {
      name: 'idx_tasks_status',
      columns: [table.status],
    },
    {
      name: 'idx_tasks_assigned',
      columns: [table.assignedTo],
    },
    {
      name: 'idx_tasks_parent',
      columns: [table.parentTaskId],
    },
    {
      name: 'idx_tasks_wbs',
      columns: [table.wbsCode],
    },
    {
      name: 'idx_tasks_priority',
      columns: [table.priority],
    },
    {
      name: 'idx_tasks_due_date',
      columns: [table.dueDate],
    },
    {
      name: 'idx_tasks_created_by',
      columns: [table.createdBy],
    },
  ],
}));

// ============================================================
// TASK DEPENDENCIES TABLE (Explicit dependency tracking)
// ============================================================

export const taskDependencies = pgTable('task_dependencies', {
  id: text('id').primaryKey().defaultRandom(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  dependsOnTaskId: text('depends_on_task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  
  dependencyType: text('dependency_type').default('finish_to_start'), // finish_to_start, start_to_start, finish_to_finish, start_to_finish
  lagDays: integer('lag_days').default(0), // Days of lag between tasks
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_task_deps_task',
      columns: [table.taskId],
    },
    {
      name: 'idx_task_deps_depends_on',
      columns: [table.dependsOnTaskId],
    },
    {
      name: 'idx_task_deps_type',
      columns: [table.dependencyType],
    },
  ],
}));

// ============================================================
// TASK COMMENTS TABLE
// ============================================================

export const taskComments = pgTable('task_comments', {
  id: text('id').primaryKey().defaultRandom(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  comment: text('comment').notNull(),
  commentType: text('comment_type').default('general'), // general, status_update, issue, resolution
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_task_comments_task',
      columns: [table.taskId],
    },
    {
      name: 'idx_task_comments_user',
      columns: [table.userId],
    },
    {
      name: 'idx_task_comments_type',
      columns: [table.commentType],
    },
    {
      name: 'idx_task_comments_created',
      columns: [table.createdAt],
    },
  ],
}));

// ============================================================
// TASK ATTACHMENTS TABLE
// ============================================================

export const taskAttachments = pgTable('task_attachments', {
  id: text('id').primaryKey().defaultRandom(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  filePath: text('file_path').notNull(),
  
  description: text('description'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_task_attachments_task',
      columns: [table.taskId],
    },
    {
      name: 'idx_task_attachments_uploaded_by',
      columns: [table.uploadedBy],
    },
    {
      name: 'idx_task_attachments_created',
      columns: [table.createdAt],
    },
  ],
}));

// ============================================================
// TASK TIME LOGS TABLE
// ============================================================

export const taskTimeLogs = pgTable('task_time_logs', {
  id: text('id').primaryKey().defaultRandom(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  hours: decimal('hours', { precision: 5, scale: 2 }).notNull(),
  description: text('description'),
  
  // Approval
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_task_time_logs_task',
      columns: [table.taskId],
    },
    {
      name: 'idx_task_time_logs_user',
      columns: [table.userId],
    },
    {
      name: 'idx_task_time_logs_start_time',
      columns: [table.startTime],
    },
    {
      name: 'idx_task_time_logs_approved',
      columns: [table.approvedBy],
    },
  ],
}));

// ============================================================
// RELATIONSHIPS
// ============================================================

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  milestone: one(milestones, {
    fields: [tasks.milestoneId],
    references: [milestones.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
  }),
  subtasks: many(tasks, {
    relationName: 'task_subtasks',
  }),
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
  dependencies: many(taskDependencies, {
    relationName: 'task_dependencies',
  }),
  dependents: many(taskDependencies, {
    relationName: 'task_dependents',
  }),
  comments: many(taskComments, {
    relationName: 'task_comments',
  }),
  attachments: many(taskAttachments, {
    relationName: 'task_attachments',
  }),
  timeLogs: many(taskTimeLogs, {
    relationName: 'task_time_logs',
  }),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
  }),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskComments.userId],
    references: [users.id],
  }),
}));

export const taskAttachmentsRelations = relations(taskAttachments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAttachments.taskId],
    references: [tasks.id],
  }),
  uploadedByUser: one(users, {
    fields: [taskAttachments.uploadedBy],
    references: [users.id],
  }),
}));

export const taskTimeLogsRelations = relations(taskTimeLogs, ({ one }) => ({
  task: one(tasks, {
    fields: [taskTimeLogs.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskTimeLogs.userId],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [taskTimeLogs.approvedBy],
    references: [users.id],
  }),
}));

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type Task = typeof tasks.$inferSelect;
export type TaskDependency = typeof taskDependencies.$inferSelect;
export type TaskComment = typeof taskComments.$inferSelect;
export type TaskAttachment = typeof taskAttachments.$inferSelect;
export type TaskTimeLog = typeof taskTimeLogs.$inferSelect;

export type TaskWithRelations = Task & {
  project?: any;
  milestone?: any;
  parentTask?: Task | null;
  subtasks?: Task[];
  assignedUser?: any;
  createdByUser?: any;
  dependencies?: (TaskDependency & { dependsOnTask: Task })[];
  dependents?: (TaskDependency & { task: Task })[];
  comments?: (TaskComment & { user: any })[];
  attachments?: TaskAttachment[];
  timeLogs?: (TaskTimeLog & { user: any; approvedByUser?: any })[];
};

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTaskInput = Partial<CreateTaskInput>;

// ============================================================
// CONSTANTS
// ============================================================

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked',
} as const;

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TASK_CATEGORIES = {
  DEVELOPMENT: 'development',
  DESIGN: 'design',
  TESTING: 'testing',
  DOCUMENTATION: 'documentation',
  PLANNING: 'planning',
  DEPLOYMENT: 'deployment',
  MAINTENANCE: 'maintenance',
  RESEARCH: 'research',
} as const;

export const DEPENDENCY_TYPES = {
  FINISH_TO_START: 'finish_to_start', // Task B cannot start until Task A finishes
  START_TO_START: 'start_to_start', // Task B cannot start until Task A starts
  FINISH_TO_FINISH: 'finish_to_finish', // Task B cannot finish until Task A finishes
  START_TO_FINISH: 'start_to_finish', // Task B cannot finish until Task A starts
} as const;

export const COMMENT_TYPES = {
  GENERAL: 'general',
  STATUS_UPDATE: 'status_update',
  ISSUE: 'issue',
  RESOLUTION: 'resolution',
} as const;

// ============================================================
// KANBAN COLUMNS
// ============================================================

export const KANBAN_COLUMNS = [
  { id: TASK_STATUSES.TODO, title: 'To Do', color: 'bg-gray-500' },
  { id: TASK_STATUSES.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-500' },
  { id: TASK_STATUSES.IN_REVIEW, title: 'Review', color: 'bg-yellow-500' },
  { id: TASK_STATUSES.DONE, title: 'Done', color: 'bg-green-500' },
  { id: TASK_STATUSES.BLOCKED, title: 'Blocked', color: 'bg-red-500' },
] as const;
