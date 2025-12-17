const { pool } = require('../config/database');

const AnalyticsService = {
  // Project Analytics
  async getProjectAnalytics(projectId) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.status,
        p.progress,
        p.budget,
        p.contract_amount,
        p.start_date,
        p.end_date,
        p.remaining_days,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT w.id) as total_worklogs,
        COALESCE(SUM(w.hours), 0) as total_hours_logged,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks_count,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = p.id AND status = 'approved') as total_expenses
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN worklogs w ON w.project_id = p.id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
  },

  // User Performance Metrics
  async getUserPerformance(userId, startDate, endDate) {
    const query = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.role,
        u.department,
        COUNT(DISTINCT w.id) as total_worklogs,
        COALESCE(SUM(w.hours), 0) as total_hours_logged,
        COUNT(DISTINCT t.id) as tasks_assigned,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed,
        COUNT(DISTINCT p.id) as projects_involved,
        (SELECT COUNT(*) FROM expenses WHERE user_id = $1 AND status = 'approved') as expenses_submitted,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = $1 AND status = 'approved') as total_expenses
      FROM users u
      LEFT JOIN worklogs w ON w.user_id = u.id
      LEFT JOIN tasks t ON t.assignee = u.id
      LEFT JOIN projects p ON p.id = w.project_id
      WHERE u.id = $1
        AND ($2::date IS NULL OR w.date >= $2)
        AND ($3::date IS NULL OR w.date <= $3)
      GROUP BY u.id
    `;
    
    const result = await pool.query(query, [userId, startDate, endDate]);
    return result.rows[0];
  },

  // Department-wise Resource Allocation
  async getResourceAllocation() {
    const query = `
      SELECT 
        u.department,
        COUNT(DISTINCT u.id) as total_employees,
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT t.id) as total_tasks,
        COALESCE(SUM(w.hours), 0) as total_hours_logged,
        COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
        COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_projects
      FROM users u
      LEFT JOIN projects p ON p.team_members LIKE '%' || u.id || '%'
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN worklogs w ON w.user_id = u.id
      WHERE u.role != 'admin'
      GROUP BY u.department
    `;
    
    const result = await pool.query(query);
    return result.rows;
  },

  // Project Timeline Analysis
  async getProjectTimeline(projectId) {
    const query = `
      WITH timeline AS (
        SELECT 
          date_trunc('day', date) as day,
          SUM(hours) as hours_logged,
          COUNT(DISTINCT user_id) as users_working
        FROM worklogs
        WHERE project_id = $1
        GROUP BY 1
      )
      SELECT 
        day,
        hours_logged,
        users_working,
        SUM(hours_logged) OVER (ORDER BY day) as cumulative_hours
      FROM timeline
      ORDER BY day
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows;
  },

  // Budget vs Actual Analysis
  async getBudgetAnalysis(projectId) {
    const query = `
      SELECT 
        p.id as project_id,
        p.name as project_name,
        p.budget as planned_budget,
        p.contract_amount,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = p.id AND status = 'approved') as actual_expenses,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = p.id AND status = 'pending') as pending_expenses,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = p.id AND status = 'rejected') as rejected_expenses,
        p.progress as project_progress,
        (SELECT COALESCE(SUM(amount), 0) / NULLIF(p.budget, 0) * 100 FROM expenses WHERE project_id = p.id AND status = 'approved') as budget_utilization_percentage
      FROM projects p
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
  }
};

module.exports = AnalyticsService;
