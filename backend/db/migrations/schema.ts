import { pgTable, index, foreignKey, uuid, text, jsonb, timestamp, numeric, integer, unique, boolean, time, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const activity_type = pgEnum("activity_type", ['create', 'update', 'delete', 'comment', 'assign', 'status_change'])
export const approval_action_type = pgEnum("approval_action_type", ['project_manager_approval', 'supervisor_approval'])
export const approval_status = pgEnum("approval_status", ['pending', 'approved', 'rejected'])
export const expense_category = pgEnum("expense_category", ['travel', 'supplies', 'equipment', 'training', 'other'])
export const expense_status = pgEnum("expense_status", ['pending', 'approved', 'rejected', 'reimbursed'])
export const priority = pgEnum("priority", ['low', 'medium', 'high'])
export const status = pgEnum("status", ['todo', 'in_progress', 'in_review', 'done', 'pending', 'approved', 'rejected', 'active', 'inactive'])
export const user_role = pgEnum("user_role", ['admin', 'manager', 'employee'])
export const work_type = pgEnum("work_type", ['project', 'office', 'other'])


export const activity_log = pgTable("activity_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	entity_type: text().notNull(),
	entity_id: text().notNull(),
	type: activity_type().notNull(),
	action: text().notNull(),
	description: text(),
	user_id: uuid().notNull(),
	changes: jsonb(),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_activity_entity_type").using("btree", table.entity_type.asc().nullsLast().op("text_ops"), table.entity_id.asc().nullsLast().op("text_ops")),
	index("idx_activity_log_created_at").using("btree", table.created_at.asc().nullsLast().op("timestamp_ops")),
	index("idx_activity_log_entity").using("btree", table.entity_type.asc().nullsLast().op("text_ops"), table.entity_id.asc().nullsLast().op("text_ops")),
	index("idx_activity_log_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	index("idx_activity_user_created").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.created_at.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "activity_log_user_id_users_id_fk"
		}),
]);

export const tasks = pgTable("tasks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	status: status().default('todo').notNull(),
	priority: priority().default('medium').notNull(),
	due_date: timestamp({ mode: 'string' }),
	estimated_hours: numeric({ precision: 6, scale:  2 }),
	actual_hours: numeric({ precision: 6, scale:  2 }).default('0.00'),
	weight: numeric({ precision: 10, scale:  2 }).default('1.00'),
	completed_at: timestamp({ mode: 'string' }),
	project_id: uuid().notNull(),
	assigned_to: uuid(),
	created_by: uuid().notNull(),
	parent_task_id: uuid(),
	category: text(),
	story_points: integer(),
	sprint_id: uuid(),
	blocked_by: uuid(),
	blocked_reason: text(),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_tasks_assigned_status").using("btree", table.assigned_to.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("uuid_ops")),
	index("idx_tasks_assigned_to").using("btree", table.assigned_to.asc().nullsLast().op("uuid_ops")),
	index("idx_tasks_created_by").using("btree", table.created_by.asc().nullsLast().op("uuid_ops")),
	index("idx_tasks_due_date_status").using("btree", table.due_date.asc().nullsLast().op("timestamp_ops"), table.status.asc().nullsLast().op("timestamp_ops")),
	index("idx_tasks_project_assigned").using("btree", table.project_id.asc().nullsLast().op("uuid_ops"), table.assigned_to.asc().nullsLast().op("uuid_ops")),
	index("idx_tasks_project_id").using("btree", table.project_id.asc().nullsLast().op("uuid_ops")),
	index("idx_tasks_project_status").using("btree", table.project_id.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("uuid_ops")),
	index("idx_tasks_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_tasks_title_gin").using("gin", sql`to_tsvector('english'::regconfig, title)`),
	index("idx_tasks_title_trgm").using("gin", table.title.asc().nullsLast().op("gin_trgm_ops")),
	foreignKey({
			columns: [table.project_id],
			foreignColumns: [projects.id],
			name: "tasks_project_id_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assigned_to],
			foreignColumns: [users.id],
			name: "tasks_assigned_to_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.created_by],
			foreignColumns: [users.id],
			name: "tasks_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parent_task_id],
			foreignColumns: [table.id],
			name: "tasks_parent_task_id_tasks_id_fk"
		}).onDelete("cascade"),
]);

