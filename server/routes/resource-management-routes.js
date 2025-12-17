/**
 * Resource Management Routes
 * Handles resource allocation, team, and capacity management
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../services/database');
const { verifyToken } = require('../middleware/auth');

// Get all resources with capacity information
router.get('/resources', verifyToken, async (req, res) => {
    try {
        const { projectId, department } = req.query;
        
        let query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.department,
                u.position,
                u.hourly_rate,
                COUNT(DISTINCT pm.project_id) as projects_assigned,
                COUNT(DISTINCT t.id) as tasks_assigned,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                COALESCE(SUM(CASE WHEN t.status != 'completed' THEN t.estimated_hours ELSE 0 END), 0) as allocated_hours,
                COALESCE(AVG(t.progress), 0) as avg_progress,
                (SELECT COUNT(*) FROM project_members WHERE user_id = u.id) as total_projects
            FROM users u
            LEFT JOIN project_members pm ON u.id = pm.user_id
            LEFT JOIN tasks t ON u.id = t.assignee AND t.is_deleted = FALSE
            WHERE u.is_deleted = FALSE AND u.status = 'active'
        `;
        
        const params = [];
        
        if (department) {
            query += ` AND u.department = $${params.length + 1}`;
            params.push(department);
        }
        
        query += `
            GROUP BY u.id, u.name, u.email, u.department, u.position, u.hourly_rate
            ORDER BY u.name ASC
        `;
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            resources: result.rows.map(row => ({
                id: row.id,
                name: row.name,
                email: row.email,
                department: row.department,
                position: row.position,
                hourlyRate: parseFloat(row.hourly_rate),
                projectsAssigned: parseInt(row.projects_assigned),
                tasksAssigned: parseInt(row.tasks_assigned),
                completedTasks: parseInt(row.completed_tasks),
                allocatedHours: parseFloat(row.allocated_hours),
                avgProgress: parseFloat(row.avg_progress),
                totalProjects: parseInt(row.total_projects),
                utilization: calculateUtilization(row.allocated_hours)
            })),
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resources',
            message: error.message
        });
    }
});

// Get single resource details
router.get('/resources/:resourceId', verifyToken, async (req, res) => {
    try {
        const { resourceId } = req.params;
        
        const query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.department,
                u.position,
                u.hourly_rate,
                u.phone,
                u.status,
                COUNT(DISTINCT pm.project_id) as projects_assigned,
                COUNT(DISTINCT t.id) as tasks_assigned,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                COALESCE(SUM(CASE WHEN t.status != 'completed' THEN t.estimated_hours ELSE 0 END), 0) as allocated_hours,
                COALESCE(AVG(t.progress), 0) as avg_progress
            FROM users u
            LEFT JOIN project_members pm ON u.id = pm.user_id
            LEFT JOIN tasks t ON u.id = t.assignee AND t.is_deleted = FALSE
            WHERE u.id = $1 AND u.is_deleted = FALSE
            GROUP BY u.id, u.name, u.email, u.department, u.position, u.hourly_rate, u.phone, u.status
        `;
        
        const result = await pool.query(query, [resourceId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Resource not found'
            });
        }
        
        const resource = result.rows[0];
        
        // Get project assignments for this resource
        const projectsQuery = `
            SELECT 
                p.id,
                p.name,
                p.status,
                pm.role,
                COUNT(DISTINCT t.id) as task_count,
                COALESCE(SUM(t.estimated_hours), 0) as total_hours
            FROM project_members pm
            LEFT JOIN projects p ON pm.project_id = p.id
            LEFT JOIN tasks t ON p.id = t.project_id AND t.assignee = $1 AND t.is_deleted = FALSE
            WHERE pm.user_id = $1
            GROUP BY p.id, p.name, p.status, pm.role
            ORDER BY p.name ASC
        `;
        
        const projectsResult = await pool.query(projectsQuery, [resourceId]);
        
        // Get task assignments
        const tasksQuery = `
            SELECT 
                t.id,
                t.name,
                t.status,
                t.priority,
                t.progress,
                t.estimated_hours,
                t.due_date,
                p.name as project_name,
                p.id as project_id
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.assignee = $1 AND t.is_deleted = FALSE
            ORDER BY t.due_date ASC
        `;
        
        const tasksResult = await pool.query(tasksQuery, [resourceId]);
        
        res.json({
            success: true,
            resource: {
                id: resource.id,
                name: resource.name,
                email: resource.email,
                department: resource.department,
                position: resource.position,
                phone: resource.phone,
                hourlyRate: parseFloat(resource.hourly_rate),
                status: resource.status,
                projectsAssigned: parseInt(resource.projects_assigned),
                tasksAssigned: parseInt(resource.tasks_assigned),
                completedTasks: parseInt(resource.completed_tasks),
                allocatedHours: parseFloat(resource.allocated_hours),
                avgProgress: parseFloat(resource.avg_progress),
                utilization: calculateUtilization(resource.allocated_hours),
                projects: projectsResult.rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    status: row.status,
                    role: row.role,
                    taskCount: parseInt(row.task_count),
                    totalHours: parseFloat(row.total_hours)
                })),
                tasks: tasksResult.rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    status: row.status,
                    priority: row.priority,
                    progress: parseFloat(row.progress),
                    estimatedHours: parseFloat(row.estimated_hours),
                    dueDate: row.due_date,
                    projectName: row.project_name,
                    projectId: row.project_id
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching resource details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resource details',
            message: error.message
        });
    }
});

// Get team members for a project
router.get('/resources/team/:projectId', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const query = `
            SELECT 
                pm.id as membership_id,
                u.id,
                u.name,
                u.email,
                u.department,
                u.position,
                u.hourly_rate,
                pm.role,
                pm.assigned_at,
                COUNT(DISTINCT t.id) as tasks_in_project,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                COALESCE(SUM(t.estimated_hours), 0) as estimated_hours,
                COALESCE(AVG(t.progress), 0) as avg_progress
            FROM project_members pm
            LEFT JOIN users u ON pm.user_id = u.id
            LEFT JOIN tasks t ON pm.project_id = t.project_id 
                AND t.assignee = u.id 
                AND t.is_deleted = FALSE
            WHERE pm.project_id = $1 AND u.is_deleted = FALSE
            GROUP BY pm.id, u.id, u.name, u.email, u.department, u.position, u.hourly_rate, pm.role, pm.assigned_at
            ORDER BY u.name ASC
        `;
        
        const result = await pool.query(query, [projectId]);
        
        res.json({
            success: true,
            teamMembers: result.rows.map(row => ({
                membershipId: row.membership_id,
                id: row.id,
                name: row.name,
                email: row.email,
                department: row.department,
                position: row.position,
                hourlyRate: parseFloat(row.hourly_rate),
                role: row.role,
                assignedAt: row.assigned_at,
                tasksInProject: parseInt(row.tasks_in_project),
                completedTasks: parseInt(row.completed_tasks),
                estimatedHours: parseFloat(row.estimated_hours),
                avgProgress: parseFloat(row.avg_progress)
            })),
            total: result.rows.length,
            projectId: projectId
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team members',
            message: error.message
        });
    }
});

// Get resource allocation for a project
router.get('/resources/allocation/:projectId', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Get detailed allocation data
        const query = `
            SELECT 
                u.id as resource_id,
                u.name as resource_name,
                u.department,
                pm.role,
                p.name as project_name,
                p.id as project_id,
                p.status as project_status,
                COUNT(DISTINCT t.id) as task_count,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_count,
                COUNT(DISTINCT CASE WHEN t.status = 'todo' THEN t.id END) as pending_count,
                COUNT(DISTINCT CASE WHEN t.status = 'in-progress' THEN t.id END) as in_progress_count,
                COALESCE(SUM(t.estimated_hours), 0) as total_estimated_hours,
                COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.estimated_hours ELSE 0 END), 0) as completed_hours,
                COALESCE(AVG(t.progress), 0) as avg_progress,
                MAX(t.due_date) as latest_due_date,
                COUNT(DISTINCT CASE WHEN t.priority = 'critical' THEN t.id END) as critical_tasks,
                COUNT(DISTINCT CASE WHEN t.priority = 'high' THEN t.id END) as high_priority_tasks
            FROM project_members pm
            LEFT JOIN users u ON pm.user_id = u.id
            LEFT JOIN projects p ON pm.project_id = p.id
            LEFT JOIN tasks t ON p.id = t.project_id 
                AND t.assignee = u.id 
                AND t.is_deleted = FALSE
            WHERE pm.project_id = $1 AND u.is_deleted = FALSE
            GROUP BY u.id, u.name, u.department, pm.role, p.name, p.id, p.status
            ORDER BY u.name ASC
        `;
        
        const result = await pool.query(query, [projectId]);
        
        // Calculate summary statistics
        let totalAllocatedHours = 0;
        let totalCompletedHours = 0;
        let totalTasks = 0;
        let totalCompleted = 0;
        
        result.rows.forEach(row => {
            totalAllocatedHours += parseFloat(row.total_estimated_hours);
            totalCompletedHours += parseFloat(row.completed_hours);
            totalTasks += parseInt(row.task_count);
            totalCompleted += parseInt(row.completed_count);
        });
        
        res.json({
            success: true,
            projectId: projectId,
            allocations: result.rows.map(row => ({
                resourceId: row.resource_id,
                resourceName: row.resource_name,
                department: row.department,
                role: row.role,
                projectName: row.project_name,
                projectId: row.project_id,
                projectStatus: row.project_status,
                taskCount: parseInt(row.task_count),
                completedCount: parseInt(row.completed_count),
                pendingCount: parseInt(row.pending_count),
                inProgressCount: parseInt(row.in_progress_count),
                totalEstimatedHours: parseFloat(row.total_estimated_hours),
                completedHours: parseFloat(row.completed_hours),
                remainingHours: parseFloat(row.total_estimated_hours) - parseFloat(row.completed_hours),
                avgProgress: parseFloat(row.avg_progress),
                latestDueDate: row.latest_due_date,
                criticalTasks: parseInt(row.critical_tasks),
                highPriorityTasks: parseInt(row.high_priority_tasks),
                utilizationRate: calculateAllocationRate(
                    parseFloat(row.total_estimated_hours),
                    parseFloat(row.completed_hours)
                )
            })),
            summary: {
                totalAllocatedHours,
                totalCompletedHours,
                totalRemainingHours: totalAllocatedHours - totalCompletedHours,
                totalTasks,
                totalCompleted,
                overallProgress: totalTasks > 0 ? (totalCompleted / totalTasks * 100).toFixed(2) : 0,
                teamSize: result.rows.length
            }
        });
    } catch (error) {
        console.error('Error fetching resource allocation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resource allocation',
            message: error.message
        });
    }
});

// Get team capacity and utilization
router.get('/resources/capacity/team', verifyToken, async (req, res) => {
    try {
        const { department } = req.query;
        
        let query = `
            SELECT 
                u.id,
                u.name,
                u.department,
                u.position,
                u.hourly_rate,
                COUNT(DISTINCT pm.project_id) as projects_count,
                COUNT(DISTINCT t.id) as total_tasks,
                COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
                COUNT(DISTINCT CASE WHEN t.status IN ('todo', 'in-progress') THEN t.id END) as active_tasks,
                COALESCE(SUM(t.estimated_hours), 0) as total_hours,
                COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.estimated_hours ELSE 0 END), 0) as completed_hours,
                COALESCE(AVG(t.progress), 0) as avg_progress
            FROM users u
            LEFT JOIN project_members pm ON u.id = pm.user_id
            LEFT JOIN tasks t ON u.id = t.assignee AND t.is_deleted = FALSE
            WHERE u.is_deleted = FALSE AND u.status = 'active'
        `;
        
        const params = [];
        
        if (department) {
            query += ` AND u.department = $${params.length + 1}`;
            params.push(department);
        }
        
        query += `
            GROUP BY u.id, u.name, u.department, u.position, u.hourly_rate
            ORDER BY u.department ASC, u.name ASC
        `;
        
        const result = await pool.query(query, params);
        
        // Group by department
        const byDepartment = {};
        result.rows.forEach(row => {
            if (!byDepartment[row.department]) {
                byDepartment[row.department] = [];
            }
            byDepartment[row.department].push({
                id: row.id,
                name: row.name,
                position: row.position,
                hourlyRate: parseFloat(row.hourly_rate),
                projectsCount: parseInt(row.projects_count),
                totalTasks: parseInt(row.total_tasks),
                completedTasks: parseInt(row.completed_tasks),
                activeTasks: parseInt(row.active_tasks),
                totalHours: parseFloat(row.total_hours),
                completedHours: parseFloat(row.completed_hours),
                avgProgress: parseFloat(row.avg_progress),
                utilization: calculateUtilization(row.total_hours),
                capacity: calculateCapacity(row.active_tasks, row.total_hours)
            });
        });
        
        res.json({
            success: true,
            teamCapacity: byDepartment,
            totalResources: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching team capacity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team capacity',
            message: error.message
        });
    }
});

// Get resource availability (for allocation)
router.get('/resources/availability/list', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.department,
                u.position,
                u.hourly_rate,
                COUNT(DISTINCT pm.project_id) as current_projects,
                COUNT(DISTINCT CASE WHEN t.status IN ('todo', 'in-progress', 'review') THEN t.id END) as pending_tasks,
                COALESCE(SUM(CASE WHEN t.status IN ('todo', 'in-progress', 'review') THEN t.estimated_hours ELSE 0 END), 0) as allocated_hours,
                CASE 
                    WHEN COUNT(DISTINCT pm.project_id) >= 3 THEN 'High'
                    WHEN COUNT(DISTINCT pm.project_id) >= 2 THEN 'Medium'
                    ELSE 'Low'
                END as workload
            FROM users u
            LEFT JOIN project_members pm ON u.id = pm.user_id
            LEFT JOIN tasks t ON u.id = t.assignee AND t.is_deleted = FALSE
            WHERE u.is_deleted = FALSE AND u.status = 'active'
            GROUP BY u.id, u.name, u.email, u.department, u.position, u.hourly_rate
            ORDER BY workload ASC, u.name ASC
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            availableResources: result.rows.map(row => ({
                id: row.id,
                name: row.name,
                email: row.email,
                department: row.department,
                position: row.position,
                hourlyRate: parseFloat(row.hourly_rate),
                currentProjects: parseInt(row.current_projects),
                pendingTasks: parseInt(row.pending_tasks),
                allocatedHours: parseFloat(row.allocated_hours),
                workload: row.workload,
                available: row.workload === 'Low'
            })),
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching resource availability:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resource availability',
            message: error.message
        });
    }
});

// Helper functions
function calculateUtilization(hours) {
    // Assume 40 hour work week
    const maxHours = 40;
    const utilization = (parseFloat(hours) / maxHours) * 100;
    return Math.min(utilization, 100).toFixed(2);
}

function calculateCapacity(tasks, hours) {
    if (tasks === 0) return 'Available';
    if (tasks <= 2 && hours <= 20) return 'Available';
    if (tasks <= 4 && hours <= 35) return 'Moderate';
    return 'At Capacity';
}

function calculateAllocationRate(estimated, completed) {
    if (estimated === 0) return 0;
    return ((completed / estimated) * 100).toFixed(2);
}

module.exports = router;
