import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/timelogs - Get all time logs with filtering and pagination
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // GET /api/timelogs - Get all time logs with filtering and pagination
  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtering options
    const userId = req.query.userId as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const taskId = req.query.taskId as string | undefined;
    const timesheetId = req.query.timesheetId as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const billable = req.query.billable ? req.query.billable === 'true' : undefined;

    const where = {
      ...(userId && { userId }),
      ...(projectId && { projectId }),
      ...(taskId && { taskId }),
      ...(timesheetId && { timesheetId }),
      ...(billable !== undefined && { billable }),
      ...((dateFrom || dateTo) && {
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    const [timeLogs, total] = await Promise.all([
      prisma.timeLog.findMany({
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
              status: true,
            },
          },
          timesheet: {
            select: {
              id: true,
              status: true,
              approved: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.timeLog.count({ where }),
    ]);

    // Calculate total hours
    const totalHours = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

    return res.status(200).json({
      success: true,
      data: timeLogs,
      meta: {
        totalHours,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  }

  // POST /api/timelogs - Create a new time log
  if (req.method === 'POST') {
    validateRequest(req, ['userId', 'projectId', 'date', 'duration', 'description']);
    
    const {
      userId,
      projectId,
      taskId,
      timesheetId,
      date,
      duration,
      description,
      billable = true,
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

    // Check if task exists if provided
    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new ApiError(404, 'Task not found');
      }
    }

    // Check if timesheet exists if provided
    if (timesheetId) {
      const timesheet = await prisma.timesheet.findUnique({
        where: { id: timesheetId },
      });

      if (!timesheet) {
        throw new ApiError(404, 'Timesheet not found');
      }

      // Check if timesheet is approved
      if (timesheet.approved) {
        throw new ApiError(400, 'Cannot add time log to an approved timesheet');
      }
    }

    // Check for overlapping time logs for the same user
    const logDate = new Date(date);
    const startOfDay = new Date(logDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(logDate.setHours(23, 59, 59, 999));

    const existingLogs = await prisma.timeLog.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Calculate total duration for the day
    const totalDuration = existingLogs.reduce((sum, log) => sum + (log.duration || 0), 0) + parseFloat(duration);
    
    // Check if total duration exceeds 24 hours (sanity check)
    if (totalDuration > 24) {
      throw new ApiError(400, 'Total time logged for the day cannot exceed 24 hours');
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        date: new Date(date),
        duration: parseFloat(duration),
        description,
        billable,
        user: { connect: { id: userId } },
        project: { connect: { id: projectId } },
        ...(taskId && { task: { connect: { id: taskId } } }),
        ...(timesheetId && { timesheet: { connect: { id: timesheetId } } }),
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
            status: true,
          },
        },
        timesheet: {
          select: {
            id: true,
            status: true,
            approved: true,
          },
        },
      },
    });

    return res.status(201).json({ 
      success: true, 
      data: timeLog,
      message: 'Time log created successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
