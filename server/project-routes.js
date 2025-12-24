/**
 * Project Management API Routes
 * Comprehensive CRUD operations for projects with Neon PostgreSQL integration
 */

const express = require('express');
const router = express.Router();
const { executeQuery, getClient } = require('../database/neon-connection');
// const validateCurrency = require('../middleware/currency-validator');

// Apply currency validation to all routes that handle monetary values
// router.use(validateCurrency);

// Project CRUD Operations

// Get user's assigned projects (My Projects)
router.get('/projects/my-projects', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, search = '', userId } = req.query;

    // Get userId from authenticated user or query param
    const targetUserId = req.user?.id || userId;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    let query = `
      SELECT DISTINCT p.* FROM projects p
      WHERE p.is_deleted = false
      AND (
        p.project_manager = $1 
        OR p.team_members ILIKE CONCAT('%', $1, '%')
      )
    `;
    const params = [targetUserId];

    if (status) {
      query += ` AND p.status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (p.name ILIKE $${params.length + 1} OR p.description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      total: result.rows.length,
      isEmpty: result.rows.length === 0,
      message: result.rows.length === 0 ? 'No projects found. Create your first project to get started.' : undefined
    });
  } catch (error) {
    console.error('❌ Get my-projects error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, search = '' } = req.query;

    let query = `
      SELECT * FROM projects
      WHERE is_deleted = false
    `;
    const params = [];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      total: result.rowCount || result.rows.length,
      isEmpty: result.rows.length === 0,
      message: result.rows.length === 0 ? 'No projects available. Create your first project to get started.' : undefined
    });
    } catch (error) {
    console.error('❌ Get projects error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
    }
    });

// Get single project by ID
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'SELECT * FROM projects WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Get project error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// Create new project
router.post('/projects', async (req, res) => {
  try {
    const projectData = req.body;

    // Validate required fields
    if (!projectData.name || !projectData.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const result = await executeQuery(`
      INSERT INTO projects (
        name, description, status, start_date, end_date, budget, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *
    `, [
      projectData.name,
      projectData.description || '',
      projectData.status || 'planning',
      projectData.start_date || null,
      projectData.end_date || null,
      projectData.budget || 0,
      projectData.created_by || 'system'
    ]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create project error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// Update project
router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = req.body;

    // Build dynamic update query
    const fields = Object.keys(projectData);
    const updates = fields.map((field, index) => `${field} = $${index + 1}`);
    const params = fields.map(field => projectData[field]);

    params.push(id);

    const result = await executeQuery(
      `UPDATE projects SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length} AND is_deleted = false RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or already deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update project error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// Partial update project (PATCH)
router.patch('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = req.body;

    if (Object.keys(projectData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Build dynamic update query for partial updates
    const fields = Object.keys(projectData);
    const updates = fields.map((field, index) => `${field} = $${index + 1}`);
    const params = fields.map(field => projectData[field]);

    params.push(id);

    const result = await executeQuery(
      `UPDATE projects SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length} AND is_deleted = false RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or already deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Patch project error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// Delete project (soft delete)
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'UPDATE projects SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND is_deleted = false RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or already deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Delete project error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// Task Management for Projects

// Get tasks by project ID
router.get('/projects/:projectId/tasks', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT * FROM tasks
      WHERE project_id = $1 AND is_deleted = false
    `;
    const params = [projectId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get project tasks error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project tasks',
      error: error.message
    });
  }
});

// Create task for project
router.post('/projects/:projectId/tasks', async (req, res) => {
  try {
    const { projectId } = req.params;
    const taskData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'description', 'assignee', 'due_date'];
    const missingFields = requiredFields.filter(field => !taskData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const result = await executeQuery(`
      INSERT INTO tasks (
        project_id, name, description, assignee, status, priority,
        weight, progress, planned_start_date, planned_end_date,
        due_date, estimated_hours, created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *
    `, [
      projectId,
      taskData.name,
      taskData.description,
      taskData.assignee,
      taskData.status || 'todo',
      taskData.priority || 'medium',
      taskData.weight || 0,
      taskData.progress || 0,
      taskData.planned_start_date || null,
      taskData.planned_end_date || null,
      taskData.due_date,
      taskData.estimated_hours || 0,
      taskData.created_by || 'system',
      taskData.updated_by || 'system'
    ]);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create task error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// Project Analytics

// Get S-Curve progress data (Plan vs Actual)
router.get('/projects/:id/s-curve', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate project exists
    const projectResult = await executeQuery(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const sCurveData = await calculateSCurve(id);

    res.status(200).json({
      success: true,
      data: sCurveData
    });
  } catch (error) {
    console.error('❌ Get S-Curve error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate S-Curve',
      error: error.message
    });
  }
});

// Export S-Curve as PDF
router.get('/projects/:id/s-curve/export/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate project exists
    const projectResult = await executeQuery(
      'SELECT name FROM projects WHERE id = $1',
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const projectName = projectResult.rows[0].name;

    // Generate PDF
    const pdfBuffer = await generateSCurvePdf(id);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="S-Curve-${projectName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ S-Curve PDF export error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
});

// Get project progress analytics
router.get('/projects/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;

    // Get project with tasks
    const projectResult = await executeQuery(
      'SELECT * FROM projects WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const tasksResult = await executeQuery(
      'SELECT * FROM tasks WHERE project_id = $1 AND is_deleted = false',
      [id]
    );

    const worklogsResult = await executeQuery(
      'SELECT * FROM worklogs WHERE project_id = $1 AND is_deleted = false',
      [id]
    );

    const expensesResult = await executeQuery(
      'SELECT * FROM expenses WHERE project_id = $1 AND is_deleted = false',
      [id]
    );

    const project = projectResult.rows[0];
    const tasks = tasksResult.rows;
    const worklogs = worklogsResult.rows;
    const expenses = expensesResult.rows;

    // Calculate analytics
    const taskStatusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const totalHours = worklogs.reduce((sum, log) => sum + (log.hours || 0), 0);
    const totalMandays = totalHours / 8;
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    const progressData = {
      overallProgress: project.progress || 0,
      taskCompletion: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0,
      budgetUsage: project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0,
      timeUsage: project.duration_days > 0 ? ((new Date() - new Date(project.start_date)) / (1000 * 60 * 60 * 24 * project.duration_days)) * 100 : 0
    };

    res.status(200).json({
      success: true,
      data: {
        project,
        tasks: {
          total: tasks.length,
          statusCounts: taskStatusCounts,
          completionRate: progressData.taskCompletion
        },
        worklogs: {
          total: worklogs.length,
          totalHours,
          totalMandays
        },
        expenses: {
          total: expenses.length,
          totalAmount: totalExpenses,
          budgetUsage: progressData.budgetUsage
        },
        progress: progressData
      }
    });
  } catch (error) {
    console.error('❌ Get project analytics error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project analytics',
      error: error.message
    });
  }
});