export const expenses = pgTable("expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	project_id: uuid().notNull(),
	task_id: uuid(),
	user_id: uuid().notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	category: expense_category().notNull(),
	description: text().notNull(),
	receipt_url: text(),
	status: expense_status().default('pending').notNull(),
	approved_by: uuid(),
	approved_at: timestamp({ mode: 'string' }),
	notes: text(),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_expenses_category").using("btree", table.category.asc().nullsLast().op("enum_ops")),
	index("idx_expenses_pending").using("btree", table.created_at.asc().nullsLast().op("timestamp_ops")).where(sql`(status = 'pending'::expense_status)`),
	index("idx_expenses_project_id").using("btree", table.project_id.asc().nullsLast().op("uuid_ops")),
	index("idx_expenses_project_status").using("btree", table.project_id.asc().nullsLast().op("uuid_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_expenses_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_expenses_user_date").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.date.asc().nullsLast().op("uuid_ops")),
	index("idx_expenses_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	index("idx_expenses_user_status").using("btree", table.user_id.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.project_id],
			foreignColumns: [projects.id],
			name: "expenses_project_id_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.task_id],
			foreignColumns: [tasks.id],
			name: "expenses_task_id_tasks_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "expenses_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.approved_by],
			foreignColumns: [users.id],
			name: "expenses_approved_by_users_id_fk"
		}).onDelete("set null"),
]);

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	code: text(),
	description: text(),
	status: status().default('todo').notNull(),
	start_date: timestamp({ mode: 'string' }),
	end_date: timestamp({ mode: 'string' }),
	budget: numeric({ precision: 12, scale:  2 }),
	spent: numeric({ precision: 12, scale:  2 }).default('0.00'),
	remaining: numeric({ precision: 12, scale:  2 }).default('0.00'),
	manager_id: uuid(),
	client_id: uuid(),
	hourly_rate: numeric({ precision: 10, scale:  2 }).default('0.00'),
	priority: text().default('medium'),
	category: text(),
	is_archived: boolean().default(false),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	userId: uuid(),
}, (table) => [
	index("idx_projects_active").using("btree", table.created_at.asc().nullsLast().op("timestamp_ops")).where(sql`((is_archived = false) AND (status <> ALL (ARRAY['done'::status, 'inactive'::status])))`),
	index("idx_projects_client_id").using("btree", table.client_id.asc().nullsLast().op("uuid_ops")),
	index("idx_projects_code_gin").using("gin", sql`to_tsvector('english'::regconfig, code)`),
	index("idx_projects_code_trgm").using("gin", table.code.asc().nullsLast().op("gin_trgm_ops")),
	index("idx_projects_manager_id").using("btree", table.manager_id.asc().nullsLast().op("uuid_ops")),
	index("idx_projects_manager_status").using("btree", table.manager_id.asc().nullsLast().op("uuid_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_projects_name_gin").using("gin", sql`to_tsvector('english'::regconfig, name)`),
	index("idx_projects_name_trgm").using("gin", table.name.asc().nullsLast().op("gin_trgm_ops")),
	index("idx_projects_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_projects_status_archived").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.is_archived.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.manager_id],
			foreignColumns: [users.id],
			name: "projects_manager_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.client_id],
			foreignColumns: [clients.id],
			name: "projects_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "projects_userId_fkey"
		}),
	unique("projects_code_unique").on(table.code),
]);

export const clients = pgTable("clients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text(),
	phone: text(),
	address: text(),
	tax_id: text(),
	notes: text(),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_clients_name_gin").using("gin", sql`to_tsvector('english'::regconfig, name)`),
	index("idx_clients_name_trgm").using("gin", table.name.asc().nullsLast().op("gin_trgm_ops")),
]);

export const time_entries = pgTable("time_entries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	work_type: work_type().notNull(),
	project_id: uuid(),
	task_id: uuid(),
	user_id: uuid().notNull(),
	start_time: time().notNull(),
	end_time: time(),
	hours: numeric({ precision: 5, scale:  2 }).notNull(),
	description: text(),
	status: status().default('pending').notNull(),
	approved_by: uuid(),
	approved_at: timestamp({ mode: 'string' }),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	project_manager_approval_status: approval_status(),
	project_manager_id: uuid(),
	project_manager_approval_date: timestamp({ mode: 'string' }),
	supervisor_approval_status: approval_status(),
	supervisor_id: uuid(),
	supervisor_approval_date: timestamp({ mode: 'string' }),
}, (table) => [
	index("idx_time_entries_date").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
	index("idx_time_entries_pending").using("btree", table.created_at.asc().nullsLast().op("timestamp_ops")).where(sql`(status = 'pending'::status)`),
	index("idx_time_entries_project_id").using("btree", table.project_id.asc().nullsLast().op("uuid_ops")),
	index("idx_time_entries_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_time_entries_task_id").using("btree", table.task_id.asc().nullsLast().op("uuid_ops")),
	index("idx_time_entries_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	index("idx_time_pm_status").using("btree", table.project_manager_approval_status.asc().nullsLast().op("enum_ops"), table.project_manager_id.asc().nullsLast().op("enum_ops")),
	index("idx_time_project_date").using("btree", table.project_id.asc().nullsLast().op("timestamp_ops"), table.date.asc().nullsLast().op("uuid_ops")),
	index("idx_time_project_status").using("btree", table.project_id.asc().nullsLast().op("uuid_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_time_supervisor_status").using("btree", table.supervisor_approval_status.asc().nullsLast().op("enum_ops"), table.supervisor_id.asc().nullsLast().op("enum_ops")),
	index("idx_time_user_date").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.date.asc().nullsLast().op("uuid_ops")),
	index("idx_time_user_status").using("btree", table.user_id.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.project_id],
			foreignColumns: [projects.id],
			name: "time_entries_project_id_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.task_id],
			foreignColumns: [tasks.id],
			name: "time_entries_task_id_tasks_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "time_entries_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.approved_by],
			foreignColumns: [users.id],
			name: "time_entries_approved_by_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.project_manager_id],
			foreignColumns: [users.id],
			name: "fk_time_entries_pm_id"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.supervisor_id],
			foreignColumns: [users.id],
			name: "fk_time_entries_supervisor_id"
		}).onDelete("set null"),
]);

