-- Add performance indexes

-- User model indexes
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "user" ("email");
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "user" ("role");
CREATE INDEX IF NOT EXISTS "user_status_idx" ON "user" ("status");

-- Project model indexes
CREATE INDEX IF NOT EXISTS "project_status_idx" ON "project" ("status");
CREATE INDEX IF NOT EXISTS "project_client_idx" ON "project" ("client_id") WHERE "client_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "project_date_range_idx" ON "project" ("start_date", "end_date");

-- Task model indexes
CREATE INDEX IF NOT EXISTS "task_project_idx" ON "task" ("project_id");
CREATE INDEX IF NOT EXISTS "task_assigned_to_idx" ON "task" ("assigned_to_id") WHERE "assigned_to_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "task" ("status");
CREATE INDEX IF NOT EXISTS "task_due_date_idx" ON "task" ("due_date") WHERE "due_date" IS NOT NULL;

-- Timesheet model indexes
CREATE INDEX IF NOT EXISTS "timesheet_user_idx" ON "timesheet" ("user_id");
CREATE INDEX IF NOT EXISTS "timesheet_status_idx" ON "timesheet" ("status");
CREATE INDEX IF NOT EXISTS "timesheet_date_range_idx" ON "timesheet" ("start_date", "end_date");

-- TimeLog model indexes
CREATE INDEX IF NOT EXISTS "timelog_user_idx" ON "time_log" ("user_id");
CREATE INDEX IF NOT EXISTS "timelog_task_idx" ON "time_log" ("task_id") WHERE "task_id" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "timelog_date_idx" ON "time_log" ("date");

-- Comment model indexes
CREATE INDEX IF NOT EXISTS "comment_author_idx" ON "comment" ("author_id");
CREATE INDEX IF NOT EXISTS "comment_created_at_idx" ON "comment" ("created_at");
