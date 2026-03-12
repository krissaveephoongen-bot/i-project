/**
 * Schedule & Penalty Management Service
 *
 * Comprehensive schedule tracking, progress comparison,
 * penalty calculation, and contract compliance management
 */

import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

interface ProgressSnapshot {
  dataDate: Date
  actualProgress: number // %
  expectedProgress: number // %
  daysElapsed: number
}

interface PenaltyCalculation {
  daysLate: number
  baseAmount: number
  adjustments: Array<{ type: string; amount: number; reason: string }>
  netPenalty: number
  penaltyType: string
}

interface ScheduleHealth {
  overallHealth: 'on_track' | 'at_risk' | 'critical' | 'off_track'
  daysAhead: number
  daysBehind: number
  scheduledProgress: number // What % should be done by today
  actualProgress: number // What % is actually done
  scheduleVariance: number
  forecastEndDate: Date
  probabilityOfMeeting: number // 0-100
}

export class SchedulePenaltyService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Calculate what % should be complete by a given date
   * Linear assumption: progress should be equal across timeline
   *
   * Formula: (Days Elapsed / Total Days) * 100
   */
  calculateExpectedProgress(
    startDate: Date,
    endDate: Date,
    asOfDate: Date = new Date()
  ): number {
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysElapsed = Math.ceil(
      (asOfDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysElapsed <= 0) return 0
    if (daysElapsed >= totalDays) return 100

    return Math.min((daysElapsed / totalDays) * 100, 100)
  }

  /**
   * Calculate Schedule Performance Index (SPI)
   * Similar to EVM but for schedule
   *
   * Formula: (% Actual Complete / % Planned Complete)
   * > 1.0 = Ahead of schedule
   * = 1.0 = On schedule
   * < 1.0 = Behind schedule
   */
  calculateSchedulePerformanceIndex(
    actualProgress: number,
    expectedProgress: number
  ): number {
    if (expectedProgress === 0) return 1.0
    return actualProgress / expectedProgress
  }

  /**
   * Calculate Days Late for penalty purposes
   * Returns 0 if project is on time
   */
  calculateDaysLate(
    contractEndDate: Date,
    actualOrForecastDate: Date
  ): number {
    const daysLate = Math.ceil(
      (actualOrForecastDate.getTime() - contractEndDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
    return Math.max(0, daysLate)
  }

  /**
   * Calculate penalty amount based on structure
   *
   * Supports multiple penalty types:
   * 1. DAILY_RATE: Fixed $ amount per day late
   * 2. PERCENTAGE_CONTRACT: % of contract value per day
   * 3. CUMULATIVE: Escalating percentage based on days late
   * 4. MILESTONE_BASED: Fixed amount per missed milestone
   * 5. TIERED: Different rates for different delay periods
   */
  async calculatePenalty(
    structureId: string,
    daysLate: number,
    actualDate: Date,
    contractEndDate: Date
  ): Promise<PenaltyCalculation> {
    const structure = await this.prisma.contract_penalty_structure.findUnique({
      where: { id: structureId },
    })

    if (!structure) {
      throw new Error(`Penalty structure ${structureId} not found`)
    }

    // Apply grace period
    let daysLatAfterGrace = Math.max(0, daysLate - structure.gracePeriodDays)

    if (daysLatAfterGrace === 0) {
      return {
        daysLate: 0,
        baseAmount: 0,
        adjustments: [
          {
            type: 'grace_period',
            amount: 0,
            reason: `Within ${structure.gracePeriodDays} day grace period`,
          },
        ],
        netPenalty: 0,
        penaltyType: structure.penaltyType,
      }
    }

    let baseAmount = 0

    switch (structure.penaltyType) {
      case 'daily_rate':
        baseAmount = Number(structure.dailyPenaltyAmount || 0) * daysLatAfterGrace
        break

      case 'percentage_contract':
        const dailyPercent = Number(structure.dailyPenaltyPercent || 0)
        baseAmount =
          Number(structure.totalContractValue) *
          (dailyPercent / 100) *
          daysLatAfterGrace
        break

      case 'cumulative':
        baseAmount = this.calculateCumulativePenalty(
          daysLatAfterGrace,
          structure.totalContractValue,
          structure.tieredPenalties as any
        )
        break

      case 'milestone_based':
        // Handled separately, would need milestone data
        baseAmount = 0
        break

      case 'tiered':
        baseAmount = this.calculateTieredPenalty(
          daysLatAfterGrace,
          structure.totalContractValue,
          structure.tieredPenalties as any
        )
        break

      default:
        baseAmount = 0
    }

    // Apply cap
    let netPenalty = baseAmount
    const adjustments: Array<{ type: string; amount: number; reason: string }> =
      []

    if (structure.maxPenaltyPercent) {
      const maxByPercent =
        Number(structure.totalContractValue) *
        (Number(structure.maxPenaltyPercent) / 100)
      if (netPenalty > maxByPercent) {
        adjustments.push({
          type: 'cap_by_percent',
          amount: maxByPercent - netPenalty,
          reason: `Capped at ${structure.maxPenaltyPercent}% of contract`,
        })
        netPenalty = maxByPercent
      }
    }

    if (structure.maxPenaltyAmount) {
      if (netPenalty > Number(structure.maxPenaltyAmount)) {
        adjustments.push({
          type: 'absolute_cap',
          amount: Number(structure.maxPenaltyAmount) - netPenalty,
          reason: `Capped at absolute maximum`,
        })
        netPenalty = Number(structure.maxPenaltyAmount)
      }
    }

    return {
      daysLate: daysLatAfterGrace,
      baseAmount,
      adjustments,
      netPenalty,
      penaltyType: structure.penaltyType,
    }
  }

  /**
   * Calculate cumulative escalating penalty
   * Example: 0.1% for days 1-10, 0.2% for days 11-20, etc.
   */
  private calculateCumulativePenalty(
    daysLate: number,
    contractValue: number,
    tieredStructure: Array<{ daysRange: string; percent: number }>
  ): number {
    let totalPenalty = 0

    // Parse tier structure and apply progressive rates
    let cumulativeDays = 0
    for (const tier of tieredStructure) {
      const [startDay, endDay] = tier.daysRange.split('-').map(Number)

      if (daysLate <= cumulativeDays) break

      const applicableDays = Math.min(endDay, daysLate) - Math.max(startDay, cumulativeDays)

      if (applicableDays > 0) {
        totalPenalty +=
          contractValue * (tier.percent / 100) * applicableDays
      }

      cumulativeDays = endDay
    }

    return totalPenalty
  }

  /**
   * Calculate tiered penalty (different rates for different ranges)
   */
  private calculateTieredPenalty(
    daysLate: number,
    contractValue: number,
    tieredStructure: Array<{ daysRange: string; percent: number }>
  ): number {
    // Find the applicable tier for the total days late
    for (const tier of tieredStructure) {
      const [startDay, endDay] = tier.daysRange.split('-').map(Number)
      if (daysLate >= startDay && daysLate <= endDay) {
        return contractValue * (tier.percent / 100)
      }
    }

    // If beyond all tiers, apply highest
    const lastTier = tieredStructure[tieredStructure.length - 1]
    const lastPercent = lastTier.percent
    return contractValue * (lastPercent / 100)
  }

  /**
   * Assess overall schedule health
   */
  async assessScheduleHealth(
    projectId: string,
    asOfDate: Date = new Date()
  ): Promise<ScheduleHealth> {
    const schedule = await this.prisma.project_schedule.findUnique({
      where: { projectId },
    })

    if (!schedule) {
      throw new Error(`Schedule not found for project ${projectId}`)
    }

    const expectedProgress = this.calculateExpectedProgress(
      schedule.contractStartDate,
      schedule.contractEndDate,
      asOfDate
    )

    const actualProgress = Number(schedule.currentProgress)
    const variance = actualProgress - expectedProgress

    // Calculate days
    const totalDays = Math.ceil(
      (schedule.contractEndDate.getTime() - schedule.contractStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const daysElapsed = Math.ceil(
      (asOfDate.getTime() - schedule.contractStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const daysAhead = daysElapsed - (actualProgress / 100) * totalDays
    const daysBehind = Math.max(0, -daysAhead)

    // Forecast end date based on current rate
    let forecastEndDate = schedule.contractEndDate
    if (actualProgress < 100) {
      const remainingPercent = 100 - actualProgress
      const daysPerPercent = daysElapsed / Math.max(actualProgress, 0.01)
      const estimatedAdditionalDays = remainingPercent * daysPerPercent
      forecastEndDate = new Date(
        asOfDate.getTime() + estimatedAdditionalDays * 24 * 60 * 60 * 1000
      )
    }

    // Determine health status
    let overallHealth: 'on_track' | 'at_risk' | 'critical' | 'off_track' = 'on_track'

    if (actualProgress >= 100) {
      overallHealth = 'off_track' // Already done, was late if after contract date
    } else if (
      forecastEndDate > schedule.contractEndDate &&
      variance < -5
    ) {
      overallHealth = 'critical'
    } else if (variance < 0) {
      overallHealth = 'at_risk'
    }

    // Probability of meeting deadline
    let probabilityOfMeeting = 100
    if (forecastEndDate > schedule.contractEndDate) {
      const daysLateInForecast = Math.ceil(
        (forecastEndDate.getTime() - schedule.contractEndDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
      // Reduce probability based on forecast delay
      // If forecasted 5 days late, probability = 100 - (5 * 5) = 75%
      probabilityOfMeeting = Math.max(
        0,
        100 - Math.min(100, daysLateInForecast * 5)
      )
    }

    return {
      overallHealth,
      daysAhead: Math.max(0, daysAhead),
      daysBehind,
      scheduledProgress: expectedProgress,
      actualProgress,
      scheduleVariance: variance,
      forecastEndDate,
      probabilityOfMeeting,
    }
  }

  /**
   * Record progress snapshot for history tracking
   */
  async recordProgressSnapshot(
    scheduleId: string,
    actualProgress: number,
    asOfDate: Date = new Date()
  ): Promise<ProgressSnapshot> {
    const schedule = await this.prisma.project_schedule.findUnique({
      where: { id: scheduleId },
    })

    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`)
    }

    const expectedProgress = this.calculateExpectedProgress(
      schedule.contractStartDate,
      schedule.contractEndDate,
      asOfDate
    )

    const daysElapsed = Math.ceil(
      (asOfDate.getTime() - schedule.contractStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const snapshot = await this.prisma.schedule_progress_history.create({
      data: {
        scheduleId,
        dataDate: asOfDate,
        dayNumber: daysElapsed,
        actualProgress: new Decimal(actualProgress),
        expectedProgress: new Decimal(expectedProgress),
        scheduleVariance: new Decimal(actualProgress - expectedProgress),
        variancePercentage: new Decimal(
          ((actualProgress - expectedProgress) / expectedProgress) * 100
        ),
        accumulativeVariance: new Decimal(actualProgress - expectedProgress),
        health: await this.determineHealth(
          actualProgress,
          expectedProgress
        ),
        forecastEndDate: new Date(), // TODO: Calculate proper forecast
      },
    })

    return {
      dataDate: snapshot.dataDate,
      actualProgress,
      expectedProgress,
      daysElapsed,
    }
  }

  /**
   * Calculate schedule variance and determine if at risk
   */
  calculateScheduleVariance(
    actualProgress: number,
    expectedProgress: number
  ): number {
    return actualProgress - expectedProgress
  }

  /**
   * Determine schedule health status
   */
  private async determineHealth(
    actualProgress: number,
    expectedProgress: number
  ): Promise<string> {
    const variance = actualProgress - expectedProgress

    if (variance >= 0) return 'on_track'
    if (variance >= -5) return 'at_risk'
    return 'critical'
  }

  /**
   * Create penalty record when deadline is missed
   */
  async createPenaltyRecord(
    scheduleId: string,
    structureId: string,
    daysLate: number,
    startDate: Date,
    notes?: string
  ): Promise<string> {
    const penalty = await this.prisma.contract_penalty.create({
      data: {
        scheduleId,
        structureId,
        penaltyNumber: `PEN-${Date.now()}`,
        startDate,
        daysLate,
        penaltyType: 'daily_rate', // Default, will be updated
        penaltyBasis: new Decimal(0),
        penaltyAmount: new Decimal(0),
        baseAmount: new Decimal(0),
        netPenalty: new Decimal(0),
        calculationMethod: 'automated',
        notes,
      },
    })

    return penalty.id
  }

  /**
   * Waive penalty (full or partial)
   */
  async waivePenalty(
    penaltyId: string,
    waiverAmount: number,
    waiverReason: string,
    waiverBy: string
  ): Promise<void> {
    await this.prisma.contract_penalty.update({
      where: { id: penaltyId },
      data: {
        waivedAmount: new Decimal(waiverAmount),
        waivedReason: waiverReason,
        waivedBy: waiverBy,
        waivedDate: new Date(),
        status: waiverAmount >= 100 ? 'waived' : 'approved',
      },
    })
  }

  /**
   * Calculate recovery days needed
   */
  calculateRecoveryNeeded(
    currentProgress: number,
    expectedProgress: number,
    remainingDays: number
  ): {
    recoveryDaysNeeded: number
    requiredDailyProgress: number
    feasible: boolean
  } {
    const varianceDays = remainingDays * (expectedProgress / 100)
    const recoveryDaysNeeded = varianceDays - remainingDays * (currentProgress / 100)

    return {
      recoveryDaysNeeded: Math.max(0, recoveryDaysNeeded),
      requiredDailyProgress: remainingDays > 0
        ? (100 - currentProgress) / remainingDays
        : 0,
      feasible: recoveryDaysNeeded <= remainingDays,
    }
  }

  /**
   * Forecast end date based on current velocity
   */
  forecastEndDate(
    startDate: Date,
    currentProgress: number,
    daysElapsed: number
  ): Date {
    if (currentProgress === 0 || daysElapsed === 0) {
      return new Date()
    }

    const remainingProgress = 100 - currentProgress
    const daysPerPercent = daysElapsed / currentProgress
    const remainingDays = remainingProgress * daysPerPercent

    return new Date(
      startDate.getTime() + (daysElapsed + remainingDays) * 24 * 60 * 60 * 1000
    )
  }

  /**
   * Get schedule compliance summary
   */
  async getComplianceSummary(projectId: string): Promise<any> {
    const compliance = await this.prisma.schedule_compliance.findUnique({
      where: { projectId },
    })

    if (!compliance) {
      return {
        message: `No compliance data for project ${projectId}`,
      }
    }

    return {
      projectId,
      health: compliance.overallHealth,
      daysAhead: compliance.daysAhead,
      daysBehind: compliance.daysBehind,
      scheduledProgress: compliance.expectedProgress,
      actualProgress: compliance.currentProgress,
      progressVariance: compliance.progressVariance,
      forecastEndDate: compliance.forecastEndDate,
      probabilityOfMeeting: compliance.probability,
      totalPenalties: compliance.totalPenalties,
      pendingPenalties: compliance.pendingPenalties,
      appliedPenalties: compliance.appliedPenalties,
      waivedPenalties: compliance.waivedPenalties,
      milestones: {
        total: compliance.totalMilestones,
        completed: compliance.completedMilestones,
        missed: compliance.missedMilestones,
        completionRate: compliance.milestoneCompletionRate,
      },
    }
  }
}

export function createSchedulePenaltyService(
  prisma: PrismaClient
): SchedulePenaltyService {
  return new SchedulePenaltyService(prisma)
}
