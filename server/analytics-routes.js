/**
 * Analytics Summary Routes
 * Main analytics endpoint for dashboard
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');

// Get analytics summary
router.get('/analytics', async (req, res) => {
  try {
    // Get total projects
    const projectsResult = await executeQuery(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        COALESCE(SUM(contract_amount), 0) as total_budget,
        COALESCE(SUM(CASE WHEN status = 'active' THEN contract_amount ELSE 0 END), 0) as active_budget
      FROM projects WHERE is_deleted = false`
    );

    // Get team size
    const teamResult = await executeQuery(
      `SELECT COUNT(DISTINCT user_id) as team_size FROM project_team`
    );

    // Calculate completion rate
    const completionResult = await executeQuery(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
      FROM tasks WHERE is_deleted = false`
    );

    // Get spent budget from expenses
    const expenseResult = await executeQuery(
      `SELECT COALESCE(SUM(amount), 0) as spent FROM expenses WHERE status = 'approved' AND is_deleted = false`
    );

    const projectData = projectsResult.rows[0] || {};
    const teamData = teamResult.rows[0] || { team_size: 0 };
    const completionData = completionResult.rows[0] || { total_tasks: 0, completed_tasks: 0 };
    const expenseData = expenseResult.rows[0] || { spent: 0 };

    const completionRate = completionData.total_tasks > 0 
      ? Math.round((completionData.completed_tasks / completionData.total_tasks) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProjects: parseInt(projectData.total) || 0,
        completedProjects: parseInt(projectData.completed) || 0,
        activeProjects: parseInt(projectData.active) || 0,
        totalBudget: parseFloat(projectData.total_budget) || 0,
        spentBudget: parseFloat(expenseData.spent) || 0,
        teamSize: parseInt(teamData.team_size) || 0,
        completionRate: completionRate,
      }
    });
  } catch (error) {
    console.error('❌ Analytics error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

module.exports = router;
