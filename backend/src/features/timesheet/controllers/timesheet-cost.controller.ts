import { Request, Response } from 'express'
import TimesheetCostService from '../timesheet-cost.service'
import { timesheetSchemas } from '../schemas/timesheet.schema'
import { createErrorResponse, createSuccessResponse } from '../../../shared/utils/response'

export class TimesheetCostController {
  /**
   * POST /api/timesheet/:id/cost/calculate
   * Calculate cost for time entry
   */
  async calculateCost(req: Request, res: Response) {
    try {
      const { entryId } = timesheetSchemas.calculateCost.parse(req.body)

      const calculation = await TimesheetCostService.calculateEntryCost(entryId)

      res.json(
        createSuccessResponse(calculation, 'Cost calculated successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to calculate cost', error))
    }
  }

  /**
   * POST /api/timesheet/:id/cost/record
   * Record cost for time entry
   */
  async recordCost(req: Request, res: Response) {
    try {
      const { entryId } = timesheetSchemas.recordCost.parse(req.body)

      const costId = await TimesheetCostService.recordTimesheetCost(entryId)

      res.status(201).json(
        createSuccessResponse({ costId }, 'Cost recorded successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to record cost', error))
    }
  }

  /**
   * POST /api/timesheet/:id/cost/approve
   * Approve entry and include in ACWP
   */
  async approveCost(req: Request, res: Response) {
    try {
      const { entryId } = timesheetSchemas.approveCost.parse(req.body)

      await TimesheetCostService.approveTimesheetEntry(entryId)

      res.json(
        createSuccessResponse(null, 'Entry approved and included in ACWP')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to approve entry', error))
    }
  }

  /**
   * POST /api/timesheet/weekly/process
   * Process weekly timesheet
   */
  async processWeekly(req: Request, res: Response) {
    try {
      const { userId, weekStartDate, weekEndDate } = timesheetSchemas.processWeekly.parse(
        req.body
      )

      const summary = await TimesheetCostService.processWeeklyTimesheet(
        userId,
        new Date(weekStartDate),
        new Date(weekEndDate)
      )

      res.json(
        createSuccessResponse(summary, 'Weekly timesheet processed')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to process weekly', error))
    }
  }

  /**
   * GET /api/timesheet/:userId/daily/:date
   * Get daily summary
   */
  async getDailySummary(req: Request, res: Response) {
    try {
      const { userId, date } = req.params

      const summary = await TimesheetCostService.generateDailySummary(
        userId,
        new Date(date)
      )

      res.json(
        createSuccessResponse(summary, 'Daily summary retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get daily summary', error))
    }
  }

  /**
   * GET /api/timesheet/:userId/monthly/:year/:month
   * Get monthly cost summary
   */
  async getMonthly(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { year, month } = timesheetSchemas.getMonthly.parse(req.query)

      const summary = await TimesheetCostService.getMonthlyTimesheetCost(
        userId,
        year,
        month
      )

      res.json(
        createSuccessResponse(summary, 'Monthly summary retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get monthly summary', error))
    }
  }

  /**
   * GET /api/timesheet/:userId/payroll/:year/:month
   * Export for payroll
   */
  async exportForPayroll(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { year, month } = timesheetSchemas.exportPayroll.parse(req.query)

      const payrollData = await TimesheetCostService.exportForPayroll(
        userId,
        month,
        year
      )

      res.json(
        createSuccessResponse(payrollData, 'Payroll data exported')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to export payroll', error))
    }
  }

  /**
   * POST /api/timesheet/batch/process-approved
   * Batch process approved timesheets
   */
  async batchProcessApproved(req: Request, res: Response) {
    try {
      const result = await TimesheetCostService.batchProcessApprovedTimesheets()

      res.json(
        createSuccessResponse(
          {
            processed: result.processed,
            totalCost: result.totalCost.toString(),
            updatedProjectCount: result.updatedProjects.size,
          },
          `Batch processed ${result.processed} timesheets`
        )
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to batch process', error))
    }
  }

  /**
   * GET /api/projects/:projectId/labor-cost
   * Get project labor cost summary
   */
  async getProjectLaborCost(req: Request, res: Response) {
    try {
      const { projectId } = req.params

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq } = require('drizzle-orm')

      const costs = await db
        .select()
        .from(schema.timesheet_cost)
        .where(eq(schema.timesheet_cost.projectId, projectId))

      let totalCost = new (require('@prisma/client/runtime/library').Decimal)(0)
      let totalHours = new (require('@prisma/client/runtime/library').Decimal)(0)

      for (const cost of costs) {
        totalCost = totalCost.plus(cost.finalCost)
        totalHours = totalHours.plus(cost.hours)
      }

      res.json(
        createSuccessResponse(
          {
            projectId,
            totalHours: totalHours.toString(),
            totalCost: totalCost.toString(),
            entryCount: costs.length,
            includedInACWP: costs.filter(c => c.isIncludedInACWP).length,
          },
          'Project labor cost retrieved'
        )
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get labor cost', error))
    }
  }
}

export default new TimesheetCostController()
