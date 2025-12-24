-- Create performance views for API and frontend optimization
-- Migration: Add Performance Views
-- Created: 2025-12-24

-- Project Summary View - Optimized for dashboard and project listings
CREATE OR REPLACE VIEW project_summaries AS
SELECT
    p.id,
    p.name,
    p.code,
    p.status,
    p.progress,
    p.budget,
    COALESCE(p."actualCost", 0) as actual_cost,
    p."startDate",
    p."endDate",
    c.name as client_name,
    pm.user->>'name' as project_manager_name,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN 1 END) as overdue_tasks,
    COALESCE(SUM(tl.duration), 0) as total_hours,
    p."createdAt"
FROM "Project" p
LEFT JOIN clients c ON p."clientId" = c.id
LEFT JOIN "ProjectManager" pm ON p."projectManagerId" = pm.id
LEFT JOIN tasks t ON p.id = t."projectId"
LEFT JOIN time_logs tl ON tl."projectId" = p.id
GROUP BY p.id, p.name, p.code, p.status, p.progress, p.budget, p."actualCost",
         p."startDate", p."endDate", c.name, pm.user, p."createdAt";

-- User Workload View - For resource management and assignments
CREATE OR REPLACE VIEW user_workloads AS
SELECT
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    u.role,
    u.department,
    COUNT(CASE WHEN t.status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW') THEN 1 END) as active_tasks,
    COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN 1 END) as overdue_tasks,
    COALESCE(SUM(CASE WHEN tl.start_time >= date_trunc('week', NOW()) THEN tl.duration END), 0) as total_hours_this_week,
    COALESCE(SUM(CASE WHEN tl.start_time >= date_trunc('month', NOW()) THEN tl.duration END), 0) as total_hours_this_month,
    COUNT(DISTINCT p.id) as projects_count,
    GREATEST(u.last_login, MAX(tl.start_time)) as last_activity
FROM "User" u
LEFT JOIN tasks t ON u.id = t.assignee_id
LEFT JOIN time_logs tl ON u.id = tl.user_id
LEFT JOIN "Project" p ON tl.project_id = p.id
GROUP BY u.id, u.name, u.email, u.role, u.department, u.last_login;

-- Task Progress View - For S-Curve and progress tracking
CREATE OR REPLACE VIEW task_progress AS
SELECT
    t.id,
    t.title,
    t.project_id,
    p.name as project_name,
    t.assignee_id,
    u.name as assignee_name,
    t.status,
    t.priority,
    t.planned_start_date,
    t.planned_end_date,
    t.actual_progress,
    t.planned_progress_weight,
    t.estimated_hours,
    COALESCE(t.actual_hours, 0) as actual_hours,
    t.due_date,
    CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN true ELSE false END as is_overdue,
    CASE WHEN t.due_date < NOW() AND t.status != 'DONE'
         THEN EXTRACT(EPOCH FROM (NOW() - t.due_date))/86400
         ELSE 0 END as days_overdue,
    t.created_at
FROM tasks t
LEFT JOIN "Project" p ON t.project_id = p.id
LEFT JOIN "User" u ON t.assignee_id = u.id;

-- Timesheet Summary View - For reporting and approvals
CREATE OR REPLACE VIEW timesheet_summaries AS
SELECT
    ts.id,
    ts.user_id,
    u.name as user_name,
    ts.project_id,
    p.name as project_name,
    ts.task_id,
    t.title as task_title,
    ts.date,
    ts.hours_worked,
    ts.status,
    au.name as approved_by_name,
    ts.approved_at,
    ts.description
FROM timesheets ts
LEFT JOIN "User" u ON ts.user_id = u.id
LEFT JOIN "Project" p ON ts.project_id = p.id
LEFT JOIN tasks t ON ts.task_id = t.id
LEFT JOIN "User" au ON ts.approved_by_id = au.id;

-- Project Expenses Summary View
CREATE OR REPLACE VIEW project_expenses_summaries AS
SELECT
    p.id as project_id,
    p.name as project_name,
    COALESCE(SUM(c.amount), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN c.status = 'pending' THEN c.amount END), 0) as pending_expenses,
    COALESCE(SUM(CASE WHEN c.status = 'approved' THEN c.amount END), 0) as approved_expenses,
    COALESCE(SUM(CASE WHEN c.date >= date_trunc('month', NOW()) THEN c.amount END), 0) as expenses_this_month,
    COALESCE(SUM(CASE WHEN c.date >= date_trunc('week', NOW()) THEN c.amount END), 0) as expenses_this_week,
    (SELECT category FROM "Cost" WHERE project_id = p.id GROUP BY category ORDER BY SUM(amount) DESC LIMIT 1) as top_category,
    COUNT(c.id) as expense_count
FROM "Project" p
LEFT JOIN "Cost" c ON p.id = c.project_id
GROUP BY p.id, p.name;

-- Dashboard Metrics View - For admin dashboard
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT
    (SELECT COUNT(*) FROM "Project") as total_projects,
    (SELECT COUNT(*) FROM "Project" WHERE status IN ('PLANNING', 'IN_PROGRESS')) as active_projects,
    (SELECT COUNT(*) FROM "Project" WHERE status = 'COMPLETED') as completed_projects,
    (SELECT COUNT(*) FROM "User") as total_users,
    (SELECT COUNT(*) FROM "User" WHERE status = 'active') as active_users,
    (SELECT COUNT(*) FROM tasks) as total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status = 'DONE') as completed_tasks,
    (SELECT COUNT(*) FROM tasks WHERE due_date < NOW() AND status != 'DONE') as overdue_tasks,
    (SELECT COALESCE(SUM(tl.duration), 0) FROM time_logs tl WHERE tl.start_time >= date_trunc('month', NOW())) as total_hours_this_month,
    (SELECT COALESCE(SUM(c.amount), 0) FROM "Cost" c WHERE c.date >= date_trunc('month', NOW())) as total_expenses_this_month,
    (SELECT COUNT(*) FROM timesheets WHERE status = 'SUBMITTED') as pending_approvals;

-- Recent Activity View - For activity feeds (commented out - activity_log table not found)
-- CREATE OR REPLACE VIEW recent_activities AS
-- SELECT
--     al.id,
--     al.entity_type,
--     al.entity_id,
--     al.type,
--     al.action,
--     al.description,
--     al.user_id,
--     u.name as user_name,
--     p.name as project_name,
--     t.title as task_title,
--     al.created_at
-- FROM activity_log al
-- LEFT JOIN "User" u ON al.user_id = u.id
-- LEFT JOIN "Project" p ON al.entity_type = 'project' AND al.entity_id = p.id
-- LEFT JOIN tasks t ON al.entity_type = 'task' AND al.entity_id = t.id
-- ORDER BY al.created_at DESC
-- LIMIT 100;

-- Create indexes on views for better performance (where applicable)
-- Note: PostgreSQL automatically creates implicit indexes on primary keys of views

-- Add comments for documentation
COMMENT ON VIEW project_summaries IS 'Performance view for project dashboard and listings with aggregated task and time data';
COMMENT ON VIEW user_workloads IS 'Performance view for user resource management and workload tracking';
COMMENT ON VIEW task_progress IS 'Performance view for task progress tracking and S-Curve analysis';
COMMENT ON VIEW timesheet_summaries IS 'Performance view for timesheet reporting and approval workflows';
COMMENT ON VIEW project_expenses_summaries IS 'Performance view for project expense tracking and summaries';
COMMENT ON VIEW dashboard_metrics IS 'Performance view for admin dashboard metrics and KPIs';
-- COMMENT ON VIEW recent_activities IS 'Performance view for recent activity feeds and notifications';