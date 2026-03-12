import { db, schema } from '../../shared/database/connection'
import { eq, and, gte, lte } from 'drizzle-orm'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// TYPES
// ============================================================================

export interface ScheduleHealthMetrics {
  projectId: string
  currentDay: number
  totalDays: number
  actualProgress: number
  expectedProgress: number
  scheduleVariance: number
  daysAhead: number
  daysBehind: number
  scheduledPercentComplete: number
  probability: number
  forecastedDaysLate: number
}

export interface PenaltyCalculation {
  daysLate: number
  penaltyType: string
  baseAmount: Decimal
  adjustments: Array<{ type: string; amount: Decimal }>
  netPenalty: Decimal
  maxApplicable: Decimal
}

// ============================================================================
// SCHEDULE & PENALTY SERVICE
// ============================================================================

export class SchedulePenaltyService {
  /**
   * Calculate schedule health metrics for a project
   */
  async calculateScheduleHealth(
    projectId: string,
    asOfDate: Date = new Date()
  ): Promise<ScheduleHealthMetrics> {
    // Get project schedule
    const schedule = await db.query.project_schedule.findFirst({
      where: eq(schema.project_schedule.projectId, projectId),
    })

    if (!schedule) {
      throw new Error(`No schedule found for project ${projectId}`)
    }

    // Get project current progress
    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    })

    if (!project) {
      throw new Error(`Project ${projectId} not found`)
    }

    // Calculate days
    const totalDays = schedule.totalContractDays
    const currentDay = Math.ceil(
      (asOfDate.getTime() - schedule.contractStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    // Expected progress by contract timeline (linear)
    const expectedProgress = (currentDay / totalDays) * 100
    const actualProgress = project.progress

    // Schedule variance
    const scheduleVariance = actualProgress - expectedProgress

    // Days ahead/behind
    const daysAhead = Math.max(0, scheduleVariance * (totalDays / 100))
    const daysBehind = Math.max(0, -scheduleVariance * (totalDays / 100))

    // Forecast completion at current rate
    const daysRemainingAtCurrentRate =
      actualProgress > 0 ? (totalDays * (100 - actualProgress)) / actualProgress : totalDays
    const forecastEndDate = new Date(asOfDate.getTime() + daysRemainingAtCurrentRate * 24 * 60 * 60 * 1000)
    const forecastedDaysLate = Math.max(
      0,
      Math.ceil(
        (forecastEndDate.getTime() - schedule.contractEndDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    )

    // Probability of meeting deadline
    const probability = Math.max(
      0,
      100 - forecastedDaysLate * 5 // 5% reduction per day late
    )

    return {
      projectId,
      currentDay: Math.min(currentDay, totalDays),
      totalDays,
      actualProgress,
      expectedProgress,
      scheduleVariance,
      daysAhead,
      daysBehind,
      scheduledPercentComplete: Math.min(100, (currentDay / totalDays) * 100),
      probability,
      forecastedDaysLate,
    }
  }

  /**
   * Record daily schedule progress snapshot
   */
  async recordDailyProgress(
    scheduleId: string,
    dataDate: Date,
    actualProgress: number
  ): Promise<void> {
    const schedule = await db.query.project_schedule.findFirst({
      where: eq(schema.project_schedule.id, scheduleId),
    })

    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`)
    }

    // Calculate metrics
    const dayNumber = Math.ceil(
      (dataDate.getTime() - schedule.contractStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const expectedProgress = (dayNumber / schedule.totalContractDays) * 100
    const variance = actualProgress - expectedProgress

    // Get previous accumulative variance
    const previousRecord = await db.query.schedule_progress_history.findFirst({
      where: eq(schema.schedule_progress_history.scheduleId, scheduleId),
    })

    const accumulativeVariance = (previousRecord?.accumulativeVariance.toNumber() || 0) + variance

    // Determine health status
    let health: 'on_track' | 'at_risk' | 'critical' | 'off_track'
    if (variance >= 0) {
      health = 'on_track'
    } else if (variance >= -5) {
      health = 'at_risk'
    } else if (variance >= -10) {
      health = 'critical'
    } else {
      health = 'off_track'
    }

    // Forecast end date
    let forecastEndDate: Date | null = null
    if (actualProgress > 0) {
      const daysToCompletion =
        (schedule.totalContractDays * (100 - actualProgress)) / actualProgress
      forecastEndDate = new Date(
        dataDate.getTime() + daysToCompletion * 24 * 60 * 60 * 1000
      )
    }

    const forecatedDaysLate = forecastEndDate
      ? Math.ceil(
          (forecastEndDate.getTime() - schedule.contractEndDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null

    // Determine velocity trend
    let velocityTrend: 'improving' | 'stable' | 'declining' | null = null
    if (previousRecord) {
      const currentRate = variance
      const previousRate = previousRecord.scheduleVariance.toNumber()
      if (currentRate > previousRate) {
        velocityTrend = 'improving'
      } else if (Math.abs(currentRate - previousRate) <= 1) {
        velocityTrend = 'stable'
      } else {
        velocityTrend = 'declining'
      }
    }

    // Insert record
    await db.insert(schema.schedule_progress_history).values({
      scheduleId,
      dataDate,
      dayNumber,
      actualProgress: new Decimal(actualProgress),
      expectedProgress: new Decimal(expectedProgress),
      scheduleVariance: new Decimal(variance),
      variancePercentage: new Decimal((variance / expectedProgress) * 100),
      accumulativeVariance: new Decimal(accumulativeVariance),
      velocityTrend,
      health,
      forecastEndDate,
      forecatedDaysLate,
    })
  }

  /**
   * Calculate penalty based on structure and days late
   */
  async calculatePenalty(
    scheduleId: string,
    penaltyStructureId: string,
    daysLate: number,
    startDate: Date
  ): Promise<PenaltyCalculation> {
    const structure = await db.query.contract_penalty_structure.findFirst({
      where: eq(schema.contract_penalty_structure.id, penaltyStructureId),
    })

    if (!structure) {
      throw new Error(`Penalty structure ${penaltyStructureId} not found`)
    }

    let baseAmount = new Decimal(0)
    const adjustments: Array<{ type: string; amount: Decimal }> = []

    // Apply grace period
    const applicableDaysLate = Math.max(
      0,
      daysLate - structure.gracePeriodDays
    )

    // Calculate base penalty based on type
    const contractValue = structure.totalContractValue

    switch (structure.penaltyType) {
      case 'daily_rate':
        if (structure.dailyPenaltyAmount) {
          baseAmount = new Decimal(structure.dailyPenaltyAmount).times(
            applicableDaysLate
          )
        }
        break

      case 'percentage_contract':
        if (structure.dailyPenaltyPercent) {
          baseAmount = contractValue
            .times(new Decimal(structure.dailyPenaltyPercent))
            .div(100)
            .times(applicableDaysLate)
        }
        break

      case 'cumulative':
        if (structure.tieredPenalties) {
          const tiers = structure.tieredPenalties as Array<{
            daysRange: string
            percent: number
          }>

          let remainingDays = applicableDaysLate
          for (const tier of tiers) {
            const [minDays, maxDays] = tier.daysRange
              .split('-')
              .map(d => parseInt(d))
            const daysInTier = Math.min(remainingDays, maxDays - minDays + 1)

            if (daysInTier > 0) {
              const tierPenalty = contractValue
                .times(new Decimal(tier.percent))
                .div(100)
                .times(daysInTier)
              baseAmount = baseAmount.plus(tierPenalty)
              remainingDays -= daysInTier
            }
          }
        }
        break

      case 'milestone_based':
        // Milestone penalties tracked separately
        baseAmount = new Decimal(0)
        break

      case 'tiered':
        // Different rates for different delay brackets
        if (applicableDaysLate <= 7) {
          baseAmount = contractValue.times(0.005).times(applicableDaysLate) // 0.5% per day
        } else if (applicableDaysLate <= 14) {
          baseAmount = contractValue
            .times(0.005)
            .times(7)
            .plus(contractValue.times(0.01).times(applicableDaysLate - 7)) // 1% per day
        } else {
          baseAmount = contractValue
            .times(0.005)
            .times(7)
            .plus(contractValue.times(0.01).times(7))
            .plus(contractValue.times(0.015).times(applicableDaysLate - 14)) // 1.5% per day
        }
        break
    }

    // Apply caps
    let netPenalty = baseAmount
    const maxApplicable = structure.maxPenaltyAmount
      ? new Decimal(structure.maxPenaltyAmount)
      : contractValue.times(structure.maxPenaltyPercent).div(100)

    if (netPenalty.greaterThan(maxApplicable)) {
      adjustments.push({
        type: 'penalty_cap',
        amount: netPenalty.minus(maxApplicable),
      })
      netPenalty = maxApplicable
    }

    return {
      daysLate,
      penaltyType: structure.penaltyType,
      baseAmount,
      adjustments,
      netPenalty,
      maxApplicable,
    }
  }

  /**
   * Apply penalty to project
   */
  async applyPenalty(
    scheduleId: string,
    penaltyStructureId: string,
    daysLate: number,
    startDate: Date,
    approvedBy: string,
    notes: string = ''
  ): Promise<string> {
    const calculation = await this.calculatePenalty(
      scheduleId,
      penaltyStructureId,
      daysLate,
      startDate
    )

    const penaltyNumber = `PEN-${Date.now()}`
    const endDate = new Date(
      startDate.getTime() + daysLate * 24 * 60 * 60 * 1000
    )

    await db.insert(schema.contract_penalty).values({
      scheduleId,
      structureId: penaltyStructureId,
      penaltyNumber,
      startDate,
      endDate,
      daysLate,
      penaltyType: calculation.penaltyType as any,
      penaltyBasis: calculation.baseAmount,
      calculationMethod: `Calculated using ${calculation.penaltyType} method`,
      penaltyAmount: calculation.netPenalty,
      baseAmount: calculation.baseAmount,
      adjustments: calculation.adjustments,
      netPenalty: calculation.netPenalty,
      status: 'calculated',
      approvedBy,
      approvedDate: new Date(),
      notes,
    })

    return penaltyNumber
  }

  /**
   * Waive or adjust penalty
   */
  async waivePenalty(
    penaltyId: string,
    waivedAmount: Decimal,
    reason: string,
    waivedBy: string
  ): Promise<void> {
    const penalty = await db.query.contract_penalty.findFirst({
      where: eq(schema.contract_penalty.id, penaltyId),
    })

    if (!penalty) {
      throw new Error(`Penalty ${penaltyId} not found`)
    }

    const newNetPenalty = penalty.netPenalty.minus(waivedAmount)

    await db
      .update(schema.contract_penalty)
      .set({
        waivedAmount: penalty.waivedAmount.plus(waivedAmount),
        waivedReason: reason,
        waivedBy,
        waivedDate: new Date(),
        netPenalty: newNetPenalty,
        status: waivedAmount.equals(penalty.netPenalty) ? 'waived' : 'calculated',
      })
      .where(eq(schema.contract_penalty.id, penaltyId))
  }

  /**
   * Request schedule extension
   */
  async requestExtension(
    scheduleId: string,
    requestedDays: number,
    reason: string,
    requestedBy: string,
    notes: string = ''
  ): Promise<string> {
    const schedule = await db.query.project_schedule.findFirst({
      where: eq(schema.project_schedule.id, scheduleId),
    })

    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`)
    }

    // Get the number of previous extensions
    const extensionCount = await db
      .select({ count: schema.schedule_extension.id })
      .from(schema.schedule_extension)
      .where(
        and(
          eq(schema.schedule_extension.scheduleId, scheduleId),
          // Get completed extensions
        )
      )

    const newEndDate = new Date(
      schedule.contractEndDate.getTime() + requestedDays * 24 * 60 * 60 * 1000
    )

    await db.insert(schema.schedule_extension).values({
      scheduleId,
      extensionNumber: (extensionCount[0]?.count as number) + 1,
      requestedDays,
      originalEndDate: schedule.contractEndDate,
      newEndDate,
      requestDate: new Date(),
      reason,
      status: 'requested',
      requestedBy,
      notes,
    })

    return `EXT-${scheduleId}-${(extensionCount[0]?.count as number) + 1}`
  }

  /**
   * Approve schedule extension
   */
  async approveExtension(
    extensionId: string,
    approvedDays: number,
    approvedBy: string
  ): Promise<void> {
    const extension = await db.query.schedule_extension.findFirst({
      where: eq(schema.schedule_extension.id, extensionId),
    })

    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`)
    }

    const newEndDate = new Date(
      extension.originalEndDate.getTime() + approvedDays * 24 * 60 * 60 * 1000
    )

    // Update extension
    await db
      .update(schema.schedule_extension)
      .set({
        approvedDays,
        newEndDate,
        status: 'approved',
        approvedBy,
        approvalDate: new Date(),
      })
      .where(eq(schema.schedule_extension.id, extensionId))

    // Update project schedule
    await db
      .update(schema.project_schedule)
      .set({
        contractEndDate: newEndDate,
      })
      .where(eq(schema.project_schedule.id, extension.scheduleId))
  }

  /**
   * Generate recovery plan when project falls behind
   */
  async generateRecoveryPlan(
    projectId: string,
    triggerDate: Date = new Date()
  ): Promise<string> {
    const metrics = await this.calculateScheduleHealth(projectId, triggerDate)

    if (metrics.daysBehind <= 0) {
      throw new Error('Project is not behind schedule')
    }

    const schedule = await db.query.project_schedule.findFirst({
      where: eq(schema.project_schedule.projectId, projectId),
    })

    if (!schedule) {
      throw new Error(`No schedule for project ${projectId}`)
    }

    const daysAvailable = Math.max(
      0,
      Math.ceil(
        (schedule.contractEndDate.getTime() - triggerDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    )

    // Generate recovery actions based on gap
    const actions = this.generateRecoveryActions(
      metrics.daysBehind,
      daysAvailable
    )

    const planNumber = `SRP-${Date.now()}`

    await db.insert(schema.schedule_recovery_plan).values({
      projectId,
      planNumber,
      triggerDate,
      daysBehind: Math.ceil(metrics.daysBehind),
      requiredDaysToRecover: Math.ceil(metrics.daysBehind),
      daysAvailable,
      actions,
      recoveryDays: Math.ceil(metrics.daysBehind),
      additionalCost: new Decimal(0),
      riskLevel: metrics.daysBehind > 10 ? 'high' : 'medium',
      successProbability: new Decimal(
        Math.max(10, 100 - metrics.daysBehind * 3)
      ),
      status: 'draft',
    })

    return planNumber
  }

  /**
   * Generate recovery actions based on gap size
   */
  private generateRecoveryActions(daysBehind: number, daysAvailable: number): object[] {
    const actions: Array<{
      action: string
      resource_impact: string
      cost: number
      timeline: string
      owner: string
    }> = []

    if (daysBehind <= 3) {
      actions.push({
        action: 'Daily stand-ups to monitor progress',
        resource_impact: 'PM: 1 hour/day',
        cost: 0,
        timeline: 'Immediate',
        owner: 'PM',
      })
    }

    if (daysBehind > 3 && daysBehind <= 7) {
      actions.push({
        action: 'Add overtime for critical path',
        resource_impact: 'Overtime: +10 hours/week',
        cost: 3000,
        timeline: 'Days 1-7',
        owner: 'Dev Lead',
      })
      actions.push({
        action: 'Fast-track non-critical tasks',
        resource_impact: 'PM oversight',
        cost: 0,
        timeline: 'Days 1-7',
        owner: 'PM',
      })
    }

    if (daysBehind > 7) {
      actions.push({
        action: 'Add temporary resources',
        resource_impact: '+2 FTE contractors',
        cost: 8000,
        timeline: 'Days 1-14',
        owner: 'PM',
      })
      actions.push({
        action: 'Parallel workstreams',
        resource_impact: 'Reorganize tasks for parallelization',
        cost: 2000,
        timeline: 'Days 1-5',
        owner: 'PM',
      })
      actions.push({
        action: 'Reduce scope if necessary',
        resource_impact: 'Scope reduction review',
        cost: 0,
        timeline: 'Days 1-3',
        owner: 'Sponsor',
      })
    }

    return actions
  }
}

export default new SchedulePenaltyService()
