import { Request, Response } from 'express'
import EVMService from '../services/evm.service'
import {
  CreateSnapshotRequest,
  GetWBSHierarchyRequest,
  UpdateTaskProgressRequest,
  GetEVMMetricsRequest,
  evmSchemas,
} from '../schemas/evm.schema'
import { createErrorResponse, createSuccessResponse } from '../../../shared/utils/response'
import { Decimal } from '@prisma/client/runtime/library'

export class EVMController {
  /**
   * POST /api/projects/:id/evm/snapshot
   * Create EVM period snapshot
   */
  async createSnapshot(req: Request, res: Response) {
    try {
      const body = evmSchemas.createSnapshot.parse(req.body)

      const snapshot = await EVMService.createSnapshot(
        body.projectId,
        new Date(body.periodStart),
        new Date(body.periodEnd),
        body.calculatedBy
      )

      res.status(201).json(
        createSuccessResponse(snapshot, 'EVM snapshot created successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to create snapshot', error))
    }
  }

  /**
   * GET /api/projects/:id/evm/metrics
   * Get current EVM metrics
   */
  async getMetrics(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { asOfDate } = req.query

      const hierarchy = await EVMService.getWBSHierarchy(id)

      if (!hierarchy) {
        return res
          .status(404)
          .json(createErrorResponse('Project WBS not found'))
      }

      // Get latest snapshot
      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq, desc } = require('drizzle-orm')

      const latestSnapshot = await db
        .select()
        .from(schema.evm_period_snapshot)
        .where(eq(schema.evm_period_snapshot.projectId, id))
        .orderBy(desc(schema.evm_period_snapshot.calculatedAt))
        .limit(1)

      res.json(
        createSuccessResponse(
          {
            hierarchy,
            latestSnapshot: latestSnapshot[0] || null,
          },
          'EVM metrics retrieved'
        )
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get metrics', error))
    }
  }

  /**
   * GET /api/projects/:id/wbs/hierarchy
   * Get full WBS hierarchy
   */
  async getWBSHierarchy(req: Request, res: Response) {
    try {
      const { id } = req.params

      const hierarchy = await EVMService.getWBSHierarchy(id)

      if (!hierarchy) {
        return res
          .status(404)
          .json(createErrorResponse('Project WBS not found'))
      }

      res.json(
        createSuccessResponse(hierarchy, 'WBS hierarchy retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get WBS', error))
    }
  }

  /**
   * PATCH /api/projects/:id/tasks/:taskId/progress
   * Update task progress (with cascade)
   */
  async updateTaskProgress(req: Request, res: Response) {
    try {
      const { id, taskId } = req.params
      const { actualProgress } = evmSchemas.updateTaskProgress.parse(req.body)

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq } = require('drizzle-orm')

      // Update task
      await db
        .update(schema.wbs_task)
        .set({
          actualProgress: new Decimal(actualProgress),
        })
        .where(eq(schema.wbs_task.id, taskId))

      // Cascade update
      await EVMService.cascadeProgressUpdate(taskId)

      res.json(
        createSuccessResponse(null, 'Task progress updated and cascaded')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to update progress', error))
    }
  }

  /**
   * GET /api/projects/:id/scurve
   * Get S-curve data for visualization
   */
  async getScurveData(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { startDate, endDate } = req.query

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq, and, gte, lte } = require('drizzle-orm')

      const whereConditions = [eq(schema.scurve_data.projectId, id)]

      if (startDate) {
        whereConditions.push(
          gte(schema.scurve_data.periodDate, new Date(startDate as string))
        )
      }

      if (endDate) {
        whereConditions.push(
          lte(schema.scurve_data.periodDate, new Date(endDate as string))
        )
      }

      const scurveData = await db
        .select()
        .from(schema.scurve_data)
        .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])

      res.json(createSuccessResponse(scurveData, 'S-curve data retrieved'))
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get S-curve data', error))
    }
  }

  /**
   * POST /api/projects/:id/baseline
   * Create baseline snapshot
   */
  async createBaseline(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { baselineNumber, baselineType } = req.body

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema

      // Get current WBS state
      const hierarchy = await EVMService.getWBSHierarchy(id)

      if (!hierarchy) {
        return res
          .status(404)
          .json(createErrorResponse('Project not found'))
      }

      // Create baseline
      const baselineId = `BL-${Date.now()}`
      await db.insert(schema.project_baseline).values({
        projectId: id,
        baselineNumber,
        baselineType: baselineType || 'performance',
        totalBudget: hierarchy.allocatedBudget,
        totalDuration: 0, // Calculate from hierarchy
        baselineDate: new Date(),
        baselineSnapshot: hierarchy,
        isActive: true,
      })

      res.status(201).json(
        createSuccessResponse(
          { id: baselineId },
          'Baseline created successfully'
        )
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to create baseline', error))
    }
  }

  /**
   * GET /api/projects/:id/evm/comparison
   * Compare current vs baseline
   */
  async compareToBaseline(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { baselineNumber } = req.query

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq, and } = require('drizzle-orm')

      const baseline = await db
        .select()
        .from(schema.project_baseline)
        .where(
          and(
            eq(schema.project_baseline.projectId, id),
            eq(schema.project_baseline.baselineNumber, parseInt(baselineNumber as string))
          )
        )
        .limit(1)

      if (!baseline[0]) {
        return res
          .status(404)
          .json(createErrorResponse('Baseline not found'))
      }

      // Get current hierarchy
      const current = await EVMService.getWBSHierarchy(id)

      // Compare
      const comparison = {
        baseline: baseline[0],
        current,
        variance: {
          budgetVariance:
            (current?.allocatedBudget || 0) -
            (baseline[0].totalBudget || 0),
          progressVariance:
            (current?.actualProgress || 0) -
            (baseline[0].baselineSnapshot?.actualProgress || 0),
        },
      }

      res.json(
        createSuccessResponse(comparison, 'Baseline comparison retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to compare baseline', error))
    }
  }
}

export default new EVMController()
