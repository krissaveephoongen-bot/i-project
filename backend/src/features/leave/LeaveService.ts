/**
 * Leave Service
 * Handles leave allocations and requests
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { calculateLeaveHours, parseDate } from '../timesheet/timesheet.utils';
import {
  validateLeaveRequest,
  hasValidationErrors,
  formatValidationErrors,
} from '../timesheet/timesheet.validation';

const prisma = new PrismaClient();

interface CreateLeaveRequestData {
  startDate: string | Date;
  endDate: string | Date;
  leaveType: string;
  reason: string;
}

interface UpdateAllocationData {
  annualLeaveHours?: number;
  usedLeaveHours?: number;
  remainingHours?: number;
}

export class LeaveService {
  /**
   * Get or create leave allocation for a user and year
   */
  async getOrCreateAllocation(userId: string, year: number) {
    try {
      let allocation = await prisma.leave_allocations.findFirst({
        where: {
          user_id: userId,
          year,
        },
      });

      if (!allocation) {
        // Create new allocation with default 20 days (160 hours)
        allocation = await prisma.leave_allocations.create({
          data: {
            user_id: userId,
            year,
            annual_leave_hours: '160', // 20 days * 8 hours
            used_leave_hours: '0',
            remaining_hours: '160',
          },
        });
      }

      return this.formatAllocation(allocation);
    } catch (error) {
      if (error instanceof Error && error.message.includes('user_id')) {
        throw new AppError(404, 'User not found');
      }
      throw new AppError(500, 'Failed to get or create allocation');
    }
  }

  /**
   * Get leave allocation for a user and year
   */
  async getAllocation(userId: string, year: number) {
    const allocation = await prisma.leave_allocations.findFirst({
      where: {
        user_id: userId,
        year,
      },
    });

    if (!allocation) {
      throw new AppError(404, 'Leave allocation not found');
    }

    return this.formatAllocation(allocation);
  }

  /**
   * Update leave allocation
   */
  async updateAllocation(
    userId: string,
    year: number,
    data: UpdateAllocationData
  ) {
    const allocation = await prisma.leave_allocations.findFirst({
      where: {
        user_id: userId,
        year,
      },
    });

    if (!allocation) {
      throw new AppError(404, 'Leave allocation not found');
    }

    const updateData: any = {};

    if (data.annualLeaveHours !== undefined) {
      if (data.annualLeaveHours < 0) {
        throw new AppError(400, 'Annual leave hours must be non-negative');
      }
      updateData.annual_leave_hours = data.annualLeaveHours.toString();
    }

    if (data.usedLeaveHours !== undefined) {
      if (data.usedLeaveHours < 0) {
        throw new AppError(400, 'Used leave hours must be non-negative');
      }
      updateData.used_leave_hours = data.usedLeaveHours.toString();
    }

    // Calculate remaining hours
    const annual = data.annualLeaveHours ?? parseFloat(allocation.annual_leave_hours);
    const used = data.usedLeaveHours ?? parseFloat(allocation.used_leave_hours);
    updateData.remaining_hours = (annual - used).toString();

    try {
      const updated = await prisma.leave_allocations.update({
        where: { id: allocation.id },
        data: updateData,
      });

      return this.formatAllocation(updated);
    } catch (error) {
      throw new AppError(500, 'Failed to update allocation');
    }
  }

  /**
   * Create a leave request
   */
  async createLeaveRequest(userId: string, data: CreateLeaveRequestData) {
    // Validate input
    const validationErrors = validateLeaveRequest({
      startDate: typeof data.startDate === 'string' ? data.startDate : data.startDate.toISOString().split('T')[0],
      endDate: typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString().split('T')[0],
      leaveType: data.leaveType,
      reason: data.reason,
    });

    if (hasValidationErrors(validationErrors)) {
      throw new AppError(400, 'Validation failed', formatValidationErrors(validationErrors));
    }

    const startDate = typeof data.startDate === 'string' ? parseDate(data.startDate) : data.startDate;
    const endDate = typeof data.endDate === 'string' ? parseDate(data.endDate) : data.endDate;

    // Calculate leave hours
    const leaveHours = calculateLeaveHours(startDate, endDate);

    // Check allocation balance
    const year = startDate.getFullYear();
    const allocation = await this.getOrCreateAllocation(userId, year);

    if (data.leaveType === 'annual' && leaveHours > allocation.remainingHours) {
      throw new AppError(
        400,
        `Insufficient leave balance. Requested: ${leaveHours} hours, Available: ${allocation.remainingHours} hours`
      );
    }

    try {
      const request = await prisma.leave_requests.create({
        data: {
          leave_allocation_id: allocation.id,
          user_id: userId,
          start_date: startDate,
          end_date: endDate,
          leave_type: data.leaveType as any,
          reason: data.reason,
          status: 'pending',
        },
        include: {
          leave_allocations: true,
          users: true,
        },
      });

      return this.formatLeaveRequest(request);
    } catch (error) {
      throw new AppError(500, 'Failed to create leave request');
    }
  }

  /**
   * Get a leave request
   */
  async getLeaveRequest(id: string) {
    const request = await prisma.leave_requests.findUnique({
      where: { id },
      include: {
        leave_allocations: true,
        users: true,
        approver: true,
      },
    });

    if (!request) {
      throw new AppError(404, 'Leave request not found');
    }

    return this.formatLeaveRequest(request);
  }

  /**
   * Get leave requests for a user
   */
  async getUserLeaveRequests(userId: string, status?: string) {
    const whereClause: any = { user_id: userId };
    if (status) {
      whereClause.status = status;
    }

    const requests = await prisma.leave_requests.findMany({
      where: whereClause,
      include: {
        leave_allocations: true,
        approver: true,
      },
      orderBy: [{ start_date: 'desc' }, { created_at: 'desc' }],
    });

    return requests.map((request) => this.formatLeaveRequest(request));
  }

  /**
   * Get leave requests pending approval
   */
  async getLeaveRequestsForApproval(managerId: string) {
    // Get all users managed by this manager
    const managedUsers = await prisma.users.findMany({
      where: {
        // Assuming there's a managerId field or similar
        // For now, we'll get all pending requests across the system
        // This should be enhanced based on org structure
      },
    });

    const requests = await prisma.leave_requests.findMany({
      where: {
        status: 'pending',
      },
      include: {
        leave_allocations: {
          include: { users: true },
        },
        approver: true,
      },
      orderBy: { created_at: 'asc' },
    });

    return requests.map((request) => this.formatLeaveRequest(request));
  }

  /**
   * Approve a leave request
   */
  async approveLeaveRequest(id: string, approvedBy: string) {
    const request = await prisma.leave_requests.findUnique({
      where: { id },
      include: { leave_allocations: true },
    });

    if (!request) {
      throw new AppError(404, 'Leave request not found');
    }

    if (request.status !== 'pending') {
      throw new AppError(400, 'Only pending requests can be approved');
    }

    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    const leaveHours = calculateLeaveHours(startDate, endDate);

    try {
      // Update leave request
      const updated = await prisma.leave_requests.update({
        where: { id },
        data: {
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date(),
        },
        include: {
          leave_allocations: true,
          users: true,
          approver: true,
        },
      });

      // Update allocation
      const allocation = request.leave_allocations;
      const newUsedHours =
        parseFloat(allocation.used_leave_hours) + leaveHours;

      await prisma.leave_allocations.update({
        where: { id: allocation.id },
        data: {
          used_leave_hours: newUsedHours.toString(),
          remaining_hours: (
            parseFloat(allocation.annual_leave_hours) - newUsedHours
          ).toString(),
        },
      });

      return this.formatLeaveRequest(updated);
    } catch (error) {
      throw new AppError(500, 'Failed to approve leave request');
    }
  }

  /**
   * Reject a leave request
   */
  async rejectLeaveRequest(id: string) {
    const request = await prisma.leave_requests.findUnique({
      where: { id },
    });

    if (!request) {
      throw new AppError(404, 'Leave request not found');
    }

    if (request.status !== 'pending') {
      throw new AppError(400, 'Only pending requests can be rejected');
    }

    try {
      const updated = await prisma.leave_requests.update({
        where: { id },
        data: {
          status: 'rejected',
        },
        include: {
          leave_allocations: true,
          users: true,
          approver: true,
        },
      });

      return this.formatLeaveRequest(updated);
    } catch (error) {
      throw new AppError(500, 'Failed to reject leave request');
    }
  }

  /**
   * Format allocation for response
   */
  private formatAllocation(allocation: any) {
    return {
      id: allocation.id,
      userId: allocation.user_id,
      year: allocation.year,
      annualLeaveHours: parseFloat(allocation.annual_leave_hours),
      usedLeaveHours: parseFloat(allocation.used_leave_hours),
      remainingHours: parseFloat(allocation.remaining_hours),
      createdAt: allocation.created_at.toISOString(),
      updatedAt: allocation.updated_at.toISOString(),
    };
  }

  /**
   * Format leave request for response
   */
  private formatLeaveRequest(request: any) {
    return {
      id: request.id,
      userId: request.user_id,
      leaveAllocationId: request.leave_allocation_id,
      startDate: request.start_date.toISOString().split('T')[0],
      endDate: request.end_date.toISOString().split('T')[0],
      leaveType: request.leave_type,
      reason: request.reason,
      status: request.status,
      approvedBy: request.approved_by,
      approvedAt: request.approved_at?.toISOString() || null,
      createdAt: request.created_at.toISOString(),
      updatedAt: request.updated_at.toISOString(),
      user: request.users ? {
        id: request.users.id,
        name: request.users.name,
      } : null,
      allocation: request.leave_allocations
        ? this.formatAllocation(request.leave_allocations)
        : null,
      approver: request.approver ? {
        id: request.approver.id,
        name: request.approver.name,
      } : null,
    };
  }
}

export default new LeaveService();
