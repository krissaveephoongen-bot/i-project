import { Request, Response } from 'express'
import SchedulePenaltyService from '../schedule-penalty.service'
import { scheduleSchemas } from '../schemas/schedule.schema'
import { createErrorResponse, createSuccessResponse } from '../../../shared/utils/response'
import { Decimal } from '@prisma/client/runtime/library'

export class ScheduleController {
  /**
   * GET /api/projects/:id/schedule/health
   * Get schedule health metrics
   */
  async getScheduleHealth(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { asOfDate } = req.query

      const health = await SchedulePenaltyService.calculateScheduleHealth(
        id,
        asOfDate ? new Date(asOfDate as string) : new Date()
      )

      res.json(createSuccessResponse(health, 'Schedule health retrieved'))
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get schedule health', error))
    }
  }

  /**
   * POST /api/projects/:id/schedule/progress
   * Record daily progress
   */
  async recordProgress(req: Request, res: Response) {
    try {
      const { scheduleId, dataDate, actualProgress } = scheduleSchemas.recordProgress.parse(req.body)

      await SchedulePenaltyService.recordDailyProgress(
        scheduleId,
        new Date(dataDate),
        actualProgress
      )

      res.status(201).json(
        createSuccessResponse(null, 'Progress recorded successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to record progress', error))
    }
  }

  /**
   * POST /api/projects/:id/schedule/penalty/calculate
   * Calculate penalty (preview)
   */
  async calculatePenalty(req: Request, res: Response) {
    try {
      const { scheduleId, penaltyStructureId, daysLate, startDate } =
        scheduleSchemas.calculatePenalty.parse(req.body)

      const calculation = await SchedulePenaltyService.calculatePenalty(
        scheduleId,
        penaltyStructureId,
        daysLate,
        new Date(startDate)
      )

      res.json(
        createSuccessResponse(calculation, 'Penalty calculated')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to calculate penalty', error))
    }
  }

  /**
   * POST /api/projects/:id/schedule/penalty/apply
   * Apply penalty
   */
  async applyPenalty(req: Request, res: Response) {
    try {
      const { scheduleId, penaltyStructureId, daysLate, startDate, approvedBy, notes } =
        scheduleSchemas.applyPenalty.parse(req.body)

      const penaltyNumber = await SchedulePenaltyService.applyPenalty(
        scheduleId,
        penaltyStructureId,
        daysLate,
        new Date(startDate),
        approvedBy,
        notes
      )

      res.status(201).json(
        createSuccessResponse({ penaltyNumber }, 'Penalty applied successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to apply penalty', error))
    }
  }

  /**
   * PATCH /api/projects/:id/schedule/penalty/:penaltyId/waive
   * Waive penalty
   */
  async waivePenalty(req: Request, res: Response) {
    try {
      const { penaltyId } = req.params
      const { waivedAmount, reason, waivedBy } = scheduleSchemas.waivePenalty.parse(req.body)

      await SchedulePenaltyService.waivePenalty(
        penaltyId,
        new Decimal(waivedAmount),
        reason,
        waivedBy
      )

      res.json(createSuccessResponse(null, 'Penalty waived successfully'))
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to waive penalty', error))
    }
  }

  /**
   * POST /api/projects/:id/schedule/extension/request
   * Request schedule extension
   */
  async requestExtension(req: Request, res: Response) {
    try {
      const { scheduleId, requestedDays, reason, requestedBy, notes } =
        scheduleSchemas.requestExtension.parse(req.body)

      const extensionId = await SchedulePenaltyService.requestExtension(
        scheduleId,
        requestedDays,
        reason,
        requestedBy,
        notes
      )

      res.status(201).json(
        createSuccessResponse({ extensionId }, 'Extension requested')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to request extension', error))
    }
  }

  /**
   * POST /api/projects/:id/schedule/extension/:extensionId/approve
   * Approve extension
   */
  async approveExtension(req: Request, res: Response) {
    try {
      const { extensionId } = req.params
      const { approvedDays, approvedBy } = scheduleSchemas.approveExtension.parse(req.body)

      await SchedulePenaltyService.approveExtension(
        extensionId,
        approvedDays,
        approvedBy
      )

      res.json(
        createSuccessResponse(null, 'Extension approved successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to approve extension', error))
    }
  }

  /**
   * POST /api/projects/:id/schedule/recovery-plan
   * Generate recovery plan
   */
  async generateRecoveryPlan(req: Request, res: Response) {
    try {
      const { projectId, triggerDate } = scheduleSchemas.generateRecoveryPlan.parse(req.body)

      const planNumber = await SchedulePenaltyService.generateRecoveryPlan(
        projectId,
        triggerDate ? new Date(triggerDate) : new Date()
      )

      res.status(201).json(
        createSuccessResponse({ planNumber }, 'Recovery plan generated')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to generate recovery plan', error))
    }
  }

  /**
   * GET /api/projects/:id/schedule/compliance
   * Get schedule compliance summary
   */
  async getCompliance(req: Request, res: Response) {
    try {
      const { id } = req.params

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq } = require('drizzle-orm')

      const compliance = await db
        .select()
        .from(schema.schedule_compliance)
        .where(eq(schema.schedule_compliance.projectId, id))
        .limit(1)

      if (!compliance[0]) {
        return res
          .status(404)
          .json(createErrorResponse('Schedule compliance not found'))
      }

      res.json(
        createSuccessResponse(compliance[0], 'Schedule compliance retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get compliance', error))
    }
  }

  /**
   * GET /api/projects/:id/schedule/milestones
   * Get project milestones
   */
  async getMilestones(req: Request, res: Response) {
    try {
      const { id } = req.params

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq } = require('drizzle-orm')

      // Get schedule first
      const schedule = await db
        .select()
        .from(schema.project_schedule)
        .where(eq(schema.project_schedule.projectId, id))
        .limit(1)

      if (!schedule[0]) {
        return res
          .status(404)
          .json(createErrorResponse('Schedule not found'))
      }

      // Get milestones
      const milestones = await db
        .select()
        .from(schema.schedule_milestone)
        .where(eq(schema.schedule_milestone.scheduleId, schedule[0].id))

      res.json(
        createSuccessResponse(milestones, 'Milestones retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get milestones', error))
    }
  }

  /**
   * GET /api/projects/:id/schedule/penalties
   * Get applied penalties
   */
  async getPenalties(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.query

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq, and } = require('drizzle-orm')

      // Get schedule first
      const schedule = await db
        .select()
        .from(schema.project_schedule)
        .where(eq(schema.project_schedule.projectId, id))
        .limit(1)

      if (!schedule[0]) {
        return res
          .status(404)
          .json(createErrorResponse('Schedule not found'))
      }

      const whereConditions = [eq(schema.contract_penalty.scheduleId, schedule[0].id)]

      if (status) {
        whereConditions.push(eq(schema.contract_penalty.status, status))
      }

      const penalties = await db
        .select()
        .from(schema.contract_penalty)
        .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])

      res.json(
        createSuccessResponse(penalties, 'Penalties retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get penalties', error))
    }
  }
}

export default new ScheduleController()
