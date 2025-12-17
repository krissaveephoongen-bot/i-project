const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function for error handling
const handleError = (res, error, statusCode = 500) => {
  console.error('API Error:', error);
  res.status(statusCode).json({
    error: error.message || 'Internal Server Error',
    status: statusCode
  });
};

/**
 * GET /api/prisma/projects
 * Get all projects with optional filters
 */
router.get('/projects', async (req, res) => {
  try {
    const { status, search, skip = 0, take = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          costs: { select: { amount: true, status: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(take)
      }),
      prisma.project.count({ where })
    ]);

    // Add calculated fields
    const projectsWithStats = projects.map(project => ({
      ...project,
      totalSpent: project.costs.reduce((sum, cost) => sum + cost.amount, 0),
      costCount: project.costs.length,
      approvedCosts: project.costs.filter(c => c.status === 'approved').length,
      pendingCosts: project.costs.filter(c => c.status === 'pending').length
    }));

    res.json({
      data: projectsWithStats,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/projects/:id
 * Get a specific project with its costs
 */
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        costs: {
          include: {
            submitted: { select: { id: true, name: true, email: true } },
            approved: { select: { id: true, name: true, email: true } },
            attachments: true,
            approvals: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Add statistics
    const stats = {
      totalBudget: project.budget,
      totalSpent: project.costs.reduce((sum, cost) => sum + cost.amount, 0),
      costCount: project.costs.length,
      approvedAmount: project.costs
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.amount, 0),
      pendingAmount: project.costs
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0),
      remainingBudget: project.budget - project.costs.reduce((sum, c) => sum + c.amount, 0),
      percentageUsed: ((project.costs.reduce((sum, c) => sum + c.amount, 0) / project.budget) * 100).toFixed(2)
    };

    res.json({ data: { ...project, stats } });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/projects
 * Create a new project
 */
router.post('/projects', async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate, status } = req.body;

    // Validation
    if (!name || !budget) {
      return res.status(400).json({
        error: 'Missing required fields: name, budget'
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        budget: parseFloat(budget),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'active'
      }
    });

    res.status(201).json({ data: project, message: 'Project created successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * PUT /api/prisma/projects/:id
 * Update a project
 */
router.put('/projects/:id', async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate, status } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(budget && { budget: parseFloat(budget) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status })
      }
    });

    res.json({ data: project, message: 'Project updated successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    handleError(res, error);
  }
});

/**
 * DELETE /api/prisma/projects/:id
 * Delete a project (and its costs)
 */
router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ data: project, message: 'Project deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/projects/:id/budget-analysis
 * Get detailed budget analysis
 */
router.get('/projects/:id/budget-analysis', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        costs: { where: { status: 'approved' } }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const totalSpent = project.costs.reduce((sum, cost) => sum + cost.amount, 0);
    const remaining = project.budget - totalSpent;

    res.json({
      data: {
        projectId: project.id,
        projectName: project.name,
        budget: project.budget,
        spent: totalSpent,
        remaining,
        percentageUsed: ((totalSpent / project.budget) * 100).toFixed(2),
        costBreakdown: project.costs.reduce((acc, cost) => {
          acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
