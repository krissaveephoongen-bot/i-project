-- Database Schema Optimizations
-- Add missing indexes for better performance

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
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_milestone 
  FOREIGN KEY (milestoneId) REFERENCES milestones(id) 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Add check constraints for data integrity
ALTER TABLE tasks ADD CONSTRAINT chk_tasks_priority 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE tasks ADD CONSTRAINT chk_tasks_status 
  CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled'));

ALTER TABLE projects ADD CONSTRAINT chk_projects_progress 
  CHECK (progress >= 0 AND progress <= 100);

ALTER TABLE projects ADD CONSTRAINT chk_projects_status 
  CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled'));

-- Create materialized views for reporting
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_summary AS
SELECT 
  p.id,
  p.name,
  p.status,
  p.progress,
  p.budget,
  p.spent,
  p.start_date,
  p.end_date,
  c.name as client_name,
  u.name as manager_name,
  COUNT(t.id) as task_count,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status != 'completed' THEN 1 END) as pending_tasks,
  COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) as approved_expenses,
  COALESCE(SUM(te.hours), 0) as total_hours
FROM projects p
LEFT JOIN clients c ON p.client_id = c.id
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN expenses e ON p.id = e.project_id
LEFT JOIN time_entries te ON p.id = te.project_id
GROUP BY p.id, p.name, p.status, p.progress, p.budget, p.spent, p.start_date, p.end_date, c.name, u.name;

-- Create refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_project_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_summary;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for materialized view
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mv_project_summary_status ON mv_project_summary(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mv_project_summary_progress ON mv_project_summary(progress);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mv_project_summary_client_name ON mv_project_summary(client_name);

-- Create partitioned table for large time series data (if needed)
-- This is optional for very large datasets
/*
CREATE TABLE time_entries_partitioned (
  LIKE time_entries INCLUDING ALL
) PARTITION BY RANGE (date);

CREATE TABLE time_entries_2024 PARTITION OF time_entries_partitioned
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE time_entries_2025 PARTITION OF time_entries_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
*/

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for data cleanup
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete audit logs older than 1 year
  DELETE FROM audit_logs WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
  
  -- Delete old notifications (read and older than 30 days)
  DELETE FROM notifications WHERE read = true AND created_at < CURRENT_DATE - INTERVAL '30 days';
  
  -- Delete old time entries (older than 2 years)
  DELETE FROM time_entries WHERE date < CURRENT_DATE - INTERVAL '2 years';
  
  -- Delete old project progress snapshots (older than 1 year)
  DELETE FROM project_progress_snapshots WHERE date < CURRENT_DATE - INTERVAL '1 year';
  
  -- Delete old SPI/CPI snapshots (older than 6 months)
  DELETE FROM spi_cpi_daily_snapshot WHERE date < CURRENT_DATE - INTERVAL '6 months';
  
  RAISE NOTICE 'Data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job for data cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');

-- Create function for performance monitoring
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  size_mb NUMERIC,
  index_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    n_live_tup as row_count,
    pg_total_relation_size(schemaname::text, tablename) / 1024 / 1024 as size_mb,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = schemaname AND tablename = t.tablename) as index_count
  FROM pg_stat_user_tables t
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname::text, tablename) DESC;
END;
$$ LANGUAGE plpgsql;
