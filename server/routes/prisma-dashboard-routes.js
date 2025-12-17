const express = require('express');
const router = express.Router();
const prismaService = require('../services/prisma-service');

// Helper function for error handling
const handleError = (res, error, statusCode = 500) => {
  console.error('API Error:', error);
  res.status(statusCode).json({
    error: error.message || 'Internal Server Error',
    status: statusCode
  });
};

/**
 * GET /api/prisma/dashboard
 * Get dashboard summary with all key statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const summary = await prismaService.getDashboardSummary();
    res.json({ data: summary });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/dashboard/projects
 * Get project overview
 */
router.get('/dashboard/projects', async (req, res) => {
  try {
    const projects = await prismaService.getAllProjectsWithStats();
    
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.totalSpent, 0);
    const totalRemaining = totalBudget - totalSpent;

    res.json({
      data: {
        projects,
        summary: {
          totalProjects: projects.length,
          totalBudget,
          totalSpent,
          totalRemaining,
          percentageUsed: ((totalSpent / totalBudget) * 100).toFixed(2),
          activeProjects: projects.filter(p => p.status === 'active').length,
          completedProjects: projects.filter(p => p.status === 'completed').length
        }
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/dashboard/costs
 * Get cost overview and trends
 */
router.get('/dashboard/costs', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const [costStats, recentCosts, costsByCategory] = await Promise.all([
      prisma.cost.groupBy({
        by: ['status'],
        _count: true,
        _sum: { amount: true }
      }),
      prisma.cost.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          submitted: { select: { id: true, name: true } }
        }
      }),
      prisma.cost.groupBy({
        by: ['category'],
        _count: true,
        _sum: { amount: true }
      })
    ]);

    const totalAmount = costStats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);
    const totalCount = costStats.reduce((sum, stat) => sum + stat._count, 0);

    await prisma.$disconnect();

    res.json({
      data: {
        summary: {
          totalAmount,
          totalCount,
          byStatus: costStats,
          byCategory: costsByCategory
        },
        recentCosts
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/dashboard/approvals
 * Get approval overview
 */
router.get('/dashboard/approvals', async (req, res) => {
  try {
    const stats = await prismaService.getApprovalStats();
    
    // Get pending approvals count
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const pendingCount = await prisma.costApproval.count({
      where: { status: 'pending' }
    });

    await prisma.$disconnect();

    res.json({
      data: {
        ...stats,
        pendingCount
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/dashboard/users
 * Get user statistics
 */
router.get('/dashboard/users', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const [userStats, topApprovers, topSubmitters] = await Promise.all([
      prisma.user.count(),
      prisma.costApproval.groupBy({
        by: ['approvedBy'],
        _count: true
      }).then(stats => 
        stats.sort((a, b) => b._count - a._count).slice(0, 10)
      ),
      prisma.cost.groupBy({
        by: ['submittedBy'],
        _count: true
      }).then(stats => 
        stats.sort((a, b) => b._count - a._count).slice(0, 10)
      )
    ]);

    await prisma.$disconnect();

    res.json({
      data: {
        totalUsers: userStats,
        topApprovers,
        topSubmitters
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/dashboard/project/:projectId
 * Get project-specific dashboard
 */
router.get('/dashboard/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const [projectStats, costsByStatus, costsByCategory] = await Promise.all([
      prismaService.getProjectBudgetSummary(projectId),
      (async () => {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const result = await prisma.cost.groupBy({
          by: ['status'],
          where: { projectId },
          _count: true,
          _sum: { amount: true }
        });
        await prisma.$disconnect();
        return result;
      })(),
      (async () => {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const result = await prisma.cost.groupBy({
          by: ['category'],
          where: { projectId },
          _count: true,
          _sum: { amount: true }
        });
        await prisma.$disconnect();
        return result;
      })()
    ]);

    res.json({
      data: {
        projectStats,
        costsByStatus,
        costsByCategory
      }
    });
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ error: error.message });
    }
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/dashboard/user/:userId
 * Get user activity dashboard
 */
router.get('/dashboard/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [userStats, createdCosts, approvingCosts] = await Promise.all([
      prismaService.getUserStats(userId),
      (async () => {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const result = await prisma.cost.findMany({
          where: { submittedBy: userId },
          include: { project: { select: { id: true, name: true } } },
          take: 10,
          orderBy: { createdAt: 'desc' }
        });
        await prisma.$disconnect();
        return result;
      })(),
      (async () => {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const result = await prisma.costApproval.findMany({
          where: { approvedBy: userId },
          include: { cost: { select: { id: true, description: true } } },
          take: 10,
          orderBy: { createdAt: 'desc' }
        });
        await prisma.$disconnect();
        return result;
      })()
    ]);

    res.json({
      data: {
        userStats,
        recentCostsCreated: createdCosts,
        recentApprovalsGiven: approvingCosts
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/prisma/dashboard/budget-analysis
 * Get overall budget analysis
 */
router.get('/dashboard/budget-analysis', async (req, res) => {
  try {
    const projects = await prismaService.getAllProjectsWithStats();

    const analysis = {
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      totalSpent: projects.reduce((sum, p) => sum + p.totalSpent, 0),
      totalRemaining: projects.reduce((sum, p) => sum + p.remaining, 0),
      projectCount: projects.length,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        budget: p.budget,
        spent: p.totalSpent,
        remaining: p.remaining,
        percentageUsed: p.percentageUsed,
        status: p.status
      }))
    };

    res.json({ data: analysis });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
