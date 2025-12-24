import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/notifications - Get all notifications with filtering and pagination
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // GET /api/notifications - Get all notifications with filtering and pagination
  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Filtering options
    const userId = req.query.userId as string | undefined;
    const read = req.query.read ? req.query.read === 'true' : undefined;
    const type = req.query.type as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    if (!userId) {
      throw new ApiError(400, 'User ID is required');
    }

    const where = {
      userId,
      ...(read !== undefined && { read }),
      ...(type && { type }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          relatedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { 
          userId,
          read: false 
        } 
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        unreadCount,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }

  // POST /api/notifications - Create a new notification
  if (req.method === 'POST') {
    validateRequest(req, ['userId', 'title', 'message']);
    
    const {
      userId,
      title,
      message,
      type = 'INFO',
      relatedUserId,
      projectId,
      taskId,
      link,
    } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if related user exists if provided
    if (relatedUserId) {
      const relatedUser = await prisma.user.findUnique({
        where: { id: relatedUserId },
      });

      if (!relatedUser) {
        throw new ApiError(404, 'Related user not found');
      }
    }

    // Check if project exists if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new ApiError(404, 'Project not found');
      }
    }

    // Check if task exists if provided
    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new ApiError(404, 'Task not found');
      }
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        link,
        user: { connect: { id: userId } },
        ...(relatedUserId && { relatedUser: { connect: { id: relatedUserId } } }),
        ...(projectId && { project: { connect: { id: projectId } } }),
        ...(taskId && { task: { connect: { id: taskId } } }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        relatedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // In a real app, you would send a real-time notification here
    // e.g., using WebSockets, Firebase Cloud Messaging, etc.

    return res.status(201).json({ 
      success: true, 
      data: notification,
      message: 'Notification created successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
