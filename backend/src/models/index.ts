import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { users } from './users';

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
