import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/timelogs/[id] - Get a single time log by ID
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  // GET /api/timelogs/[id] - Get time log by ID
  if (req.method === 'GET') {
    const timeLog = await prisma.timeLog.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            position: true,
            department: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
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
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!timeLog) {
      throw new ApiError(404, 'Time log not found');
    }

    return res.status(200).json({ success: true, data: timeLog });
  }

  // PUT /api/timelogs/[id] - Update a time log
  if (req.method === 'PUT') {
    const {
      date,
      duration,
      description,
      billable,
      projectId,
      taskId,
      timesheetId,
    } = req.body;

    // Check if time log exists
    const existingTimeLog = await prisma.timeLog.findUnique({
      where: { id: id as string },
    });

    if (!existingTimeLog) {
      throw new ApiError(404, 'Time log not found');
    }

    // Check if timesheet is approved (if timesheetId is provided or being updated)
    if (timesheetId || existingTimeLog.timesheetId) {
      const timesheetIdToCheck = timesheetId || existingTimeLog.timesheetId;
      const timesheet = await prisma.timesheet.findUnique({
        where: { id: timesheetIdToCheck as string },
      });

      if (timesheet?.approved) {
        throw new ApiError(400, 'Cannot update time log for an approved timesheet');
      }
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

    // Check if task exists if being updated
    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new ApiError(404, 'Task not found');
      }
    }

    // Check for overlapping time logs for the same user on the same day
    if (date) {
      const logDate = new Date(date);
      const startOfDay = new Date(logDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(logDate.setHours(23, 59, 59, 999));

      const existingLogs = await prisma.timeLog.findMany({
        where: {
          id: { not: id as string },
          userId: existingTimeLog.userId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      // Calculate total duration for the day
      const totalDuration = existingLogs.reduce(
        (sum: number, log) => sum + (log.duration || 0),
        duration ? parseFloat(duration) : existingTimeLog.duration || 0
      );
      
      // Check if total duration exceeds 24 hours (sanity check)
      if (totalDuration > 24) {
        throw new ApiError(400, 'Total time logged for the day cannot exceed 24 hours');
      }
    }

    const updatedTimeLog = await prisma.timeLog.update({
      where: { id: id as string },
      data: {
        ...(date && { date: new Date(date) }),
        ...(duration && { duration: parseFloat(duration) }),
        ...(description !== undefined && { description }),
        ...(billable !== undefined && { billable }),
        ...(projectId && { project: { connect: { id: projectId } } }),
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

    return res.status(200).json({ 
      success: true, 
      data: updatedTimeLog,
      message: 'Time log updated successfully' 
    });
  }

  // DELETE /api/timelogs/[id] - Delete a time log
  if (req.method === 'DELETE') {
    // Check if time log exists
    const timeLog = await prisma.timeLog.findUnique({
      where: { id: id as string },
      include: {
        timesheet: {
          select: {
            id: true,
            approved: true,
          },
        },
      },
    });

    if (!timeLog) {
      throw new ApiError(404, 'Time log not found');
    }

    // Check if timesheet is approved
    if (timeLog.timesheet?.approved) {
      throw new ApiError(400, 'Cannot delete time log from an approved timesheet');
    }

    await prisma.timeLog.delete({
      where: { id: id as string },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Time log deleted successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
