const express = require('express');
const { prisma } = require('./prisma-client');
const { authenticateToken } = require('./middleware/auth-middleware');
const redis = require('./utils/redis');

const router = express.Router();

/**
 * GET /api/menu/stats
 * Get dashboard statistics for menu display
 */
const CACHE_TTL = 300; // 5 minutes

// Helper function to get cache key
const getCacheKey = (userId, key) => `menu:${userId}:${key}`;

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = getCacheKey(userId, 'stats');
    
    // Try to get cached data first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // If not in cache, fetch from database
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      pendingTasks
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({
        where: {
          status: { in: ['PLANNING', 'IN_PROGRESS'] },
        },
      }),
      prisma.task.count(),
    ]);

    // Get pending and overdue tasks
    const [pendingTasksCount, overdueTasks] = await Promise.all([
      prisma.task.count({
        where: {
          status: { in: ['TODO', 'IN_PROGRESS'] },
        },
      }),
      prisma.task.count({
        where: {
          status: { not: 'DONE' },
          dueDate: {
            lt: new Date(),
          },
        },
      }),
    ]);

    // Get user-specific tasks
    const userTasks = await prisma.task.count({
      where: {
        assigneeId: userId,
      },
    });

    // Get team members count
    const totalTeamMembers = await prisma.user.count({
      where: {
        role: { not: 'ADMIN' },
      },
    });

    // Get pending timesheets
    const pendingTimesheets = await prisma.timesheet.count({
      where: {
        status: { in: ['DRAFT', 'SUBMITTED'] },
      },
    });

    // Get pending costs
    const pendingCosts = await prisma.cost.count({
      where: {
        status: 'pending',
      },
    });

    // Get user's projects
    const myProjects = await prisma.projectManagerAssignment.count({
      where: {
        projectManager: {
          userId: userId,
        },
        status: 'active',
      },
    });

    // Get user's assigned tasks
    const assignedTasks = await prisma.task.count({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' },
      },
    });

    const stats = {
      totalProjects,
      activeProjects,
      totalTasks,
      pendingTasks: pendingTasksCount,
      overdueTasks,
      userTasks,
      totalTeamMembers,
      pendingTimesheets,
      pendingCosts,
      myProjectsCount: myProjects,
      assignedTasksCount: assignedTasks,
      timestamp: new Date().toISOString()
    };

    // Cache the results
    await redis.set(cacheKey, stats, CACHE_TTL);

    res.json({
      ...stats,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching menu stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch menu stats',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/menu/recent
 * Get recent items accessed by user
 */
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const userId = req.user.id;

    // Get recent projects the user is managing
    const recentProjects = await prisma.projectManagerAssignment.findMany({
      where: {
        projectManager: {
          userId: userId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    // Get recent tasks assigned to user
    const recentTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    // Combine and format
    const items = [
      ...recentProjects.map(p => ({
        id: p.projectId,
        title: p.project.name,
        type: 'project',
        projectId: p.projectId,
        path: `/projects/${p.projectId}`,
        lastAccessed: p.updatedAt,
        status: p.project.status,
      })),
      ...recentTasks.map(t => ({
        id: t.id,
        title: t.title,
        type: 'task',
        projectId: t.projectId,
        path: `/projects/${t.projectId}`,
        lastAccessed: t.updatedAt,
        status: t.status,
      })),
    ]
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
      .slice(0, limit);

    res.json(items);
  } catch (error) {
    console.error('Error fetching recent items:', error);
    res.status(500).json({ error: 'Failed to fetch recent items' });
  }
});

/**
 * GET /api/menu/projects
 * Get user's active projects for quick access
 */
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const userId = req.user.id;

    const projects = await prisma.projectManagerAssignment.findMany({
      where: {
        projectManager: {
          userId: userId,
        },
        status: 'active',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            progress: true,
            priority: true,
          },
        },
      },
      orderBy: {
        project: {
          updatedAt: 'desc',
        },
      },
      take: limit,
    });

    const formattedProjects = projects.map(p => ({
      id: p.projectId,
      name: p.project.name,
      code: p.project.code,
      status: p.project.status,
      progress: p.project.progress,
      priority: p.project.priority,
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/menu/tasks
 * Get user's assigned tasks
 */
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const userId = req.user.id;

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: limit,
    });

    const formattedTasks = tasks.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      projectId: t.projectId,
      projectName: t.project.name,
      dueDate: t.dueDate?.toISOString(),
      priority: t.priority,
      assigneeName: t.assignee?.name || 'Unassigned',
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * POST /api/menu/track
 * Track item access for analytics
 */
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const { itemId, type, timestamp } = req.body;
    
    // Could store in a new table for analytics
    // For now, just acknowledge the request
    res.json({ success: true, message: 'Item access tracked' });
  } catch (error) {
    console.error('Error tracking item access:', error);
    res.status(500).json({ error: 'Failed to track item access' });
  }
});

/**
 * GET /api/menu/notifications/unread-count
 * Get unread notifications count
 */
router.get('/notifications/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ error: 'Failed to fetch notification count' });
  }
});

module.exports = router;
