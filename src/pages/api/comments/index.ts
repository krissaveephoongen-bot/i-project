import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/comments - Get all comments with filtering and pagination
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // GET /api/comments - Get all comments with filtering and pagination
  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Filtering options
    const userId = req.query.userId as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const taskId = req.query.taskId as string | undefined;
    const parentId = req.query.parentId as string | undefined;
    const includeReplies = req.query.includeReplies === 'true';

    const where = {
      ...(userId && { userId }),
      ...(projectId && { projectId }),
      ...(taskId && { taskId }),
      ...(parentId === 'null' ? { parentId: null } : parentId ? { parentId } : undefined),
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
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
          parent: {
            select: {
              id: true,
              content: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          replies: includeReplies
            ? {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true,
                    },
                  },
                  _count: {
                    select: {
                      replies: true,
                    },
                  },
                },
                orderBy: { createdAt: 'asc' },
              }
            : false,
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.comment.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  // POST /api/comments - Create a new comment
  if (req.method === 'POST') {
    validateRequest(req, ['userId', 'content']);
    
    const {
      userId,
      projectId,
      taskId,
      parentId,
      content,
      attachments = [],
    } = req.body;

    // Validate that at least one of projectId or taskId is provided
    if (!projectId && !taskId) {
      throw new ApiError(400, 'Either projectId or taskId must be provided');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
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

    // Check if parent comment exists if provided
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new ApiError(404, 'Parent comment not found');
      }

      // Ensure the parent comment is for the same project/task
      if (projectId && parentComment.projectId !== projectId) {
        throw new ApiError(400, 'Parent comment is not for this project');
      }
      if (taskId && parentComment.taskId !== taskId) {
        throw new ApiError(400, 'Parent comment is not for this task');
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        attachments,
        user: { connect: { id: userId } },
        ...(projectId && { project: { connect: { id: projectId } } }),
        ...(taskId && { task: { connect: { id: taskId } } }),
        ...(parentId && { parent: { connect: { id: parentId } } }),
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
        parent: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return res.status(201).json({ 
      success: true, 
      data: comment,
      message: 'Comment created successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
