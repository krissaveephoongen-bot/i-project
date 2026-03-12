import { db, schema } from '../../shared/database/connection'
import { eq, and, gte, lte } from 'drizzle-orm'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// TYPES
// ============================================================================

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: Decimal
  amount: Decimal
}

export interface BillingCycle {
  projectId: string
  billingType: string
  totalAmount: Decimal
  installments: Array<{
    number: number
    scheduledDate: Date
    amount: Decimal
    status: string
  }>
}

// ============================================================================
// BILLING SERVICE
// ============================================================================

export class BillingService {
  /**
   * Create invoice from project billing configuration
   */
  async createInvoice(
    projectId: string,
    customerId: string,
    invoiceDate: Date,
    dueDate: Date,
    lineItems: InvoiceLineItem[],
    notes: string = ''
  ): Promise<string> {
    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    })

    if (!project) {
      throw new Error(`Project ${projectId} not found`)
    }

    // Get billing configuration
    const billing = await db.query.project_billing.findFirst({
      where: eq(schema.project_billing.projectId, projectId),
    })

    if (!billing) {
      throw new Error(`No billing configuration for project ${projectId}`)
    }

    // Calculate amounts
    const subtotal = lineItems.reduce(
      (sum, item) => sum.plus(item.amount),
      new Decimal(0)
    )

    const discountAmount = subtotal
      .times(new Decimal(billing.discountPercent))
      .div(100)
    const taxableAmount = subtotal.minus(discountAmount)
    const taxAmount = taxableAmount
      .times(new Decimal(billing.taxPercent))
      .div(100)
    const totalAmount = taxableAmount.plus(taxAmount)

    const invoiceNumber = `INV-${Date.now()}`

    // Create invoice
    await db.insert(schema.invoices).values({
      customerId,
      billingId: null,
      projectId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      lineItems,
      notes,
      status: 'draft',
      paidAmount: new Decimal(0),
      remainingAmount: totalAmount,
    })

    return invoiceNumber
  }

  /**
   * Send invoice to customer
   */
  async sendInvoice(invoiceId: string, sentDate: Date = new Date()): Promise<void> {
    const invoice = await db.query.invoices.findFirst({
      where: eq(schema.invoices.id, invoiceId),
    })

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`)
    }

    if (invoice.status !== 'draft') {
      throw new Error(`Cannot send invoice with status ${invoice.status}`)
    }

    await db
      .update(schema.invoices)
      .set({
        status: 'sent',
        sentDate,
      })
      .where(eq(schema.invoices.id, invoiceId))
  }

  /**
   * Record customer payment
   */
  async recordPayment(
    invoiceId: string,
    customerId: string,
    projectId: string,
    paymentAmount: Decimal,
    paymentDate: Date,
    paymentMethod: string,
    referenceNumber: string = '',
    transactionId: string = ''
  ): Promise<string> {
    const invoice = await db.query.invoices.findFirst({
      where: eq(schema.invoices.id, invoiceId),
    })

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`)
    }

    // Check if payment exceeds remaining
    if (paymentAmount.greaterThan(invoice.remainingAmount)) {
      throw new Error(
        `Payment amount exceeds remaining balance of ${invoice.remainingAmount}`
      )
    }

    // Update invoice
    const newPaidAmount = invoice.paidAmount.plus(paymentAmount)
    const newRemainingAmount = invoice.remainingAmount.minus(paymentAmount)
    const newStatus =
      newRemainingAmount.equals(0) && paymentAmount.greaterThan(0) ? 'paid' : 'partial_paid'

    await db
      .update(schema.invoices)
      .set({
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
        paidDate: newStatus === 'paid' ? paymentDate : invoice.paidDate,
      })
      .where(eq(schema.invoices.id, invoiceId))

    // Record payment
    const paymentId = `PAY-${Date.now()}`
    await db.insert(schema.customer_payments).values({
      customerId,
      invoiceId,
      projectId,
      paymentDate,
      amount: paymentAmount,
      referenceNumber: referenceNumber || paymentId,
      paymentMethod,
      transactionId,
      status: 'recorded',
    })

    return paymentId
  }

  /**
   * Generate installment billing schedule
   */
  async generateInstallmentSchedule(
    projectId: string,
    totalAmount: Decimal,
    installmentCount: number,
    startDate: Date,
    intervalDays: number = 30
  ): Promise<Array<{ number: number; scheduledDate: Date; amount: Decimal }>> {
    const amountPerInstallment = totalAmount.div(installmentCount)
    const installments: Array<{
      number: number
      scheduledDate: Date
      amount: Decimal
    }> = []

    for (let i = 1; i <= installmentCount; i++) {
      const scheduledDate = new Date(
        startDate.getTime() + intervalDays * (i - 1) * 24 * 60 * 60 * 1000
      )

      // Last installment gets remainder
      const amount =
        i === installmentCount
          ? totalAmount.minus(
              amountPerInstallment.times(installmentCount - 1)
            )
          : amountPerInstallment

      installments.push({
        number: i,
        scheduledDate,
        amount,
      })
    }

    return installments
  }

  /**
   * Create milestone-based billing
   */
  async createMilestoneBilling(
    projectId: string,
    customerId: string,
    totalAmount: Decimal
  ): Promise<string> {
    // Get project milestones
    const milestones = await db.query.milestones.findMany({
      where: eq(schema.milestones.projectId, projectId),
    })

    if (milestones.length === 0) {
      throw new Error(`No milestones found for project ${projectId}`)
    }

    const billingId = `MIL-${Date.now()}`

    // Create billing record
    await db.insert(schema.project_billing).values({
      projectId,
      billingType: 'milestone_based',
      totalBillingAmount: totalAmount,
      currency: 'THB',
      paymentTerms: 'net30',
      taxType: 'vat',
      taxPercent: new Decimal(7),
    })

    // Calculate amount per milestone
    const amountPerMilestone = totalAmount.div(milestones.length)

    // Create installments for each milestone
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i]
      const amount =
        i === milestones.length - 1
          ? totalAmount.minus(amountPerMilestone.times(milestones.length - 1))
          : amountPerMilestone

      await db.insert(schema.billing_installment).values({
        billingId: billingId,
        installmentNumber: i + 1,
        description: `Milestone: ${milestone.name}`,
        scheduledDate: milestone.dueDate,
        amount,
        status: 'scheduled',
      })
    }

    return billingId
  }

  /**
   * Update project financials summary
   */
  async updateProjectFinancials(projectId: string): Promise<void> {
    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    })

    if (!project) {
      throw new Error(`Project ${projectId} not found`)
    }

    // Get all invoices for this project
    const invoices = await db.query.invoices.findMany({
      where: eq(schema.invoices.projectId, projectId),
    })

    // Calculate totals
    let totalInvoiced = new Decimal(0)
    let totalCollected = new Decimal(0)

    for (const invoice of invoices) {
      totalInvoiced = totalInvoiced.plus(invoice.totalAmount)
      totalCollected = totalCollected.plus(invoice.paidAmount)
    }

    const pendingCollection = totalInvoiced.minus(totalCollected)

    // Get all expenses
    const expenses = await db.query.expenses.findMany({
      where: eq(schema.expenses.projectId, projectId),
    })

    let totalCost = new Decimal(0)
    let laborCost = new Decimal(0)
    let materialCost = new Decimal(0)
    let equipmentCost = new Decimal(0)
    let otherCost = new Decimal(0)

    for (const expense of expenses) {
      const amount = new Decimal(expense.amount)
      totalCost = totalCost.plus(amount)

      switch (expense.category) {
        case 'equipment':
          equipmentCost = equipmentCost.plus(amount)
          break
        case 'software':
        case 'consulting':
          materialCost = materialCost.plus(amount)
          break
        case 'travel':
        default:
          otherCost = otherCost.plus(amount)
          break
      }
    }

    // Get timesheet costs
    const timesheetCosts = await db.query.timesheet_cost.findMany({
      where: and(
        eq(schema.timesheet_cost.projectId, projectId),
        eq(schema.timesheet_cost.isIncludedInACWP, true)
      ),
    })

    for (const cost of timesheetCosts) {
      const amount = new Decimal(cost.finalCost)
      totalCost = totalCost.plus(amount)
      laborCost = laborCost.plus(amount)
    }

    // Calculate profit
    const billingAmount = new Decimal(project.budget || 0)
    const grossProfit = billingAmount.minus(totalCost)
    const marginPercent =
      billingAmount.toNumber() > 0
        ? grossProfit.div(billingAmount).times(100)
        : new Decimal(0)

    // ROI calculation
    const roi =
      totalCost.toNumber() > 0
        ? grossProfit.div(totalCost).times(100)
        : new Decimal(0)

    // Calculate overdue days
    const currentDate = new Date()
    const overdueInvoices = invoices.filter(
      inv =>
        inv.dueDate < currentDate &&
        inv.status !== 'paid' &&
        inv.status !== 'cancelled'
    )

    let daysOverdue = 0
    for (const inv of overdueInvoices) {
      const daysDiff = Math.ceil(
        (currentDate.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      daysOverdue = Math.max(daysOverdue, daysDiff)
    }

    // Collection rate
    const collectionRate =
      invoices.length > 0
        ? (invoices.filter(inv => inv.status === 'paid').length /
            invoices.length) *
          100
        : new Decimal(0)

    // Get or create financials record
    const existingFinancials = await db.query.project_financials.findFirst({
      where: eq(schema.project_financials.projectId, projectId),
    })

    const financialData = {
      projectId,
      totalBillingAmount: billingAmount,
      totalInvoiced,
      totalCollected,
      pendingCollection,
      totalCost,
      laborCost,
      materialCost,
      equipmentCost,
      otherCost,
      grossProfit,
      marginPercent,
      netProfit: grossProfit,
      roi,
      budgetVariance: billingAmount.minus(totalCost),
      budgetVariancePercent: billingAmount.greaterThan(0)
        ? billingAmount
            .minus(totalCost)
            .div(billingAmount)
            .times(100)
        : new Decimal(0),
      daysOverdue,
      collectionRate: new Decimal(collectionRate),
      averagePaymentDays: invoices.length > 0 ? 30 : null, // Simplified
      lastUpdated: new Date(),
    }

    if (existingFinancials) {
      await db
        .update(schema.project_financials)
        .set(financialData)
        .where(eq(schema.project_financials.projectId, projectId))
    } else {
      await db.insert(schema.project_financials).values(financialData)
    }
  }

  /**
   * Get invoice status for customer
   */
  async getInvoiceStatus(
    customerId: string
  ): Promise<{
    totalInvoiced: Decimal
    totalPaid: Decimal
    totalPending: Decimal
    overdue: Decimal
    invoiceCount: number
  }> {
    const invoices = await db.query.invoices.findMany({
      where: eq(schema.invoices.customerId, customerId),
    })

    let totalInvoiced = new Decimal(0)
    let totalPaid = new Decimal(0)
    let overdue = new Decimal(0)

    const currentDate = new Date()

    for (const invoice of invoices) {
      totalInvoiced = totalInvoiced.plus(invoice.totalAmount)
      totalPaid = totalPaid.plus(invoice.paidAmount)

      if (
        invoice.dueDate < currentDate &&
        invoice.status !== 'paid' &&
        invoice.status !== 'cancelled'
      ) {
        overdue = overdue.plus(invoice.remainingAmount)
      }
    }

    const totalPending = totalInvoiced.minus(totalPaid)

    return {
      totalInvoiced,
      totalPaid,
      totalPending,
      overdue,
      invoiceCount: invoices.length,
    }
  }

  /**
   * Check for overdue invoices and take action
   */
  async checkAndEscalateOverdue(
    daysOverdueThreshold: number = 30
  ): Promise<Array<{ invoiceId: string; customerId: string; overdueAmount: Decimal }>> {
    const currentDate = new Date()
    const thresholdDate = new Date(
      currentDate.getTime() - daysOverdueThreshold * 24 * 60 * 60 * 1000
    )

    const overdueInvoices = await db.query.invoices.findMany({
      where: and(
        lte(schema.invoices.dueDate, thresholdDate),
        // Only unpaid invoices
      ),
    })

    const escalationList: Array<{
      invoiceId: string
      customerId: string
      overdueAmount: Decimal
    }> = []

    for (const invoice of overdueInvoices) {
      if (
        invoice.status !== 'paid' &&
        invoice.status !== 'cancelled'
      ) {
        escalationList.push({
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          overdueAmount: invoice.remainingAmount,
        })
      }
    }

    return escalationList
  }
}

export default new BillingService()
