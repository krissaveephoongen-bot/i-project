/**
 * Team Management Routes
 * Handles adding/removing project members
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../services/database');
const { verifyToken } = require('../middleware/auth');

// Get all members of a project
router.get('/projects/:projectId/members', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const query = `
            SELECT 
                pm.id,
                pm.project_id,
                pm.user_id,
                pm.role,
                pm.assigned_at,
                u.name,
                u.email,
                u.department,
                u.position
            FROM project_members pm
            LEFT JOIN users u ON pm.user_id = u.id
            WHERE pm.project_id = $1
            ORDER BY pm.assigned_at DESC
        `;
        
        const result = await pool.query(query, [projectId]);
        
        res.json({
            success: true,
            members: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching project members:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project members',
            message: error.message
        });
    }
});

// Add member to project
router.post('/projects/:projectId/members', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, role = 'member' } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }
        
        // Check if user already exists in project
        const checkQuery = `
            SELECT id FROM project_members 
            WHERE project_id = $1 AND user_id = $2
        `;
        const checkResult = await pool.query(checkQuery, [projectId, userId]);
        
        if (checkResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'User is already a member of this project'
            });
        }
        
        // Add member
        const insertQuery = `
            INSERT INTO project_members (project_id, user_id, role, created_by)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await pool.query(insertQuery, [
            projectId,
            userId,
            role,
            req.user?.id
        ]);
        
        // Log the action
        await logAudit('member', result.rows[0].id, 'create', req.user?.id, null, result.rows[0]);
        
        res.status(201).json({
            success: true,
            message: 'Member added to project',
            member: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding project member:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add project member',
            message: error.message
        });
    }
});

// Remove member from project
router.delete('/projects/:projectId/members/:userId', verifyToken, async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        
        // Get member info before deletion for audit
        const selectQuery = `
            SELECT * FROM project_members 
            WHERE project_id = $1 AND user_id = $2
        `;
        const selectResult = await pool.query(selectQuery, [projectId, userId]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Member not found in this project'
            });
        }
        
        const memberData = selectResult.rows[0];
        
        // Delete member
        const deleteQuery = `
            DELETE FROM project_members 
            WHERE project_id = $1 AND user_id = $2
            RETURNING *
        `;
        
        const result = await pool.query(deleteQuery, [projectId, userId]);
        
        // Log the action
        await logAudit('member', memberData.id, 'delete', req.user?.id, memberData, null);
        
        res.json({
            success: true,
            message: 'Member removed from project'
        });
    } catch (error) {
        console.error('Error removing project member:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove project member',
            message: error.message
        });
    }
});

// Update member role in project
router.patch('/projects/:projectId/members/:userId', verifyToken, async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        const { role } = req.body;
        
        if (!role || !['lead', 'member', 'viewer'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be one of: lead, member, viewer'
            });
        }
        
        // Get current data
        const selectQuery = `
            SELECT * FROM project_members 
            WHERE project_id = $1 AND user_id = $2
        `;
        const selectResult = await pool.query(selectQuery, [projectId, userId]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Member not found in this project'
            });
        }
        
        const oldData = selectResult.rows[0];
        
        // Update role
        const updateQuery = `
            UPDATE project_members 
            SET role = $1
            WHERE project_id = $2 AND user_id = $3
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, [role, projectId, userId]);
        
        // Log the action
        await logAudit('member', result.rows[0].id, 'update', req.user?.id, oldData, result.rows[0]);
        
        res.json({
            success: true,
            message: 'Member role updated',
            member: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating project member role:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update project member role',
            message: error.message
        });
    }
});

// Get member count for project
router.get('/projects/:projectId/members/count', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const query = `
            SELECT COUNT(*) as count FROM project_members 
            WHERE project_id = $1
        `;
        
        const result = await pool.query(query, [projectId]);
        
        res.json({
            success: true,
            count: parseInt(result.rows[0].count)
        });
    } catch (error) {
        console.error('Error getting member count:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get member count',
            message: error.message
        });
    }
});

// Helper function to log audit
async function logAudit(entityType, entityId, action, changedBy, oldValue, newValue) {
    try {
        const query = `
            INSERT INTO audit_logs (entity_type, entity_id, action, changed_by, old_value, new_value)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        await pool.query(query, [
            entityType,
            entityId,
            action,
            changedBy,
            oldValue ? JSON.stringify(oldValue) : null,
            newValue ? JSON.stringify(newValue) : null
        ]);
    } catch (error) {
        console.error('Error logging audit:', error);
    }
}

module.exports = router;
