-- Create materialized views for complex aggregations
-- Migration: Add Materialized Views for Performance
-- Created: 2025-12-24

-- Materialized view for project analytics - refreshed periodically
CREATE MATERIALIZED VIEW project_analytics AS
SELECT
    p.id,
    p.name,
    p.code,
    p.status,
    p.budget,
    COALESCE(p.actual_cost, 0) as actual_cost,
    p.start_date,
    p.end_date,
    p.progress,

    -- Task metrics
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'DONE' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW') THEN t.id END) as active_tasks,
    COUNT(DISTINCT CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN t.id END) as overdue_tasks,

    -- Time metrics
    COALESCE(SUM(tl.duration), 0) as total_logged_hours,
    COALESCE(AVG(tl.duration), 0) as avg_hours_per_log,
    COALESCE(SUM(CASE WHEN tl.start_time >= date_trunc('month', NOW()) THEN tl.duration END), 0) as hours_this_month,

    -- Cost metrics
    COALESCE(SUM(c.amount), 0) as total_costs,
    COALESCE(SUM(CASE WHEN c.status = 'approved' THEN c.amount END), 0) as approved_costs,
    COALESCE(SUM(CASE WHEN c.date >= date_trunc('month', NOW()) THEN c.amount END), 0) as costs_this_month,

    -- User metrics
    COUNT(DISTINCT t.assignee_id) as assigned_users,
    COUNT(DISTINCT tl.user_id) as active_users,

    -- Date metrics
    EXTRACT(EPOCH FROM (NOW() - p.start_date)) / 86400 as days_since_start,
    CASE WHEN p.end_date IS NOT NULL THEN EXTRACT(EPOCH FROM (p.end_date - NOW())) / 86400 ELSE NULL END as days_to_deadline,

    p.created_at,
    NOW() as last_updated
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN time_logs tl ON p.id = tl.project_id
LEFT JOIN costs c ON p.id = c.project_id
GROUP BY p.id, p.name, p.code, p.status, p.budget, p.actual_cost, p.start_date, p.end_date, p.progress, p.created_at;

-- Materialized view for user productivity metrics
CREATE MATERIALIZED VIEW user_productivity AS
SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    u.department,

    -- Task metrics
    COUNT(DISTINCT CASE WHEN t.status = 'DONE' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW') THEN t.id END) as active_tasks,
    COUNT(DISTINCT CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN t.id END) as overdue_tasks,

    -- Time metrics
    COALESCE(SUM(tl.duration), 0) as total_logged_hours,
    COALESCE(AVG(tl.duration), 0) as avg_session_length,
    COALESCE(SUM(CASE WHEN tl.start_time >= date_trunc('week', NOW()) THEN tl.duration END), 0) as hours_this_week,
    COALESCE(SUM(CASE WHEN tl.start_time >= date_trunc('month', NOW()) THEN tl.duration END), 0) as hours_this_month,

    -- Project involvement
    COUNT(DISTINCT p.id) as projects_involved,
    COUNT(DISTINCT CASE WHEN p.status IN ('PLANNING', 'IN_PROGRESS') THEN p.id END) as active_projects,

    -- Timesheet metrics
    COUNT(DISTINCT CASE WHEN ts.status = 'APPROVED' THEN ts.id END) as approved_timesheets,
    COUNT(DISTINCT CASE WHEN ts.status = 'SUBMITTED' THEN ts.id END) as pending_timesheets,

    -- Efficiency metrics
    CASE WHEN COUNT(t.id) > 0 THEN
        ROUND(CAST(COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) AS DECIMAL) / COUNT(t.id) * 100, 2)
    ELSE 0 END as task_completion_rate,

    u.created_at,
    NOW() as last_updated
FROM users u
LEFT JOIN tasks t ON u.id = t.assignee_id
LEFT JOIN time_logs tl ON u.id = tl.user_id
LEFT JOIN projects p ON tl.project_id = p.id
LEFT JOIN timesheets ts ON u.id = ts.user_id
GROUP BY u.id, u.name, u.email, u.role, u.department, u.created_at;

-- Materialized view for team workload distribution
CREATE MATERIALIZED VIEW team_workload AS
SELECT
    u.department,
    u.role,

    -- User count
    COUNT(DISTINCT u.id) as user_count,

    -- Task distribution
    COUNT(DISTINCT t.id) as total_assigned_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'DONE' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW') THEN t.id END) as active_tasks,
    COUNT(DISTINCT CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN t.id END) as overdue_tasks,

    -- Time distribution
    COALESCE(SUM(tl.duration), 0) as total_logged_hours,
    COALESCE(AVG(tl.duration), 0) as avg_hours_per_user,
    COALESCE(SUM(CASE WHEN tl.start_time >= date_trunc('month', NOW()) THEN tl.duration END), 0) as hours_this_month,

    -- Project distribution
    COUNT(DISTINCT p.id) as projects_involved,
    COUNT(DISTINCT CASE WHEN p.status IN ('PLANNING', 'IN_PROGRESS') THEN p.id END) as active_projects,

    NOW() as last_updated
FROM users u
LEFT JOIN tasks t ON u.id = t.assignee_id
LEFT JOIN time_logs tl ON u.id = tl.user_id
LEFT JOIN projects p ON tl.project_id = p.id
WHERE u.status = 'active'
GROUP BY u.department, u.role;

-- Create indexes on materialized views for better query performance
CREATE INDEX idx_project_analytics_status ON project_analytics(status);
CREATE INDEX idx_project_analytics_progress ON project_analytics(progress);
CREATE INDEX idx_project_analytics_created_at ON project_analytics(created_at);

CREATE INDEX idx_user_productivity_role ON user_productivity(role);
CREATE INDEX idx_user_productivity_department ON user_productivity(department);
CREATE INDEX idx_user_productivity_completion_rate ON user_productivity(task_completion_rate);

CREATE INDEX idx_team_workload_department ON team_workload(department);
CREATE INDEX idx_team_workload_role ON team_workload(role);

-- Create refresh functions for automated updates
CREATE OR REPLACE FUNCTION refresh_project_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY project_analytics;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_user_productivity()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_productivity;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_team_workload()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY team_workload;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_all_analytics()
RETURNS void AS $$
BEGIN
    PERFORM refresh_project_analytics();
    PERFORM refresh_user_productivity();
    PERFORM refresh_team_workload();
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON MATERIALIZED VIEW project_analytics IS 'Materialized view for comprehensive project analytics and KPIs';
COMMENT ON MATERIALIZED VIEW user_productivity IS 'Materialized view for user productivity metrics and performance tracking';
COMMENT ON MATERIALIZED VIEW team_workload IS 'Materialized view for team workload distribution and resource allocation';

COMMENT ON FUNCTION refresh_project_analytics() IS 'Refresh project analytics materialized view concurrently';
COMMENT ON FUNCTION refresh_user_productivity() IS 'Refresh user productivity materialized view concurrently';
COMMENT ON FUNCTION refresh_team_workload() IS 'Refresh team workload materialized view concurrently';
COMMENT ON FUNCTION refresh_all_analytics() IS 'Refresh all analytics materialized views';