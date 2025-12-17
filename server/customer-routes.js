/**
 * Customer Management API Routes
 * CRUD operations for customers/clients
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');

/**
 * Get all customers
 */
router.get('/customers', async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    let query = `SELECT * FROM customers WHERE is_deleted = false`;
    const params = [];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1} OR contact_person ILIKE $${params.length + 1})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0,
    });
  } catch (error) {
    console.error('❌ Get customers error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message,
    });
  }
});

/**
 * Get customer by ID
 */
router.get('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'SELECT * FROM customers WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Get customer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message,
    });
  }
});

/**
 * Create new customer
 */
router.post('/customers', async (req, res) => {
  try {
    const { name, contact_person, email, phone, address, type = 'private', status = 'active' } = req.body;

    // Validate required field
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required',
      });
    }

    const query = `
      INSERT INTO customers (name, contact_person, email, phone, address, type, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const params = [name.trim(), contact_person, email, phone, address, type, status];

    const result = await executeQuery(query, params);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Create customer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message,
    });
  }
});

/**
 * Update customer
 */
router.put('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_person, email, phone, address, type, status } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name.trim());
    }
    if (contact_person !== undefined) {
      updates.push(`contact_person = $${paramIndex++}`);
      params.push(contact_person);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      params.push(address);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      params.push(type);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      AND is_deleted = false
      RETURNING *
    `;

    const result = await executeQuery(query, params);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Update customer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message,
    });
  }
});

/**
 * Delete customer (soft delete)
 */
router.delete('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'UPDATE customers SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND is_deleted = false RETURNING *',
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Delete customer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message,
    });
  }
});

module.exports = router;
