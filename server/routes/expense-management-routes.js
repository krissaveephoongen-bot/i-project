/**
 * Expense Management Routes
 * Handles expense submission, approval, and tracking
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../services/database');
const { verifyToken } = require('../middleware/auth');

// Get all expenses (with filters)
router.get('/expenses', verifyToken, async (req, res) => {
    try {
        const { projectId, status, userId, category, page = 1, limit = 20 } = req.query;
        
        let query = `
            SELECT 
                e.*,
                p.name as project_name,
                u.name as submitted_by,
                a.name as approved_by_name
            FROM expenses e
            LEFT JOIN projects p ON e.project_id = p.id
            LEFT JOIN users u ON e.user_id = u.id
            LEFT JOIN users a ON e.approved_by = a.id
            WHERE e.is_deleted = FALSE
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (projectId) {
            query += ` AND e.project_id = $${paramIndex}`;
            params.push(projectId);
            paramIndex++;
        }
        
        if (status) {
            query += ` AND e.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        
        if (userId) {
            query += ` AND e.user_id = $${paramIndex}`;
            params.push(userId);
            paramIndex++;
        }
        
        if (category) {
            query += ` AND e.category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        
        query += ` ORDER BY e.expense_date DESC, e.created_at DESC`;
        
        // Pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            expenses: result.rows,
            total: result.rows.length,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch expenses',
            message: error.message
        });
    }
});

// Get single expense
router.get('/expenses/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                e.*,
                p.name as project_name,
                u.name as submitted_by,
                a.name as approved_by_name
            FROM expenses e
            LEFT JOIN projects p ON e.project_id = p.id
            LEFT JOIN users u ON e.user_id = u.id
            LEFT JOIN users a ON e.approved_by = a.id
            WHERE e.id = $1 AND e.is_deleted = FALSE
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }
        
        res.json({
            success: true,
            expense: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch expense',
            message: error.message
        });
    }
});

// Submit expense
router.post('/expenses', verifyToken, async (req, res) => {
    try {
        const {
            projectId,
            amount,
            category,
            description,
            receiptUrl,
            expenseDate
        } = req.body;
        
        if (!amount || !category || !expenseDate) {
            return res.status(400).json({
                success: false,
                error: 'Amount, category, and expense date are required'
            });
        }
        
        if (!['travel', 'food', 'accommodation', 'equipment', 'software', 'service', 'other'].includes(category)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category'
            });
        }
        
        const query = `
            INSERT INTO expenses (
                project_id,
                user_id,
                amount,
                category,
                description,
                receipt_url,
                expense_date,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
            RETURNING *
        `;
        
        const result = await pool.query(query, [
            projectId,
            req.user?.id,
            amount,
            category,
            description,
            receiptUrl,
            expenseDate
        ]);
        
        // Log audit
        await logAudit('expense', result.rows[0].id, 'create', req.user?.id, null, result.rows[0]);
        
        res.status(201).json({
            success: true,
            message: 'Expense submitted successfully',
            expense: result.rows[0]
        });
    } catch (error) {
        console.error('Error submitting expense:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit expense',
            message: error.message
        });
    }
});

// Update expense
router.patch('/expenses/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Get current data
        const selectQuery = `SELECT * FROM expenses WHERE id = $1 AND is_deleted = FALSE`;
        const selectResult = await pool.query(selectQuery, [id]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }
        
        const oldData = selectResult.rows[0];
        
        // Check if already approved/rejected
        if (oldData.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Cannot update a submitted expense'
            });
        }
        
        const allowedFields = ['amount', 'category', 'description', 'receipt_url', 'expense_date'];
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
            UPDATE expenses 
            SET ${setClause.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, params);
        
        // Log audit
        await logAudit('expense', result.rows[0].id, 'update', req.user?.id, oldData, result.rows[0]);
        
        res.json({
            success: true,
            message: 'Expense updated successfully',
            expense: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update expense',
            message: error.message
        });
    }
});

// Approve expense
router.patch('/expenses/:id/approve', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalNotes } = req.body;
        
        // Get current data
        const selectQuery = `SELECT * FROM expenses WHERE id = $1 AND is_deleted = FALSE`;
        const selectResult = await pool.query(selectQuery, [id]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }
        
        const oldData = selectResult.rows[0];
        
        const updateQuery = `
            UPDATE expenses 
            SET 
                status = 'approved',
                approval_notes = $1,
                approved_by = $2,
                approved_at = NOW(),
                updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, [
            approvalNotes || null,
            req.user?.id,
            id
        ]);
        
        // Log audit
        await logAudit('expense', result.rows[0].id, 'approve', req.user?.id, oldData, result.rows[0]);
        
        res.json({
            success: true,
            message: 'Expense approved',
            expense: result.rows[0]
        });
    } catch (error) {
        console.error('Error approving expense:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to approve expense',
            message: error.message
        });
    }
});

// Reject expense
router.patch('/expenses/:id/reject', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalNotes } = req.body;
        
        if (!approvalNotes) {
            return res.status(400).json({
                success: false,
                error: 'Rejection reason is required'
            });
        }
        
        // Get current data
        const selectQuery = `SELECT * FROM expenses WHERE id = $1 AND is_deleted = FALSE`;
        const selectResult = await pool.query(selectQuery, [id]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }
        
        const oldData = selectResult.rows[0];
        
        const updateQuery = `
            UPDATE expenses 
            SET 
                status = 'rejected',
                approval_notes = $1,
                approved_by = $2,
                approved_at = NOW(),
                updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, [
            approvalNotes,
            req.user?.id,
            id
        ]);
        
        // Log audit
        await logAudit('expense', result.rows[0].id, 'reject', req.user?.id, oldData, result.rows[0]);
        
        res.json({
            success: true,
            message: 'Expense rejected',
            expense: result.rows[0]
        });
    } catch (error) {
        console.error('Error rejecting expense:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reject expense',
            message: error.message
        });
    }
});

// Delete expense (soft delete)
router.delete('/expenses/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get current data
        const selectQuery = `SELECT * FROM expenses WHERE id = $1 AND is_deleted = FALSE`;
        const selectResult = await pool.query(selectQuery, [id]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }
        
        const oldData = selectResult.rows[0];
        
        const deleteQuery = `
            UPDATE expenses 
            SET is_deleted = TRUE, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await pool.query(deleteQuery, [id]);
        
        // Log audit
        await logAudit('expense', id, 'delete', req.user?.id, oldData, null);
        
        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete expense',
            message: error.message
        });
    }
});

// Get pending expenses for approval
router.get('/expenses/pending/approval', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                e.*,
                p.name as project_name,
                u.name as submitted_by
            FROM expenses e
            LEFT JOIN projects p ON e.project_id = p.id
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.status = 'pending' AND e.is_deleted = FALSE
            ORDER BY e.expense_date DESC
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            expenses: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching pending expenses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pending expenses',
            message: error.message
        });
    }
});

// Get expense summary
router.get('/expenses/summary/stats', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.query;
        
        let query = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
                COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as total_approved,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending
            FROM expenses
            WHERE is_deleted = FALSE
        `;
        
        const params = [];
        
        if (projectId) {
            query += ` AND project_id = $1`;
            params.push(projectId);
        }
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            stats: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching expense summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch expense summary',
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
