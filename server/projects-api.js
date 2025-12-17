/**
 * Projects API Routes using Drizzle ORM
 * GET endpoints for fetching project data from PostgreSQL
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { desc, eq, and } = require('drizzle-orm');

// Import schema
const schema = require('../src/lib/schema');

// Create pool and drizzle instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/project_management',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = drizzle(pool, { schema });

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await db.query.projects.findMany({
      with: {
        manager: true,
        client: true,
      },
    });

    res.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get project by ID
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, parseInt(id)),
      with: {
        manager: true,
        client: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get project tasks
router.get('/projects/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;

    const tasks = await db.query.tasks.findMany({
      where: eq(schema.tasks.projectId, parseInt(id)),
      with: {
        assignedToUser: true,
        createdByUser: true,
      },
    });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get project time entries
router.get('/projects/:id/time-entries', async (req, res) => {
  try {
    const { id } = req.params;

    const entries = await db.query.timeEntries.findMany({
      where: eq(schema.timeEntries.projectId, parseInt(id)),
      with: {
        user: true,
        task: true,
      },
    });

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get project expenses
router.get('/projects/:id/expenses', async (req, res) => {
  try {
    const { id } = req.params;

    const expenses = await db.query.expenses.findMany({
      where: eq(schema.expenses.projectId, parseInt(id)),
      with: {
        user: true,
        task: true,
      },
    });

    res.json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get all time entries (for timesheet)
router.get('/time-entries', async (req, res) => {
  try {
    const entries = await db.query.timeEntries.findMany({
      with: {
        user: true,
        project: true,
        task: true,
      },
      orderBy: desc(schema.timeEntries.date),
    });

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await db.query.expenses.findMany({
      with: {
        user: true,
        project: true,
        task: true,
      },
      orderBy: desc(schema.expenses.date),
    });

    res.json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get project summary/analytics
router.get('/projects/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const tasks = await db.query.tasks.findMany({
      where: eq(schema.tasks.projectId, projectId),
    });

    const timeEntries = await db.query.timeEntries.findMany({
      where: eq(schema.timeEntries.projectId, projectId),
    });

    const expenses = await db.query.expenses.findMany({
      where: eq(schema.expenses.projectId, projectId),
    });

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalHours = timeEntries.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        project,
        stats: {
          totalTasks: tasks.length,
          completedTasks,
          progress,
          totalHours: Math.round(totalHours * 100) / 100,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          budget: project.budget,
          spent: project.spent,
          remaining: project.remaining,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
