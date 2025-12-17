/**
 * Task Management Routes
 * Handles CRUD operations for tasks with status tracking
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../services/database');
const { verifyToken } = require('../middleware/auth');

// Get all tasks (with filters)
router.get('/tasks', verifyToken, async (req, res) => {
    try {
        const { projectId, status, priority, assignee, page = 1, limit = 20 } = req.query;
        
        let query = `
            SELECT 
                t.*,
                p.name as project_name,
                u.name as assignee_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN users u ON t.assignee = u.id
            WHERE t.is_deleted = FALSE
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (projectId) {
            query += ` AND t.project_id = $${paramIndex}`;
            params.push(projectId);
            paramIndex++;
        }
        
        if (status) {
            query += ` AND t.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        
        if (priority) {
            query += ` AND t.priority = $${paramIndex}`;
            params.push(priority);
            paramIndex++;
        }
        
        if (assignee) {
            query += ` AND t.assignee = $${paramIndex}`;
            params.push(assignee);
            paramIndex++;
        }
        
        query += ` ORDER BY t.created_at DESC`;
        
        // Pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        // Get total count
        let countQuery = `SELECT COUNT(*) FROM tasks WHERE is_deleted = FALSE`;
        const countParams = [];
        
        if (projectId) {
            countQuery += ` AND project_id = $1`;
            countParams.push(projectId);
        }
        
        const countResult = await pool.query(countQuery, countParams);
        
        res.json({
            success: true,
            tasks: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tasks',
            message: error.message
        });
    }
});

// Get single task
router.get('/tasks/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                t.*,
                p.name as project_name,
                u.name as assignee_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN users u ON t.assignee = u.id
            WHERE t.id = $1 AND t.is_deleted = FALSE
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        res.json({
            success: true,
            task: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task',
            message: error.message
        });
    }
});

// Create task
router.post('/tasks', verifyToken, async (req, res) => {
    try {
        const {
            projectId,
            name,
            description,
            assignee,
            status = 'todo',
            priority = 'medium',
            weight = 0,
            plannedStartDate,
            plannedEndDate,
            dueDate,
            estimatedHours
        } = req.body;
        
        if (!name || !projectId) {
            return res.status(400).json({
                success: false,
                error: 'Task name and project ID are required'
            });
        }
        
        const query = `
            INSERT INTO tasks (
                project_id,
                name,
                description,
                assignee,
                status,
                priority,
                weight,
                planned_start_date,
                planned_end_date,
                due_date,
                estimated_hours,
                created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        
        const result = await pool.query(query, [
            projectId,
            name,
            description,
            assignee,
            status,
            priority,
            weight,
            plannedStartDate,
            plannedEndDate,
            dueDate,
            estimatedHours,
            req.user?.id
        ]);
        
        // Log audit
        await logAudit('task', result.rows[0].id, 'create', req.user?.id, null, result.rows[0]);
        
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task',
            message: error.message
        });
    }
});

// Update task
router.patch('/tasks/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Get current data
        const selectQuery = `SELECT * FROM tasks WHERE id = $1 AND is_deleted = FALSE`;
        const selectResult = await pool.query(selectQuery, [id]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        const oldData = selectResult.rows[0];
        
        // Build dynamic update query
        const allowedFields = [
            'name', 'description', 'assignee', 'status', 'priority',
            'weight', 'progress', 'planned_start_date', 'planned_end_date',
            'due_date', 'estimated_hours'
        ];
        
        const setClause = [];
        const params = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = $${paramIndex}`);
                params.push(value);
                paramIndex++;
            }
        }
        
        if (setClause.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }
        
        setClause.push(`updated_at = NOW()`);
        params.push(id);
        
        const updateQuery = `
            UPDATE tasks 
            SET ${setClause.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, params);
        
        // Log audit
        await logAudit('task', result.rows[0].id, 'update', req.user?.id, oldData, result.rows[0]);
        
        res.json({
            success: true,
            message: 'Task updated successfully',
            task: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task',
            message: error.message
        });
    }
});

// Update task status
router.patch('/tasks/:id/status', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['todo', 'in-progress', 'review', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be: todo, in-progress, review, or completed'
            });
        }
        
        // Get current data
        const selectQuery = `SELECT * FROM tasks WHERE id = $1 AND is_deleted = FALSE`;
        const selectResult = await pool.query(selectQuery, [id]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        const oldData = selectResult.rows[0];
        
        const updateQuery = `
            UPDATE tasks 
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, [status, id]);
        
        // Log audit
        await logAudit('task', result.rows[0].id, 'update', req.user?.id, oldData, result.rows[0]);
        
        res.json({
            success: true,
            message: 'Task status updated',
            task: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task status',
            message: error.message
        });
    }
});

// Delete task (soft delete)
router.delete('/tasks/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get current data
        const selectQuery = `SELECT * FROM tasks WHERE id = $1 AND is_deleted = FALSE`;
        const selectResult = await pool.query(selectQuery, [id]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        
        const oldData = selectResult.rows[0];
        
        const deleteQuery = `
            UPDATE tasks 
            SET is_deleted = TRUE, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await pool.query(deleteQuery, [id]);
        
        // Log audit
        await logAudit('task', id, 'delete', req.user?.id, oldData, null);
        
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task',
            message: error.message
        });
    }
});

// Get project tasks
router.get('/projects/:projectId/tasks', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.query;
        
        let query = `
            SELECT 
                t.*,
                u.name as assignee_name
            FROM tasks t
            LEFT JOIN users u ON t.assignee = u.id
            WHERE t.project_id = $1 AND t.is_deleted = FALSE
        `;
        
        const params = [projectId];
        
        if (status) {
            query += ` AND t.status = $2`;
            params.push(status);
        }
        
        query += ` ORDER BY t.priority DESC, t.created_at DESC`;
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            tasks: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching project tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project tasks',
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
