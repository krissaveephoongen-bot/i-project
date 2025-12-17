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
 * GET /api/prisma/approvals
 * Get all cost approvals with optional filters
 */
router.get('/approvals', async (req, res) => {
  try {
    const { status, costId, approvedBy, skip = 0, take = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (costId) where.costId = costId;
    if (approvedBy) where.approvedBy = approvedBy;

    const [approvals, total] = await Promise.all([
      prisma.costApproval.findMany({
        where,
        include: {
          cost: { select: { id: true, description: true, amount: true, projectId: true } },
          approved: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(take)
      }),
      prisma.costApproval.count({ where })
    ]);

    res.json({
      data: approvals,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/approvals/:id
 * Get a specific approval
 */
router.get('/approvals/:id', async (req, res) => {
  try {
    const approval = await prisma.costApproval.findUnique({
      where: { id: req.params.id },
      include: {
        cost: {
          include: {
            project: true,
            submitted: { select: { id: true, name: true, email: true } }
          }
        },
        approved: true
      }
    });

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    res.json({ data: approval });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/approvals
 * Create a new cost approval
 */
router.post('/approvals', async (req, res) => {
  try {
    const { costId, status, comment, approvedBy } = req.body;

    // Validation
    if (!costId || !status || !approvedBy) {
      return res.status(400).json({
        error: 'Missing required fields: costId, status, approvedBy'
      });
    }

    // Verify cost exists
    const cost = await prisma.cost.findUnique({ where: { id: costId } });
    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    // Verify approver exists
    const approver = await prisma.user.findUnique({ where: { id: approvedBy } });
    if (!approver) {
      return res.status(404).json({ error: 'Approver not found' });
    }

    const approval = await prisma.costApproval.create({
      data: {
        costId,
        status,
        comment,
        approvedBy
      },
      include: {
        cost: { select: { id: true, description: true, amount: true } },
        approved: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json({ data: approval, message: 'Approval created successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * PUT /api/prisma/approvals/:id
 * Update an approval
 */
router.put('/approvals/:id', async (req, res) => {
  try {
    const { status, comment } = req.body;

    const data = {};
    if (status) data.status = status;
    if (comment) data.comment = comment;

    const approval = await prisma.costApproval.update({
      where: { id: req.params.id },
      data,
      include: {
        cost: { select: { id: true, description: true } },
        approved: { select: { id: true, name: true } }
      }
    });

    res.json({ data: approval, message: 'Approval updated successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Approval not found' });
    }
    handleError(res, error);
  }
});

/**
 * DELETE /api/prisma/approvals/:id
 * Delete an approval
 */
router.delete('/approvals/:id', async (req, res) => {
  try {
    const approval = await prisma.costApproval.delete({
      where: { id: req.params.id }
    });

    res.json({ data: approval, message: 'Approval deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Approval not found' });
    }
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/costs/:costId/approvals
 * Get all approvals for a specific cost
 */
router.get('/costs/:costId/approvals', async (req, res) => {
  try {
    const { costId } = req.params;

    // Verify cost exists
    const cost = await prisma.cost.findUnique({ where: { id: costId } });
    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    const approvals = await prisma.costApproval.findMany({
      where: { costId },
      include: { approved: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: approvals });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/pending-approvals
 * Get all pending approvals
 */
router.get('/pending-approvals', async (req, res) => {
  try {
    const { approvedBy, skip = 0, take = 10 } = req.query;

    const where = { status: 'pending' };
    if (approvedBy) where.approvedBy = approvedBy;

    const [approvals, total] = await Promise.all([
      prisma.costApproval.findMany({
        where,
        include: {
          cost: {
            include: {
              project: { select: { id: true, name: true } },
              submitted: { select: { id: true, name: true } }
            }
          },
          approved: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'asc' },
        skip: parseInt(skip),
        take: parseInt(take)
      }),
      prisma.costApproval.count({ where })
    ]);

    res.json({
      data: approvals,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/costs/:costId/approve
 * Approve a cost with approval record
 */
router.post('/costs/:costId/approve', async (req, res) => {
  try {
    const { costId } = req.params;
    const { approvedBy, comment } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'Missing approvedBy' });
    }

    // Verify cost exists
    const cost = await prisma.cost.findUnique({ where: { id: costId } });
    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update cost status
      const updatedCost = await tx.cost.update({
        where: { id: costId },
        data: {
          status: 'approved',
          approvedBy
        }
      });

      // Create approval record
      const approval = await tx.costApproval.create({
        data: {
          costId,
          status: 'approved',
          comment,
          approvedBy
        },
        include: { approved: { select: { id: true, name: true } } }
      });

      return { cost: updatedCost, approval };
    });

    res.json({ data: result, message: 'Cost approved successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/prisma/costs/:costId/reject
 * Reject a cost with approval record
 */
router.post('/costs/:costId/reject', async (req, res) => {
  try {
    const { costId } = req.params;
    const { approvedBy, comment } = req.body;

    if (!approvedBy) {
      return res.status(400).json({ error: 'Missing approvedBy' });
    }

    // Verify cost exists
    const cost = await prisma.cost.findUnique({ where: { id: costId } });
    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update cost status
      const updatedCost = await tx.cost.update({
        where: { id: costId },
        data: {
          status: 'rejected'
        }
      });

      // Create approval record
      const approval = await tx.costApproval.create({
        data: {
          costId,
          status: 'rejected',
          comment,
          approvedBy
        },
        include: { approved: { select: { id: true, name: true } } }
      });

      return { cost: updatedCost, approval };
    });

    res.json({ data: result, message: 'Cost rejected successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/approval-statistics
 * Get approval statistics
 */
router.get('/approval-statistics', async (req, res) => {
  try {
    const [stats, byApprover] = await Promise.all([
      prisma.costApproval.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.costApproval.groupBy({
        by: ['approvedBy'],
        _count: true,
        _sum: { id: true }
      })
    ]);

    res.json({
      data: {
        byStatus: stats,
        byApprover: byApprover
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
