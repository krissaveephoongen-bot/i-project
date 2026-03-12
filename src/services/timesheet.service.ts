/**
 * Timesheet Management Service
 *
 * Comprehensive timesheet tracking system integrating:
 * - Project tasks (billable/non-billable)
 * - Non-project activities
 * - Leave management
 * - Cost calculation (labor cost tracking)
 * - Approval workflow
 * - Integration with EVM and Project Financials
 */

import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

interface TimeEntryInput {
  userId: string
  date: Date
  entryType: 'project_task' | 'non_project' | 'leave'
  startTime: string // HH:mm
  endTime?: string // HH:mm
  projectId?: string
  taskId?: string
  wbsTaskId?: string
  nonProjectActivityId?: string
  leaveRequestId?: string
  description?: string
  breakMinutes?: number
  billable?: boolean
  concurrentReason?: string
}

interface TimesheetSummary {
  totalProjectHours: number
  totalNonProjectHours: number
  totalLeaveHours: number
  totalBillableHours: number
  totalHours: number
  entryCount: number
}

export class TimesheetService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Create time entry
   * Validates entry, calculates hours, creates record
   */
  async createTimeEntry(data: TimeEntryInput): Promise<any> {
    // Validate user exists
    const user = await this.prisma.users.findUnique({
      where: { id: data.userId },
      select: { hourlyRate: true },
    })
    if (!user) {
      throw new Error(`User ${data.userId} not found`)
    }

    // Calculate total minutes
    const { totalMinutes, hours } = this.calculateHours(
      data.startTime,
      data.endTime || data.startTime,
      data.breakMinutes || 0
    )

    // Validate hours
    if (hours === 0) {
      throw new Error('Entry must be at least 15 minutes')
    }

    // Check for overlapping entries
    const overlap = await this.checkForOverlapingEntries(
      data.userId,
      data.date,
      data.startTime,
      data.endTime || data.startTime
    )

    if (overlap && !data.concurrentReason) {
      throw new Error('Time overlaps with existing entry. Provide concurrentReason to allow parallel work.')
    }

    // Get hourly rate based on entry type
    const hourlyRate = Number(user.hourlyRate)

    // Create entry
    const entry = await this.prisma.time_entries.create({
      data: {
        userId: data.userId,
        date: data.date,
        entryType: data.entryType,
        startTime: data.startTime,
        endTime: data.endTime,
        projectId: data.projectId,
        taskId: data.taskId,
        wbsTaskId: data.wbsTaskId,
        nonProjectActivityId: data.nonProjectActivityId,
        leaveRequestId: data.leaveRequestId,
        breakMinutes: data.breakMinutes || 0,
        totalMinutes,
        hours: new Decimal(hours),
        description: data.description,
        billable: data.billable !== false,
        isConcurrentEntry: !!overlap,
        concurrentReason: data.concurrentReason,
        status: 'draft',
        approvalStatus: 'pending',
      },
    })

    // Create associated cost record if project
    if (data.projectId && entry.entryType === 'project_task') {
      await this.createTimesheetCost(entry.id, hourlyRate, hours)
    }

    return entry
  }

  /**
   * Calculate hours from time range
   */
  private calculateHours(
    startTime: string,
    endTime: string,
    breakMinutes: number
  ): { totalMinutes: number; hours: number } {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin

    // If end time is earlier than start time, assume next day
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60
    }

    const totalMinutes = endMinutes - startMinutes - breakMinutes
    const hours = totalMinutes / 60

    return { totalMinutes: Math.max(0, totalMinutes), hours: Math.max(0, hours) }
  }

  /**
   * Check for overlapping entries
   */
  private async checkForOverlapingEntries(
    userId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const entries = await this.prisma.time_entries.findMany({
      where: {
        userId,
        date,
        status: { not: 'rejected' },
      },
      select: { startTime: true, endTime: true },
    })

    if (entries.length === 0) return false

    const [newStart] = startTime.split(':').map(Number)
    const [newEnd] = endTime.split(':').map(Number)

    for (const entry of entries) {
      const [existStart] = entry.startTime.split(':').map(Number)
      const [existEnd] = (entry.endTime || entry.startTime).split(':').map(Number)

      // Check overlap
      if (newStart < existEnd && newEnd > existStart) {
        return true
      }
    }

    return false
  }

  /**
   * Create timesheet cost record
   */
  private async createTimesheetCost(
    entryId: string,
    hourlyRate: number,
    hours: number
  ): Promise<void> {
    const baseCost = hourlyRate * hours
    const overtimeMultiplier = this.calculateOvertimeMultiplier(hours)
    const finalCost = baseCost * overtimeMultiplier

    await this.prisma.timesheet_cost.create({
      data: {
        entryId,
        hourlyRate: new Decimal(hourlyRate),
        hours: new Decimal(hours),
        baseCost: new Decimal(baseCost),
        overtimeMultiplier: new Decimal(overtimeMultiplier),
        finalCost: new Decimal(finalCost),
        isIncludedInACWP: false,
      },
    })
  }

  /**
   * Calculate overtime multiplier
   * 1.0x for normal hours (≤8 per day)
   * 1.5x for overtime (8-12 per day)
   * 2.0x for excessive overtime (>12 per day)
   */
  private calculateOvertimeMultiplier(dailyHours: number): number {
    if (dailyHours <= 8) return 1.0
    if (dailyHours <= 12) return 1.5
    return 2.0
  }

  /**
   * Submit timesheet for a period
   */
  async submitTimesheet(
    userId: string,
    periodStartDate: Date,
    periodEndDate: Date
  ): Promise<any> {
    // Get all entries for period
    const entries = await this.prisma.time_entries.findMany({
      where: {
        userId,
        date: {
          gte: periodStartDate,
          lte: periodEndDate,
        },
      },
    })

    // Calculate summary
    const summary = this.calculateTimesheetSummary(entries)

    // Create submission record
    const submission = await this.prisma.timesheet_submission.create({
      data: {
        userId,
        periodStartDate,
        periodEndDate,
        periodType: this.determinePeriodType(periodStartDate, periodEndDate),
        totalProjectHours: new Decimal(summary.totalProjectHours),
        totalNonProjectHours: new Decimal(summary.totalNonProjectHours),
        totalLeaveHours: new Decimal(summary.totalLeaveHours),
        totalBillableHours: new Decimal(summary.totalBillableHours),
        totalHours: new Decimal(summary.totalHours),
        status: 'submitted',
        submittedAt: new Date(),
      },
    })

    // Update entries to submitted
    await this.prisma.time_entries.updateMany({
      where: {
        userId,
        date: {
          gte: periodStartDate,
          lte: periodEndDate,
        },
        status: 'draft',
      },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
    })

    return submission
  }

  /**
   * Calculate timesheet summary
   */
  private calculateTimesheetSummary(
    entries: any[]
  ): TimesheetSummary {
    let projectHours = 0
    let nonProjectHours = 0
    let leaveHours = 0
    let billableHours = 0

    for (const entry of entries) {
      const hours = Number(entry.hours)

      switch (entry.entryType) {
        case 'project_task':
          projectHours += hours
          if (entry.billable) billableHours += hours
          break
        case 'non_project':
          nonProjectHours += hours
          break
        case 'leave':
          leaveHours += hours
          break
      }
    }

    return {
      totalProjectHours: projectHours,
      totalNonProjectHours: nonProjectHours,
      totalLeaveHours: leaveHours,
      totalBillableHours: billableHours,
      totalHours: projectHours + nonProjectHours + leaveHours,
      entryCount: entries.length,
    }
  }

  /**
   * Determine period type
   */
  private determinePeriodType(startDate: Date, endDate: Date): string {
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysDiff <= 7) return 'weekly'
    return 'monthly'
  }

  /**
   * Approve timesheet
   */
  async approveTimesheet(
    submissionId: string,
    approvedBy: string
  ): Promise<any> {
    const submission = await this.prisma.timesheet_submission.update({
      where: { id: submissionId },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
      },
    })

    // Update all entries to approved
    await this.prisma.time_entries.updateMany({
      where: {
        userId: submission.userId,
        date: {
          gte: submission.periodStartDate,
          lte: submission.periodEndDate,
        },
        status: 'submitted',
      },
      data: {
        status: 'approved',
        approvalStatus: 'approved',
        approvedBy,
        approvedAt: new Date(),
      },
    })

    // Include timesheet costs in ACWP
    await this.includeTimesheetCostsInACWP(
      submission.userId,
      submission.periodStartDate,
      submission.periodEndDate
    )

    return submission
  }

  /**
   * Include timesheet costs in ACWP
   * Called after timesheet approval
   */
  private async includeTimesheetCostsInACWP(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const costs = await this.prisma.timesheet_cost.findMany({
      where: {
        entry: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'approved',
        },
      },
    })

    for (const cost of costs) {
      if (!cost.isIncludedInACWP) {
        await this.prisma.timesheet_cost.update({
          where: { id: cost.id },
          data: {
            isIncludedInACWP: true,
            acwpIncludedDate: new Date(),
          },
        })

        // Update project financials if project linked
        if (cost.projectId) {
          await this.updateProjectFinancials(cost.projectId)
        }
      }
    }
  }

  /**
   * Update project financials
   * Recalculate project costs including new timesheet costs
   */
  private async updateProjectFinancials(projectId: string): Promise<void> {
    // This would call the FinancialService to recalculate
    // For now, just a placeholder
    console.log(`Update project financials for ${projectId}`)
  }

  /**
   * Get daily timesheet summary
   */
  async getDailySummary(userId: string, date: Date): Promise<any> {
    const entries = await this.prisma.time_entries.findMany({
      where: {
        userId,
        date,
        status: { not: 'rejected' },
      },
    })

    const summary = this.calculateTimesheetSummary(entries)

    // Get or create daily summary record
    const dailySummary = await this.prisma.daily_timesheet_summary.upsert({
      where: {
        userId_date: { userId, date },
      },
      update: {
        projectHours: new Decimal(summary.totalProjectHours),
        nonProjectHours: new Decimal(summary.totalNonProjectHours),
        leaveHours: new Decimal(summary.totalLeaveHours),
        billableHours: new Decimal(summary.totalBillableHours),
        totalHours: new Decimal(summary.totalHours),
        isValid: summary.totalHours <= 12, // Max 12 hours per day
      },
      create: {
        userId,
        date,
        projectHours: new Decimal(summary.totalProjectHours),
        nonProjectHours: new Decimal(summary.totalNonProjectHours),
        leaveHours: new Decimal(summary.totalLeaveHours),
        billableHours: new Decimal(summary.totalBillableHours),
        totalHours: new Decimal(summary.totalHours),
        isValid: summary.totalHours <= 12,
      },
    })

    return dailySummary
  }

  /**
   * Request leave
   */
  async requestLeave(
    userId: string,
    startDate: Date,
    endDate: Date,
    leaveType: string,
    reason?: string
  ): Promise<any> {
    // Get leave allocation for current year
    const year = startDate.getFullYear()
    const allocation = await this.prisma.leave_allocations.findUnique({
      where: {
        userId_year: { userId, year },
      },
    })

    if (!allocation) {
      throw new Error(`No leave allocation found for ${year}`)
    }

    // Calculate days
    const leaveDays = this.calculateLeaveDays(startDate, endDate)

    // Check available balance
    const field = `${leaveType.toLowerCase()}LeaveRemaining` as keyof typeof allocation
    const available = Number(allocation[field] || 0)

    if (leaveDays > available) {
      throw new Error(
        `Insufficient ${leaveType} leave balance. Available: ${available}, Requested: ${leaveDays}`
      )
    }

    // Create leave request
    const leaveRequest = await this.prisma.leave_requests.create({
      data: {
        allocationId: allocation.id,
        userId,
        startDate,
        endDate,
        leaveDays: new Decimal(leaveDays),
        leaveType: leaveType as any,
        reason,
        status: 'pending',
      },
    })

    return leaveRequest
  }

  /**
   * Calculate leave days (excluding weekends)
   */
  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    let days = 0
    const current = new Date(startDate)

    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      // Count only weekdays (1-5 = Mon-Fri)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days++
      }
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  /**
   * Approve leave request
   */
  async approveLeave(
    leaveRequestId: string,
    approvedBy: string
  ): Promise<any> {
    const leaveRequest = await this.prisma.leave_requests.findUnique({
      where: { id: leaveRequestId },
      include: { allocation: true },
    })

    if (!leaveRequest) {
      throw new Error('Leave request not found')
    }

    // Create time entries for leave
    const current = new Date(leaveRequest.startDate)
    while (current <= leaveRequest.endDate) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        await this.createTimeEntry({
          userId: leaveRequest.userId,
          date: new Date(current),
          entryType: 'leave',
          startTime: '08:00',
          endTime: '17:00',
          breakMinutes: 60,
          leaveRequestId,
        })
      }
      current.setDate(current.getDate() + 1)
    }

    // Update leave allocation
    const field = `${leaveRequest.leaveType.toLowerCase()}LeaveUsed` as keyof typeof leaveRequest.allocation
    const usedField = field
    const used = Number(leaveRequest.allocation[usedField] || 0)
    const remaining = Number(leaveRequest.allocation[`${leaveRequest.leaveType.toLowerCase()}LeaveRemaining`] || 0)

    await this.prisma.leave_allocations.update({
      where: { id: leaveRequest.allocationId },
      data: {
        [usedField]: new Decimal(used + Number(leaveRequest.leaveDays)),
        [`${leaveRequest.leaveType.toLowerCase()}LeaveRemaining`]: new Decimal(
          remaining - Number(leaveRequest.leaveDays)
        ),
      },
    })

    // Update leave request
    return await this.prisma.leave_requests.update({
      where: { id: leaveRequestId },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
      },
    })
  }

  /**
   * Get user timesheet statistics
   */
  async getTimesheetStats(userId: string): Promise<any> {
    // Get last 12 weeks of data
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 84) // 12 weeks

    const entries = await this.prisma.time_entries.findMany({
      where: {
        userId,
        date: { gte: twoWeeksAgo },
        status: 'approved',
      },
    })

    // Calculate stats
    const totalEntries = entries.length
    const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)
    const avgDailyHours = totalHours / Math.ceil((Date.now() - twoWeeksAgo.getTime()) / (1000 * 60 * 60 * 24))

    const projectHours = entries
      .filter((e) => e.entryType === 'project_task')
      .reduce((sum, e) => sum + Number(e.hours), 0)

    const stats = await this.prisma.timesheet_statistics.upsert({
      where: { userId },
      update: {
        avgDailyHours: new Decimal(avgDailyHours),
        avgProjectHoursPercent: new Decimal((projectHours / totalHours) * 100),
        lastCalculated: new Date(),
      },
      create: {
        userId,
        avgDailyHours: new Decimal(avgDailyHours),
        avgProjectHoursPercent: new Decimal((projectHours / totalHours) * 100),
        avgBillableHoursPercent: new Decimal(50), // Placeholder
        punctualityScore: new Decimal(90), // Placeholder
        completenessScore: new Decimal(95), // Placeholder
        lastCalculated: new Date(),
      },
    })

    return stats
  }
}

export function createTimesheetService(prisma: PrismaClient): TimesheetService {
  return new TimesheetService(prisma)
}
