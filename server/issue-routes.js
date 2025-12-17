/**
 * Project Issues API Routes
 * Handle CRUD operations for project issues with status tracking
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');

// Get all issues for a project
router.get('/projects/:projectId/issues', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, category } = req.query;

    let query = `
      SELECT * FROM project_issues
      WHERE project_id = $1 AND is_deleted = false
    `;
    const params = [projectId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (priority) {
      query += ` AND priority = $${params.length + 1}`;
      params.push(priority);
    }

    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('❌ Get issues error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message,
    });
  }
});

// Get issue details
router.get('/issues/:issueId', async (req, res) => {
  try {
    const { issueId } = req.params;

    const result = await executeQuery(
      'SELECT * FROM project_issues WHERE id = $1 AND is_deleted = false',
      [issueId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Get issue error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue',
      error: error.message,
    });
  }
});

// Create new issue
router.post('/projects/:projectId/issues', async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      code,
      title,
      description,
      category = 'other',
      priority = 'medium',
      assigned_to,
      reported_by,
      impact_on_schedule = false,
      impact_on_budget = false,
      estimated_cost,
      root_cause,
      due_date,
    } = req.body;

    // Validate required fields
    if (!code || !title) {
      return res.status(400).json({
        success: false,
        message: 'Code and title are required',
      });
    }

    // Check if project exists
    const projectCheck = await executeQuery(
      'SELECT id FROM projects WHERE id = $1 AND is_deleted = false',
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const query = `
      INSERT INTO project_issues (
        project_id, code, title, description, category, priority,
        assigned_to, reported_by, impact_on_schedule, impact_on_budget,
        estimated_cost, root_cause, due_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `;

    const result = await executeQuery(query, [
      projectId,
      code,
      title,
      description,
      category,
      priority,
      assigned_to || null,
      reported_by || null,
      impact_on_schedule,
      impact_on_budget,
      estimated_cost || null,
      root_cause || null,
      due_date || null,
    ]);

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Create issue error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create issue',
      error: error.message,
    });
  }
});

// Update issue
router.put('/issues/:issueId', async (req, res) => {
  try {
    const { issueId } = req.params;
    const {
      title,
      description,
      category,
      status,
      priority,
      assigned_to,
      impact_on_schedule,
      impact_on_budget,
      estimated_cost,
      root_cause,
      resolution_notes,
      due_date,
      resolved_date,
    } = req.body;

    // Check if issue exists
    const issueCheck = await executeQuery(
      'SELECT id FROM project_issues WHERE id = $1 AND is_deleted = false',
      [issueId]
    );

    if (issueCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    const fields = {
      title,
      description,
      category,
      status,
      priority,
      assigned_to,
      impact_on_schedule,
      impact_on_budget,
      estimated_cost,
      root_cause,
      resolution_notes,
      due_date,
      resolved_date,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = NOW()`);
    params.push(issueId);

    const query = `
      UPDATE project_issues
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Update issue error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update issue',
      error: error.message,
    });
  }
});

// Update issue status
router.patch('/issues/:issueId/status', async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, resolved_date } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const query = `
      UPDATE project_issues
      SET status = $1, 
          resolved_date = CASE WHEN $1 IN ('resolved', 'closed') THEN COALESCE($2, NOW()) ELSE resolved_date END,
          updated_at = NOW()
      WHERE id = $3 AND is_deleted = false
      RETURNING *
    `;

    const result = await executeQuery(query, [status, resolved_date || null, issueId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue status updated',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Update issue status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update issue status',
      error: error.message,
    });
  }
});

// Soft delete issue
router.delete('/issues/:issueId', async (req, res) => {
  try {
    const { issueId } = req.params;

    const result = await executeQuery(
      'UPDATE project_issues SET is_deleted = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [issueId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Delete issue error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete issue',
      error: error.message,
    });
  }
});

// Get issue summary for a project
router.get('/projects/:projectId/issues/summary', async (req, res) => {
  try {
    const { projectId } = req.params;

    const query = `
      SELECT 
        COUNT(*) AS total_issues,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_issues,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress_issues,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_issues,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_issues,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) AS critical_issues,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS high_priority_issues,
        SUM(CASE WHEN impact_on_schedule = true THEN 1 ELSE 0 END) AS schedule_impact_count,
        SUM(CASE WHEN impact_on_budget = true THEN 1 ELSE 0 END) AS budget_impact_count,
        COALESCE(SUM(estimated_cost), 0) AS total_issue_cost
      FROM project_issues
      WHERE project_id = $1 AND is_deleted = false
    `;

    const result = await executeQuery(query, [projectId]);

    res.status(200).json({
      success: true,
      data: result.rows[0] || {
        total_issues: 0,
        open_issues: 0,
        in_progress_issues: 0,
        resolved_issues: 0,
        closed_issues: 0,
        critical_issues: 0,
        high_priority_issues: 0,
        schedule_impact_count: 0,
        budget_impact_count: 0,
        total_issue_cost: 0,
      },
    });
  } catch (error) {
    console.error('❌ Get issue summary error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue summary',
      error: error.message,
    });
  }
});

// Get critical issues across all projects
router.get('/issues/critical', async (req, res) => {
  try {
    const query = `
      SELECT 
        pi.*,
        p.name AS project_name,
        p.code AS project_code
      FROM project_issues pi
      JOIN projects p ON pi.project_id = p.id
      WHERE pi.is_deleted = FALSE 
        AND (pi.status IN ('open', 'in-progress') OR pi.priority IN ('high', 'critical'))
      ORDER BY 
        CASE pi.priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        pi.created_at DESC
    `;

    const result = await executeQuery(query, []);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('❌ Get critical issues error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch critical issues',
      error: error.message,
    });
  }
});

module.exports = router;
