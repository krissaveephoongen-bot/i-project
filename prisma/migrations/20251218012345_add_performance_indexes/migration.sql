-- Add performance indexes

-- User model indexes
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "User" ("email");
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "User" ("role");
CREATE INDEX IF NOT EXISTS "user_status_idx" ON "User" ("status");

-- Project model indexes
CREATE INDEX IF NOT EXISTS "project_status_idx" ON "Project" ("status");
CREATE INDEX IF NOT EXISTS "project_client_idx" ON "Project" ("clientId") WHERE "clientId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "project_date_range_idx" ON "Project" ("startDate", "endDate");

-- Task model indexes
CREATE INDEX IF NOT EXISTS "task_project_idx" ON "Task" ("projectId");
CREATE INDEX IF NOT EXISTS "task_assigned_to_idx" ON "Task" ("assignedToId") WHERE "assignedToId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "task_status_idx" ON "Task" ("status");
CREATE INDEX IF NOT EXISTS "task_due_date_idx" ON "Task" ("dueDate") WHERE "dueDate" IS NOT NULL;

-- Timesheet model indexes
CREATE INDEX IF NOT EXISTS "timesheet_user_idx" ON "Timesheet" ("userId");
CREATE INDEX IF NOT EXISTS "timesheet_status_idx" ON "Timesheet" ("status");
CREATE INDEX IF NOT EXISTS "timesheet_date_range_idx" ON "Timesheet" ("startDate", "endDate");

-- TimeLog model indexes
CREATE INDEX IF NOT EXISTS "timelog_user_idx" ON "TimeLog" ("userId");
CREATE INDEX IF NOT EXISTS "timelog_task_idx" ON "TimeLog" ("taskId") WHERE "taskId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "timelog_date_idx" ON "TimeLog" ("date");

-- Comment model indexes
CREATE INDEX IF NOT EXISTS "comment_author_idx" ON "Comment" ("authorId");
CREATE INDEX IF NOT EXISTS "comment_created_at_idx" ON "Comment" ("createdAt");
