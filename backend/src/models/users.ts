import { pgTable, text, timestamp, decimal, boolean, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { users } from './users';

// ============================================================
// USERS TABLE
// ============================================================

export const users = pgTable('users', {
  id: text('id').primaryKey().defaultRandom().unique(),
  objectId: text('object_id').unique(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password'),
  
  // Role & Permissions
  role: text('role').default('employee'), // admin, manager, employee
  department: text('department'),
  position: text('position'),
  employeeCode: text('employee_code').unique(),
  
  // Contact
  phone: text('phone'),
  avatar: text('avatar_url'),
  
  // Status
  status: text('status').default('active'),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  
  // Security
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lastLogin: timestamp('last_login'),
  lockedUntil: timestamp('locked_until'),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  
  // Project Management
  isProjectManager: boolean('is_project_manager').default(false),
  isSupervisor: boolean('is_supervisor').default(false),
  
  // Preferences
  notificationPreferences: text('notification_preferences').$type('json'),
  timezone: text('timezone').default('Asia/Bangkok'),
  
  // Financial
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).default('0'),
  
  // Timesheet
  weeklyCapacity: decimal('weekly_capacity', { precision: 5, scale: 2 }).default('40.00'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_users_email',
      columns: [table.email],
      unique: true,
    },
    {
      name: 'idx_users_role',
      columns: [table.role],
    },
    {
      name: 'idx_users_status',
      columns: [table.status],
    },
    {
      name: 'idx_users_active',
      columns: [table.isActive],
    },
  ],
}));

// ============================================================
// CLIENTS TABLE
// ============================================================

export const clients = pgTable('clients', {
  id: text('id').primaryKey().defaultRandom().unique(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxId: text('tax_id'),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
}, (table) => ({
  indexes: [
    {
      name: 'idx_clients_name',
      columns: [table.name],
    },
  ],
}));

// ============================================================
// RELATIONSHIPS
// ============================================================

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

export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
