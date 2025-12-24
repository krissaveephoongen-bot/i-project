import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/timesheets - Get all timesheets with filtering and pagination
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // GET /api/timesheets - Get all timesheets with filtering and pagination
  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtering options
    const userId = req.query.userId as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const status = req.query.status as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const approved = req.query.approved ? req.query.approved === 'true' : undefined;

    const where = {
      ...(userId && { userId }),
      ...(projectId && { projectId }),
      ...(status && { status }),
      ...(approved !== undefined && { approved }),
      ...((startDate || endDate) && {
        startDate: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    };

    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
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
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          timeLogs: {
            select: {
              id: true,
              description: true,
              duration: true,
              date: true,
              task: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          _count: {
            select: {
              timeLogs: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
      prisma.timesheet.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: timesheets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  // POST /api/timesheets - Create a new timesheet
  if (req.method === 'POST') {
    validateRequest(req, ['userId', 'projectId', 'startDate', 'endDate']);
    
    const {
      userId,
      projectId,
      startDate,
      endDate,
      notes,
      status = 'DRAFT',
      approved = false,
      approvedById = null,
      approvedAt = null,
    } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Check for overlapping timesheets for the same user and project
    const overlappingTimesheet = await prisma.timesheet.findFirst({
      where: {
        userId,
        projectId,
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
        ],
      },
    });

    if (overlappingTimesheet) {
      throw new ApiError(400, 'A timesheet already exists for this date range');
    }

    const timesheet = await prisma.timesheet.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
        status,
        approved,
        approvedAt: approved ? new Date() : null,
        user: { connect: { id: userId } },
        project: { connect: { id: projectId } },
        ...(approvedById && { 
          approvedBy: { connect: { id: approvedById } },
        }),
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
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({ 
      success: true, 
      data: timesheet,
      message: 'Timesheet created successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
