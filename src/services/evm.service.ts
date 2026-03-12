/**
 * EVM (Earned Value Management) Calculation Service
 *
 * Core business logic for:
 * - Earned Value calculations (BCWS, BCWP, ACWP)
 * - Performance indices (SPI, CPI)
 * - Variance analysis
 * - Forecasting (EAC, ETC, VAC)
 * - S-Curve data generation
 */

import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

interface EVMCalculationResult {
  bcws: number
  bcwp: number
  acwp: number
  spi: number
  cpi: number
  scheduleVariance: number
  costVariance: number
  eac: number
  etcCost: number
  vac: number
  trendStatus: 'on-track' | 'at-risk' | 'critical'
}

/**
 * EVM Service: Standardized calculation engine for project control
 */
export class EVMService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Calculate BCWS (Budget Cost of Work Scheduled)
   * = Sum of budgets for all tasks scheduled to complete by this date
   *
   * @param projectId - Project ID
   * @param asOfDate - Date to calculate BCWS as of
   */
  async calculateBCWS(projectId: string, asOfDate: Date): Promise<number> {
    const result = await this.prisma.wbs_task.aggregate({
      where: {
        workpackage: {
          phase: {
            wbs_root: {
              projectId,
            },
          },
        },
        plannedEndDate: {
          lte: asOfDate, // Task was scheduled to complete by this date
        },
      },
      _sum: {
        allocatedBudget: true,
      },
    })

    return result._sum.allocatedBudget ? Number(result._sum.allocatedBudget) : 0
  }

  /**
   * Calculate BCWP (Budget Cost of Work Performed)
   * = Sum of budgets × % complete (actual) for all tasks
   *
   * Represents the value of work actually completed at planned cost rates
   */
  async calculateBCWP(projectId: string): Promise<number> {
    const tasks = await this.prisma.wbs_task.findMany({
      where: {
        workpackage: {
          phase: {
            wbs_root: {
              projectId,
            },
          },
        },
      },
      select: {
        allocatedBudget: true,
        actualProgress: true,
      },
    })

    return tasks.reduce((total, task) => {
      const budget = Number(task.allocatedBudget)
      const progress = Number(task.actualProgress) / 100 // Convert % to decimal
      return total + budget * progress
    }, 0)
  }

  /**
   * Calculate ACWP (Actual Cost of Work Performed)
   * = Sum of actual labor costs + actual material costs + actual equipment costs
   *
   * True cost incurred regardless of budget
   */
  async calculateACWP(projectId: string): Promise<number> {
    // Sum all actual labor costs from resource assignments
    const laborResult = await this.prisma.task_resource_assignment.aggregate({
      where: {
        task: {
          workpackage: {
            phase: {
              wbs_root: {
                projectId,
              },
            },
          },
        },
      },
      _sum: {
        actualLaborCost: true,
      },
    })

    // Sum all actual costs from cost allocations
    const costResult = await this.prisma.task_cost_allocation.aggregate({
      where: {
        task: {
          workpackage: {
            phase: {
              wbs_root: {
                projectId,
              },
            },
          },
        },
      },
      _sum: {
        actualCost: true,
      },
    })

    // Sum actual expenses
    const expenseResult = await this.prisma.expenses.aggregate({
      where: {
        projectId,
        status: {
          in: ['approved', 'paid'], // Only count approved/paid
        },
      },
      _sum: {
        amount: true,
      },
    })

    const laborCost = laborResult._sum.actualLaborCost
      ? Number(laborResult._sum.actualLaborCost)
      : 0
    const costAllocation = costResult._sum.actualCost
      ? Number(costResult._sum.actualCost)
      : 0
    const expenses = expenseResult._sum.amount ? Number(expenseResult._sum.amount) : 0

    return laborCost + costAllocation + expenses
  }

  /**
   * Calculate Schedule Performance Index (SPI)
   * SPI = BCWP / BCWS
   *
   * > 1.0 = Ahead of schedule
   * = 1.0 = On schedule
   * < 1.0 = Behind schedule (RED)
   */
  calculateSPI(bcwp: number, bcws: number): number {
    if (bcws === 0) return 1.0
    return bcwp / bcws
  }

  /**
   * Calculate Cost Performance Index (CPI)
   * CPI = BCWP / ACWP
   *
   * > 1.0 = Under budget
   * = 1.0 = On budget
   * < 1.0 = Over budget (RED)
   */
  calculateCPI(bcwp: number, acwp: number): number {
    if (acwp === 0) return 1.0
    return bcwp / acwp
  }

  /**
   * Calculate Schedule Variance (SV)
   * SV = BCWP - BCWS
   *
   * > 0 = Ahead
   * = 0 = On track
   * < 0 = Behind
   */
  calculateScheduleVariance(bcwp: number, bcws: number): number {
    return bcwp - bcws
  }

  /**
   * Calculate Cost Variance (CV)
   * CV = BCWP - ACWP
   *
   * > 0 = Under budget
   * = 0 = On budget
   * < 0 = Over budget
   */
  calculateCostVariance(bcwp: number, acwp: number): number {
    return bcwp - acwp
  }

  /**
   * Calculate Estimate at Completion (EAC)
   * EAC = BAC / CPI
   *
   * Total estimated cost based on current cost performance
   */
  calculateEAC(bac: number, cpi: number): number {
    if (cpi === 0) return bac
    return bac / cpi
  }

  /**
   * Calculate Estimate to Complete (ETC)
   * ETC = EAC - ACWP
   *
   * Cost to complete remaining work
   */
  calculateETC(eac: number, acwp: number): number {
    return eac - acwp
  }

  /**
   * Calculate Variance at Completion (VAC)
   * VAC = BAC - EAC
   *
   * Expected cost variance at project completion
   * > 0 = Will be under budget
   * < 0 = Will be over budget
   */
  calculateVAC(bac: number, eac: number): number {
    return bac - eac
  }

  /**
   * Determine trend status based on SPI and CPI
   * Used for dashboard alerts and risk flagging
   */
  determineTrendStatus(spi: number, cpi: number): 'on-track' | 'at-risk' | 'critical' {
    if (spi < 0.95 || cpi < 0.95) {
      return 'at-risk'
    }
    if (spi < 0.90 || cpi < 0.90) {
      return 'critical'
    }
    return 'on-track'
  }

  /**
   * Full EVM Calculation for a project
   * Computes all metrics and stores snapshot
   */
  async calculateProjectEVM(projectId: string): Promise<EVMCalculationResult> {
    const project = await this.prisma.projects.findUnique({
      where: { id: projectId },
      select: { budget: true, startDate: true, endDate: true },
    })

    if (!project || !project.budget) {
      throw new Error(`Project ${projectId} not found or has no budget`)
    }

    const bac = Number(project.budget)
    const asOfDate = new Date()

    // Calculate metrics
    const bcws = await this.calculateBCWS(projectId, asOfDate)
    const bcwp = await this.calculateBCWP(projectId)
    const acwp = await this.calculateACWP(projectId)

    const spi = this.calculateSPI(bcwp, bcws)
    const cpi = this.calculateCPI(bcwp, acwp)
    const scheduleVariance = this.calculateScheduleVariance(bcwp, bcws)
    const costVariance = this.calculateCostVariance(bcwp, acwp)

    const eac = this.calculateEAC(bac, cpi)
    const etcCost = this.calculateETC(eac, acwp)
    const vac = this.calculateVAC(bac, eac)

    const trendStatus = this.determineTrendStatus(spi, cpi)

    // Update project with latest EVM metrics
    await this.prisma.projects.update({
      where: { id: projectId },
      data: {
        currentBcws: new Decimal(bcws),
        currentBcwp: new Decimal(bcwp),
        currentAcwp: new Decimal(acwp),
        currentSpi: new Decimal(spi),
        currentCpi: new Decimal(cpi),
        spi: new Decimal(spi),
        lastEVMCalculation: new Date(),
      },
    })

    return {
      bcws,
      bcwp,
      acwp,
      spi,
      cpi,
      scheduleVariance,
      costVariance,
      eac,
      etcCost,
      vac,
      trendStatus,
    }
  }

  /**
   * Create EVM period snapshot
   * Called weekly/monthly to record historical data
   */
  async createEVMSnapshot(
    projectId: string,
    wbsLevel: string,
    entityId: string,
    periodStart: Date,
    periodEnd: Date,
    periodType: string
  ) {
    const evm = await this.calculateProjectEVM(projectId)

    return this.prisma.evm_period_snapshot.create({
      data: {
        projectId,
        wbsLevel,
        entityId,
        periodType,
        periodStart,
        periodEnd,
        bcws: new Decimal(evm.bcws),
        bcwp: new Decimal(evm.bcwp),
        acwp: new Decimal(evm.acwp),
        spi: new Decimal(evm.spi),
        cpi: new Decimal(evm.cpi),
        scheduleVariance: new Decimal(evm.scheduleVariance),
        costVariance: new Decimal(evm.costVariance),
        eac: new Decimal(evm.eac),
        etcCost: new Decimal(evm.etcCost),
        vac: new Decimal(evm.vac),
        trendStatus: evm.trendStatus,
      },
    })
  }

  /**
   * Generate S-Curve data for visualization
   * Cumulative BCWS, BCWP, ACWP over time
   */
  async generateSCurveData(projectId: string, startDate: Date, endDate: Date) {
    const project = await this.prisma.projects.findUnique({
      where: { id: projectId },
      select: { budget: true },
    })

    if (!project || !project.budget) {
      throw new Error(`Project ${projectId} not found or invalid budget`)
    }

    const bac = Number(project.budget)
    const evm = await this.calculateProjectEVM(projectId)

    return this.prisma.scurve_data.create({
      data: {
        projectId,
        periodDate: new Date(),
        cumulativeBcws: new Decimal(evm.bcws),
        cumulativeBcwp: new Decimal(evm.bcwp),
        cumulativeAcwp: new Decimal(evm.acwp),
        plannedPercent: new Decimal((evm.bcws / bac) * 100),
        earnedPercent: new Decimal((evm.bcwp / bac) * 100),
        actualPercent: new Decimal((evm.acwp / bac) * 100),
        spi: new Decimal(evm.spi),
        cpi: new Decimal(evm.cpi),
      },
    })
  }

  /**
   * Rollup progress from tasks to workpackage level
   * Bottom-up aggregation
   */
  async rollupTaskProgress(workpackageId: string): Promise<number> {
    const tasks = await this.prisma.wbs_task.findMany({
      where: { workpackageId },
      select: { actualProgress: true, allocatedBudget: true },
    })

    if (tasks.length === 0) return 0

    const totalBudget = tasks.reduce((sum, t) => sum + Number(t.allocatedBudget), 0)
    const weightedProgress = tasks.reduce(
      (sum, t) => sum + Number(t.actualProgress) * Number(t.allocatedBudget),
      0
    )

    return totalBudget > 0 ? (weightedProgress / totalBudget) * 100 : 0
  }

  /**
   * Rollup workpackage progress to phase level
   */
  async rollupWorkpackageProgress(phaseId: string): Promise<number> {
    const workpackages = await this.prisma.wbs_workpackage.findMany({
      where: { phaseId },
      select: { actualProgress: true, allocatedBudget: true },
    })

    if (workpackages.length === 0) return 0

    const totalBudget = workpackages.reduce((sum, w) => sum + Number(w.allocatedBudget), 0)
    const weightedProgress = workpackages.reduce(
      (sum, w) => sum + Number(w.actualProgress) * Number(w.allocatedBudget),
      0
    )

    return totalBudget > 0 ? (weightedProgress / totalBudget) * 100 : 0
  }

  /**
   * Cascade progress from task to workpackage to phase to project
   * Called after task completion update
   */
  async cascadeProgressUpdate(taskId: string) {
    const task = await this.prisma.wbs_task.findUnique({
      where: { id: taskId },
      select: { workpackageId: true },
    })

    if (!task) return

    // Update workpackage
    const wpProgress = await this.rollupTaskProgress(task.workpackageId)
    const workpackage = await this.prisma.wbs_workpackage.findUnique({
      where: { id: task.workpackageId },
      select: { phaseId: true },
    })

    await this.prisma.wbs_workpackage.update({
      where: { id: task.workpackageId },
      data: { actualProgress: new Decimal(wpProgress) },
    })

    if (!workpackage) return

    // Update phase
    const phaseProgress = await this.rollupWorkpackageProgress(workpackage.phaseId)
    const phase = await this.prisma.wbs_phase.findUnique({
      where: { id: workpackage.phaseId },
      select: { wbsRootId: true },
    })

    await this.prisma.wbs_phase.update({
      where: { id: workpackage.phaseId },
      data: { actualProgress: new Decimal(phaseProgress) },
    })

    if (!phase) return

    // Update project overall progress
    const root = await this.prisma.wbs_root.findUnique({
      where: { id: phase.wbsRootId },
      select: { projectId: true },
    })

    if (!root) return

    const phases = await this.prisma.wbs_phase.findMany({
      where: { wbsRootId: phase.wbsRootId },
      select: { actualProgress: true, allocatedBudget: true },
    })

    const totalBudget = phases.reduce((sum, p) => sum + Number(p.allocatedBudget), 0)
    const weightedProgress = phases.reduce(
      (sum, p) => sum + Number(p.actualProgress) * Number(p.allocatedBudget),
      0
    )

    const projectProgress = totalBudget > 0 ? Math.round((weightedProgress / totalBudget) * 100) : 0

    await this.prisma.projects.update({
      where: { id: root.projectId },
      data: { progress: projectProgress },
    })
  }
}

/**
 * Factory for creating EVM service
 */
export function createEVMService(prisma: PrismaClient): EVMService {
  return new EVMService(prisma)
}
