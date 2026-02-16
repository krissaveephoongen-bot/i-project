/**
 * Timesheet Service
 * Handles all timesheet-related business logic and database operations
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { calculateHours, getMonthDateRange } from './timesheet.utils';
import {
  validateTimeEntry,
  hasValidationErrors,
  formatValidationErrors,
} from './timesheet.validation';
import {
  detectDuplicateOrParallelWork,
  updateConcurrentRelationships,
  checkDailyTotalHours,
} from './timesheet.duplicate-detection';

const prisma = new PrismaClient();

interface TimeEntryData {
  date: string | Date;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  workType: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  description?: string;
}

interface UpdateTimeEntryData extends Partial<TimeEntryData> {}

export class TimesheetService {
  /**
   * Create a new time entry
   */
  async createTimeEntry(data: TimeEntryData & { isConcurrent?: boolean; concurrentReason?: string; chargeable?: boolean; chargeAmount?: number }) {
    // Validate input
    const validationErrors = validateTimeEntry({
      startTime: data.startTime,
      endTime: data.endTime,
      breakDuration: data.breakDuration,
      date: typeof data.date === 'string' ? data.date : data.date.toISOString().split('T')[0],
      workType: data.workType,
      description: data.description,
    });

    if (hasValidationErrors(validationErrors)) {
      throw new AppError(400, 'Validation failed', formatValidationErrors(validationErrors));
    }

    // Check for duplicates and parallel work
    const date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    const duplicateCheck = await detectDuplicateOrParallelWork(
      {
        userId: data.userId,
        date,
        startTime: data.startTime,
        endTime: data.endTime,
        projectId: data.projectId,
        workType: data.workType,
      }
    );

    // If concurrent work but no comment provided, throw error
    if (duplicateCheck.isConcurrent && !data.concurrentReason) {
      throw new AppError(
        400,
        'CONCURRENT_REASON_REQUIRED',
        {
          message: 'โปรดระบุเหตุผลการทำงานขนาน',
          warnings: duplicateCheck.warnings,
        }
      );
    }

    // Check daily total doesn't exceed 24 hours
    const dailyTotal = await checkDailyTotalHours(data.userId, date);
    if (dailyTotal.exceeds) {
      throw new AppError(
        400,
        'EXCEEDS_DAILY_LIMIT',
        `วันนี้บันทึก ${dailyTotal.total} ชั่วโมง (>24h)`
      );
    }

    // Calculate hours
    const hours = calculateHours(
      data.startTime,
      data.endTime,
      data.breakDuration || 0
    );

    // Determine billable hours
    let billableHours: number | null = null;
    if (['project', 'training'].includes(data.workType) && !data.chargeable) {
      billableHours = hours;
    }

    try {
      const timeEntry = await prisma.time_entries.create({
        data: {
          date,
          startTime: data.startTime,
          endTime: data.endTime,
          breakDuration: data.breakDuration || 60,
          workType: data.workType as any,
          projectId: data.projectId,
          taskId: data.taskId,
          userId: data.userId,
          hours: hours.toString(),
          billableHours: billableHours?.toString() || null,
          description: data.description,
          status: 'pending',
          // New concurrent work fields
          isConcurrent: duplicateCheck.isConcurrent,
          concurrentReason: data.concurrentReason || null,
          chargeable: data.chargeable || false,
          chargeAmount: data.chargeAmount || null,
        },
      });

      // If concurrent, update related entries
      if (duplicateCheck.isConcurrent && duplicateCheck.overlappingEntries) {
        await updateConcurrentRelationships(
          timeEntry.id,
          duplicateCheck.overlappingEntries.map((e) => e.id),
          data.concurrentReason || ''
        );
      }

      return this.formatTimeEntry(timeEntry);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error) {
        if (error.message.includes('user_id')) {
          throw new AppError(404, 'User not found');
        }
        if (error.message.includes('project_id')) {
          throw new AppError(404, 'Project not found');
        }
      }
      throw new AppError(500, 'Failed to create time entry');
    }
  }

  /**
   * Get a single time entry by ID
   */
  async getTimeEntry(id: string) {
    const timeEntry = await prisma.time_entries.findUnique({
      where: { id },
      include: {
        projects: true,
        tasks: true,
        users_time_entries_userIdTousers: true,
        time_entry_comments: {
          include: { users: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!timeEntry) {
      throw new AppError(404, 'Time entry not found');
    }

    return this.formatTimeEntryWithRelations(timeEntry);
  }

  /**
   * Get time entries for a user in a specific month
   */
  async getUserTimeEntries(userId: string, month: number, year: number) {
    const { start, end } = getMonthDateRange(month, year);

    const timeEntries = await prisma.time_entries.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        projects: true,
        time_entry_comments: { include: { users: true } },
      },
      orderBy: [{ date: 'desc' }, { created_at: 'desc' }],
    });

    return timeEntries.map((entry) => this.formatTimeEntry(entry));
  }

  /**
   * Calculate total hours for a user in a month
   */
  async getMonthlyHours(userId: string, month: number, year: number): Promise<number> {
    const { start, end } = getMonthDateRange(month, year);

    const result = await prisma.time_entries.aggregate({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
        status: 'pending', // Only count approved entries
      },
      _sum: {
        hours: true,
      },
    });

    return result._sum.hours ? parseFloat(result._sum.hours.toString()) : 0;
  }

  /**
   * Calculate billable hours for a project
   */
  async getProjectHours(
    projectId: string,
    month?: number,
    year?: number
  ): Promise<number> {
    let whereClause: any = {
      projectId,
      billableHours: {
        gt: 0,
      },
    };

    if (month && year) {
      const { start, end } = getMonthDateRange(month, year);
      whereClause.date = {
        gte: start,
        lte: end,
      };
    }

    const result = await prisma.time_entries.aggregate({
      where: whereClause,
      _sum: {
        billableHours: true,
      },
    });

    return result._sum.billableHours
      ? parseFloat(result._sum.billableHours.toString())
      : 0;
  }

  /**
   * Update a time entry
   */
  async updateTimeEntry(id: string, data: UpdateTimeEntryData) {
    const timeEntry = await prisma.time_entries.findUnique({
      where: { id },
    });

    if (!timeEntry) {
      throw new AppError(404, 'Time entry not found');
    }

    if (timeEntry.status !== 'pending' && timeEntry.status !== 'rejected') {
      throw new AppError(400, 'Cannot edit approved or in-review time entries');
    }

    // Prepare update data
    const updateData: any = {};

    if (data.date) {
      updateData.date = typeof data.date === 'string' ? new Date(data.date) : data.date;
    }

    if (data.startTime || data.endTime) {
      const startTime = data.startTime || timeEntry.startTime;
      const endTime = data.endTime || timeEntry.endTime;
      const breakMin = data.breakDuration ?? timeEntry.breakDuration;

      // Validate
      const validationErrors = validateTimeEntry({
        startTime,
        endTime,
        breakDuration: breakMin,
        workType: data.workType || timeEntry.workType,
      });

      if (hasValidationErrors(validationErrors)) {
        throw new AppError(400, 'Validation failed', formatValidationErrors(validationErrors));
      }

      updateData.startTime = startTime;
      updateData.endTime = endTime;
      updateData.hours = calculateHours(startTime, endTime, breakMin).toString();
    }

    if (data.breakDuration !== undefined) {
      updateData.breakDuration = data.breakDuration;
    }

    if (data.workType) {
      updateData.workType = data.workType;
    }

    if (data.projectId !== undefined) {
      updateData.projectId = data.projectId;
    }

    if (data.taskId !== undefined) {
      updateData.taskId = data.taskId;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    updateData.updatedAt = new Date();

    try {
      const updated = await prisma.time_entries.update({
        where: { id },
        data: updateData,
      });

      return this.formatTimeEntry(updated);
    } catch (error) {
      throw new AppError(500, 'Failed to update time entry');
    }
  }

  /**
   * Approve a time entry
   */
  async approveTimeEntry(id: string, approvedBy: string) {
    const timeEntry = await prisma.time_entries.findUnique({
      where: { id },
    });

    if (!timeEntry) {
      throw new AppError(404, 'Time entry not found');
    }

    if (timeEntry.status !== 'pending') {
      throw new AppError(400, 'Only pending time entries can be approved');
    }

    try {
      const updated = await prisma.time_entries.update({
        where: { id },
        data: {
          status: 'approved',
          approvedBy,
          approvedAt: new Date(),
        },
      });

      return this.formatTimeEntry(updated);
    } catch (error) {
      throw new AppError(500, 'Failed to approve time entry');
    }
  }

  /**
   * Reject a time entry
   */
  async rejectTimeEntry(id: string, reason: string) {
    const timeEntry = await prisma.time_entries.findUnique({
      where: { id },
    });

    if (!timeEntry) {
      throw new AppError(404, 'Time entry not found');
    }

    if (!['pending', 'in_review'].includes(timeEntry.status)) {
      throw new AppError(400, 'Can only reject pending or in-review entries');
    }

    try {
      const updated = await prisma.time_entries.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectedReason: reason,
        },
      });

      return this.formatTimeEntry(updated);
    } catch (error) {
      throw new AppError(500, 'Failed to reject time entry');
    }
  }

  /**
   * Delete a time entry
   */
  async deleteTimeEntry(id: string) {
    const timeEntry = await prisma.time_entries.findUnique({
      where: { id },
    });

    if (!timeEntry) {
      throw new AppError(404, 'Time entry not found');
    }

    if (!['pending', 'rejected'].includes(timeEntry.status)) {
      throw new AppError(400, 'Cannot delete approved or in-review entries');
    }

    try {
      // Delete associated comments first
      await prisma.time_entry_comments.deleteMany({
        where: { time_entry_id: id },
      });

      // Delete the time entry
      await prisma.time_entries.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppError(500, 'Failed to delete time entry');
    }
  }

  /**
   * Add a comment to a time entry
   */
  async addComment(timeEntryId: string, userId: string, text: string) {
    const timeEntry = await prisma.time_entries.findUnique({
      where: { id: timeEntryId },
    });

    if (!timeEntry) {
      throw new AppError(404, 'Time entry not found');
    }

    if (!text || text.trim().length === 0) {
      throw new AppError(400, 'Comment text is required');
    }

    try {
      const comment = await prisma.time_entry_comments.create({
        data: {
          time_entry_id: timeEntryId,
          user_id: userId,
          text: text.trim(),
        },
        include: { users: true },
      });

      return {
        id: comment.id,
        text: comment.text,
        user: {
          id: comment.users.id,
          name: comment.users.name,
        },
        createdAt: comment.created_at,
      };
    } catch (error) {
      throw new AppError(500, 'Failed to add comment');
    }
  }

  /**
   * Get comments for a time entry
   */
  async getComments(timeEntryId: string) {
    const comments = await prisma.time_entry_comments.findMany({
      where: { time_entry_id: timeEntryId },
      include: { users: true },
      orderBy: { created_at: 'desc' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      user: {
        id: comment.users.id,
        name: comment.users.name,
        avatar: comment.users.avatar,
      },
      createdAt: comment.created_at,
    }));
  }

  /**
   * Format time entry for response
   */
  private formatTimeEntry(entry: any) {
    return {
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      startTime: entry.startTime,
      endTime: entry.endTime,
      breakDuration: entry.breakDuration,
      workType: entry.workType,
      projectId: entry.projectId,
      taskId: entry.taskId,
      userId: entry.userId,
      hours: parseFloat(entry.hours),
      billableHours: entry.billableHours ? parseFloat(entry.billableHours) : null,
      description: entry.description,
      status: entry.status,
      approvedBy: entry.approvedBy,
      approvedAt: entry.approvedAt?.toISOString() || null,
      rejectedReason: entry.rejectedReason,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }

  /**
   * Format time entry with relations
   */
  private formatTimeEntryWithRelations(entry: any) {
    return {
      ...this.formatTimeEntry(entry),
      project: entry.projects ? {
        id: entry.projects.id,
        name: entry.projects.name,
      } : null,
      task: entry.tasks ? {
        id: entry.tasks.id,
        name: entry.tasks.name,
      } : null,
      user: entry.users_time_entries_userIdTousers ? {
        id: entry.users_time_entries_userIdTousers.id,
        name: entry.users_time_entries_userIdTousers.name,
      } : null,
      approver: entry.users_time_entries_approvedByTousers ? {
        id: entry.users_time_entries_approvedByTousers.id,
        name: entry.users_time_entries_approvedByTousers.name,
      } : null,
      comments: (entry.time_entry_comments || []).map((comment: any) => ({
        id: comment.id,
        text: comment.text,
        user: {
          id: comment.users.id,
          name: comment.users.name,
        },
        createdAt: comment.created_at.toISOString(),
      })),
    };
  }
}

export default new TimesheetService();
