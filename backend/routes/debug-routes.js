// backend/routes/debug-routes.js
import express from 'express';
import { db } from '../lib/db.js';
import { users, projects, tasks, expenses, vendors } from '../lib/schema.js';
import { eq, desc, asc } from 'drizzle-orm';

const router = express.Router();

// Debug endpoint for users
router.get('/users', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const userList = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      department: users.department,
      position: users.position,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(parseInt(limit))
    .offset(parseInt(offset));

    const totalUsers = await db.select({ count: users.id }).from(users);

    res.json({
      users: userList,
      total: totalUsers.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint for projects
router.get('/projects', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const projectList = await db.select({
      id: projects.id,
      name: projects.name,
      code: projects.code,
      status: projects.status,
      progress: projects.progress,
      budget: projects.budget,
      spent: projects.spent,
      startDate: projects.startDate,
      endDate: projects.endDate,
      createdAt: projects.createdAt
    })
    .from(projects)
    .orderBy(desc(projects.createdAt))
    .limit(parseInt(limit))
    .offset(parseInt(offset));

    const totalProjects = await db.select({ count: projects.id }).from(projects);

    res.json({
      projects: projectList,
      total: totalProjects.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug projects error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint for tasks
router.get('/tasks', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const taskList = await db.select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      projectId: tasks.projectId,
      assignedTo: tasks.assignedTo,
      createdAt: tasks.createdAt,
      dueDate: tasks.dueDate
    })
    .from(tasks)
    .orderBy(desc(tasks.createdAt))
    .limit(parseInt(limit))
    .offset(parseInt(offset));

    const totalTasks = await db.select({ count: tasks.id }).from(tasks);

    res.json({
      tasks: taskList,
      total: totalTasks.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug tasks error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint for expenses
router.get('/expenses', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const expenseList = await db.select({
      id: expenses.id,
      date: expenses.date,
      amount: expenses.amount,
      category: expenses.category,
      description: expenses.description,
      status: expenses.status,
      projectId: expenses.projectId,
      userId: expenses.userId,
      createdAt: expenses.createdAt
    })
    .from(expenses)
    .orderBy(desc(expenses.date))
    .limit(parseInt(limit))
    .offset(parseInt(offset));

    const totalExpenses = await db.select({ count: expenses.id }).from(expenses);

    res.json({
      expenses: expenseList,
      total: totalExpenses.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug expenses error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint for vendors
router.get('/vendors', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const vendorList = await db.select({
      id: vendors.id,
      name: vendors.name,
      code: vendors.code,
      type: vendors.type,
      category: vendors.category,
      status: vendors.status,
      overallRating: vendors.overallRating,
      totalProjects: vendors.totalProjects,
      successfulProjects: vendors.successfulProjects,
      createdAt: vendors.createdAt
    })
    .from(vendors)
    .orderBy(desc(vendors.createdAt))
    .limit(parseInt(limit))
    .offset(parseInt(offset));

    const totalVendors = await db.select({ count: vendors.id }).from(vendors);

    res.json({
      vendors: vendorList,
      total: totalVendors.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug vendors error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint for database schema info
router.get('/schema', async (req, res) => {
  try {
    const tables = [
      'users',
      'projects', 
      'tasks',
      'expenses',
      'vendors',
      'vendor_contracts',
      'vendor_payments',
      'expense_items',
      'vendor_kpi_evaluations',
      'vendor_kpi_criteria'
    ];

    const schemaInfo = {};

    for (const table of tables) {
      try {
        const result = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
        schemaInfo[table] = {
          exists: true,
          count: result[0]?.count || 0
        };
      } catch (error) {
        schemaInfo[table] = {
          exists: false,
          error: error.message
        };
      }
    }

    res.json({
      schema: schemaInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug schema error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint for system health
router.get('/health', async (req, res) => {
  try {
    const health = {
      database: 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    };

    // Test database connection
    try {
      await db.select({ count: 1 }).from(users);
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.dbError = error.message;
    }

    res.json(health);

  } catch (error) {
    console.error('Debug health error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
