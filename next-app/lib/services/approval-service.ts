// Approval Service
// Handles all approval-related database operations

import { prisma } from '../database'
import { BaseService, type BaseServiceOptions, type PaginationOptions, type PaginatedResult } from '../base-service'
import type { users, Prisma } from '@prisma/client'

// Approval types
export enum ApprovalType {
  EXPENSE = 'expense',
  TIMESHEET = 'timesheet',
  LEAVE_REQUEST = 'leave_request',
  PROJECT_CHANGE = 'project_change'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum ApprovalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Base approval interface
export interface ApprovalRequest {
  id: string
  type: ApprovalType
  title: string
  description: string
  requestedBy: string
  requestedByEmail: string
  requestedAt: Date
  status: ApprovalStatus
  priority: ApprovalPriority
  amount?: number
  currency?: string
  projectName?: string
  metadata?: Record<string, any>
  approvedBy?: string
  approvedAt?: Date
  rejectedReason?: string
}

// Approval action interface
export interface ApprovalAction {
  action: 'approve' | 'reject'
  reason?: string
  approvedBy: string
}

export class ApprovalService {
  // Get pending approvals
  async getPendingApprovals(options?: {
    type?: ApprovalType
    priority?: ApprovalPriority
    requestedBy?: string
    pagination?: PaginationOptions
  }): Promise<{ approvals: ApprovalRequest[]; total: number }> {
    try {
      const where: any = { status: ApprovalStatus.PENDING }
      
      if (options?.type) where.type = options.type
      if (options?.priority) where.priority = options.priority
      if (options?.requestedBy) where.requestedBy = options.requestedBy

      // Get expense approvals
      const expenseApprovals = await this.getExpenseApprovals(where)
      
      // Get timesheet approvals  
      const timesheetApprovals = await this.getTimesheetApprovals(where)
      
      // Combine all approvals
      const allApprovals = [...expenseApprovals, ...timesheetApprovals]
      
      // Sort by requestedAt (newest first)
      allApprovals.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
      
      // Apply pagination if provided
      let result = allApprovals
      let total = allApprovals.length
      
      if (options?.pagination) {
        const { page, limit } = options.pagination
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        result = allApprovals.slice(startIndex, endIndex)
      }

      return { approvals: result, total }
    } catch (error) {
      console.error('Get pending approvals failed:', error)
      throw new Error(`Failed to get pending approvals: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Process approval action
  async processApproval(
    id: string, 
    type: ApprovalType, 
    action: ApprovalAction
  ): Promise<ApprovalRequest> {
    try {
      switch (type) {
        case ApprovalType.EXPENSE:
          return await this.processExpenseApproval(id, action)
        case ApprovalType.TIMESHEET:
          return await this.processTimesheetApproval(id, action)
        default:
          throw new Error(`Unsupported approval type: ${type}`)
      }
    } catch (error) {
      console.error(`Process approval failed for ${type} ${id}:`, error)
      throw new Error(`Failed to process approval: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get approval statistics
  async getApprovalStats(): Promise<{
    pending: { count: number; totalAmount: number }
    approved: { count: number; totalAmount: number }
    rejected: { count: number; totalAmount: number }
    byType: Record<ApprovalType, { pending: number; approved: number; rejected: number }>
    byPriority: Record<ApprovalPriority, number>
  }> {
    try {
      // Get expense stats
      const expenseStats = await this.getExpenseStats()
      
      // Get timesheet stats
      const timesheetStats = await this.getTimesheetStats()
      
      // Combine stats
      const combined = {
        pending: {
          count: expenseStats.pending.count + timesheetStats.pending.count,
          totalAmount: expenseStats.pending.totalAmount + timesheetStats.pending.totalAmount
        },
        approved: {
          count: expenseStats.approved.count + timesheetStats.approved.count,
          totalAmount: expenseStats.approved.totalAmount + timesheetStats.approved.totalAmount
        },
        rejected: {
          count: expenseStats.rejected.count + timesheetStats.rejected.count,
          totalAmount: expenseStats.rejected.totalAmount + timesheetStats.rejected.totalAmount
        },
        byType: {
          [ApprovalType.EXPENSE]: expenseStats.byType,
          [ApprovalType.TIMESHEET]: timesheetStats.byType
        } as Record<ApprovalType, any>,
        byPriority: {
          ...expenseStats.byPriority,
          ...timesheetStats.byPriority
        } as Record<ApprovalPriority, number>
      }

      return combined
    } catch (error) {
      console.error('Get approval stats failed:', error)
      throw new Error(`Failed to get approval stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Private helper methods
  private async getExpenseApprovals(where: any): Promise<ApprovalRequest[]> {
    const expenses = await prisma.expenses.findMany({
      where: {
        status: where.status === 'pending' ? 'pending' : where.status,
        ...(where.type && { category: { contains: where.type } })
      },
      include: {
        user: true,
        project: true
      },
      orderBy: { created_at: 'desc' }
    })

    return expenses.map(expense => ({
      id: expense.id,
      type: ApprovalType.EXPENSE,
      title: `Expense: ${expense.category}`,
      description: expense.description || 'No description',
      requestedBy: expense.user?.name || 'Unknown',
      requestedByEmail: expense.user?.email || '',
      requestedAt: expense.created_at,
      status: expense.status as ApprovalStatus,
      priority: expense.amount > 5000 ? ApprovalPriority.HIGH : ApprovalPriority.MEDIUM,
      amount: Number(expense.amount),
      currency: 'THB',
      projectName: expense.project?.name || 'No Project',
      metadata: { date: expense.date, ...expense },
      approvedBy: expense.approved_by || undefined,
      approvedAt: expense.approved_at || undefined,
      rejectedReason: expense.rejected_reason || undefined
    }))
  }

  private async getTimesheetApprovals(where: any): Promise<ApprovalRequest[]> {
    const timeEntries = await prisma.timeEntries.findMany({
      where: {
        status: where.status === 'pending' ? 'pending' : where.status
      },
      include: {
        user: true,
        project: true
      },
      orderBy: { created_at: 'desc' }
    })

    return timeEntries.map(entry => ({
      id: entry.id,
      type: ApprovalType.TIMESHEET,
      title: `Timesheet: ${entry.hours}h - ${entry.project?.code || 'No Project'}`,
      description: entry.description || 'No description',
      requestedBy: entry.user?.name || 'Unknown',
      requestedByEmail: entry.user?.email || '',
      requestedAt: entry.created_at,
      status: entry.status as ApprovalStatus,
      priority: ApprovalPriority.MEDIUM,
      amount: Number(entry.hours),
      currency: 'Hrs',
      projectName: entry.project?.name || 'No Project',
      metadata: { date: entry.date, ...entry },
      approvedBy: entry.approved_by || undefined,
      approvedAt: entry.approved_at || undefined,
      rejectedReason: entry.rejected_reason || undefined
    }))
  }

  private async processExpenseApproval(id: string, action: ApprovalAction): Promise<ApprovalRequest> {
    const status = action.action === 'approve' ? 'approved' : 'rejected'
    const updateData: any = {
      status,
      updated_at: new Date()
    }

    if (action.action === 'approve') {
      updateData.approved_at = new Date()
      updateData.approved_by = action.approvedBy
    } else {
      updateData.rejected_reason = action.reason
    }

    const expense = await prisma.expenses.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        project: true
      }
    })

    return (await this.getExpenseApprovals({ status: 'approved' }))[0]
  }

  private async processTimesheetApproval(id: string, action: ApprovalAction): Promise<ApprovalRequest> {
    const status = action.action === 'approve' ? 'approved' : 'rejected'
    const updateData: any = {
      status,
      updated_at: new Date()
    }

    if (action.action === 'approve') {
      updateData.approved_at = new Date()
      updateData.approved_by = action.approvedBy
    } else {
      updateData.rejected_reason = action.reason
    }

    const timeEntry = await prisma.timeEntries.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        project: true
      }
    })

    return (await this.getTimesheetApprovals({ status: 'approved' }))[0]
  }

  private async getExpenseStats() {
    const expenses = await prisma.expenses.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true }
    })

    const stats = {
      pending: { count: 0, totalAmount: 0 },
      approved: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
      byType: { pending: 0, approved: 0, rejected: 0 },
      byPriority: { [ApprovalPriority.LOW]: 0, [ApprovalPriority.MEDIUM]: 0, [ApprovalPriority.HIGH]: 0, [ApprovalPriority.URGENT]: 0 }
    }

    expenses.forEach(expense => {
      const status = expense.status as string
      const count = expense._count.id
      const amount = Number(expense._sum.amount || 0)

      if (stats[status as keyof typeof stats]) {
        stats[status as keyof typeof stats] = { count, totalAmount: amount }
      }
    })

    return stats
  }

  private async getTimesheetStats() {
    const timeEntries = await prisma.timeEntries.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { hours: true }
    })

    const stats = {
      pending: { count: 0, totalAmount: 0 },
      approved: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
      byType: { pending: 0, approved: 0, rejected: 0 },
      byPriority: { [ApprovalPriority.LOW]: 0, [ApprovalPriority.MEDIUM]: 0, [ApprovalPriority.HIGH]: 0, [ApprovalPriority.URGENT]: 0 }
    }

    timeEntries.forEach(entry => {
      const status = entry.status as string
      const count = entry._count.id
      const hours = Number(entry._sum.hours || 0)

      if (stats[status as keyof typeof stats]) {
        stats[status as keyof typeof stats] = { count, totalAmount: hours }
      }
    })

    return stats
  }
}

// Export singleton instance
export const approvalService = new ApprovalService()
