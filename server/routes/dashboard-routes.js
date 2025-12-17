/**
 * Enhanced Dashboard Routes
 * Provides statistics and charts data
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../services/database');
const { verifyToken } = require('../middleware/auth');

// Get dashboard statistics
router.get('/dashboard/stats', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.query;
        
        let whereClause = '';
        const params = [];
        let paramIndex = 1;
        
        if (projectId) {
            whereClause = ` WHERE p.id = $${paramIndex}`;
            params.push(projectId);
            paramIndex++;
        }
        
        const query = `
            SELECT 
                COUNT(DISTINCT p.id) as total_projects,
                COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
                COUNT(DISTINCT t.id) as total_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'todo' THEN t.id END) as pending_tasks,
                COUNT(DISTINCT pm.id) as total_members,
                COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) as total_approved_expenses,
                COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END), 0) as total_pending_expenses,
                COALESCE(AVG(p.progress), 0) as average_project_progress,
                COALESCE(SUM(p.budget), 0) as total_budget
            FROM projects p
            LEFT JOIN tasks t ON p.id = t.project_id AND t.is_deleted = FALSE
            LEFT JOIN project_members pm ON p.id = pm.project_id
            LEFT JOIN expenses e ON p.id = e.project_id AND e.is_deleted = FALSE
            ${whereClause} AND p.is_deleted = FALSE
        `;
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            stats: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics',
            message: error.message
        });
    }
});

// Get project progress data (for charts)
router.get('/dashboard/charts/projects', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.progress,
                p.status,
                p.start_date,
                p.end_date,
                COUNT(DISTINCT t.id) as total_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                COALESCE(SUM(e.amount), 0) as total_expenses
            FROM projects p
            LEFT JOIN tasks t ON p.id = t.project_id AND t.is_deleted = FALSE
            LEFT JOIN expenses e ON p.id = e.project_id AND e.is_deleted = FALSE
            WHERE p.is_deleted = FALSE
            GROUP BY p.id, p.name, p.progress, p.status, p.start_date, p.end_date
            ORDER BY p.created_at DESC
            LIMIT 10
        `;
        
        const result = await pool.query(query);
        
        const chartData = result.rows.map(row => ({
            name: row.name,
            progress: parseFloat(row.progress) || 0,
            status: row.status,
            totalTasks: parseInt(row.total_tasks),
            completedTasks: parseInt(row.completed_tasks),
            totalExpenses: parseFloat(row.total_expenses)
        }));
        
        res.json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Error fetching project chart data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project chart data',
            message: error.message
        });
    }
});

// Get expense breakdown by category
router.get('/dashboard/charts/expenses', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                category,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total,
                COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as approved,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending
            FROM expenses
            WHERE is_deleted = FALSE
            GROUP BY category
            ORDER BY total DESC
        `;
        
        const result = await pool.query(query);
        
        const chartData = result.rows.map(row => ({
            category: row.category,
            count: parseInt(row.count),
            total: parseFloat(row.total),
            approved: parseFloat(row.approved),
            pending: parseFloat(row.pending)
        }));
        
        res.json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Error fetching expense chart data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch expense chart data',
            message: error.message
        });
    }
});

// Get task status distribution
router.get('/dashboard/charts/tasks', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.query;
        
        let whereClause = 'WHERE t.is_deleted = FALSE';
        const params = [];
        
        if (projectId) {
            whereClause += ` AND t.project_id = $1`;
            params.push(projectId);
        }
        
        const query = `
            SELECT 
                status,
                COUNT(*) as count,
                COALESCE(AVG(progress), 0) as avg_progress
            FROM tasks
            ${whereClause}
            GROUP BY status
            ORDER BY count DESC
        `;
        
        const result = await pool.query(query, params);
        
        const chartData = result.rows.map(row => ({
            status: row.status,
            count: parseInt(row.count),
            avgProgress: parseFloat(row.avg_progress)
        }));
        
        res.json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Error fetching task chart data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task chart data',
            message: error.message
        });
    }
});

// Get team utilization
router.get('/dashboard/charts/team', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id,
                u.name,
                u.department,
                COUNT(DISTINCT pm.project_id) as projects_assigned,
                COUNT(DISTINCT t.id) as tasks_assigned,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                COALESCE(AVG(t.progress), 0) as avg_task_progress
            FROM users u
            LEFT JOIN project_members pm ON u.id = pm.user_id
            LEFT JOIN tasks t ON u.id = t.assignee AND t.is_deleted = FALSE
            WHERE u.is_deleted = FALSE
            GROUP BY u.id, u.name, u.department
            ORDER BY projects_assigned DESC
            LIMIT 15
        `;
        
        const result = await pool.query(query);
        
        const chartData = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            department: row.department,
            projectsAssigned: parseInt(row.projects_assigned),
            tasksAssigned: parseInt(row.tasks_assigned),
            completedTasks: parseInt(row.completed_tasks),
            avgTaskProgress: parseFloat(row.avg_task_progress)
        }));
        
        res.json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Error fetching team chart data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team chart data',
            message: error.message
        });
    }
});

// Get summary data
router.get('/dashboard/summary', verifyToken, async (req, res) => {
    try {
        // Get today's activity
        const todayQuery = `
            SELECT 
                COUNT(DISTINCT CASE WHEN t.created_at::DATE = CURRENT_DATE THEN t.id END) as new_tasks_today,
                COUNT(DISTINCT CASE WHEN e.created_at::DATE = CURRENT_DATE AND e.status = 'pending' THEN e.id END) as pending_expenses_today,
                COALESCE(SUM(CASE WHEN e.created_at::DATE = CURRENT_DATE AND e.status = 'approved' THEN e.amount ELSE 0 END), 0) as approved_today
            FROM tasks t, expenses e
        `;
        
        const todayResult = await pool.query(todayQuery);
        
        // Get upcoming milestones
        const upcomingQuery = `
            SELECT 
                p.id,
                p.name,
                p.end_date,
                EXTRACT(DAY FROM p.end_date - NOW())::INTEGER as days_remaining,
                p.progress
            FROM projects p
            WHERE p.is_deleted = FALSE 
                AND p.end_date > NOW() 
                AND p.status = 'active'
            ORDER BY p.end_date ASC
            LIMIT 5
        `;
        
        const upcomingResult = await pool.query(upcomingQuery);
        
        res.json({
            success: true,
            summary: {
                todayActivity: todayResult.rows[0],
                upcomingMilestones: upcomingResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard summary',
            message: error.message
        });
    }
});

// Get project-specific dashboard
router.get('/dashboard/project/:projectId', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const query = `
            SELECT 
                p.*,
                COUNT(DISTINCT t.id) as total_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                COUNT(DISTINCT pm.id) as team_members,
                COALESCE(SUM(CASE WHEN e.status = 'approved' THEN e.amount ELSE 0 END), 0) as approved_budget_used,
                COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END), 0) as pending_expenses
            FROM projects p
            LEFT JOIN tasks t ON p.id = t.project_id AND t.is_deleted = FALSE
            LEFT JOIN project_members pm ON p.id = pm.project_id
            LEFT JOIN expenses e ON p.id = e.project_id AND e.is_deleted = FALSE
            WHERE p.id = $1 AND p.is_deleted = FALSE
            GROUP BY p.id
        `;
        
        const result = await pool.query(query, [projectId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        const project = result.rows[0];
        
        res.json({
            success: true,
            project: {
                ...project,
                budgetPercentageUsed: project.budget > 0 
                    ? ((parseFloat(project.approved_budget_used) / parseFloat(project.budget)) * 100).toFixed(2)
                    : 0,
                taskCompletionPercentage: project.total_tasks > 0
                    ? ((parseInt(project.completed_tasks) / parseInt(project.total_tasks)) * 100).toFixed(2)
                    : 0
            }
        });
    } catch (error) {
        console.error('Error fetching project dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch project dashboard',
            message: error.message
        });
    }
});

module.exports = router;
