import { Request, Response } from 'express'
import VendorService from '../vendor.service'
import { vendorSchemas } from '../schemas/vendor.schema'
import { createErrorResponse, createSuccessResponse } from '../../../shared/utils/response'
import { Decimal } from '@prisma/client/runtime/library'

export class VendorController {
  /**
   * POST /api/vendors
   * Create vendor
   */
  async createVendor(req: Request, res: Response) {
    try {
      const {
        code,
        name,
        vendorType,
        email,
        phone,
        address,
        city,
        country,
        category,
        taxId,
        licenseNumber,
        bankAccount,
        bankName,
      } = vendorSchemas.createVendor.parse(req.body)

      const vendorId = await VendorService.createVendor(
        code,
        name,
        vendorType,
        email,
        phone,
        address,
        city,
        country,
        category,
        taxId,
        licenseNumber,
        bankAccount,
        bankName
      )

      res.status(201).json(
        createSuccessResponse({ vendorId }, 'Vendor created successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to create vendor', error))
    }
  }

  /**
   * GET /api/vendors/:id
   * Get vendor details
   */
  async getVendor(req: Request, res: Response) {
    try {
      const { id } = req.params

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq } = require('drizzle-orm')

      const vendor = await db
        .select()
        .from(schema.vendors)
        .where(eq(schema.vendors.id, id))
        .limit(1)

      if (!vendor[0]) {
        return res
          .status(404)
          .json(createErrorResponse('Vendor not found'))
      }

      res.json(
        createSuccessResponse(vendor[0], 'Vendor retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get vendor', error))
    }
  }

  /**
   * POST /api/vendors/:id/payment
   * Record vendor payment
   */
  async recordPayment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        contractId,
        projectId,
        paymentType,
        amount,
        dueDate,
        paymentMethod,
        notes,
      } = vendorSchemas.recordPayment.parse(req.body)

      const paymentId = await VendorService.recordVendorPayment(
        id,
        contractId || '',
        projectId || '',
        paymentType,
        new Decimal(amount),
        new Date(dueDate),
        paymentMethod,
        notes
      )

      res.status(201).json(
        createSuccessResponse({ paymentId }, 'Payment recorded successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to record payment', error))
    }
  }

  /**
   * PATCH /api/vendors/:vendorId/payment/:paymentId/confirm
   * Confirm payment
   */
  async confirmPayment(req: Request, res: Response) {
    try {
      const { vendorId, paymentId } = req.params
      const { paidDate, transactionId } = vendorSchemas.confirmPayment.parse(req.body)

      await VendorService.confirmPayment(paymentId, new Date(paidDate), transactionId)

      res.json(
        createSuccessResponse(null, 'Payment confirmed successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to confirm payment', error))
    }
  }

  /**
   * POST /api/vendors/:id/evaluation
   * Create KPI evaluation
   */
  async createEvaluation(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        projectId,
        evaluationPeriod,
        qualityScore,
        timelinessScore,
        costScore,
        communicationScore,
        technicalScore,
        evaluatorId,
        strengths,
        weaknesses,
        recommendations,
      } = vendorSchemas.createKPIEvaluation.parse(req.body)

      const evaluationId = await VendorService.createKPIEvaluation(
        id,
        projectId || '',
        evaluationPeriod,
        new Decimal(qualityScore),
        new Decimal(timelinessScore),
        new Decimal(costScore),
        new Decimal(communicationScore),
        new Decimal(technicalScore),
        evaluatorId,
        strengths,
        weaknesses,
        recommendations
      )

      res.status(201).json(
        createSuccessResponse({ evaluationId }, 'Evaluation created successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to create evaluation', error))
    }
  }

  /**
   * GET /api/vendors/:id/performance
   * Get vendor performance summary
   */
  async getPerformance(req: Request, res: Response) {
    try {
      const { id } = req.params

      const performance = await VendorService.getVendorPerformance(id)

      res.json(
        createSuccessResponse(performance, 'Vendor performance retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get performance', error))
    }
  }

  /**
   * POST /api/vendors/:id/contract
   * Create vendor contract
   */
  async createContract(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        projectId,
        contractNumber,
        title,
        startDate,
        endDate,
        value,
        contractType,
        paymentTerms,
        description,
      } = vendorSchemas.createContract.parse(req.body)

      const contractId = await VendorService.createContract(
        id,
        projectId || '',
        contractNumber,
        title,
        new Date(startDate),
        new Date(endDate),
        new Decimal(value),
        contractType,
        paymentTerms,
        description
      )

      res.status(201).json(
        createSuccessResponse({ contractId }, 'Contract created successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to create contract', error))
    }
  }

  /**
   * PATCH /api/vendors/:vendorId/contract/:contractId/sign
   * Sign contract
   */
  async signContract(req: Request, res: Response) {
    try {
      const { vendorId, contractId } = req.params
      const { signedBy, signedDate } = vendorSchemas.signContract.parse(req.body)

      await VendorService.signContract(
        contractId,
        signedBy,
        signedDate ? new Date(signedDate) : new Date()
      )

      res.json(
        createSuccessResponse(null, 'Contract signed successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to sign contract', error))
    }
  }

  /**
   * GET /api/vendors/:id/contracts
   * Get vendor contracts
   */
  async getContracts(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.query

      const contracts = await VendorService.getVendorContracts(
        id,
        status as string
      )

      res.json(
        createSuccessResponse(contracts, 'Vendor contracts retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get contracts', error))
    }
  }

  /**
   * GET /api/vendors/:id/cost-analysis
   * Get vendor cost analysis
   */
  async getCostAnalysis(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { category } = req.query

      const analysis = await VendorService.getVendorCostAnalysis(
        id,
        category as string
      )

      res.json(
        createSuccessResponse(analysis, 'Cost analysis retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get cost analysis', error))
    }
  }

  /**
   * GET /api/vendors/:id/scorecard
   * Get vendor scorecard
   */
  async getScorecard(req: Request, res: Response) {
    try {
      const { id } = req.params

      const scorecard = await VendorService.generateVendorScorecard(id)

      res.json(
        createSuccessResponse(scorecard, 'Vendor scorecard retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get scorecard', error))
    }
  }

  /**
   * GET /api/vendors
   * List all vendors
   */
  async listVendors(req: Request, res: Response) {
    try {
      const { type, status, limit = '50', offset = '0' } = req.query

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq, and } = require('drizzle-orm')

      const whereConditions = []

      if (type) {
        whereConditions.push(eq(schema.vendors.vendorType, type))
      }

      if (status) {
        whereConditions.push(eq(schema.vendors.status, status))
      }

      const vendors = await db
        .select()
        .from(schema.vendors)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string))

      res.json(
        createSuccessResponse(vendors, 'Vendors retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get vendors', error))
    }
  }
}

export default new VendorController()
