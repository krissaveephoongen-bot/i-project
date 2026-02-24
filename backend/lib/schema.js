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
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'employee', 'vendor']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);
export const approvalActionTypeEnum = pgEnum('approval_action_type', ['project_manager_approval', 'supervisor_approval']);

// Stakeholder/Contact table
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  position: text('position'),
  email: text('email'),
  phone: text('phone'),
  department: text('department'),
  type: text('type').notNull(), // 'client', 'stakeholder', 'team_member'
  clientId: uuid('client_id').references(() => clients.id),
  projectId: uuid('project_id').references(() => projects.id),
  userId: uuid('user_id').references(() => users.id),
  isKeyPerson: boolean('is_key_person').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vendor KPI Criteria
export const vendor_kpi_criteria = pgTable('vendor_kpi_criteria', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  weight: numeric('weight', { precision: 5, scale: 2 }).notNull(), // 0-100
  category: text('category').notNull(), // 'quality', 'timeliness', 'cost', 'communication'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team Structure table
export const teamStructure = pgTable('team_structure', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').notNull(), // 'project_manager', 'team_lead', 'developer', 'designer', etc.
  level: integer('level').notNull().default(1), // 1=PM, 2=Team Lead, 3=Member
  parentId: uuid('parent_id').references(() => teamStructure.id),
  responsibilities: text('responsibilities'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Approval Workflows table
export const approvalWorkflows = pgTable('approval_workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'timesheet', 'expense', 'task', 'purchase_order'
  requiredRole: text('required_role').notNull(), // 'manager', 'admin', 'finance'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Approval Requests table
export const approvalRequests = pgTable('approval_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'timesheet', 'expense', 'task', 'purchase_order'
  requestId: uuid('request_id').notNull(), // ID of the item being approved
  title: text('title').notNull(),
  description: text('description'),
  requestedBy: uuid('requested_by').references(() => users.id).notNull(),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  status: approvalStatusEnum('status').default('pending'),
  priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
  amount: numeric('amount', { precision: 15, scale: 2 }), // For expense/purchase approvals
  currency: text('currency').default('THB'),
  projectId: uuid('project_id').references(() => projects.id),
  workflowId: uuid('workflow_id').references(() => approvalWorkflows.id),
  metadata: jsonb('metadata'), // Additional data specific to approval type
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Approval Actions table
export const approvalActions = pgTable('approval_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestId: uuid('request_id').references(() => approvalRequests.id).notNull(),
  actionBy: uuid('action_by').references(() => users.id).notNull(),
  action: approvalActionTypeEnum('action').notNull(), // 'approve', 'reject', 'request_changes'
  comments: text('comments'),
  actionAt: timestamp('action_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vendors
export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code'),
  type: text('type').notNull(), // 'supplier', 'contractor', 'service'
  category: text('category'),
  status: text('status').default('active'),
  // Contact & identity
  contactPerson: text('contactPerson'),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  taxId: text('taxId'),
  registrationNumber: text('registrationNumber'),
  // Address
  address: text('address'),
  city: text('city'),
  province: text('province'),
  postalCode: text('postalCode'),
  country: text('country'),
  // Banking & payment
  bankAccount: text('bankAccount'),
  bankName: text('bankName'),
  paymentTerms: integer('paymentTerms'),
  creditLimit: numeric('creditLimit', { precision: 15, scale: 2 }),
  // Metrics & notes
  notes: text('notes'),
  overallRating: numeric('overallRating', { precision: 5, scale: 2 }),
  onTimeDeliveryRate: numeric('onTimeDeliveryRate', { precision: 5, scale: 2 }),
  totalProjects: integer('totalProjects').default(0),
  successfulProjects: integer('successfulProjects').default(0),
  // Status flags & timestamps
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Vendor Contracts
export const vendor_contracts = pgTable('vendor_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendorId').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid('projectId').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  contractNumber: text('contractNumber').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type'),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  value: numeric('value', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').default('THB'),
  paymentTerms: text('paymentTerms'),
  paymentSchedule: text('paymentSchedule'),
  status: text('status').default('active'),
  signedDate: timestamp('signedDate'),
  signedBy: uuid('signedBy').references(() => users.id, { onDelete: 'set null' }),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Vendor Payments
export const vendor_payments = pgTable('vendor_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendorId').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  contractId: uuid('contractId').references(() => vendor_contracts.id, { onDelete: 'set null' }),
  projectId: uuid('projectId').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  paymentType: text('paymentType').notNull(), // 'milestone', 'installment', 'final'
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').default('THB'),
  dueDate: timestamp('dueDate').notNull(),
  paidDate: timestamp('paidDate'),
  status: text('status').default('pending'), // 'pending', 'paid', 'overdue', 'cancelled'
  paymentMethod: text('paymentMethod'),
  transactionId: text('transactionId'),
  receiptUrl: text('receiptUrl'),
  description: text('description'),
  installmentNumber: integer('installmentNumber'),
  totalInstallments: integer('totalInstallments'),
  approvedBy: uuid('approvedBy').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approvedAt'),
  rejectedReason: text('rejectedReason'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Vendor KPI Evaluations
export const vendor_kpi_evaluations = pgTable('vendor_kpi_evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }).notNull(),
  contractId: uuid('contract_id').references(() => vendor_contracts.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  evaluationPeriod: text('evaluation_period').notNull(), // 'monthly', 'quarterly', 'project_end'
  qualityScore: numeric('quality_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  timelinessScore: numeric('timeliness_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  costScore: numeric('cost_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  communicationScore: numeric('communication_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  overallScore: numeric('overall_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  comments: text('comments'),
  evaluatedBy: uuid('evaluated_by').references(() => users.id, { onDelete: 'set null' }).notNull(),
  evaluationDate: timestamp('evaluation_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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
  isProjectManager: boolean('is_project_manager').default(false),
  isSupervisor: boolean('is_supervisor').default(false),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lastLogin: timestamp('last_login'),
  lockedUntil: timestamp('locked_until'),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  notificationPreferences: jsonb('notification_preferences'),
  timezone: text('timezone').default('Asia/Bangkok'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clients - must be defined before projects (which references clients.id)
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxId: text('taxId'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
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
  projectManagerApprovalStatus: approvalStatusEnum('project_manager_approval_status').default('pending'),
  projectManagerId: uuid('project_manager_id').references(() => users.id, { onDelete: 'set null' }),
  projectManagerApprovalDate: timestamp('project_manager_approval_date'),
  supervisorApprovalStatus: approvalStatusEnum('supervisor_approval_status').default('pending'),
  supervisorId: uuid('supervisor_id').references(() => users.id, { onDelete: 'set null' }),
  supervisorApprovalDate: timestamp('supervisor_approval_date'),
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

// Expense Items table
export const expense_items = pgTable('expense_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  expenseId: uuid('expense_id').references(() => expenses.id, { onDelete: 'cascade' }).notNull(),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).default('1.00'),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
  vendorItemCode: text('vendor_item_code'),
  vendorInvoice: text('vendor_invoice'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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

// Timesheet Approval Actions Table
export const timesheetApprovalActions = pgTable('timesheet_approval_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  timesheetId: uuid('timesheet_id').references(() => timeEntries.id, { onDelete: 'cascade' }).notNull(),
  actionType: approvalActionTypeEnum('action_type').notNull(),
  previousStatus: approvalStatusEnum('previous_status').notNull(),
  newStatus: approvalStatusEnum('new_status').notNull(),
  changedBy: uuid('changed_by').references(() => users.id, { onDelete: 'set null' }).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
