const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

class PrismaService {
  // ==================== USER SERVICES ====================

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    return user;
  }

  /**
   * Create user with hashed password
   */
  async createUser(data) {
    const { password, ...userData } = data;
    const hashedPassword = await bcryptjs.hash(password, 12);

    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }

  // ==================== PROJECT SERVICES ====================

  /**
   * Get project with cost statistics
   */
  async getProjectWithStats(projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        costs: true
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const totalSpent = project.costs.reduce((sum, cost) => sum + cost.amount, 0);

    return {
      ...project,
      totalSpent,
      remaining: project.budget - totalSpent,
      costCount: project.costs.length,
      percentageUsed: ((totalSpent / project.budget) * 100).toFixed(2)
    };
  }

  /**
   * Get all projects with cost summaries
   */
  async getAllProjectsWithStats(filters = {}) {
    const projects = await prisma.project.findMany({
      where: filters,
      include: {
        costs: { select: { amount: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => {
      const totalSpent = project.costs.reduce((sum, cost) => sum + cost.amount, 0);
      return {
        ...project,
        totalSpent,
        remaining: project.budget - totalSpent,
        costCount: project.costs.length,
        approvedCosts: project.costs.filter(c => c.status === 'approved').length,
        percentageUsed: ((totalSpent / project.budget) * 100).toFixed(2)
      };
    });
  }

  // ==================== COST SERVICES ====================

  /**
   * Create cost with validation
   */
  async createCost(data) {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Verify project has sufficient budget
    const projectStats = await this.getProjectWithStats(data.projectId);
    if (projectStats.remaining < data.amount) {
      throw new Error(
        `Insufficient budget. Remaining: ${projectStats.remaining}, Required: ${data.amount}`
      );
    }

    return prisma.cost.create({
      data: {
        ...data,
        status: 'pending'
      },
      include: {
        project: true,
        submitted: { select: { id: true, name: true, email: true } }
      }
    });
  }

  /**
   * Get cost with full details
   */
  async getCostDetails(costId) {
    const cost = await prisma.cost.findUnique({
      where: { id: costId },
      include: {
        project: true,
        submitted: true,
        approved: { select: { id: true, name: true, email: true } },
        attachments: true,
        approvals: {
          include: { approved: { select: { id: true, name: true, email: true } } }
        }
      }
    });

    if (!cost) {
      throw new Error('Cost not found');
    }

    return cost;
  }

  /**
   * Get costs by project with aggregates
   */
  async getCostsByProject(projectId) {
    const costs = await prisma.cost.findMany({
      where: { projectId },
      include: {
        submitted: { select: { id: true, name: true } },
        approved: { select: { id: true, name: true } },
        attachments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const aggregate = await prisma.cost.aggregate({
      where: { projectId },
      _sum: { amount: true },
      _count: true
    });

    return {
      costs,
      summary: {
        total: aggregate._sum.amount || 0,
        count: aggregate._count,
        pending: costs.filter(c => c.status === 'pending').length,
        approved: costs.filter(c => c.status === 'approved').length,
        rejected: costs.filter(c => c.status === 'rejected').length
      }
    };
  }

  // ==================== APPROVAL SERVICES ====================

  /**
   * Approve cost with transaction
   */
  async approveCost(costId, approvedBy, comment = '') {
    const result = await prisma.$transaction(async (tx) => {
      // Verify cost exists
      const cost = await tx.cost.findUnique({ where: { id: costId } });
      if (!cost) {
        throw new Error('Cost not found');
      }

      // Update cost
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

    return result;
  }

  /**
   * Reject cost with transaction
   */
  async rejectCost(costId, approvedBy, comment = '') {
    const result = await prisma.$transaction(async (tx) => {
      // Verify cost exists
      const cost = await tx.cost.findUnique({ where: { id: costId } });
      if (!cost) {
        throw new Error('Cost not found');
      }

      // Update cost
      const updatedCost = await tx.cost.update({
        where: { id: costId },
        data: { status: 'rejected' }
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

    return result;
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovalsForUser(userId) {
    return prisma.costApproval.findMany({
      where: {
        approvedBy: userId,
        status: 'pending'
      },
      include: {
        cost: {
          include: {
            project: { select: { id: true, name: true } },
            submitted: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Get approval history for a cost
   */
  async getCostApprovalHistory(costId) {
    return prisma.costApproval.findMany({
      where: { costId },
      include: { approved: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ==================== STATISTICS SERVICES ====================

  /**
   * Get approval statistics
   */
  async getApprovalStats() {
    const [byStatus, byApprover, totalCosts] = await Promise.all([
      prisma.costApproval.groupBy({
        by: ['status'],
        _count: true,
        _sum: { id: true }
      }),
      prisma.costApproval.groupBy({
        by: ['approvedBy'],
        _count: true
      }),
      prisma.cost.count()
    ]);

    return {
      byStatus,
      byApprover,
      totalCosts
    };
  }

  /**
   * Get project budget summary
   */
  async getProjectBudgetSummary(projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        costs: {
          where: { status: 'approved' },
          select: { amount: true, category: true }
        }
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const totalSpent = project.costs.reduce((sum, cost) => sum + cost.amount, 0);
    const costByCategory = project.costs.reduce((acc, cost) => {
      acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
      return acc;
    }, {});

    return {
      projectId: project.id,
      projectName: project.name,
      budget: project.budget,
      spent: totalSpent,
      remaining: project.budget - totalSpent,
      percentageUsed: ((totalSpent / project.budget) * 100).toFixed(2),
      costBreakdown: costByCategory
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    const [createdCosts, approvedCosts, approvals] = await Promise.all([
      prisma.cost.count({ where: { submittedBy: userId } }),
      prisma.cost.count({ where: { approvedBy: userId } }),
      prisma.costApproval.count({ where: { approvedBy: userId } })
    ]);

    return {
      userId,
      costsCreated: createdCosts,
      costsApproved: approvedCosts,
      approvalsGiven: approvals
    };
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary() {
    const [totalUsers, totalProjects, totalCosts, costStats] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.cost.count(),
      prisma.cost.groupBy({
        by: ['status'],
        _count: true,
        _sum: { amount: true }
      })
    ]);

    const totalSpent = costStats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);

    return {
      summary: {
        totalUsers,
        totalProjects,
        totalCosts,
        totalSpent
      },
      costStats
    };
  }

  // ==================== CLEANUP ====================

  async disconnect() {
    await prisma.$disconnect();
  }
}

module.exports = new PrismaService();
