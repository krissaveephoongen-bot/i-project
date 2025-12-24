import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/projects/[id] - Get a single project by ID
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  // GET /api/projects/[id] - Get project by ID
  if (req.method === 'GET') {
    const project = await prisma.project.findUnique({
      where: { id: id as string },
      include: {
        client: true,
        projectManager: {
          select: {
            id: true,
            managerRole: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            name: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            estimatedHours: true,
            actualHours: true,
            plannedStartDate: true,
            plannedEndDate: true,
            plannedProgressWeight: true,
            actualProgress: true,
            projectId: true,
            assigneeId: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            reporterId: true,
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            parentTaskId: true,
            labels: true,
            createdAt: true,
            updatedAt: true,
            startedAt: true,
            completedAt: true,
            _count: {
              select: {
                comments: true,
                timeLogs: true,
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
            _count: {
              select: {
                timeLogs: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            tasks: true,
            timesheets: true,
            timeLogs: true,
            comments: true,
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    return res.status(200).json({ success: true, data: project });
  }

  // PUT /api/projects/[id] - Update a project
  if (req.method === 'PUT') {
    const {
      name,
      code,
      description,
      startDate,
      endDate,
      budget,
      actualCost,
      estimatedHours,
      status,
      priority,
      clientId,
      projectManagerId,
      tags,
      progress,
    } = req.body;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: id as string },
    });

    if (!existingProject) {
      throw new ApiError(404, 'Project not found');
    }

    // Check if code is being updated and if it's already taken
    if (code && code !== existingProject.code) {
      const codeExists = await prisma.project.findFirst({
        where: {
          code,
          id: { not: id as string },
        },
      });

      if (codeExists) {
        throw new ApiError(400, 'Project with this code already exists');
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id: id as string },
      data: {
        name,
        code,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : endDate === null ? null : undefined,
        budget,
        actualCost,
        estimatedHours,
        status,
        priority,
        clientId,
        projectManagerId,
        tags,
        progress,
      },
      include: {
        client: true,
        projectManager: {
          select: {
            id: true,
            managerRole: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ 
      success: true, 
      data: updatedProject,
      message: 'Project updated successfully' 
    });
  }

  // DELETE /api/projects/[id] - Delete a project
  if (req.method === 'DELETE') {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: id as string },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Check if project has related records
    const relatedCounts = await prisma.$transaction([
      prisma.task.count({ where: { projectId: id as string } }),
      prisma.timesheet.count({ where: { projectId: id as string } }),
      prisma.timeLog.count({ where: { projectId: id as string } }),
      prisma.comment.count({ where: { projectId: id as string } }),
    ]);

    const [taskCount, timesheetCount, timeLogCount, commentCount] = relatedCounts;
    
    if (taskCount > 0 || timesheetCount > 0 || timeLogCount > 0 || commentCount > 0) {
      throw new ApiError(400, 'Cannot delete project with related records. Please delete related tasks, timesheets, and time logs first.');
    }

    await prisma.project.delete({
      where: { id: id as string },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
