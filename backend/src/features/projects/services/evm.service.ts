import { db, schema } from '../../../shared/database/connection'
import { eq, and } from 'drizzle-orm'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// TYPES
// ============================================================================

export interface EVMSnapshot {
  projectId: string
  periodStart: Date
  periodEnd: Date
  
  bac: Decimal | null      // Budget at Completion
  bcws: Decimal            // Budgeted Cost of Work Scheduled
  bcwp: Decimal            // Budgeted Cost of Work Performed
  acwp: Decimal            // Actual Cost of Work Performed
  
  spi: Decimal | null      // Schedule Performance Index = BCWP / BCWS
  cpi: Decimal | null      // Cost Performance Index = BCWP / ACWP
  
  scheduleVariance: Decimal | null  // SV = BCWP - BCWS
  costVariance: Decimal | null      // CV = BCWP - ACWP
  
  eac: Decimal | null      // Estimate at Completion = BAC / CPI
  etcCost: Decimal | null   // Estimate to Complete = EAC - ACWP
  vac: Decimal | null      // Variance at Completion = BAC - EAC
  
  trendStatus: 'on-track' | 'at-risk' | 'critical' | null
}

export interface WBSHierarchyNode {
  id: string
  level: 'project' | 'phase' | 'workpackage' | 'task' | 'subtask'
  name: string
  allocatedBudget: Decimal
  plannedProgress: Decimal
  actualProgress: Decimal
  
  plannedStartDate: Date
  plannedEndDate: Date
  actualStartDate: Date | null
  actualEndDate: Date | null
  
  children?: WBSHierarchyNode[]
}

// ============================================================================
// EVM SERVICE - Earned Value Management Calculations
// ============================================================================

