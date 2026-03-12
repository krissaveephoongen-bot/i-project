import { Request, Response } from 'express'
import BillingService from '../billing.service'
import { billingSchemas } from '../schemas/billing.schema'
import { createErrorResponse, createSuccessResponse } from '../../../shared/utils/response'
import { Decimal } from '@prisma/client/runtime/library'

export class BillingController {
  /**
   * POST /api/projects/:id/invoices
   * Create invoice
   */
  async createInvoice(req: Request, res: Response) {
    try {
      const parsed = billingSchemas.createInvoice.parse(req.body)

      const lineItems = parsed.lineItems.map(item => ({
        ...item,
        unitPrice: new Decimal(item.unitPrice),
        amount: new Decimal(item.amount),
      }))

      const invoiceNumber = await BillingService.createInvoice(
        parsed.projectId,
        parsed.customerId,
        new Date(parsed.invoiceDate),
        new Date(parsed.dueDate),
        lineItems,
        parsed.notes
      )

      res.status(201).json(
        createSuccessResponse({ invoiceNumber }, 'Invoice created successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to create invoice', error))
    }
  }

  /**
   * POST /api/invoices/:id/send
   * Send invoice
   */
  async sendInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { sentDate } = billingSchemas.sendInvoice.parse(req.body)

      await BillingService.sendInvoice(
        id,
        sentDate ? new Date(sentDate) : new Date()
      )

      res.json(createSuccessResponse(null, 'Invoice sent successfully'))
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to send invoice', error))
    }
  }

  /**
   * POST /api/invoices/:id/payment
   * Record payment
   */
  async recordPayment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        customerId,
        projectId,
        paymentAmount,
        paymentDate,
        paymentMethod,
        referenceNumber,
        transactionId,
      } = billingSchemas.recordPayment.parse(req.body)

      const paymentId = await BillingService.recordPayment(
        id,
        customerId,
        projectId,
        new Decimal(paymentAmount),
        new Date(paymentDate),
        paymentMethod,
        referenceNumber,
        transactionId
      )

      res.status(201).json(
        createSuccessResponse({ paymentId }, 'Payment recorded successfully')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to record payment', error))
    }
  }

  /**
   * GET /api/invoices/:id
   * Get invoice details
   */
  async getInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq } = require('drizzle-orm')

      const invoice = await db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.id, id))
        .limit(1)

      if (!invoice[0]) {
        return res
          .status(404)
          .json(createErrorResponse('Invoice not found'))
      }

      res.json(
        createSuccessResponse(invoice[0], 'Invoice retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get invoice', error))
    }
  }

  /**
   * GET /api/customers/:id/invoices
   * Get customer invoices
   */
  async getCustomerInvoices(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.query

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq, and } = require('drizzle-orm')

      const whereConditions = [eq(schema.invoices.customerId, id)]

      if (status) {
        whereConditions.push(eq(schema.invoices.status, status))
      }

      const invoices = await db
        .select()
        .from(schema.invoices)
        .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])

      res.json(
        createSuccessResponse(invoices, 'Customer invoices retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get invoices', error))
    }
  }

  /**
   * GET /api/customers/:id/invoice-status
   * Get customer invoice status summary
   */
  async getInvoiceStatus(req: Request, res: Response) {
    try {
      const { id } = req.params

      const status = await BillingService.getInvoiceStatus(id)

      res.json(
        createSuccessResponse(status, 'Invoice status retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get invoice status', error))
    }
  }

  /**
   * POST /api/projects/:id/billing/installment-schedule
   * Generate installment schedule
   */
  async generateInstallmentSchedule(req: Request, res: Response) {
    try {
      const {
        projectId,
        totalAmount,
        installmentCount,
        startDate,
        intervalDays,
      } = billingSchemas.generateInstallment.parse(req.body)

      const schedule = await BillingService.generateInstallmentSchedule(
        projectId,
        new Decimal(totalAmount),
        installmentCount,
        new Date(startDate),
        intervalDays
      )

      res.json(
        createSuccessResponse(schedule, 'Installment schedule generated')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to generate schedule', error))
    }
  }

  /**
   * POST /api/projects/:id/billing/milestone
   * Create milestone-based billing
   */
  async createMilestoneBilling(req: Request, res: Response) {
    try {
      const { projectId, customerId, totalAmount } = billingSchemas.createMilestone.parse(
        req.body
      )

      const billingId = await BillingService.createMilestoneBilling(
        projectId,
        customerId,
        new Decimal(totalAmount)
      )

      res.status(201).json(
        createSuccessResponse({ billingId }, 'Milestone billing created')
      )
    } catch (error) {
      res.status(400).json(createErrorResponse('Failed to create milestone billing', error))
    }
  }

  /**
   * GET /api/projects/:id/financials
   * Get project financial summary
   */
  async getProjectFinancials(req: Request, res: Response) {
    try {
      const { id } = req.params

      const db = require('../../../shared/database/connection').db
      const schema = require('../../../shared/database/connection').schema
      const { eq } = require('drizzle-orm')

      // Update financials first
      await BillingService.updateProjectFinancials(id)

      const financials = await db
        .select()
        .from(schema.project_financials)
        .where(eq(schema.project_financials.projectId, id))
        .limit(1)

      if (!financials[0]) {
        return res
          .status(404)
          .json(createErrorResponse('Financial data not found'))
      }

      res.json(
        createSuccessResponse(financials[0], 'Project financials retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get financials', error))
    }
  }

  /**
   * GET /api/billing/overdue
   * Get overdue invoices for escalation
   */
  async checkOverdue(req: Request, res: Response) {
    try {
      const { daysOverdueThreshold } = req.query

      const overdueList = await BillingService.checkAndEscalateOverdue(
        daysOverdueThreshold ? parseInt(daysOverdueThreshold as string) : 30
      )

      res.json(
        createSuccessResponse(overdueList, 'Overdue invoices retrieved')
      )
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to check overdue', error))
    }
  }
}

export default new BillingController()
