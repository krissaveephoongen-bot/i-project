import { relations } from "drizzle-orm/relations";
import { users, activity_log, projects, tasks, expenses, clients, time_entries, comments, budget_revisions, timesheet_approval_actions } from "./schema";

export const activity_logRelations = relations(activity_log, ({one}) => ({
	user: one(users, {
		fields: [activity_log.user_id],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	activity_logs: many(activity_log),
	tasks_assigned_to: many(tasks, {
		relationName: "tasks_assigned_to_users_id"
	}),
	tasks_created_by: many(tasks, {
		relationName: "tasks_created_by_users_id"
	}),
	expenses_user_id: many(expenses, {
		relationName: "expenses_user_id_users_id"
	}),
	expenses_approved_by: many(expenses, {
		relationName: "expenses_approved_by_users_id"
	}),
	projects_manager_id: many(projects, {
		relationName: "projects_manager_id_users_id"
	}),
	projects_userId: many(projects, {
		relationName: "projects_userId_users_id"
	}),
	time_entries_user_id: many(time_entries, {
		relationName: "time_entries_user_id_users_id"
	}),
	time_entries_approved_by: many(time_entries, {
		relationName: "time_entries_approved_by_users_id"
	}),
	time_entries_project_manager_id: many(time_entries, {
		relationName: "time_entries_project_manager_id_users_id"
	}),
	time_entries_supervisor_id: many(time_entries, {
		relationName: "time_entries_supervisor_id_users_id"
	}),
	comments: many(comments),
	budget_revisions: many(budget_revisions),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	project: one(projects, {
		fields: [tasks.project_id],
		references: [projects.id]
	}),
	user_assigned_to: one(users, {
		fields: [tasks.assigned_to],
		references: [users.id],
		relationName: "tasks_assigned_to_users_id"
	}),
	user_created_by: one(users, {
		fields: [tasks.created_by],
		references: [users.id],
		relationName: "tasks_created_by_users_id"
	}),
	task: one(tasks, {
		fields: [tasks.parent_task_id],
		references: [tasks.id],
		relationName: "tasks_parent_task_id_tasks_id"
	}),
	tasks: many(tasks, {
		relationName: "tasks_parent_task_id_tasks_id"
	}),
	expenses: many(expenses),
	time_entries: many(time_entries),
	comments: many(comments),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	tasks: many(tasks),
	expenses: many(expenses),
	user_manager_id: one(users, {
		fields: [projects.manager_id],
		references: [users.id],
		relationName: "projects_manager_id_users_id"
	}),
	client: one(clients, {
		fields: [projects.client_id],
		references: [clients.id]
	}),
	user_userId: one(users, {
		fields: [projects.userId],
		references: [users.id],
		relationName: "projects_userId_users_id"
	}),
	time_entries: many(time_entries),
	budget_revisions: many(budget_revisions),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	project: one(projects, {
		fields: [expenses.project_id],
		references: [projects.id]
	}),
	task: one(tasks, {
		fields: [expenses.task_id],
		references: [tasks.id]
	}),
	user_user_id: one(users, {
		fields: [expenses.user_id],
		references: [users.id],
		relationName: "expenses_user_id_users_id"
	}),
	user_approved_by: one(users, {
		fields: [expenses.approved_by],
		references: [users.id],
		relationName: "expenses_approved_by_users_id"
	}),
}));

export const clientsRelations = relations(clients, ({many}) => ({
	projects: many(projects),
}));

export const time_entriesRelations = relations(time_entries, ({one, many}) => ({
	project: one(projects, {
		fields: [time_entries.project_id],
		references: [projects.id]
	}),
	task: one(tasks, {
		fields: [time_entries.task_id],
		references: [tasks.id]
	}),
	user_user_id: one(users, {
		fields: [time_entries.user_id],
		references: [users.id],
		relationName: "time_entries_user_id_users_id"
	}),
	user_approved_by: one(users, {
		fields: [time_entries.approved_by],
		references: [users.id],
		relationName: "time_entries_approved_by_users_id"
	}),
	user_project_manager_id: one(users, {
		fields: [time_entries.project_manager_id],
		references: [users.id],
		relationName: "time_entries_project_manager_id_users_id"
	}),
	user_supervisor_id: one(users, {
		fields: [time_entries.supervisor_id],
		references: [users.id],
		relationName: "time_entries_supervisor_id_users_id"
	}),
	timesheet_approval_actions: many(timesheet_approval_actions),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	task: one(tasks, {
		fields: [comments.task_id],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [comments.user_id],
		references: [users.id]
	}),
}));

export const budget_revisionsRelations = relations(budget_revisions, ({one}) => ({
	project: one(projects, {
		fields: [budget_revisions.project_id],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [budget_revisions.changed_by],
		references: [users.id]
	}),
}));

export const timesheet_approval_actionsRelations = relations(timesheet_approval_actions, ({one}) => ({
	time_entry: one(time_entries, {
		fields: [timesheet_approval_actions.timesheet_id],
		references: [time_entries.id]
	}),
}));