export class EVMService {
  /**
   * Calculate BCWS (Budgeted Cost of Work Scheduled)
   * BCWS = Sum of planned budget for work scheduled by this date
   */
  async calculateBCWS(projectId: string, asOfDate: Date): Promise<Decimal> {
    // Get all phases in project
    const phases = await db.query.wbs_phase.findMany({
      where: and(
        eq(schema.wbs_phase.status, 'active'),
        // Filter by planned dates
      ),
    })

    let totalBCWS = new Decimal(0)

    // For each phase, sum budget allocation weighted by progress
    for (const phase of phases) {
      // Calculate expected progress by asOfDate
      const totalDays = Math.ceil(
        (phase.plannedEndDate.getTime() - phase.plannedStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
      const daysElapsed = Math.ceil(
        (asOfDate.getTime() - phase.plannedStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
      const expectedProgress = Math.min(100, (daysElapsed / totalDays) * 100)

      // Add to BCWS
      totalBCWS = totalBCWS.plus(
        new Decimal(phase.allocatedBudget).times(expectedProgress).div(100)
      )
    }

    return totalBCWS
  }

  /**
   * Calculate BCWP (Budgeted Cost of Work Performed)
   * BCWP = Sum(Task.Budget * Task.ActualProgress%)
   */
  async calculateBCWP(projectId: string): Promise<Decimal> {
    const tasks = await db.query.wbs_task.findMany({
      where: eq(schema.wbs_task.workpackageId, projectId),
    })

    let totalBCWP = new Decimal(0)

    for (const task of tasks) {
      const earnedValue = new Decimal(task.allocatedBudget)
        .times(task.actualProgress)
        .div(100)
      totalBCWP = totalBCWP.plus(earnedValue)
    }

    return totalBCWP
  }

  /**
   * Calculate ACWP (Actual Cost of Work Performed)
   * ACWP = Sum(Labor Costs + Material Costs + Equipment Costs)
   */
  async calculateACWP(projectId: string): Promise<Decimal> {
    // Labor costs from timesheet_cost
    const laborCosts = await db.query.timesheet_cost.findMany({
      where: and(
        eq(schema.timesheet_cost.projectId, projectId),
        eq(schema.timesheet_cost.isIncludedInACWP, true)
      ),
    })

    let totalACWP = new Decimal(0)

    // Sum all included timesheet costs
    for (const cost of laborCosts) {
      totalACWP = totalACWP.plus(new Decimal(cost.finalCost))
    }

    // Add vendor costs (from vendor_payments)
    const vendorCosts = await db.query.vendor_payments.findMany({
      where: and(
        eq(schema.vendor_payments.projectId, projectId),
        eq(schema.vendor_payments.status, 'completed')
      ),
    })

    for (const cost of vendorCosts) {
      totalACWP = totalACWP.plus(new Decimal(cost.amount))
    }

    // Add expense costs
    const expenseCosts = await db.query.expenses.findMany({
      where: and(
        eq(schema.expenses.projectId, projectId),
        eq(schema.expenses.status, 'approved')
      ),
    })

    for (const cost of expenseCosts) {
      totalACWP = totalACWP.plus(new Decimal(cost.amount))
    }

    return totalACWP
  }

  /**
   * Calculate EVM indices
   * SPI = BCWP / BCWS (Schedule Performance Index)
   * CPI = BCWP / ACWP (Cost Performance Index)
   */
  calculateIndices(bcws: Decimal, bcwp: Decimal, acwp: Decimal) {
    const spi = bcws.toNumber() > 0 ? bcwp.div(bcws) : null
    const cpi = acwp.toNumber() > 0 ? bcwp.div(acwp) : null

    return { spi, cpi }
  }

  /**
   * Calculate variances
   * SV = BCWP - BCWS (Schedule Variance)
   * CV = BCWP - ACWP (Cost Variance)
   */
  calculateVariances(bcws: Decimal, bcwp: Decimal, acwp: Decimal) {
    const scheduleVariance = bcwp.minus(bcws)
    const costVariance = bcwp.minus(acwp)

    return { scheduleVariance, costVariance }
  }

  /**
   * Calculate forecasts
   * EAC = BAC / CPI (Estimate at Completion)
   * ETC = EAC - ACWP (Estimate to Complete)
   * VAC = BAC - EAC (Variance at Completion)
   */
  calculateForecasts(bac: Decimal, acwp: Decimal, cpi: Decimal | null) {
    if (!cpi || cpi.toNumber() === 0) {
      return { eac: null, etcCost: null, vac: null }
    }

    const eac = bac.div(cpi)
    const etcCost = eac.minus(acwp)
    const vac = bac.minus(eac)

    return { eac, etcCost, vac }
  }

  /**
   * Determine trend status based on SPI and CPI
   */
  determineTrendStatus(
    spi: Decimal | null,
    cpi: Decimal | null
  ): 'on-track' | 'at-risk' | 'critical' {
    if (!spi || !cpi) return 'at-risk'

    const spiValue = spi.toNumber()
    const cpiValue = cpi.toNumber()

    // Both > 1.0: On track
    if (spiValue > 1.0 && cpiValue > 1.0) {
      return 'on-track'
    }

    // Both < 0.95: Critical
    if (spiValue < 0.95 && cpiValue < 0.95) {
      return 'critical'
    }

    // Everything else: At risk
    return 'at-risk'
  }

  /**
   * Create a complete EVM snapshot for a project at a specific date
   */
  async createSnapshot(
    projectId: string,
    periodStart: Date,
    periodEnd: Date,
    calculatedBy: string
  ): Promise<EVMSnapshot> {
    // Get project BAC
    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    })

    if (!project) {
      throw new Error(`Project ${projectId} not found`)
    }

    const bac = project.bac ? new Decimal(project.bac) : null

    // Calculate EVM values
    const bcws = await this.calculateBCWS(projectId, periodEnd)
    const bcwp = await this.calculateBCWP(projectId)
    const acwp = await this.calculateACWP(projectId)

    // Calculate indices
    const { spi, cpi } = this.calculateIndices(bcws, bcwp, acwp)

    // Calculate variances
    const { scheduleVariance, costVariance } = this.calculateVariances(
      bcws,
      bcwp,
      acwp
    )

    // Calculate forecasts
    const { eac, etcCost, vac } = bac
      ? this.calculateForecasts(bac, acwp, cpi)
      : { eac: null, etcCost: null, vac: null }

    // Determine trend
    const trendStatus = this.determineTrendStatus(spi, cpi)

    // Create snapshot record
    await db.insert(schema.evm_period_snapshot).values({
      projectId,
      periodStart,
      periodEnd,
      wbsLevel: 'project',
      entityId: projectId,
      bac,
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
      calculatedBy,
    })

    return {
      projectId,
      periodStart,
      periodEnd,
      bac,
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
   * Cascade update progress from task → workpackage → phase → project
   * When a task's progress changes, update parent levels with weighted average
   */
  async cascadeProgressUpdate(taskId: string): Promise<void> {
    // Get the task
    const task = await db.query.wbs_task.findFirst({
      where: eq(schema.wbs_task.id, taskId),
    })

    if (!task) {
      throw new Error(`Task ${taskId} not found`)
    }

    // Update workpackage progress
    const workpackage = await db.query.wbs_workpackage.findFirst({
      where: eq(schema.wbs_workpackage.id, task.workpackageId),
    })

    if (workpackage) {
      // Get all tasks in this workpackage
      const tasksInWP = await db.query.wbs_task.findMany({
        where: eq(schema.wbs_task.workpackageId, workpackage.id),
      })

      // Calculate weighted average progress
      const totalBudget = tasksInWP.reduce(
        (sum, t) => sum + t.allocatedBudget.toNumber(),
        0
      )
      const weightedProgress = tasksInWP.reduce(
        (sum, t) =>
          sum +
          t.allocatedBudget.toNumber() * t.actualProgress.toNumber(),
        0
      )
      const avgProgress =
        totalBudget > 0 ? (weightedProgress / totalBudget) * 100 : 0

      // Update workpackage
      await db
        .update(schema.wbs_workpackage)
        .set({ actualProgress: new Decimal(avgProgress) })
        .where(eq(schema.wbs_workpackage.id, workpackage.id))

      // Cascade to phase
      const phase = await db.query.wbs_phase.findFirst({
        where: eq(schema.wbs_phase.id, workpackage.phaseId),
      })

      if (phase) {
        // Get all workpackages in this phase
        const workpackagesInPhase = await db.query.wbs_workpackage.findMany({
          where: eq(schema.wbs_workpackage.phaseId, phase.id),
        })

        // Calculate phase progress
        const totalPhaseBudget = workpackagesInPhase.reduce(
          (sum, wp) => sum + wp.allocatedBudget.toNumber(),
          0
        )
        const weightedPhaseProgress = workpackagesInPhase.reduce(
          (sum, wp) =>
            sum + wp.allocatedBudget.toNumber() * wp.actualProgress.toNumber(),
          0
        )
        const phaseAvgProgress =
          totalPhaseBudget > 0 ? (weightedPhaseProgress / totalPhaseBudget) * 100 : 0

        // Update phase
        await db
          .update(schema.wbs_phase)
          .set({ actualProgress: new Decimal(phaseAvgProgress) })
          .where(eq(schema.wbs_phase.id, phase.id))

        // Cascade to project
        const wbsRoot = await db.query.wbs_root.findFirst({
          where: eq(schema.wbs_root.id, phase.wbsRootId),
        })

        if (wbsRoot) {
          // Get all phases in project
          const phasesInProject = await db.query.wbs_phase.findMany({
            where: eq(schema.wbs_phase.wbsRootId, wbsRoot.id),
          })

          // Calculate project progress
          const totalProjectBudget = phasesInProject.reduce(
            (sum, p) => sum + p.allocatedBudget.toNumber(),
            0
          )
          const weightedProjectProgress = phasesInProject.reduce(
            (sum, p) =>
              sum + p.allocatedBudget.toNumber() * p.actualProgress.toNumber(),
            0
          )
          const projectAvgProgress =
            totalProjectBudget > 0
              ? (weightedProjectProgress / totalProjectBudget) * 100
              : 0

          // Update project progress
          await db
            .update(schema.projects)
            .set({ progress: projectAvgProgress })
            .where(eq(schema.projects.id, wbsRoot.projectId))
        }
      }
    }
  }

  /**
   * Get WBS hierarchy with current EVM data
   */
  async getWBSHierarchy(projectId: string): Promise<WBSHierarchyNode | null> {
    const wbsRoot = await db.query.wbs_root.findFirst({
      where: eq(schema.wbs_root.projectId, projectId),
    })

    if (!wbsRoot) {
      return null
    }

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    })

    if (!project) {
      return null
    }

    // Recursively build hierarchy
    const phases = await db.query.wbs_phase.findMany({
      where: eq(schema.wbs_phase.wbsRootId, wbsRoot.id),
    })

    const projectNode: WBSHierarchyNode = {
      id: project.id,
      level: 'project',
      name: project.name,
      allocatedBudget: new Decimal(project.bac || project.budget || 0),
      plannedProgress: new Decimal(project.progressPlan),
      actualProgress: new Decimal(project.progress),
      plannedStartDate: project.startDate || new Date(),
      plannedEndDate: project.endDate || new Date(),
      actualStartDate: null,
      actualEndDate: null,
      children: [],
    }

    for (const phase of phases) {
      const phaseNode: WBSHierarchyNode = {
        id: phase.id,
        level: 'phase',
        name: phase.name,
        allocatedBudget: phase.allocatedBudget,
        plannedProgress: phase.plannedProgress,
        actualProgress: phase.actualProgress,
        plannedStartDate: phase.plannedStartDate,
        plannedEndDate: phase.plannedEndDate,
        actualStartDate: phase.actualStartDate,
        actualEndDate: phase.actualEndDate,
        children: [],
      }

      // Get workpackages in this phase
      const workpackages = await db.query.wbs_workpackage.findMany({
        where: eq(schema.wbs_workpackage.phaseId, phase.id),
      })

      for (const wp of workpackages) {
        const wpNode: WBSHierarchyNode = {
          id: wp.id,
          level: 'workpackage',
          name: wp.name,
          allocatedBudget: wp.allocatedBudget,
          plannedProgress: wp.plannedProgress,
          actualProgress: wp.actualProgress,
          plannedStartDate: wp.plannedStartDate,
          plannedEndDate: wp.plannedEndDate,
          actualStartDate: wp.actualStartDate,
          actualEndDate: wp.actualEndDate,
          children: [],
        }

        // Get tasks in this workpackage
        const tasks = await db.query.wbs_task.findMany({
          where: eq(schema.wbs_task.workpackageId, wp.id),
        })

        for (const task of tasks) {
          const taskNode: WBSHierarchyNode = {
            id: task.id,
            level: 'task',
            name: task.name,
            allocatedBudget: task.allocatedBudget,
            plannedProgress: task.plannedProgress,
            actualProgress: task.actualProgress,
            plannedStartDate: task.plannedStartDate,
            plannedEndDate: task.plannedEndDate,
            actualStartDate: task.actualStartDate,
            actualEndDate: task.actualEndDate,
          }

          wpNode.children?.push(taskNode)
        }

        phaseNode.children?.push(wpNode)
      }

      projectNode.children?.push(phaseNode)
    }

    return projectNode
  }
}

export default new EVMService()
