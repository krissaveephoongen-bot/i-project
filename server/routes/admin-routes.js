/**
 * Admin Console Routes
 * Complete admin panel functionality
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../services/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Admin Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Query user
    const userQuery = `
      SELECT id, name, email, password, role, status 
      FROM users 
      WHERE email = $1 AND is_deleted = FALSE
    `;
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have admin access'
      });
    }

    // Verify password (in production, use proper password hashing)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get Dashboard Stats
router.get('/dashboard/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Total projects
    const projectsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(budget), 0) as total_budget
      FROM projects 
      WHERE is_deleted = FALSE
    `;
    const projectsResult = await pool.query(projectsQuery);
    const projectsData = projectsResult.rows[0];

    // Total users
    const usersQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active
      FROM users 
      WHERE is_deleted = FALSE AND role != 'admin'
    `;
    const usersResult = await pool.query(usersQuery);
    const usersData = usersResult.rows[0];

    // Pending approvals
    const approvalsQuery = `
      SELECT COUNT(*) as pending FROM timesheets 
      WHERE status = 'pending' AND is_deleted = FALSE
    `;
    const approvalsResult = await pool.query(approvalsQuery);
    const approvalsData = approvalsResult.rows[0];

    res.json({
      success: true,
      data: {
        projects: {
          total_projects: parseInt(projectsData.total),
          active_projects: parseInt(projectsData.active),
          completed_projects: parseInt(projectsData.completed),
          total_budget: parseFloat(projectsData.total_budget)
        },
        users: {
          total_users: parseInt(usersData.total),
          active_users: parseInt(usersData.active)
        },
        timesheets: {
          pending_approvals: parseInt(approvalsData.pending)
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// Get all projects (admin view)
router.get('/projects', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        id, name, description, status, budget, progress, 
        start_date, end_date, created_at, updated_at
      FROM projects
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        status: row.status,
        budget: parseFloat(row.budget),
        progress: parseFloat(row.progress),
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
});

// Create/Update project (admin)
router.post('/projects', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, budget, status } = req.body;

    const query = `
      INSERT INTO projects (name, description, budget, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, description, budget, status || 'active']);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
});

router.put('/projects/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, budget, status } = req.body;

    const query = `
      UPDATE projects
      SET name = $1, description = $2, budget = $3, status = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, description, budget, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
});

router.delete('/projects/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE projects
      SET is_deleted = TRUE, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
});

// Get all users (admin view)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        id, name, email, role, status, department, position, created_at
      FROM users
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.status,
        department: row.department,
        position: row.position,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Create user (admin)
router.post('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    const query = `
      INSERT INTO users (name, email, role, password, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING id, name, email, role
    `;
    
    const result = await pool.query(query, [name, email, role || 'member', password || 'Password@123']);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user (admin)
router.put('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const query = `
      UPDATE users
      SET name = $1, email = $2, role = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, email, role
    `;
    
    const result = await pool.query(query, [name, email, role, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Get all tasks (admin view)
router.get('/tasks', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id, t.name, t.description, t.status, t.priority,
        t.created_at, t.updated_at,
        u.name as assignee_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee = u.id
      WHERE t.is_deleted = FALSE
      ORDER BY t.created_at DESC
      LIMIT 100
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        status: row.status,
        priority: row.priority,
        assigneeName: row.assignee_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
});

// Create task (admin)
router.post('/tasks', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, status, priority } = req.body;

    const query = `
      INSERT INTO tasks (name, description, status, priority)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, description, status || 'todo', priority || 'medium']);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
});

// Update task (admin)
router.put('/tasks/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority } = req.body;

    const query = `
      UPDATE tasks
      SET name = $1, description = $2, status = $3, priority = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, description, status, priority, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
});

// Get system statistics (admin)
router.get('/statistics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const queries = [
      `SELECT COUNT(*) as count FROM projects WHERE is_deleted = FALSE`,
      `SELECT COUNT(*) as count FROM users WHERE is_deleted = FALSE`,
      `SELECT COUNT(*) as count FROM tasks WHERE is_deleted = FALSE`,
      `SELECT COUNT(*) as count FROM timesheets WHERE is_deleted = FALSE`,
      `SELECT COALESCE(SUM(budget), 0) as total FROM projects WHERE is_deleted = FALSE`
    ];

    const results = await Promise.all(queries.map(q => pool.query(q)));

    res.json({
      success: true,
      data: {
        projects: parseInt(results[0].rows[0].count),
        users: parseInt(results[1].rows[0].count),
        tasks: parseInt(results[2].rows[0].count),
        timesheets: parseInt(results[3].rows[0].count),
        totalBudget: parseFloat(results[4].rows[0].total)
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
