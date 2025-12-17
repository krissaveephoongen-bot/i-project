/**
 * Time Entries Routes for Timesheet Management
 * Handles time entry CRUD operations using the time_entries table
 */

const express = require('express');
const { executeQuery, getClient } = require('../database/neon-connection');

const router = express.Router();

/**
 * GET /timeentries
 * Fetch time entries with filters for date range and user
 */
router.get('/timeentries', async (req, res) => {
  try {
    const { startDate, endDate, userId, projectId, status } = req.query;
    let query = `
      SELECT
        te.*,
        p.name as project,
        t.name as task,
        u.name as user_name,
        au.name as approved_by_name
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN users u ON te.user_id = u.id
      LEFT JOIN users au ON te.approved_by = au.id
      WHERE te.is_deleted = false
    `;
    const params = [];

    if (startDate) {
      query += ` AND te.date >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND te.date <= $${params.length + 1}`;
      params.push(endDate);
    }

    if (userId) {
      query += ` AND te.user_id = $${params.length + 1}`;
      params.push(userId);
    }

    if (projectId) {
      query += ` AND te.project_id = $${params.length + 1}`;
      params.push(projectId);
    }

    if (status) {
      query += ` AND te.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ' ORDER BY te.date DESC, te.created_at DESC';

    const result = await executeQuery(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching time entries:', error);
    res.status(500).json({
      error: 'Failed to fetch time entries',
      message: error.message,
    });
  }
});

/**
 * GET /timeentries/:id
 * Fetch a single time entry
 */
router.get('/timeentries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await executeQuery(`
      SELECT
        te.*,
        p.name as project,
        t.name as task,
        u.name as user_name,
        au.name as approved_by_name
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN users u ON te.user_id = u.id
      LEFT JOIN users au ON te.approved_by = au.id
      WHERE te.id = $1 AND te.is_deleted = false
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching time entry:', error);
    res.status(500).json({
      error: 'Failed to fetch time entry',
      message: error.message,
    });
  }
});

/**
 * POST /timeentries
 * Create a new time entry
 */
router.post('/timeentries', async (req, res) => {
  try {
    const {
      date,
      workType,
      projectId,
      taskId,
      userId,
      startTime,
      endTime,
      hours,
      description,
    } = req.body;

    // Validate required fields
    if (!date || !workType || !userId || !hours) {
      return res.status(400).json({
        error: 'Missing required fields: date, workType, userId, hours',
      });
    }

    if (workType === 'project' && !projectId) {
      return res.status(400).json({
        error: 'Project ID is required for project work type',
      });
    }

    const result = await executeQuery(
      `INSERT INTO time_entries (
        date, work_type, project_id, task_id, user_id, start_time, end_time, hours, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        date,
        workType,
        projectId || null,
        taskId || null,
        userId,
        startTime || null,
        endTime || null,
        hours,
        description || '',
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating time entry:', error);
    res.status(500).json({
      error: 'Failed to create time entry',
      message: error.message,
    });
  }
});

/**
 * PUT /timeentries/:id
 * Update a time entry
 */
router.put('/timeentries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      workType,
      projectId,
      taskId,
      startTime,
      endTime,
      hours,
      description,
      status,
      approvedBy,
    } = req.body;

    // Check if time entry exists
    const checkResult = await executeQuery(
      'SELECT * FROM time_entries WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    const updateFields = [];
    const params = [];

    if (date !== undefined) {
      updateFields.push(`date = $${params.length + 1}`);
      params.push(date);
    }
    if (workType !== undefined) {
      updateFields.push(`work_type = $${params.length + 1}`);
      params.push(workType);
    }
    if (projectId !== undefined) {
      updateFields.push(`project_id = $${params.length + 1}`);
      params.push(projectId);
    }
    if (taskId !== undefined) {
      updateFields.push(`task_id = $${params.length + 1}`);
      params.push(taskId);
    }
    if (startTime !== undefined) {
      updateFields.push(`start_time = $${params.length + 1}`);
      params.push(startTime);
    }
    if (endTime !== undefined) {
      updateFields.push(`end_time = $${params.length + 1}`);
      params.push(endTime);
    }
    if (hours !== undefined) {
      updateFields.push(`hours = $${params.length + 1}`);
      params.push(hours);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${params.length + 1}`);
      params.push(description);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${params.length + 1}`);
      params.push(status);
      if (status === 'approved' && approvedBy) {
        updateFields.push(`approved_by = $${params.length + 1}`);
        params.push(approvedBy);
        updateFields.push(`approved_at = NOW()`);
      }
    }

    updateFields.push('updated_at = NOW()');

    const result = await executeQuery(
      `UPDATE time_entries SET ${updateFields.join(', ')} WHERE id = $${params.length + 1} AND is_deleted = false RETURNING *`,
      [...params, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating time entry:', error);
    res.status(500).json({
      error: 'Failed to update time entry',
      message: error.message,
    });
  }
});

/**
 * DELETE /timeentries/:id
 * Soft delete a time entry
 */
router.delete('/timeentries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'UPDATE time_entries SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND is_deleted = false RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    res.json({ message: 'Time entry deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('❌ Error deleting time entry:', error);
    res.status(500).json({
      error: 'Failed to delete time entry',
      message: error.message,
    });
  }
});

/**
 * GET /timeentries/approvals/pending
 * Get pending time entries for approval
 */
router.get('/timeentries/approvals/pending', async (req, res) => {
  try {
    // Get time entries that need approval (pending status)
    const result = await executeQuery(`
      SELECT
        te.*,
        p.name as project,
        t.name as task,
        u.name as user_name,
        u.email as user_email
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN users u ON te.user_id = u.id
      WHERE te.status = 'pending' AND te.is_deleted = false
      ORDER BY te.date DESC, te.created_at DESC
    `);

    // Group by user for approval workflow
    const approvalsByUser = {};
    result.rows.forEach(entry => {
      if (!approvalsByUser[entry.user_id]) {
        approvalsByUser[entry.user_id] = {
          id: entry.user_id, // Add id field for frontend compatibility
          userId: entry.user_id,
          userName: entry.user_name,
          userEmail: entry.user_email,
          submittedDate: entry.created_at,
          status: 'pending',
          totalHours: 0,
          entries: []
        };
      }
      approvalsByUser[entry.user_id].entries.push({
        id: entry.id,
        date: entry.date,
        task: entry.task_name || 'General Work',
        project: entry.project_name || 'No Project',
        hours: parseFloat(entry.hours),
        description: entry.description,
        workType: entry.work_type
      });
      approvalsByUser[entry.user_id].totalHours += parseFloat(entry.hours);
    });

    const approvals = Object.values(approvalsByUser);
    res.json(approvals);
  } catch (error) {
    console.error('❌ Error fetching pending approvals:', error);
    res.status(500).json({
      error: 'Failed to fetch pending approvals',
      message: error.message,
    });
  }
});

/**
 * POST /timeentries/:id/approve
 * Approve a time entry
 */
router.post('/timeentries/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const result = await executeQuery(
      `UPDATE time_entries
       SET status = 'approved', approved_by = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND status = 'pending' AND is_deleted = false
       RETURNING *`,
      [approvedBy, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found or already processed' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error approving time entry:', error);
    res.status(500).json({
      error: 'Failed to approve time entry',
      message: error.message,
    });
  }
});

/**
 * POST /timeentries/:id/reject
 * Reject a time entry
 */
router.post('/timeentries/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, rejectionReason } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    const result = await executeQuery(
      `UPDATE time_entries
       SET status = 'rejected', approved_by = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND status = 'pending' AND is_deleted = false
       RETURNING *`,
      [approvedBy, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found or already processed' });
    }

    // Log rejection reason in activity log if provided
    if (rejectionReason) {
      await executeQuery(
        `INSERT INTO activity_log (entity_type, entity_id, type, action, description, user_id, changes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['time_entry', id, 'update', 'rejected', `Rejected: ${rejectionReason}`, approvedBy, { rejectionReason }]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error rejecting time entry:', error);
    res.status(500).json({
      error: 'Failed to reject time entry',
      message: error.message,
    });
  }
});

/**
 * GET /timeentries/reports/summary
 * Get timesheet reports summary
 */
router.get('/timeentries/reports/summary', async (req, res) => {
  try {
    const { startDate, endDate, userId, period = 'month' } = req.query;

    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = `AND te.date >= $${params.length + 1} AND te.date <= $${params.length + 2}`;
      params.push(startDate, endDate);
    }

    // Get total statistics
    const totalsQuery = `
      SELECT
        COUNT(*) as total_entries,
        COALESCE(SUM(te.hours), 0) as total_hours,
        COUNT(DISTINCT te.user_id) as total_users,
        COUNT(DISTINCT DATE(te.date)) as total_days,
        AVG(te.hours) as avg_hours_per_entry
      FROM time_entries te
      WHERE te.is_deleted = false ${dateFilter}
    `;

    const totalsResult = await executeQuery(totalsQuery, params);

    // Get breakdown by project
    const projectQuery = `
      SELECT
        p.name as project_name,
        COUNT(te.id) as entry_count,
        COALESCE(SUM(te.hours), 0) as total_hours,
        COUNT(DISTINCT te.user_id) as user_count,
        ROUND((COUNT(te.id) * 100.0 / NULLIF(SUM(COUNT(te.id)) OVER(), 0)), 2) as percentage
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.is_deleted = false ${dateFilter}
      GROUP BY p.id, p.name
      ORDER BY total_hours DESC
    `;

    const projectResult = await executeQuery(projectQuery, params);

    // Get breakdown by work type
    const workTypeQuery = `
      SELECT
        te.work_type,
        COUNT(te.id) as entry_count,
        COALESCE(SUM(te.hours), 0) as total_hours,
        ROUND((SUM(te.hours) * 100.0 / NULLIF(SUM(SUM(te.hours)) OVER(), 0)), 2) as percentage
      FROM time_entries te
      WHERE te.is_deleted = false ${dateFilter}
      GROUP BY te.work_type
      ORDER BY total_hours DESC
    `;

    const workTypeResult = await executeQuery(workTypeQuery, params);

    // Get breakdown by status
    const statusQuery = `
      SELECT
        te.status,
        COUNT(te.id) as entry_count,
        COALESCE(SUM(te.hours), 0) as total_hours
      FROM time_entries te
      WHERE te.is_deleted = false ${dateFilter}
      GROUP BY te.status
      ORDER BY total_hours DESC
    `;

    const statusResult = await executeQuery(statusQuery, params);

    res.json({
      period,
      dateRange: { startDate, endDate },
      totals: totalsResult.rows[0],
      projectBreakdown: projectResult.rows,
      workTypeBreakdown: workTypeResult.rows,
      statusBreakdown: statusResult.rows,
    });
  } catch (error) {
    console.error('❌ Error fetching timesheet reports:', error);
    res.status(500).json({
      error: 'Failed to fetch timesheet reports',
      message: error.message,
    });
  }
});

module.exports = router;