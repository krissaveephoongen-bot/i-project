import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiHandler, ApiError, validateRequest } from '@/lib/api-utils';

// GET /api/timesheets/[id] - Get a single timesheet by ID
export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  // GET /api/timesheets/[id] - Get timesheet by ID
  if (req.method === 'GET') {
    const timesheet = await prisma.timesheet.findUnique({
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
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        timeLogs: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                status: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!timesheet) {
      throw new ApiError(404, 'Timesheet not found');
    }

    // Calculate total hours
    const totalHours = timesheet.timeLogs.reduce(
      (sum, log) => sum + (log.duration || 0),
      0
    );

    return res.status(200).json({ 
      success: true, 
      data: {
        ...timesheet,
        totalHours,
      } 
    });
  }

  // PUT /api/timesheets/[id] - Update a timesheet
  if (req.method === 'PUT') {
    const {
      startDate,
      endDate,
      notes,
      status,
      approved,
      approvedById,
    } = req.body;

    // Check if timesheet exists
    const existingTimesheet = await prisma.timesheet.findUnique({
      where: { id: id as string },
    });

    if (!existingTimesheet) {
      throw new ApiError(404, 'Timesheet not found');
    }

    // If updating dates, check for overlapping timesheets
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : existingTimesheet.startDate;
      const end = endDate ? new Date(endDate) : existingTimesheet.endDate;

      const overlappingTimesheet = await prisma.timesheet.findFirst({
        where: {
          id: { not: id as string },
          userId: existingTimesheet.userId,
          projectId: existingTimesheet.projectId,
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start },
            },
          ],
        },
      });

      if (overlappingTimesheet) {
        throw new ApiError(400, 'A timesheet already exists for this date range');
      }
    }

    // If approving the timesheet
    const isApproval = approved && !existingTimesheet.approved;
    const isRejection = approved === false && existingTimesheet.approved;

    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: id as string },
      data: {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
        ...(approved !== undefined && { 
          approved,
          approvedAt: isApproval ? new Date() : isRejection ? null : undefined,
          ...(isApproval && approvedById && { 
            approvedById,
          }),
          ...(isRejection && { 
            approvedById: null,
          }),
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
        timeLogs: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    return res.status(200).json({ 
      success: true, 
      data: updatedTimesheet,
      message: 'Timesheet updated successfully' 
    });
  }

  // DELETE /api/timesheets/[id] - Delete a timesheet
  if (req.method === 'DELETE') {
    // Check if timesheet exists
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: id as string },
      include: {
        _count: {
          select: {
            timeLogs: true,
          },
        },
      },
    });

    if (!timesheet) {
      throw new ApiError(404, 'Timesheet not found');
    }

    // Check if timesheet has time logs
    if (timesheet._count.timeLogs > 0) {
      throw new ApiError(400, 'Cannot delete timesheet with time logs. Please delete time logs first.');
    }

    await prisma.timesheet.delete({
      where: { id: id as string },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Timesheet deleted successfully' 
    });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});
