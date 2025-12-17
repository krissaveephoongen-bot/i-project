/**
 * Reports Routes
 * Generates comprehensive reports based on database data
 */

const express = require('express');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

const getDBClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
};

/**
 * GET /reports/project-summary
 * Get project summary report
 */
router.get('/reports/project-summary', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const result = await client.query(`
      SELECT 
        id,
        code,
        name,
        status,
        progress,
        budget,
        contract_amount,
        start_date,
        end_date,
        project_manager,
        team_members,
        (SELECT COALESCE(SUM(hours), 0) FROM worklogs WHERE project_id = projects.id AND is_deleted = FALSE) as total_hours,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = projects.id AND is_deleted = FALSE) as total_expenses
      FROM projects
      WHERE is_deleted = FALSE
      ORDER BY start_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching project summary:', error);
    res.status(500).json({
      error: 'Failed to fetch project summary',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /reports/project/:id
 * Get detailed report for a specific project
 */
router.get('/reports/project/:id', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Get project details
    const projectResult = await client.query(
      'SELECT * FROM projects WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Get project tasks
    const tasksResult = await client.query(
      'SELECT * FROM tasks WHERE project_id = $1 AND is_deleted = FALSE ORDER BY created_at',
      [id]
    );

    // Get project worklogs
    let worklogsQuery = 'SELECT * FROM worklogs WHERE project_id = $1 AND is_deleted = FALSE';
    const worklogsParams = [id];
    let paramCount = 2;

    if (startDate) {
      worklogsQuery += ` AND date >= $${paramCount}`;
      worklogsParams.push(startDate.split('T')[0]);
      paramCount++;
    }

    if (endDate) {
      worklogsQuery += ` AND date <= $${paramCount}`;
      worklogsParams.push(endDate.split('T')[0]);
      paramCount++;
    }

    const worklogsResult = await client.query(worklogsQuery, worklogsParams);

    // Get project expenses
    let expensesQuery = 'SELECT * FROM expenses WHERE project_id = $1 AND is_deleted = FALSE';
    const expensesParams = [id];
    paramCount = 2;

    if (startDate) {
      expensesQuery += ` AND date >= $${paramCount}`;
      expensesParams.push(startDate.split('T')[0]);
      paramCount++;
    }

    if (endDate) {
      expensesQuery += ` AND date <= $${paramCount}`;
      expensesParams.push(endDate.split('T')[0]);
      paramCount++;
    }

    const expensesResult = await client.query(expensesQuery, expensesParams);

    // Calculate statistics
    const totalHours = worklogsResult.rows.reduce((sum, w) => sum + (w.hours || 0), 0);
    const totalExpenses = expensesResult.rows.reduce((sum, e) => sum + (e.amount || 0), 0);
    const approvedExpenses = expensesResult.rows
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    res.json({
      project,
      tasks: tasksResult.rows,
      worklogs: worklogsResult.rows,
      expenses: expensesResult.rows,
      statistics: {
        total_tasks: tasksResult.rows.length,
        completed_tasks: tasksResult.rows.filter(t => t.status === 'completed').length,
        total_hours: totalHours,
        total_expenses: totalExpenses,
        approved_expenses: approvedExpenses,
        pending_expenses: totalExpenses - approvedExpenses,
        budget_remaining: project.budget ? project.budget - totalExpenses : 0,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching project report:', error);
    res.status(500).json({
      error: 'Failed to fetch project report',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /reports/timesheet-summary
 * Get timesheet summary report
 */
router.get('/reports/timesheet-summary', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { startDate, endDate, userId } = req.query;

    let query = `
      SELECT 
        user_id,
        user_name,
        COUNT(*) as total_entries,
        COALESCE(SUM(hours), 0) as total_hours,
        COALESCE(SUM(manday), 0) as total_mandays,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_entries,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_entries
      FROM worklogs
      WHERE is_deleted = FALSE
    `;

    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(startDate.split('T')[0]);
      paramCount++;
    }

    if (endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(endDate.split('T')[0]);
      paramCount++;
    }

    if (userId) {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    query += ` GROUP BY user_id, user_name ORDER BY total_hours DESC`;

    const result = await client.query(query, params);

    res.json({
      summary: result.rows,
      totals: {
        total_users: result.rows.length,
        total_entries: result.rows.reduce((sum, r) => sum + r.total_entries, 0),
        total_hours: result.rows.reduce((sum, r) => sum + parseFloat(r.total_hours), 0),
        total_mandays: result.rows.reduce((sum, r) => sum + parseFloat(r.total_mandays), 0),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching timesheet summary:', error);
    res.status(500).json({
      error: 'Failed to fetch timesheet summary',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /reports/expense-summary
 * Get expense summary report
 */
router.get('/reports/expense-summary', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { startDate, endDate, projectId } = req.query;

    let query = `
      SELECT 
        category,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_amount
      FROM expenses
      WHERE is_deleted = FALSE
    `;

    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(startDate.split('T')[0]);
      paramCount++;
    }

    if (endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(endDate.split('T')[0]);
      paramCount++;
    }

    if (projectId) {
      query += ` AND project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    query += ` GROUP BY category ORDER BY total_amount DESC`;

    const result = await client.query(query, params);

    // Get status breakdown
    let statusQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM expenses
      WHERE is_deleted = FALSE
    `;

    const statusParams = [];
    let statusParamCount = 1;

    if (startDate) {
      statusQuery += ` AND date >= $${statusParamCount}`;
      statusParams.push(startDate.split('T')[0]);
      statusParamCount++;
    }

    if (endDate) {
      statusQuery += ` AND date <= $${statusParamCount}`;
      statusParams.push(endDate.split('T')[0]);
      statusParamCount++;
    }

    if (projectId) {
      statusQuery += ` AND project_id = $${statusParamCount}`;
      statusParams.push(projectId);
      statusParamCount++;
    }

    statusQuery += ` GROUP BY status`;

    const statusResult = await client.query(statusQuery, statusParams);

    res.json({
      by_category: result.rows,
      by_status: statusResult.rows,
      totals: {
        total_count: result.rows.reduce((sum, r) => sum + r.count, 0),
        total_amount: result.rows.reduce((sum, r) => sum + parseFloat(r.total_amount), 0),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching expense summary:', error);
    res.status(500).json({
      error: 'Failed to fetch expense summary',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /reports/team-productivity
 * Get team productivity report
 */
router.get('/reports/team-productivity', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.position,
        COUNT(DISTINCT w.date) as days_worked,
        COALESCE(SUM(w.hours), 0) as total_hours,
        COALESCE(AVG(w.hours), 0) as avg_hours_per_day,
        COUNT(DISTINCT w.project_id) as projects_contributed
      FROM users u
      LEFT JOIN worklogs w ON u.id = w.user_id AND w.is_deleted = FALSE
      WHERE u.is_deleted = FALSE
    `;

    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND w.date >= $${paramCount}`;
      params.push(startDate.split('T')[0]);
      paramCount++;
    }

    if (endDate) {
      query += ` AND w.date <= $${paramCount}`;
      params.push(endDate.split('T')[0]);
      paramCount++;
    }

    query += ` GROUP BY u.id, u.name, u.email, u.position ORDER BY total_hours DESC`;

    const result = await client.query(query, params);

    res.json({
      team_productivity: result.rows,
      summary: {
        total_team_members: result.rows.length,
        total_hours: result.rows.reduce((sum, r) => sum + parseFloat(r.total_hours), 0),
        avg_hours_per_member: result.rows.length > 0 
          ? result.rows.reduce((sum, r) => sum + parseFloat(r.total_hours), 0) / result.rows.length 
          : 0,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching team productivity:', error);
    res.status(500).json({
      error: 'Failed to fetch team productivity',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /reports/monthly-summary
 * Get monthly summary report
 */
router.get('/reports/monthly-summary', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get monthly worklog data
    const worklogsResult = await client.query(`
      SELECT 
        EXTRACT(MONTH FROM date)::int as month,
        COUNT(*) as entry_count,
        COALESCE(SUM(hours), 0) as total_hours,
        COALESCE(SUM(manday), 0) as total_mandays
      FROM worklogs
      WHERE is_deleted = FALSE AND EXTRACT(YEAR FROM date) = $1
      GROUP BY EXTRACT(MONTH FROM date)
      ORDER BY month
    `, [currentYear]);

    // Get monthly expense data
    const expensesResult = await client.query(`
      SELECT 
        EXTRACT(MONTH FROM date)::int as month,
        COUNT(*) as expense_count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as approved_amount
      FROM expenses
      WHERE is_deleted = FALSE AND EXTRACT(YEAR FROM date) = $1
      GROUP BY EXTRACT(MONTH FROM date)
      ORDER BY month
    `, [currentYear]);

    res.json({
      worklogs_by_month: worklogsResult.rows,
      expenses_by_month: expensesResult.rows,
      year: currentYear,
    });
  } catch (error) {
    console.error('❌ Error fetching monthly summary:', error);
    res.status(500).json({
      error: 'Failed to fetch monthly summary',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
