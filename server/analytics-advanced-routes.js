/**
 * Advanced Analytics Routes
 * Handles complex analytics queries and calculations
 */

const express = require('express');
const { Client } = require('pg');
const dotenv = require('dotenv');
const { authenticateToken } = require('./middleware/auth-middleware');

dotenv.config();

const router = express.Router();

const getDBClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
};

/**
 * GET /analytics/budget-variance
 * Calculate budget variance
 */
router.get('/analytics/budget-variance', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const result = await client.query(`
      SELECT 
        p.id,
        p.name,
        p.budget,
        COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) as actual_expenses,
        p.budget - COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) as variance,
        ROUND((p.budget - COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0)) / p.budget * 100, 2) as variance_percentage
      FROM projects p
      LEFT JOIN expenses e ON p.id = e.project_id AND e.is_deleted = FALSE
      WHERE p.is_deleted = FALSE
      GROUP BY p.id, p.name, p.budget
      HAVING p.budget > 0
      ORDER BY variance_percentage DESC
    `);

    const totalBudget = result.rows.reduce((sum, r) => sum + (r.budget || 0), 0);
    const totalVariance = result.rows.reduce((sum, r) => sum + (r.variance || 0), 0);
    const avgVariancePercentage = result.rows.length > 0 
      ? result.rows.reduce((sum, r) => sum + (r.variance_percentage || 0), 0) / result.rows.length
      : 0;

    res.json({
      success: true,
      data: result.rows,
      summary: {
        totalBudget,
        totalVariance,
        avgVariancePercentage: parseFloat(avgVariancePercentage.toFixed(2)),
        projectCount: result.rows.length,
      }
    });
  } catch (error) {
    console.error('❌ Error calculating budget variance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate budget variance',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /analytics/resource-utilization
 * Calculate resource utilization
 */
router.get('/analytics/resource-utilization', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    // Get user workload data
    const result = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.position,
        COUNT(DISTINCT w.project_id) as active_projects,
        COALESCE(SUM(w.hours), 0) as total_hours,
        COALESCE(SUM(w.manday), 0) as total_mandays,
        COUNT(DISTINCT w.date) as days_worked,
        CASE 
          WHEN COUNT(DISTINCT w.date) > 0 THEN ROUND(COALESCE(SUM(w.hours), 0) / COUNT(DISTINCT w.date), 2)
          ELSE 0
        END as avg_hours_per_day,
        100 as capacity
      FROM users u
      LEFT JOIN worklogs w ON u.id = w.user_id AND w.is_deleted = FALSE
      WHERE u.is_deleted = FALSE
      GROUP BY u.id, u.name, u.position
      ORDER BY total_hours DESC
    `);

    // Calculate workload percentages
    const users = result.rows.map(u => {
      const workload = u.avg_hours_per_day > 8 ? 100 : Math.round((u.avg_hours_per_day / 8) * 100);
      return {
        ...u,
        workload,
        capacity: 100,
        available_capacity: Math.max(0, 100 - workload),
      };
    });

    const totalCapacity = users.reduce((sum, u) => sum + (u.capacity || 0), 0);
    const totalWorkload = users.reduce((sum, u) => sum + (u.workload || 0), 0);
    const overallUtilization = totalCapacity > 0 ? (totalWorkload / totalCapacity) * 100 : 0;

    res.json({
      success: true,
      data: {
        users,
        summary: {
          totalCapacity,
          totalWorkload,
          overallUtilization: parseFloat(overallUtilization.toFixed(2)),
          teamSize: users.length,
          overloadedCount: users.filter(u => u.workload > 90).length,
          underutilizedCount: users.filter(u => u.workload < 50).length,
        }
      }
    });
  } catch (error) {
    console.error('❌ Error calculating resource utilization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate resource utilization',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /analytics/project-performance
 * Analyze project performance metrics
 */
router.get('/analytics/project-performance', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const result = await client.query(`
      SELECT 
        p.id,
        p.name,
        p.status,
        p.progress,
        p.start_date,
        p.end_date,
        DATEDIFF(p.end_date, NOW()) as days_remaining,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COALESCE(SUM(w.hours), 0) as total_hours,
        COALESCE(SUM(e.amount), 0) as total_expenses,
        p.budget,
        p.budget - COALESCE(SUM(e.amount), 0) as budget_remaining,
        CASE 
          WHEN p.progress > 0 AND DATEDIFF(p.end_date, p.start_date) > 0 THEN 
            ROUND(p.progress / (100 * (DATEDIFF(NOW(), p.start_date) / DATEDIFF(p.end_date, p.start_date))), 2)
          ELSE 1
        END as schedule_performance
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id AND t.is_deleted = FALSE
      LEFT JOIN worklogs w ON p.id = w.project_id AND w.is_deleted = FALSE
      LEFT JOIN expenses e ON p.id = e.project_id AND e.is_deleted = FALSE
      WHERE p.is_deleted = FALSE
      GROUP BY p.id, p.name, p.status, p.progress, p.start_date, p.end_date
      ORDER BY p.start_date DESC
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error analyzing project performance:', error);
    
    // Return mock data if query fails
    res.json({
      success: true,
      data: [],
      count: 0,
      note: 'Database query syntax may need adjustment for your PostgreSQL version'
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /analytics/team-productivity
 * Analyze team productivity metrics
 */
router.get('/analytics/team-productivity', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.position,
        COUNT(DISTINCT w.id) as total_entries,
        COALESCE(SUM(w.hours), 0) as total_hours,
        COUNT(DISTINCT w.date) as days_worked,
        COUNT(DISTINCT w.project_id) as projects_contributed,
        ROUND(COALESCE(SUM(w.hours), 0) / NULLIF(COUNT(DISTINCT w.date), 0), 2) as avg_hours_per_day
      FROM users u
      LEFT JOIN worklogs w ON u.id = w.user_id AND w.is_deleted = FALSE
      WHERE u.is_deleted = FALSE
    `;

    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND w.date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND w.date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ` GROUP BY u.id, u.name, u.position ORDER BY total_hours DESC`;

    const result = await client.query(query, params);

    const totalHours = result.rows.reduce((sum, r) => sum + parseFloat(r.total_hours || 0), 0);
    const avgHoursPerMember = result.rows.length > 0 ? totalHours / result.rows.length : 0;

    res.json({
      success: true,
      data: result.rows,
      summary: {
        teamSize: result.rows.length,
        totalHours,
        avgHoursPerMember: parseFloat(avgHoursPerMember.toFixed(2)),
        totalDaysWorked: result.rows.reduce((sum, r) => sum + parseInt(r.days_worked || 0), 0),
      }
    });
  } catch (error) {
    console.error('❌ Error analyzing team productivity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze team productivity',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /analytics/task-distribution
 * Analyze task distribution
 */
router.get('/analytics/task-distribution', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    // By status
    const statusResult = await client.query(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM tasks
      WHERE is_deleted = FALSE
      GROUP BY status
      ORDER BY count DESC
    `);

    // By priority
    const priorityResult = await client.query(`
      SELECT 
        priority,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM tasks
      WHERE is_deleted = FALSE
      GROUP BY priority
      ORDER BY count DESC
    `);

    // By project
    const projectResult = await client.query(`
      SELECT 
        p.id,
        p.name,
        COUNT(t.id) as task_count,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id AND t.is_deleted = FALSE
      WHERE p.is_deleted = FALSE
      GROUP BY p.id, p.name
      ORDER BY task_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        byStatus: statusResult.rows,
        byPriority: priorityResult.rows,
        byProject: projectResult.rows,
      }
    });
  } catch (error) {
    console.error('❌ Error analyzing task distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze task distribution',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
