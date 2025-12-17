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
 * GET /api/prisma/costs
 * Get all costs with optional filters
 */
router.get('/costs', async (req, res) => {
  try {
    const { projectId, status, category, startDate, endDate, skip = 0, take = 10 } = req.query;
    
    const where = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [costs, total] = await Promise.all([
      prisma.cost.findMany({
        where,
        include: {
          project: true,
          submitted: { select: { id: true, name: true, email: true } },
          approved: { select: { id: true, name: true, email: true } },
          attachments: true,
          approvals: true
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(take)
      }),
      prisma.cost.count({ where })
    ]);

    res.json({
      data: costs,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/costs/:id
 * Get a specific cost
 */
router.get('/costs/:id', async (req, res) => {
  try {
    const cost = await prisma.cost.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        submitted: true,
        approved: true,
        attachments: true,
        approvals: {
          include: { approved: { select: { id: true, name: true, email: true } } }
        }
      }
    });

    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    res.json({ data: cost });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/costs
 * Create a new cost
 */
router.post('/costs', async (req, res) => {
  try {
    const { projectId, description, amount, category, date, submittedBy, invoiceNumber } = req.body;

    // Validation
    if (!projectId || !description || !amount || !category || !submittedBy) {
      return res.status(400).json({
        error: 'Missing required fields: projectId, description, amount, category, submittedBy'
      });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const cost = await prisma.cost.create({
      data: {
        projectId,
        description,
        amount: parseFloat(amount),
        category,
        date: date ? new Date(date) : new Date(),
        status: 'pending',
        submittedBy,
        invoiceNumber
      },
      include: {
        project: true,
        submitted: true
      }
    });

    res.status(201).json({ data: cost, message: 'Cost created successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * PUT /api/prisma/costs/:id
 * Update a cost
 */
router.put('/costs/:id', async (req, res) => {
  try {
    const { description, amount, category, date, status, invoiceNumber } = req.body;

    const cost = await prisma.cost.update({
      where: { id: req.params.id },
      data: {
        ...(description && { description }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(category && { category }),
        ...(date && { date: new Date(date) }),
        ...(status && { status }),
        ...(invoiceNumber && { invoiceNumber })
      },
      include: {
        project: true,
        submitted: true,
        approved: true
      }
    });

    res.json({ data: cost, message: 'Cost updated successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * DELETE /api/prisma/costs/:id
 * Delete a cost
 */
router.delete('/costs/:id', async (req, res) => {
  try {
    const cost = await prisma.cost.delete({
      where: { id: req.params.id }
    });

    res.json({ data: cost, message: 'Cost deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cost not found' });
    }
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/costs/:id/approve
 * Approve a cost
 */
router.post('/costs/:id/approve', async (req, res) => {
  try {
    const { approvedBy, comment, approvalStatus } = req.body;

    if (!approvedBy || !approvalStatus) {
      return res.status(400).json({ error: 'Missing approvedBy or approvalStatus' });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update cost status
      const updatedCost = await tx.cost.update({
        where: { id: req.params.id },
        data: {
          status: approvalStatus,
          ...(approvalStatus === 'approved' && { approvedBy })
        }
      });

      // Create approval record
      const approval = await tx.costApproval.create({
        data: {
          costId: req.params.id,
          status: approvalStatus,
          comment,
          approvedBy
        },
        include: { approved: true }
      });

      return { cost: updatedCost, approval };
    });

    res.json({ data: result, message: `Cost ${approvalStatus} successfully` });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/costs/project/:projectId/summary
 * Get cost summary by project
 */
router.get('/costs/project/:projectId/summary', async (req, res) => {
  try {
    const { projectId } = req.params;

    const [totalAmount, byStatus, byCategory] = await Promise.all([
      prisma.cost.aggregate({
        where: { projectId },
        _sum: { amount: true },
        _count: true
      }),
      prisma.cost.groupBy({
        by: ['status'],
        where: { projectId },
        _sum: { amount: true },
        _count: true
      }),
      prisma.cost.groupBy({
        by: ['category'],
        where: { projectId },
        _sum: { amount: true },
        _count: true
      })
    ]);

    res.json({
      data: {
        total: totalAmount._sum.amount || 0,
        count: totalAmount._count,
        byStatus,
        byCategory
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
