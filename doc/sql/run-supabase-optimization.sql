-- Supabase Database Optimization Script
-- Run this in Supabase SQL Editor
-- This script adds missing indexes for better performance

-- Tasks table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestoneId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_project_status ON tasks(projectId, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_to_status ON tasks(assignedTo, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_priority_status ON tasks(priority, status);

-- Milestones table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);

-- Expenses table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

-- Notifications table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Audit logs indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Time entries indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_hours ON time_entries(hours);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at);

-- Project members indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_members_role ON project_members(role);

-- Budget lines indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_lines_project_id ON budget_lines(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_lines_category ON budget_lines(category);

-- Documents indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_file_type ON documents(file_type);

-- Risks indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_project_id ON risks(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_severity ON risks(severity);

-- Issues indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_project_id ON issues(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_severity ON issues(severity);

-- Financial data indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_data_project_id ON financial_data(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_data_period ON financial_data(period);

-- Sales deals indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_pipeline_id ON sales_deals(pipeline_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_stage_id ON sales_deals(stage_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_status ON sales_deals(status);

-- Sales activities indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_deal_id ON sales_activities(deal_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_user_id ON sales_activities(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_type ON sales_activities(type);

-- Timesheet submissions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_user_id ON timesheet_submissions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_week_start ON timesheet_submissions(week_start_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_status ON timesheet_submissions(status);

-- Project progress snapshots indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_progress_snapshots_project_id ON project_progress_snapshots(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_progress_snapshots_date ON project_progress_snapshots(date);

-- SPI/CPI daily snapshot indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spi_cpi_daily_snapshot_project_id ON spi_cpi_daily_snapshot(projectid);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spi_cpi_daily_snapshot_date ON spi_cpi_daily_snapshot(date);

-- Stakeholders indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stakeholders_project_id ON stakeholders(project_id);

-- Cashflow indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cashflow_month ON cashflow(month);

-- Add missing columns if needed
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestoneId TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimatedHours NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actualHours NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignedTo TEXT;

-- Add foreign key constraints if missing
DO $$
BEGIN
    -- Check if foreign key exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_tasks_milestone'
        AND table_name = 'tasks'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE tasks ADD CONSTRAINT fk_tasks_milestone 
          FOREIGN KEY (milestoneId) REFERENCES milestones(id) 
          ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add check constraints for data integrity
ALTER TABLE tasks ADD CONSTRAINT IF NOT EXISTS chk_tasks_priority 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE tasks ADD CONSTRAINT IF NOT EXISTS chk_tasks_status 
  CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled'));

ALTER TABLE projects ADD CONSTRAINT IF NOT EXISTS chk_projects_progress 
  CHECK (progress >= 0 AND progress <= 100);

ALTER TABLE projects ADD CONSTRAINT IF NOT EXISTS chk_projects_status 
  CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled'));

-- Test queries to verify indexes are working
EXPLAIN ANALYZE SELECT * FROM tasks WHERE projectId = 'test' AND status = 'active';
EXPLAIN ANALYZE SELECT * FROM tasks WHERE assignedTo = 'user1' AND status = 'completed';
EXPLAIN ANALYZE SELECT * FROM milestones WHERE projectId = 'test' AND status = 'active';

-- Get table statistics
SELECT 
  schemaname || '.' || tablename as table_name,
  n_live_tup as row_count,
  pg_size_pretty(pg_total_relation_size(schemaname::text, tablename)) as size_mb,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = schemaname AND tablename = t.tablename) as index_count
FROM pg_stat_user_tables t
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname::text, tablename) DESC;
