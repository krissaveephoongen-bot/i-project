import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/tasks/[id] - Get a single task by ID
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  // GET /api/tasks/[id] - Get task by ID
  if (req.method === 'GET') {
    const task = await prisma.task.findUnique({
      where: { id: id as string },
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
        subTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            estimatedHours: true,
            progress: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                avatar: true,
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
        },
        timeLogs: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { startedAt: 'desc' },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        timesheets: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            approvedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            subTasks: true,
            comments: true,
            timeLogs: true,
            timesheets: true,
          },
        },
      },
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    return res.status(200).json({ success: true, data: task });
  }

  // PUT /api/tasks/[id] - Update a task
  if (req.method === 'PUT') {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      projectId,
      assignedToId,
      reportedById,
      parentTaskId,
      progress,
      labels,
    } = req.body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: id as string },
    });

    if (!existingTask) {
      throw new ApiError(404, 'Task not found');
    }

    // Check if project exists if being updated
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new ApiError(404, 'Project not found');
      }
    }

    // Check if assigned user exists if being updated
    if (assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedToId },
      });

      if (!user) {
        throw new ApiError(404, 'Assigned user not found');
      }
    }

    // Check if parent task exists if being updated
    if (parentTaskId) {
      // Prevent circular references
      if (parentTaskId === id) {
        throw new ApiError(400, 'A task cannot be its own parent');
      }

      const parentTask = await prisma.task.findUnique({
        where: { id: parentTaskId },
      });

      if (!parentTask) {
        throw new ApiError(404, 'Parent task not found');
      }

      // Check for circular references in the hierarchy
      let currentParentId = parentTask.parentTaskId;
      while (currentParentId) {
        if (currentParentId === id) {
          throw new ApiError(400, 'Circular reference detected in task hierarchy');
        }
        const parent = await prisma.task.findUnique({
          where: { id: currentParentId },
          select: { parentTaskId: true },
        });
        currentParentId = parent?.parentTaskId || null;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: id as string },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : dueDate === null ? null : undefined,
        estimatedHours,
        project: projectId ? { connect: { id: projectId } } : undefined,
        assignedTo: assignedToId ? { connect: { id: assignedToId } } : assignedToId === null ? { disconnect: true } : undefined,
        reportedBy: reportedById ? { connect: { id: reportedById } } : reportedById === null ? { disconnect: true } : undefined,
        parentTask: parentTaskId ? { connect: { id: parentTaskId } } : parentTaskId === null ? { disconnect: true } : undefined,
        progress,
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

    // If this task has sub-tasks, update their project if the parent's project changed
    if (projectId && projectId !== existingTask.projectId) {
      await prisma.task.updateMany({
        where: { parentTaskId: id as string },
        data: { projectId },
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: updatedTask,
      message: 'Task updated successfully' 
    });
  }

  // DELETE /api/tasks/[id] - Delete a task
  if (req.method === 'DELETE') {
    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: id as string },
      include: {
        _count: {
          select: {
            subTasks: true,
            comments: true,
            timeLogs: true,
            timesheets: true,
          },
        },
      },
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Check if task has related records that would prevent deletion
    if (task._count.subTasks > 0) {
      throw new ApiError(400, 'Cannot delete task with sub-tasks. Please delete sub-tasks first.');
    }

    // Use a transaction to ensure data consistency
    await prisma.$transaction([
      // Delete related records first
      prisma.comment.deleteMany({ where: { taskId: id as string } }),
      prisma.timeLog.deleteMany({ where: { taskId: id as string } }),
      // Then delete the task
      prisma.task.delete({ where: { id: id as string } }),
    ]);

    return res.status(200).json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
