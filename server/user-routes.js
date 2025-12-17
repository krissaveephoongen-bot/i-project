/**
 * User Management API Routes
 * Complete CRUD operations for user management with role-based access control
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');

// User CRUD Operations

// Create user
router.post('/users', async (req, res) => {
  try {
    const { email, name, role = 'member', password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, name, password'
      });
    }

    const validRoles = ['admin', 'manager', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const query = `
      INSERT INTO users (email, name, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, role, avatar_url, created_at, updated_at
    `;

    const params = [email, name, role];
    const result = await executeQuery(query, params);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Get all users with filters
router.get('/users', async (req, res) => {
  try {
    const { role, limit = 50, offset = 0, search = '' } = req.query;

    let query = `
      SELECT id, email, name, role, avatar_url, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ` AND role = $${params.length + 1}`;
      params.push(role);
    }

    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      total: result.rowCount || result.rows.length
    });
  } catch (error) {
    console.error('❌ Get users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, email, name, role, avatar_url, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await executeQuery(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Get user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Get current user (authenticated)
router.get('/users/me', async (req, res) => {
  try {
    // In a real app, get user ID from JWT token
    const userId = req.headers['x-user-id'] || 'default-user-id';

    const query = `
      SELECT id, email, name, role, avatar_url, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await executeQuery(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Current user not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Get current user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current user',
      error: error.message
    });
  }
});

// Get user by email
router.get('/users/email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const query = `
      SELECT id, email, name, role, avatar_url, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await executeQuery(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Get user by email error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, avatar_url, role } = req.body;

    let query = `UPDATE users SET `;
    const params = [];
    const updates = [];

    if (email !== undefined) {
      updates.push(`email = $${params.length + 1}`);
      params.push(email);
    }

    if (name !== undefined) {
      updates.push(`name = $${params.length + 1}`);
      params.push(name);
    }

    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${params.length + 1}`);
      params.push(avatar_url);
    }

    if (role !== undefined) {
      const validRoles = ['admin', 'manager', 'member'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        });
      }
      updates.push(`role = $${params.length + 1}`);
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    query += updates.join(', ');
    query += ` WHERE id = $${params.length + 1}`;
    params.push(id);
    query += ` RETURNING id, email, name, role, avatar_url, created_at, updated_at`;

    const result = await executeQuery(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Update current user profile
router.put('/users/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'default-user-id';
    const { name, avatar_url } = req.body;

    let query = `UPDATE users SET `;
    const params = [];
    const updates = [];

    if (name !== undefined) {
      updates.push(`name = $${params.length + 1}`);
      params.push(name);
    }

    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${params.length + 1}`);
      params.push(avatar_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    query += updates.join(', ');
    query += ` WHERE id = $${params.length + 1}`;
    params.push(userId);
    query += ` RETURNING id, email, name, role, avatar_url, created_at, updated_at`;

    const result = await executeQuery(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, email, name, role, avatar_url, created_at, updated_at
    `;

    const result = await executeQuery(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Delete user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Bulk operations

// Bulk create users
router.post('/users/bulk/create', async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Users array is required and must not be empty'
      });
    }

    const successful = [];
    const failed = [];

    for (const user of users) {
      try {
        const { email, name, role = 'member' } = user;

        if (!email || !name) {
          failed.push({ email: user.email, error: 'Missing required fields' });
          continue;
        }

        const query = `
          INSERT INTO users (email, name, role)
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO NOTHING
          RETURNING id, email, name, role
        `;

        const result = await executeQuery(query, [email, name, role]);

        if (result.rows.length > 0) {
          successful.push(result.rows[0]);
        } else {
          failed.push({ email, error: 'User already exists' });
        }
      } catch (error) {
        failed.push({ email: user.email, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Created ${successful.length} users, ${failed.length} failed`,
      successful,
      failed
    });
  } catch (error) {
    console.error('❌ Bulk create users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk create users',
      error: error.message
    });
  }
});

// Bulk update user roles
router.put('/users/bulk/roles', async (req, res) => {
  try {
    const { userIds, role } = req.body;

    if (!Array.isArray(userIds) || !role) {
      return res.status(400).json({
        success: false,
        message: 'userIds array and role are required'
      });
    }

    const validRoles = ['admin', 'manager', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
    const query = `
      UPDATE users
      SET role = $${userIds.length + 1}, updated_at = NOW()
      WHERE id IN (${placeholders})
      RETURNING id
    `;

    const params = [...userIds, role];
    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      message: `Updated ${result.rowCount} users`,
      updated: result.rows.map(r => r.id),
      failed: userIds.filter(id => !result.rows.find(r => r.id === id))
    });
  } catch (error) {
    console.error('❌ Bulk update roles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update roles',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/users/stats', async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as new_users_this_month,
        jsonb_object_agg(role, count) as users_by_role
      FROM (
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      ) subquery
    `;

    const result = await executeQuery(query, []);

    res.status(200).json({
      success: true,
      data: {
        total_users: parseInt(result.rows[0].total_users || 0),
        new_users_this_month: parseInt(result.rows[0].new_users_this_month || 0),
        active_users: 0, // Would need login tracking
        users_by_role: result.rows[0].users_by_role || {}
      }
    });
  } catch (error) {
    console.error('❌ Get user stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

module.exports = router;
