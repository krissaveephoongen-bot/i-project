/**
 * Team Member Management API Routes
 * Complete CRUD operations for team member management
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');

// Get all team members with optional filters
router.get('/team-members', async (req, res) => {
  try {
    const { role, status = 'active', department, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        id, 
        name, 
        email, 
        role, 
        department, 
        position, 
        status, 
        created_at, 
        updated_at
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Add status filter (default: active)
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Add role filter
    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    // Add department filter
    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    // Add search filter (searches name and email)
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting and pagination
    query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await executeQuery(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const countParams = [];
    let countParamIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    if (role) {
      countQuery += ` AND role = $${countParamIndex}`;
      countParams.push(role);
      countParamIndex++;
    }
    if (department) {
      countQuery += ` AND department = $${countParamIndex}`;
      countParams.push(department);
      countParamIndex++;
    }
    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      teamMembers: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching team members:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members',
      error: error.message,
    });
  }
});

// Get a specific team member
router.get('/team-members/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    const query = `
      SELECT 
        id, 
        name, 
        email, 
        role, 
        department, 
        position, 
        status, 
        created_at, 
        updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await executeQuery(query, [memberId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    res.json({
      success: true,
      teamMember: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error fetching team member:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team member',
      error: error.message,
    });
  }
});

// Create a new team member
router.post('/team-members', async (req, res) => {
  try {
    const { name, email, role, department, position, status = 'active' } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email',
      });
    }

    // Check if user already exists
    const existingUser = await executeQuery('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Team member with this email already exists',
      });
    }

    // Validate status
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const query = `
      INSERT INTO users (name, email, role, department, position, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, 
        name, 
        email, 
        role, 
        department, 
        position, 
        status, 
        created_at, 
        updated_at
    `;

    const result = await executeQuery(query, [name, email, role || null, department || null, position || null, status]);

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      teamMember: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error creating team member:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create team member',
      error: error.message,
    });
  }
});

// Update a team member
router.put('/team-members/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { name, email, role, department, position, status } = req.body;

    // Check if member exists
    const existingMember = await executeQuery('SELECT id FROM users WHERE id = $1', [memberId]);

    if (existingMember.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }
    if (role !== undefined) {
      updates.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }
    if (department !== undefined) {
      updates.push(`department = $${paramIndex}`);
      params.push(department);
      paramIndex++;
    }
    if (position !== undefined) {
      updates.push(`position = $${paramIndex}`);
      params.push(position);
      paramIndex++;
    }
    if (status !== undefined) {
      // Validate status
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    params.push(memberId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING 
        id, 
        name, 
        email, 
        role, 
        department, 
        position, 
        status, 
        created_at, 
        updated_at
    `;

    const result = await executeQuery(query, params);

    res.json({
      success: true,
      message: 'Team member updated successfully',
      teamMember: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error updating team member:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update team member',
      error: error.message,
    });
  }
});

// Delete a team member
router.delete('/team-members/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check if member exists
    const existingMember = await executeQuery('SELECT id FROM users WHERE id = $1', [memberId]);

    if (existingMember.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      });
    }

    // Delete the team member
    await executeQuery('DELETE FROM users WHERE id = $1', [memberId]);

    res.json({
      success: true,
      message: 'Team member deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting team member:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team member',
      error: error.message,
    });
  }
});

// Get team member statistics
router.get('/team-members/statistics', async (req, res) => {
  try {
    // Total members by status
    const totalQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_members,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_members
      FROM users
    `;

    const totalResult = await executeQuery(totalQuery);
    const {
      total = 0,
      active_members = 0,
      inactive_members = 0,
    } = totalResult.rows[0];

    // Members by role
    const byRoleQuery = `
      SELECT role, COUNT(*) as count
      FROM users
      WHERE role IS NOT NULL
      GROUP BY role
      ORDER BY count DESC
    `;
    const byRoleResult = await executeQuery(byRoleQuery);

    // Members by department
    const byDepartmentQuery = `
      SELECT department, COUNT(*) as count
      FROM users
      WHERE department IS NOT NULL
      GROUP BY department
      ORDER BY count DESC
    `;
    const byDepartmentResult = await executeQuery(byDepartmentQuery);

    res.json({
      success: true,
      statistics: {
        totalMembers: parseInt(total),
        activeMembers: parseInt(active_members),
        inactiveMembers: parseInt(inactive_members),
        byRole: byRoleResult.rows.map((row) => ({
          role: row.role,
          count: parseInt(row.count),
        })),
        byDepartment: byDepartmentResult.rows.map((row) => ({
          department: row.department,
          count: parseInt(row.count),
        })),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
});

module.exports = router;
