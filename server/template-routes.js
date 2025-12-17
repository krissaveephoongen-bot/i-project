/**
 * Template Routes
 * Handles project and task templates
 */

const express = require('express');
const { Client } = require('pg');
const dotenv = require('dotenv');
const { authenticateToken, requireManager } = require('./middleware/auth-middleware');

dotenv.config();

const router = express.Router();

const getDBClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
};

/**
 * GET /templates
 * Get all available templates
 */
router.get('/templates', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const result = await client.query(`
      SELECT id, name, description, category, type, created_at
      FROM templates
      WHERE is_active = TRUE
      ORDER BY category, name
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /templates/:templateName/tasks
 * Get tasks from a specific template
 */
router.get('/templates/:templateName/tasks', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { templateName } = req.params;

    // Get template
    const templateResult = await client.query(
      'SELECT id, name FROM templates WHERE name = $1 AND is_active = TRUE',
      [templateName]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    const templateId = templateResult.rows[0].id;

    // Get template tasks
    const tasksResult = await client.query(
      `SELECT id, name, description, priority, estimated_hours, order_index
       FROM template_tasks
       WHERE template_id = $1
       ORDER BY order_index ASC`,
      [templateId]
    );

    res.json({
      success: true,
      data: tasksResult.rows.map(t => ({
        id: t.id,
        title: t.name,
        description: t.description,
        priority: t.priority || 'medium',
        estimatedHours: t.estimated_hours || 0,
        tags: [],
      })),
      count: tasksResult.rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching template tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template tasks',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /templates
 * Create a new template (Manager+)
 */
router.post('/templates', authenticateToken, requireManager, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { name, description, category, type } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, category'
      });
    }

    const templateId = `template-${Date.now()}`;

    const result = await client.query(
      `INSERT INTO templates (id, name, description, category, type, is_active, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, TRUE, $6, NOW())
       RETURNING *`,
      [templateId, name, description, category, type || 'project', req.user.id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /templates/:templateId/tasks
 * Add task to template
 */
router.post('/templates/:templateId/tasks', authenticateToken, requireManager, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { templateId } = req.params;
    const { name, description, priority, estimatedHours, orderIndex } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: name'
      });
    }

    const taskId = `task-${Date.now()}`;

    const result = await client.query(
      `INSERT INTO template_tasks (id, template_id, name, description, priority, estimated_hours, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [taskId, templateId, name, description, priority || 'medium', estimatedHours || 0, orderIndex || 0]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Task added to template successfully'
    });
  } catch (error) {
    console.error('❌ Error adding task to template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add task to template',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /templates/:templateId
 * Get template details
 */
router.get('/templates/:templateId', authenticateToken, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { templateId } = req.params;

    const result = await client.query(
      'SELECT * FROM templates WHERE id = $1',
      [templateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * PUT /templates/:templateId
 * Update template
 */
router.put('/templates/:templateId', authenticateToken, requireManager, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { templateId } = req.params;
    const { name, description, category, isActive } = req.body;

    const result = await client.query(
      `UPDATE templates 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING *`,
      [name, description, category, isActive, templateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update template',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * DELETE /templates/:templateId
 * Delete template (soft delete)
 */
router.delete('/templates/:templateId', authenticateToken, requireManager, async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { templateId } = req.params;

    const result = await client.query(
      'UPDATE templates SET is_active = FALSE WHERE id = $1 RETURNING id',
      [templateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete template',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
