/**
 * Activity Log API Routes
 * Complete CRUD operations for activity log with audit trail functionality
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');

// Activity CRUD Operations

// Create activity log entry
router.post('/activities', async (req, res) => {
  try {
    const { action, entity_type, entity_id, user_id, details } = req.body;

    if (!action || !entity_type || !entity_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: action, entity_type, entity_id'
      });
    }

    const validEntityTypes = ['project', 'task', 'user', 'comment', 'worklog', 'expense'];
    if (!validEntityTypes.includes(entity_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid entity_type. Must be one of: ${validEntityTypes.join(', ')}`
      });
    }

    const query = `
      INSERT INTO activity_log (action, entity_type, entity_id, user_id, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const params = [action, entity_type, entity_id, user_id, details ? JSON.stringify(details) : null];
    const result = await executeQuery(query, params);

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create activity error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity log',
      error: error.message
    });
  }
});

// Get all activities with filters
router.get('/activities', async (req, res) => {
  try {
    const {
      entity_type,
      entity_id,
      user_id,
      action,
      limit = 50,
      offset = 0,
      start_date,
      end_date,
      sort = 'created_at'
    } = req.query;

    let query = `
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (entity_type) {
      query += ` AND a.entity_type = $${params.length + 1}`;
      params.push(entity_type);
    }

    if (entity_id) {
      query += ` AND a.entity_id = $${params.length + 1}`;
      params.push(entity_id);
    }

    if (user_id) {
      query += ` AND a.user_id = $${params.length + 1}`;
      params.push(user_id);
    }

    if (action) {
      query += ` AND a.action ILIKE $${params.length + 1}`;
      params.push(`%${action}%`);
    }

    if (start_date) {
      query += ` AND a.created_at >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND a.created_at <= $${params.length + 1}`;
      params.push(end_date);
    }

    const sortOptions = ['created_at', 'action', 'entity_type', 'user_id'];
    const validSort = sortOptions.includes(sort) ? sort : 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY a.${validSort} ${sortOrder}`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      total: result.rowCount || result.rows.length
    });
  } catch (error) {
    console.error('❌ Get activities error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
});

// Get activity by ID
router.get('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = $1
    `;

    const result = await executeQuery(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Get activity error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
});

// Update activity details
router.put('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, details } = req.body;

    let query = `
      UPDATE activity_log
      SET
    `;
    const params = [];
    const updates = [];

    if (action !== undefined) {
      updates.push(`action = $${params.length + 1}`);
      params.push(action);
    }

    if (details !== undefined) {
      updates.push(`details = $${params.length + 1}`);
      params.push(JSON.stringify(details));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    query += updates.join(', ');
    query += ` WHERE id = $${params.length + 1}`;
    params.push(id);
    query += ` RETURNING *`;

    const result = await executeQuery(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update activity error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: error.message
    });
  }
});

// Delete activity (hard delete - removes from database)
router.delete('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM activity_log
      WHERE id = $1
      RETURNING *
    `;

    const result = await executeQuery(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Delete activity error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message
    });
  }
});

// Bulk operations

// Get activity statistics
router.get('/activities/stats/summary', async (req, res) => {
  try {
    const {
      entity_type,
      start_date,
      end_date
    } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (entity_type) {
      whereClause += ` AND entity_type = $${params.length + 1}`;
      params.push(entity_type);
    }

    if (start_date) {
      whereClause += ` AND created_at >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ` AND created_at <= $${params.length + 1}`;
      params.push(end_date);
    }

    const query = `
      SELECT
        COUNT(*) as total_activities,
        COUNT(DISTINCT entity_id) as unique_entities,
        COUNT(DISTINCT user_id) as active_users,
        entity_type,
        DATE(created_at) as activity_date,
        array_agg(DISTINCT action) as actions
      FROM activity_log
      WHERE ${whereClause}
      GROUP BY entity_type, DATE(created_at)
      ORDER BY DATE(created_at) DESC
    `;

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Get activity stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics',
      error: error.message
    });
  }
});

// Get user activity history
router.get('/activities/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT 
        a.*,
        u.name as user_name
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await executeQuery(query, [userId, parseInt(limit), parseInt(offset)]);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get user activity error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activities',
      error: error.message
    });
  }
});

// Get entity activity history (all activities for a specific entity)
router.get('/activities/entity/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const validEntityTypes = ['project', 'task', 'user', 'comment', 'worklog', 'expense'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid entity_type. Must be one of: ${validEntityTypes.join(', ')}`
      });
    }

    const query = `
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = $1 AND a.entity_id = $2
      ORDER BY a.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await executeQuery(query, [entityType, entityId, parseInt(limit), parseInt(offset)]);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get entity activity error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entity activities',
      error: error.message
    });
  }
});

// Clear old activities (cleanup)
router.delete('/activities/cleanup/old', async (req, res) => {
  try {
    const { days = 90 } = req.query;

    const query = `
      DELETE FROM activity_log
      WHERE created_at < NOW() - INTERVAL '1 day' * $1
      RETURNING id
    `;

    const result = await executeQuery(query, [parseInt(days)]);

    res.status(200).json({
      success: true,
      message: `Deleted ${result.rowCount} old activities (older than ${days} days)`,
      deleted_count: result.rowCount
    });
  } catch (error) {
    console.error('❌ Cleanup activities error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup activities',
      error: error.message
    });
  }
});

module.exports = router;
