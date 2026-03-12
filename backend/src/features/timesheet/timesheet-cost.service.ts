import { db, schema } from '../../shared/database/connection'
import { eq, and } from 'drizzle-orm'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// TYPES
// ============================================================================

export interface TimesheetCostCalculation {
  entryId: string
  userId: string
  date: Date
  hours: Decimal
  hourlyRate: Decimal
  baseCost: Decimal
  overtimeMultiplier: Decimal
  finalCost: Decimal
  projectId: string
  taskId?: string
  wbsTaskId?: string
}

// ============================================================================
// TIMESHEET COST SERVICE - Integrates timesheet → ACWP
// ============================================================================

export class TimesheetCostService {
  /**
   * Calculate cost from a time entry
   */
  async calculateEntryCost(
    entryId: string
  ): Promise<TimesheetCostCalculation> {
    // Get time entry
    const entry = await db.query.time_entries.findFirst({
      where: eq(schema.time_entries.id, entryId),
    })

    if (!entry) {
      throw new Error(`Time entry ${entryId} not found`)
    }

    // Get user hourly rate
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, entry.userId),
    })

    if (!user) {
      throw new Error(`User ${entry.userId} not found`)
    }

    const hourlyRate = new Decimal(user.hourlyRate || 0)

    if (hourlyRate.equals(0)) {
      throw new Error(`User ${user.name} has no hourly rate configured`)
    }

    const hours = new Decimal(entry.hours)

    // Calculate base cost
    const baseCost = hours.times(hourlyRate)

    // Determine overtime multiplier
    const dayOfWeek = entry.date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let overtimeMultiplier = new Decimal(1.0)

    // Check if overtime
    if (hours.greaterThan(8)) {
      // Hours over 8 get 1.5x multiplier
      const overtimeHours = hours.minus(8)
      const regularHours = new Decimal(8)
      const overtimeCost = overtimeHours.times(hourlyRate).times(1.5)
      const regularCost = regularHours.times(hourlyRate)
      const finalCost = regularCost.plus(overtimeCost)
      const effectiveMultiplier = finalCost.div(hours).div(hourlyRate)
      overtimeMultiplier = effectiveMultiplier
    }

    // Weekend multiplier
    if (isWeekend) {
      overtimeMultiplier = overtimeMultiplier.times(1.25) // Additional 25%
    }

    // Calculate final cost
    const finalCost = baseCost.times(overtimeMultiplier)

    return {
      entryId,
      userId: entry.userId,
      date: entry.date,
      hours,
      hourlyRate,
      baseCost,
      overtimeMultiplier,
      finalCost,
      projectId: entry.projectId || '',
      taskId: entry.taskId,
      wbsTaskId: entry.wbsTaskId,
    }
  }

  /**
   * Record timesheet cost (creates cost record and links to ACWP)
   */
  async recordTimesheetCost(entryId: string): Promise<string> {
    // Check if cost already exists
    const existing = await db.query.timesheet_cost.findFirst({
      where: eq(schema.timesheet_cost.entryId, entryId),
    })

    if (existing) {
      throw new Error(
        `Cost already recorded for time entry ${entryId}`
      )
    }

    // Calculate cost
    const calculation = await this.calculateEntryCost(entryId)

    // Get time entry for project/task
    const entry = await db.query.time_entries.findFirst({
      where: eq(schema.time_entries.id, entryId),
    })

    if (!entry) {
      throw new Error(`Time entry ${entryId} not found`)
    }

    // Create cost record
    const costId = `TSC-${Date.now()}`

    await db.insert(schema.timesheet_cost).values({
      entryId,
      hourlyRate: calculation.hourlyRate,
      hours: calculation.hours,
      baseCost: calculation.baseCost,
      overtimeMultiplier: calculation.overtimeMultiplier,
      finalCost: calculation.finalCost,
      projectId: entry.projectId,
      taskId: entry.taskId,
      wbsTaskId: entry.wbsTaskId,
      isIncludedInACWP: false, // Will be updated when approved
    })

    return costId
  }

  /**
   * Approve timesheet and include in ACWP
   */
  async approveTimesheetEntry(entryId: string): Promise<void> {
    // Get time entry
    const entry = await db.query.time_entries.findFirst({
      where: eq(schema.time_entries.id, entryId),
    })

    if (!entry) {
      throw new Error(`Time entry ${entryId} not found`)
    }

    if (entry.status !== 'approved') {
      throw new Error(
        `Time entry must be approved before including in ACWP`
      )
    }

    // Get cost record
    const cost = await db.query.timesheet_cost.findFirst({
      where: eq(schema.timesheet_cost.entryId, entryId),
    })

    if (!cost) {
      // Create cost if not exists
      await this.recordTimesheetCost(entryId)
    }

    // Mark as included in ACWP
    await db
      .update(schema.timesheet_cost)
      .set({
        isIncludedInACWP: true,
        acwpIncludedDate: new Date(),
      })
      .where(eq(schema.timesheet_cost.entryId, entryId))
  }

  /**
   * Process weekly timesheet submission
   * Calculate total hours and costs
   */
  async processWeeklyTimesheet(
    userId: string,
    weekStartDate: Date,
    weekEndDate: Date
  ): Promise<{
    weeklyTotal: Decimal
    projectTotal: Decimal
    nonProjectTotal: Decimal
    overtimeHours: Decimal
    totalCost: Decimal
  }> {
    // Get all entries for the week
    const entries = await db.query.time_entries.findMany({
      where: and(
        eq(schema.time_entries.userId, userId),
        // Date between weekStartDate and weekEndDate
      ),
    })

    let totalHours = new Decimal(0)
    let projectHours = new Decimal(0)
    let nonProjectHours = new Decimal(0)
    let totalCost = new Decimal(0)
    let overtimeHours = new Decimal(0)

    // Process each entry
    for (const entry of entries) {
      if (entry.date >= weekStartDate && entry.date <= weekEndDate) {
        const hours = new Decimal(entry.hours)
        totalHours = totalHours.plus(hours)

        // Get cost if exists
        const cost = await db.query.timesheet_cost.findFirst({
          where: eq(schema.timesheet_cost.entryId, entry.id),
        })

        if (cost) {
          totalCost = totalCost.plus(cost.finalCost)

          // Track overtime
          if (cost.overtimeMultiplier.greaterThan(1.0)) {
            overtimeHours = overtimeHours.plus(hours)
          }
        }

        // Track by type
        if (entry.entryType === 'project_task') {
          projectHours = projectHours.plus(hours)
        } else {
          nonProjectHours = nonProjectHours.plus(hours)
        }
      }
    }

    return {
      weeklyTotal: totalHours,
      projectTotal: projectHours,
      nonProjectTotal: nonProjectHours,
      overtimeHours,
      totalCost,
    }
  }

  /**
   * Generate daily timesheet summary
   */
  async generateDailySummary(
    userId: string,
    date: Date
  ): Promise<{
    projectHours: Decimal
    nonProjectHours: Decimal
    leaveHours: Decimal
    billableHours: Decimal
    totalHours: Decimal
    isValid: boolean
    validationMessage?: string
  }> {
    // Get all entries for the day
    const entries = await db.query.time_entries.findMany({
      where: and(
        eq(schema.time_entries.userId, userId),
        // Date equals date
      ),
    })

    let projectHours = new Decimal(0)
    let nonProjectHours = new Decimal(0)
    let leaveHours = new Decimal(0)
    let billableHours = new Decimal(0)
    let totalHours = new Decimal(0)

    for (const entry of entries) {
      const hours = new Decimal(entry.hours)

      switch (entry.entryType) {
        case 'project_task':
          projectHours = projectHours.plus(hours)
          if (entry.billable) {
            billableHours = billableHours.plus(hours)
          }
          break
        case 'non_project':
          nonProjectHours = nonProjectHours.plus(hours)
          break
        case 'leave':
          leaveHours = leaveHours.plus(hours)
          break
      }

      totalHours = totalHours.plus(hours)
    }

    // Validate against daily limit (8 hours)
    const isValid = totalHours.lessThanOrEqualTo(8)
    const validationMessage = !isValid
      ? `Total hours (${totalHours}) exceeds daily limit of 8 hours`
      : undefined

    return {
      projectHours,
      nonProjectHours,
      leaveHours,
      billableHours,
      totalHours,
      isValid,
      validationMessage,
    }
  }

  /**
   * Calculate monthly timesheet cost summary for a user
   */
  async getMonthlyTimesheetCost(
    userId: string,
    year: number,
    month: number
  ): Promise<{
    userId: string
    period: string
    totalHours: Decimal
    totalCost: Decimal
    projectCost: Decimal
    overtimeCost: Decimal
    billableAmount: Decimal
  }> {
    // Get all costs for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const costs = await db.query.timesheet_cost.findMany({
      where: eq(schema.timesheet_cost, userId),
    })

    let totalHours = new Decimal(0)
    let totalCost = new Decimal(0)
    let projectCost = new Decimal(0)
    let overtimeCost = new Decimal(0)
    let billableAmount = new Decimal(0)

    for (const cost of costs) {
      // Check if in month range
      const entry = await db.query.time_entries.findFirst({
        where: eq(schema.time_entries.id, cost.entryId),
      })

      if (
        entry &&
        entry.date >= startDate &&
        entry.date <= endDate
      ) {
        totalHours = totalHours.plus(cost.hours)
        totalCost = totalCost.plus(cost.finalCost)

        if (cost.projectId) {
          projectCost = projectCost.plus(cost.finalCost)
        }

        // Overtime cost
        if (cost.overtimeMultiplier.greaterThan(1.0)) {
          const baseCost = cost.hours.times(cost.hourlyRate)
          const overtimeAdd = cost.finalCost.minus(baseCost)
          overtimeCost = overtimeCost.plus(overtimeAdd)
        }

        // Billable calculation
        if (entry.billable && entry.chargeAmount) {
          billableAmount = billableAmount.plus(
            new Decimal(entry.chargeAmount)
          )
        }
      }
    }

    return {
      userId,
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalHours,
      totalCost,
      projectCost,
      overtimeCost,
      billableAmount,
    }
  }

  /**
   * Export timesheet data for payroll
   */
  async exportForPayroll(
    userId: string,
    month: number,
    year: number
  ): Promise<object> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    })

    if (!user) {
      throw new Error(`User ${userId} not found`)
    }

    const monthlySummary = await this.getMonthlyTimesheetCost(
      userId,
      year,
      month
    )

    return {
      employee: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      period: monthlySummary.period,
      payroll: {
        regularHours: monthlySummary.totalHours.minus(
          monthlySummary.totalCost.greaterThan(monthlySummary.projectCost)
            ? monthlySummary.totalCost.minus(monthlySummary.projectCost)
            : new Decimal(0)
        ),
        overtimeHours: monthlySummary.totalHours.times(0.1), // Simplified
        hourlyRate: user.hourlyRate,
        regularPay: monthlySummary.projectCost,
        overtimePay: monthlySummary.overtimeCost,
        grossPay: monthlySummary.totalCost,
      },
      projectAllocations: monthlySummary,
    }
  }

  /**
   * Batch process approved timesheets and update ACWP
   */
  async batchProcessApprovedTimesheets(): Promise<{
    processed: number
    totalCost: Decimal
    updatedProjects: Set<string>
  }> {
    // Get all approved but not yet included entries
    const entries = await db.query.time_entries.findMany({
      where: eq(schema.time_entries.status, 'approved'),
    })

    let processed = 0
    let totalCost = new Decimal(0)
    const updatedProjects = new Set<string>()

    for (const entry of entries) {
      try {
        // Check if cost exists
        const costExists = await db.query.timesheet_cost.findFirst({
          where: eq(schema.timesheet_cost.entryId, entry.id),
        })

        if (!costExists) {
          await this.recordTimesheetCost(entry.id)
        }

        // Include in ACWP
        const cost = await db.query.timesheet_cost.findFirst({
          where: eq(schema.timesheet_cost.entryId, entry.id),
        })

        if (cost && !cost.isIncludedInACWP) {
          await this.approveTimesheetEntry(entry.id)
          processed++
          totalCost = totalCost.plus(cost.finalCost)

          if (cost.projectId) {
            updatedProjects.add(cost.projectId)
          }
        }
      } catch (error) {
        console.error(
          `Error processing time entry ${entry.id}:`,
          error
        )
      }
    }

    return {
      processed,
      totalCost,
      updatedProjects,
    }
  }
}

export default new TimesheetCostService()