export const comments = pgTable("comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	task_id: uuid().notNull(),
	user_id: uuid().notNull(),
	content: text().notNull(),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_comments_task_id").using("btree", table.task_id.asc().nullsLast().op("uuid_ops")),
	index("idx_comments_task_user").using("btree", table.task_id.asc().nullsLast().op("uuid_ops"), table.user_id.asc().nullsLast().op("uuid_ops")),
	index("idx_comments_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.task_id],
			foreignColumns: [tasks.id],
			name: "comments_task_id_tasks_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "comments_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	password: text(),
	role: user_role().default('employee').notNull(),
	avatar: text(),
	department: text(),
	position: text(),
	phone: text(),
	status: text().default('active'),
	object_id: text(),
	employee_code: text(),
	hourly_rate: numeric({ precision: 10, scale:  2 }).default('0.00'),
	is_active: boolean().default(true),
	is_deleted: boolean().default(false),
	failed_login_attempts: integer().default(0),
	last_login: timestamp({ mode: 'string' }),
	locked_until: timestamp({ mode: 'string' }),
	reset_token: text(),
	reset_token_expiry: timestamp({ mode: 'string' }),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	is_project_manager: boolean().default(false),
	is_supervisor: boolean().default(false),
	notification_preferences: jsonb(),
	timezone: text().default('Asia/Bangkok'),
}, (table) => [
	index("idx_users_active_dept").using("btree", table.is_active.asc().nullsLast().op("bool_ops"), table.department.asc().nullsLast().op("bool_ops")),
	index("idx_users_active_only").using("btree", table.created_at.asc().nullsLast().op("timestamp_ops")).where(sql`(is_active = true)`),
	index("idx_users_active_role").using("btree", table.is_active.asc().nullsLast().op("enum_ops"), table.role.asc().nullsLast().op("bool_ops")),
	index("idx_users_email_gin").using("gin", sql`to_tsvector('english'::regconfig, email)`),
	index("idx_users_email_trgm").using("gin", table.email.asc().nullsLast().op("gin_trgm_ops")),
	index("idx_users_is_active").using("btree", table.is_active.asc().nullsLast().op("bool_ops")),
	index("idx_users_is_project_manager").using("btree", table.is_project_manager.asc().nullsLast().op("bool_ops")),
	index("idx_users_is_supervisor").using("btree", table.is_supervisor.asc().nullsLast().op("bool_ops")),
	index("idx_users_name_gin").using("gin", sql`to_tsvector('english'::regconfig, name)`),
	index("idx_users_name_trgm").using("gin", table.name.asc().nullsLast().op("gin_trgm_ops")),
	index("idx_users_role").using("btree", table.role.asc().nullsLast().op("enum_ops")),
	unique("users_email_unique").on(table.email),
	unique("users_object_id_unique").on(table.object_id),
]);

export const budget_revisions = pgTable("budget_revisions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	project_id: uuid().notNull(),
	previous_budget: numeric({ precision: 12, scale:  2 }).notNull(),
	new_budget: numeric({ precision: 12, scale:  2 }).notNull(),
	reason: text().notNull(),
	changed_by: uuid().notNull(),
	changed_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.project_id],
			foreignColumns: [projects.id],
			name: "budget_revisions_project_id_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.changed_by],
			foreignColumns: [users.id],
			name: "budget_revisions_changed_by_users_id_fk"
		}).onDelete("set null"),
]);

export const timesheet_approval_actions = pgTable("timesheet_approval_actions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	timesheet_id: uuid().notNull(),
	action_type: approval_action_type().notNull(),
	previous_status: approval_status().notNull(),
	new_status: approval_status().notNull(),
	changed_by: uuid(),
	reason: text(),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.timesheet_id],
			foreignColumns: [time_entries.id],
			name: "fk_timesheet_actions_timesheet"
		}).onDelete("cascade"),
]);
