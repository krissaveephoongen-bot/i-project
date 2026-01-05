import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/tasks - Get all tasks with filtering and pagination
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // GET /api/tasks - Get all tasks with filtering and pagination
  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtering options
    const search = req.query.search as string || '';
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const assignedToId = req.query.assignedToId as string | undefined;
    const reportedById = req.query.reportedById as string | undefined;
    const parentTaskId = req.query.parentTaskId as string | undefined;

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(projectId && { projectId }),
      ...(assignedToId && { assignedToId }),
      ...(reportedById && { reportedById }),
      ...(parentTaskId === 'null' ? { parentTaskId: null } : parentTaskId ? { parentTaskId } : {}),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          parentTask: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              subTasks: true,
              comments: true,
              timeLogs: true,
            },
          },
        },
        orderBy: { 
          createdAt: 'desc' 
        },
      }),
      prisma.task.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  // POST /api/tasks - Create a new task
  if (req.method === 'POST') {
    validateRequest(req, ['title', 'projectId']);
    
    const {
      title,
      description,
      status = 'TODO',
      priority = 'medium',
      dueDate,
      estimatedHours,
      projectId,
      assignedToId,
      reportedById,
      parentTaskId,
      labels = [],
    } = req.body;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Check if assigned user exists if provided
    if (assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedToId },
      });

      if (!user) {
        throw new ApiError(404, 'Assigned user not found');
      }
    }

    // Check if parent task exists if provided
    if (parentTaskId) {
      const parentTask = await prisma.task.findUnique({
        where: { id: parentTaskId },
      });

      if (!parentTask) {
        throw new ApiError(404, 'Parent task not found');
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours,
        project: { connect: { id: projectId } },
        assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
        reportedBy: reportedById ? { connect: { id: reportedById } } : undefined,
        parentTask: parentTaskId ? { connect: { id: parentTaskId } } : undefined,
        labels,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.status(201).json({ 
      success: true, 
      data: task,
      message: 'Task created successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
