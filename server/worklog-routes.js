/**
 * Worklog Routes for Timesheet Management
 * Handles time entry CRUD operations and statistics
 */

const express = require('express');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Database connection
const getDBClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * GET /worklogs
 * Fetch worklogs with filters for date range and user
 */
router.get('/worklogs', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { startDate, endDate, userId, projectId, status } = req.query;
    let query = 'SELECT * FROM worklogs WHERE is_deleted = FALSE';
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

    if (projectId) {
      query += ` AND project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY date DESC';

    const result = await client.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching worklogs:', error);
    res.status(500).json({
      error: 'Failed to fetch worklogs',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /worklogs/:id
 * Fetch a single worklog entry
 */
router.get('/worklogs/:id', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM worklogs WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worklog not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching worklog:', error);
    res.status(500).json({
      error: 'Failed to fetch worklog',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /worklogs
 * Create a new worklog entry
 */
router.post('/worklogs', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const {
      date,
      user_id,
      user_name,
      work_type = 'project',
      project_id,
      task_id,
      description,
      start_time,
      end_time,
      hours,
      status = 'pending',
    } = req.body;

    // Validate required fields
    if (!date || !hours) {
      return res.status(400).json({
        error: 'Missing required fields: date, hours',
      });
    }

    const manday = hours / 8; // Convert hours to man-days (8 hours = 1 man-day)

    const result = await client.query(
      `INSERT INTO worklogs (
        date, user_id, user_name, work_type, project_id, task_id,
        description, start_time, end_time, hours, manday, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        date,
        user_id,
        user_name || 'System User',
        work_type,
        project_id,
        task_id,
        description,
        start_time,
        end_time,
        hours,
        manday,
        status,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating worklog:', error);
    res.status(500).json({
      error: 'Failed to create worklog',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * PUT /worklogs/:id
 * Update a worklog entry
 */
router.put('/worklogs/:id', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;
    const {
      date,
      user_id,
      user_name,
      work_type,
      project_id,
      task_id,
      description,
      start_time,
      end_time,
      hours,
      status,
    } = req.body;

    // Check if worklog exists
    const checkResult = await client.query(
      'SELECT * FROM worklogs WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Worklog not found' });
    }

    const manday = hours ? hours / 8 : checkResult.rows[0].manday;

    const result = await client.query(
      `UPDATE worklogs SET
        date = COALESCE($1, date),
        user_id = COALESCE($2, user_id),
        user_name = COALESCE($3, user_name),
        work_type = COALESCE($4, work_type),
        project_id = COALESCE($5, project_id),
        task_id = COALESCE($6, task_id),
        description = COALESCE($7, description),
        start_time = COALESCE($8, start_time),
        end_time = COALESCE($9, end_time),
        hours = COALESCE($10, hours),
        manday = COALESCE($11, manday),
        status = COALESCE($12, status),
        updated_at = NOW()
      WHERE id = $13
      RETURNING *`,
      [
        date,
        user_id,
        user_name,
        work_type,
        project_id,
        task_id,
        description,
        start_time,
        end_time,
        hours,
        manday,
        status,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating worklog:', error);
    res.status(500).json({
      error: 'Failed to update worklog',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * DELETE /worklogs/:id
 * Soft delete a worklog entry
 */
router.delete('/worklogs/:id', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;

    const result = await client.query(
      `UPDATE worklogs SET is_deleted = TRUE, updated_at = NOW()
       WHERE id = $1 AND is_deleted = FALSE
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worklog not found' });
    }

    res.json({ message: 'Worklog deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('❌ Error deleting worklog:', error);
    res.status(500).json({
      error: 'Failed to delete worklog',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /worklogs/analytics/summary
 * Get worklog summary statistics
 */
router.get('/worklogs/analytics/summary', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { startDate, endDate, userId } = req.query;
    let query = 'SELECT * FROM user_worklogs_summary WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (startDate && endDate) {
      query += ` AND week_start >= $${paramCount} AND week_start <= $${paramCount + 1}`;
      params.push(startDate, endDate);
    }

    const result = await client.query(query, params);

    // Calculate totals
    const totals = {
      total_hours: 0,
      total_mandays: 0,
      total_entries: 0,
      entries_by_user: result.rows,
    };

    result.rows.forEach(row => {
      totals.total_hours += parseFloat(row.total_hours) || 0;
      totals.total_mandays += parseFloat(row.total_mandays) || 0;
      totals.total_entries += parseInt(row.log_count) || 0;
    });

    res.json(totals);
  } catch (error) {
    console.error('❌ Error fetching worklog summary:', error);
    res.status(500).json({
      error: 'Failed to fetch worklog summary',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /worklogs/user/:userId
 * Get all worklogs for a specific user
 */
router.get('/worklogs/user/:userId', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM worklogs WHERE user_id = $1 AND is_deleted = FALSE';
    const params = [userId];
    let paramCount = 2;

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

    query += ' ORDER BY date DESC';

    const result = await client.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching user worklogs:', error);
    res.status(500).json({
      error: 'Failed to fetch user worklogs',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /worklogs/project/:projectId
 * Get all worklogs for a specific project
 */
router.get('/worklogs/project/:projectId', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { projectId } = req.params;
    const { startDate, endDate, status } = req.query;

    let query = 'SELECT * FROM worklogs WHERE project_id = $1 AND is_deleted = FALSE';
    const params = [projectId];
    let paramCount = 2;

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

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY date DESC';

    const result = await client.query(query, params);

    // Calculate project totals
    const totals = {
      total_hours: 0,
      total_mandays: 0,
      total_entries: result.rows.length,
      entries: result.rows,
    };

    result.rows.forEach(row => {
      totals.total_hours += parseFloat(row.hours) || 0;
      totals.total_mandays += parseFloat(row.manday) || 0;
    });

    res.json(totals);
  } catch (error) {
    console.error('❌ Error fetching project worklogs:', error);
    res.status(500).json({
      error: 'Failed to fetch project worklogs',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
