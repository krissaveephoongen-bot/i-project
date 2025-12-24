/**
 * Expense Routes
 * Handles expense tracking and approval workflow
 */

const express = require('express');
const { Client } = require('pg');
const dotenv = require('dotenv');
const validateCurrency = require('./middleware/currency-validator');

dotenv.config();

const router = express.Router();

// Apply currency validation to all expense routes
router.use(validateCurrency);

const getDBClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
};

/**
 * GET /
 * Fetch expenses with filters
 */
router.get('/', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { startDate, endDate, projectId, category, status, userId } = req.query;
    let query = `
      SELECT 
        e.*,
        p.name as project
      FROM expenses e
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.is_deleted = FALSE
    `;
    const params = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND e.date >= $${paramCount}`;
      params.push(startDate.split('T')[0]);
      paramCount++;
    }

    if (endDate) {
      query += ` AND e.date <= $${paramCount}`;
      params.push(endDate.split('T')[0]);
      paramCount++;
    }

    if (projectId) {
      query += ` AND e.project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    if (category) {
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (status) {
      query += ` AND e.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (userId) {
      query += ` AND e.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    query += ' ORDER BY e.date DESC';

    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching expenses:', error);
    res.status(500).json({
      error: 'Failed to fetch expenses',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /:id
 * Fetch single expense
 */
router.get('/:id', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;
    const result = await client.query(
      'SELECT * FROM expenses WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching expense:', error);
    res.status(500).json({
      error: 'Failed to fetch expense',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /
 * Create new expense
 */
router.post('/', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const {
      date,
      project_id,
      category,
      amount,
      description,
      user_id,
      user_name,
      status = 'pending',
    } = req.body;

    if (!date || !amount || !category || !description) {
      return res.status(400).json({
        error: 'Missing required fields: date, amount, category, description',
      });
    }

    const result = await client.query(
      `INSERT INTO expenses (
        date, project_id, category, amount, description, user_id, user_name, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [date, project_id, category, amount, description, user_id, user_name || 'System User', status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating expense:', error);
    res.status(500).json({
      error: 'Failed to create expense',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * PUT /:id
 * Update expense
 */
router.put('/:id', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;
    const {
      date,
      project_id,
      category,
      amount,
      description,
      user_id,
      user_name,
      status,
    } = req.body;

    // Check if expense exists
    const checkResult = await client.query(
      'SELECT * FROM expenses WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const result = await client.query(
      `UPDATE expenses SET
        date = COALESCE($1, date),
        project_id = COALESCE($2, project_id),
        category = COALESCE($3, category),
        amount = COALESCE($4, amount),
        description = COALESCE($5, description),
        user_id = COALESCE($6, user_id),
        user_name = COALESCE($7, user_name),
        status = COALESCE($8, status),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [date, project_id, category, amount, description, user_id, user_name, status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating expense:', error);
    res.status(500).json({
      error: 'Failed to update expense',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * DELETE /:id
 * Soft delete expense
 */
router.delete('/:id', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;

    const result = await client.query(
      `UPDATE expenses SET is_deleted = TRUE, updated_at = NOW()
       WHERE id = $1 AND is_deleted = FALSE
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting expense:', error);
    res.status(500).json({
      error: 'Failed to delete expense',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * GET /analytics/summary
 * Get expense summary by category
 */
router.get('/analytics/summary', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { startDate, endDate, status } = req.query;
    let query = 'SELECT * FROM project_expenses_summary';
    const params = [];

    if (startDate || endDate || status) {
      query = `SELECT category, SUM(amount) as total_amount, COUNT(*) as expense_count
               FROM expenses WHERE is_deleted = FALSE`;
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

      if (status) {
        query += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      query += ' GROUP BY category ORDER BY total_amount DESC';
    }

    const result = await client.query(query, params);
    res.json(result.rows);
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
 * POST /:id/approve
 * Approve expense
 */
router.post('/:id/approve', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;

    const result = await client.query(
      `UPDATE expenses SET status = 'approved', updated_at = NOW()
       WHERE id = $1 AND is_deleted = FALSE
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error approving expense:', error);
    res.status(500).json({
      error: 'Failed to approve expense',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

/**
 * POST /:id/reject
 * Reject expense
 */
router.post('/:id/reject', async (req, res) => {
  const client = getDBClient();
  try {
    await client.connect();

    const { id } = req.params;

    const result = await client.query(
      `UPDATE expenses SET status = 'rejected', updated_at = NOW()
       WHERE id = $1 AND is_deleted = FALSE
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error rejecting expense:', error);
    res.status(500).json({
      error: 'Failed to reject expense',
      message: error.message,
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