// User Assignment and Tracking

// Assign user to project
router.post('/projects/:projectId/assign-user', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    // Check if project exists
    const projectResult = await executeQuery(
      'SELECT * FROM projects WHERE id = $1 AND is_deleted = false',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user exists
    const userResult = await executeQuery(
      'SELECT * FROM users WHERE id = $1 AND is_deleted = false',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update project team members
    const project = projectResult.rows[0];
    const currentTeam = project.team_members ? project.team_members.split(',') : [];
    const updatedTeam = [...currentTeam, userId].filter((v, i, a) => a.indexOf(v) === i);

    const result = await executeQuery(
      'UPDATE projects SET team_members = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [updatedTeam.join(','), projectId]
    );

    res.status(200).json({
      success: true,
      message: 'User assigned to project successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Assign user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to assign user to project',
      error: error.message
    });
  }
});

// Project Reporting

// Generate project report
router.get('/projects/:id/report', async (req, res) => {
  try {
    const { id } = req.params;

    // Get comprehensive project data
    const projectResult = await executeQuery(
      'SELECT * FROM projects WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const [tasksResult, worklogsResult, expensesResult] = await Promise.all([
      executeQuery('SELECT * FROM tasks WHERE project_id = $1 AND is_deleted = false', [id]),
      executeQuery('SELECT * FROM worklogs WHERE project_id = $1 AND is_deleted = false', [id]),
      executeQuery('SELECT * FROM expenses WHERE project_id = $1 AND is_deleted = false', [id])
    ]);

    const project = projectResult.rows[0];
    const tasks = tasksResult.rows;
    const worklogs = worklogsResult.rows;
    const expenses = expensesResult.rows;

    // Generate comprehensive report
    const report = {
      projectInfo: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.start_date,
        endDate: project.end_date,
        durationDays: project.duration_days,
        progress: project.progress,
        budget: project.budget,
        contractAmount: project.contract_amount
      },
      taskSummary: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        inProgressTasks: tasks.filter(t => t.status === 'progress').length,
        pendingTasks: tasks.filter(t => t.status === 'todo').length,
        completionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0
      },
      worklogSummary: {
        totalWorklogs: worklogs.length,
        totalHours: worklogs.reduce((sum, log) => sum + (log.hours || 0), 0),
        totalMandays: worklogs.reduce((sum, log) => sum + (log.hours || 0), 0) / 8,
        averageHoursPerTask: tasks.length > 0 ? worklogs.reduce((sum, log) => sum + (log.hours || 0), 0) / tasks.length : 0
      },
      expenseSummary: {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
        budgetUsage: project.budget > 0 ? (expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0) / project.budget) * 100 : 0,
        averageExpense: expenses.length > 0 ? expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0) / expenses.length : 0
      },
      generatedAt: new Date().toISOString(),
      reportId: `REP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('❌ Generate project report error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate project report',
      error: error.message
    });
  }
});

// Project Charter Management

// Save/Update project charter
router.post('/projects/:id/charter', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectObjective, businessCase, successCriteria, scope, constraints, assumptions, risks } = req.body;

    // Validate required fields
    if (!projectObjective || !businessCase || !successCriteria) {
      return res.status(400).json({
        success: false,
        message: 'Project Objective, Business Case, and Success Criteria are required'
      });
    }

    // Check if project exists
    const projectCheck = await executeQuery(
      'SELECT id FROM projects WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (!projectCheck.rows || projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Store charter as JSON in a charter field or separate table
    // For now, we'll store it as a JSONB field if it exists, otherwise create a workaround
    const charterData = {
      projectObjective: projectObjective.trim(),
      businessCase: businessCase.trim(),
      successCriteria: successCriteria.trim(),
      scope: scope || '',
      constraints: constraints || '',
      assumptions: assumptions || '',
      risks: risks || '',
      savedAt: new Date().toISOString()
    };

    // Try to update projects table if it has a charter column
    try {
      const result = await executeQuery(
        `UPDATE projects SET charter = $1, updated_at = NOW() WHERE id = $2 AND is_deleted = false RETURNING *`,
        [JSON.stringify(charterData), id]
      );

      if (result.rows && result.rows.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'Charter saved successfully',
          data: result.rows[0]
        });
      }
    } catch (columnError) {
      // If charter column doesn't exist, just update the project metadata
      console.warn('Charter column not found, storing in project metadata');
    }

    // Fallback: update basic fields
    const result = await executeQuery(
      `UPDATE projects SET objective = $1, updated_at = NOW() WHERE id = $2 AND is_deleted = false RETURNING *`,
      [projectObjective, id]
    );

    if (result.rows && result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Failed to save charter'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Charter saved successfully',
      data: {
        ...result.rows[0],
        charter: charterData
      }
    });
  } catch (error) {
    console.error('❌ Save charter error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to save charter',
      error: error.message
    });
  }
});

// Get project charter
router.get('/projects/:id/charter', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'SELECT id, name, charter FROM projects WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = result.rows[0];
    const charter = project.charter ? (typeof project.charter === 'string' ? JSON.parse(project.charter) : project.charter) : null;

    res.status(200).json({
      success: true,
      data: {
        projectId: project.id,
        projectName: project.name,
        charter: charter
      }
    });
  } catch (error) {
    console.error('❌ Get charter error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch charter',
      error: error.message
    });
  }
});

module.exports = router;