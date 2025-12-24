/**
 * Teams Management Routes
 * Complete CRUD operations for team management with role-based access
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/neon-connection');
const {
  authenticateToken,
  requireRole,
  requireAdmin,
  checkTeamAccess
} = require('./middleware/auth-middleware');

// ============================================
// TEAM MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /teams
 * Get all teams (with member count)
 */
router.get('/teams', authenticateToken, async (req, res) => {
  try {
    const { search, status = 'active' } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT t.id, t.name, t.description, t.created_by, t.status, t.is_deleted, t.created_at, t.updated_at,
             u.name as creator_name, COUNT(tm.id) as member_count
      FROM teams t
      LEFT JOIN "User" u ON t.created_by = u.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.status = $1 AND t.is_deleted = false
    `;
    const params = [status];

    // Non-admin users only see teams they're members of
    if (req.user.role !== 'admin') {
      query += ` AND (
        t.created_by = $${params.length + 1}
        OR EXISTS (
          SELECT 1 FROM team_members tm2
          WHERE tm2.team_id = t.id AND tm2.user_id = $${params.length + 2}
        )
      )`;
      params.push(userId, userId);
    }

    if (search) {
      query += ` AND t.name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY t.id, t.name, t.description, t.created_by, t.status, t.is_deleted, t.created_at, t.updated_at, u.name ORDER BY t.created_at DESC`;

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      isEmpty: result.rows.length === 0,
      message: result.rows.length === 0 ? 'No teams found. Create your first team to get started.' : undefined
    });
    } catch (error) {
     console.error('❌ Get teams error:', error.message || error);
     res.status(500).json({
       success: false,
       message: 'Failed to fetch teams',
       error: error.message || 'Unknown error'
     });
     }
    });

/**
 * GET /teams/:id
 * Get specific team with members
 */
router.get('/teams/:id', authenticateToken, checkTeamAccess, async (req, res) => {
  try {
    const { id } = req.params;

    const teamResult = await executeQuery(
      `SELECT t.*, u.name as lead_name
       FROM teams t
       LEFT JOIN users u ON t.lead_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const membersResult = await executeQuery(
      `SELECT u.id, u.name, u.email, u.role, tm.role as team_role, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...teamResult.rows[0],
        members: membersResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Get team error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /teams
 * Create new team (admin/manager only)
 */
router.post('/teams', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { name, description, lead_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }

    const result = await executeQuery(
      `INSERT INTO teams (name, description, lead_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'active', NOW(), NOW())
       RETURNING *`,
      [name, description || '', lead_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Create team error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /teams/:id
 * Update team (lead/admin only)
 */
router.put('/teams/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, lead_id, status } = req.body;

    // Check permission - must be team lead or admin
    const teamResult = await executeQuery(
      'SELECT lead_id FROM teams WHERE id = $1',
      [id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const isLead = teamResult.rows[0].lead_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isLead && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only team lead or admin can update this team'
      });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push(`name = $${params.length + 1}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${params.length + 1}`);
      params.push(description);
    }
    if (lead_id !== undefined) {
      updates.push(`lead_id = $${params.length + 1}`);
      params.push(lead_id);
    }
    if (status !== undefined) {
      updates.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    const query = `UPDATE teams SET ${updates.join(', ')} WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);

    const result = await executeQuery(query, params);

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update team error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /teams/:id
 * Delete team (admin only - soft delete)
 */
router.delete('/teams/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      `UPDATE teams SET status = 'inactive', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete team error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// TEAM MEMBER MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /teams/:teamId/members
 * Get team members
 */
router.get('/teams/:teamId/members', authenticateToken, checkTeamAccess, async (req, res) => {
  try {
    const { teamId } = req.params;

    const result = await executeQuery(
      `SELECT u.id, u.name, u.email, u.role as user_role, tm.role as team_role, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at DESC`,
      [teamId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get team members error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /teams/:teamId/members
 * Add member to team
 */
router.post('/teams/:teamId/members', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { teamId } = req.params;
    const { user_id, role = 'member' } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    // Check if team exists
    const teamResult = await executeQuery(
      'SELECT id FROM teams WHERE id = $1',
      [teamId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user exists
    const userResult = await executeQuery(
      'SELECT id FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const result = await executeQuery(
      `INSERT INTO team_members (team_id, user_id, role, joined_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (team_id, user_id) DO UPDATE SET role = $3, joined_at = NOW()
       RETURNING *`,
      [teamId, user_id, role]
    );

    res.status(201).json({
      success: true,
      message: 'Member added to team',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Add member error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /teams/:teamId/members/:userId
 * Update team member role
 */
router.put('/teams/:teamId/members/:userId', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    const result = await executeQuery(
      `UPDATE team_members SET role = $1 WHERE team_id = $2 AND user_id = $3 RETURNING *`,
      [role, teamId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member role updated',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update member error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /teams/:teamId/members/:userId
 * Remove member from team
 */
router.delete('/teams/:teamId/members/:userId', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const result = await executeQuery(
      `DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING *`,
      [teamId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member removed from team'
    });
  } catch (error) {
    console.error('❌ Remove member error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /teams/:teamId/statistics
 * Get team statistics
 */
router.get('/teams/:teamId/statistics', authenticateToken, checkTeamAccess, async (req, res) => {
  try {
    const { teamId } = req.params;

    const countResult = await executeQuery(
      `SELECT COUNT(*) as member_count FROM team_members WHERE team_id = $1`,
      [teamId]
    );

    const rolesResult = await executeQuery(
      `SELECT role, COUNT(*) as count FROM team_members WHERE team_id = $1 GROUP BY role`,
      [teamId]
    );

    res.status(200).json({
      success: true,
      data: {
        total_members: countResult.rows[0].member_count,
        by_role: rolesResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Get statistics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
