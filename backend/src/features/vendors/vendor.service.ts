import { db, schema } from '../../shared/database/connection'
import { eq, and, lte, gte } from 'drizzle-orm'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// TYPES
// ============================================================================

export interface VendorPerformance {
  vendorId: string
  vendorName: string
  totalProjects: number
  successfulProjects: number
  successRate: number
  averageDeliveryTime: number
  onTimeDeliveryRate: number
  totalSpent: Decimal
  averageOrderValue: Decimal
  overallRating: string
  qualityScore: Decimal
  timelinessScore: Decimal
  costScore: Decimal
  communicationScore: Decimal
  technicalScore: Decimal
}

export interface VendorKPIEvaluation {
  vendorId: string
  evaluationPeriod: string
  qualityScore: Decimal
  timelinessScore: Decimal
  costScore: Decimal
  communicationScore: Decimal
  technicalScore: Decimal
  overallScore: Decimal
  rating: string
}

// ============================================================================
// VENDOR SERVICE
// ============================================================================

export class VendorService {
  /**
   * Create or update vendor master record
   */
  async createVendor(
    code: string,
    name: string,
    vendorType: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    country: string,
    category?: string,
    taxId?: string,
    licenseNumber?: string,
    bankAccount?: string,
    bankName?: string
  ): Promise<string> {
    const vendorId = `VEN-${Date.now()}`

    await db.insert(schema.vendors).values({
      code,
      name,
      vendorType: vendorType as any,
      category,
      email,
      phone,
      address,
      city,
      country,
      taxId,
      licenseNumber,
      bankAccount,
      bankName,
      overallRating: 'satisfactory',
    })

    return vendorId
  }

  /**
   * Record vendor payment
   */
  async recordVendorPayment(
    vendorId: string,
    contractId: string,
    projectId: string,
    paymentType: string,
    amount: Decimal,
    dueDate: Date,
    paymentMethod: string = 'bank_transfer',
    notes: string = ''
  ): Promise<string> {
    const vendor = await db.query.vendors.findFirst({
      where: eq(schema.vendors.id, vendorId),
    })

    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`)
    }

    const paymentId = `VPAY-${Date.now()}`

    await db.insert(schema.vendor_payments).values({
      vendorId,
      contractId: contractId || null,
      projectId: projectId || null,
      paymentType: paymentType as any,
      amount,
      currency: 'THB',
      dueDate,
      status: 'pending',
      paymentMethod: paymentMethod as any,
      notes,
    })

    return paymentId
  }

  /**
   * Confirm vendor payment
   */
  async confirmPayment(
    paymentId: string,
    paidDate: Date,
    transactionId: string = ''
  ): Promise<void> {
    const payment = await db.query.vendor_payments.findFirst({
      where: eq(schema.vendor_payments.id, paymentId),
    })

    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`)
    }

    await db
      .update(schema.vendor_payments)
      .set({
        status: 'completed',
        paidDate,
        transactionId: transactionId || undefined,
      })
      .where(eq(schema.vendor_payments.id, paymentId))

    // Update vendor totalSpent
    const vendor = await db.query.vendors.findFirst({
      where: eq(schema.vendors.id, payment.vendorId),
    })

    if (vendor) {
      const newTotalSpent = vendor.totalSpent.plus(payment.amount)
      await db
        .update(schema.vendors)
        .set({
          totalSpent: newTotalSpent,
        })
        .where(eq(schema.vendors.id, payment.vendorId))
    }
  }

  /**
   * Create KPI evaluation for vendor
   */
  async createKPIEvaluation(
    vendorId: string,
    projectId: string,
    evaluationPeriod: string,
    qualityScore: Decimal,
    timelinessScore: Decimal,
    costScore: Decimal,
    communicationScore: Decimal,
    technicalScore: Decimal,
    evaluatorId: string,
    strengths?: string,
    weaknesses?: string,
    recommendations?: string
  ): Promise<string> {
    const vendor = await db.query.vendors.findFirst({
      where: eq(schema.vendors.id, vendorId),
    })

    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`)
    }

    // Calculate overall score (average of 5 metrics)
    const overallScore = new Decimal(
      (
        (qualityScore.toNumber() +
          timelinessScore.toNumber() +
          costScore.toNumber() +
          communicationScore.toNumber() +
          technicalScore.toNumber()) /
        5
      ).toFixed(1)
    )

    // Determine rating
    const rating =
      overallScore.toNumber() >= 8
        ? 'excellent'
        : overallScore.toNumber() >= 6
          ? 'good'
          : overallScore.toNumber() >= 4
            ? 'satisfactory'
            : 'poor'

    const evaluationId = `KPIE-${Date.now()}`

    await db.insert(schema.vendor_kpi_evaluations).values({
      vendorId,
      projectId: projectId || null,
      evaluationPeriod,
      qualityScore,
      timelinessScore,
      costScore,
      communicationScore,
      technicalScore,
      overallScore,
      rating: rating as any,
      evaluatorId,
      strengths,
      weaknesses,
      recommendations,
      nextEvaluationDate: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days
      ),
    })

    // Update vendor overall rating (average of recent evaluations)
    await this.updateVendorRating(vendorId)

    return evaluationId
  }

  /**
   * Update vendor overall rating based on recent evaluations
   */
  async updateVendorRating(vendorId: string): Promise<void> {
    // Get last 4 evaluations
    const evaluations = await db.query.vendor_kpi_evaluations.findMany({
      where: eq(schema.vendor_kpi_evaluations.vendorId, vendorId),
      limit: 4,
    })

    if (evaluations.length === 0) return

    // Calculate average scores
    let totalQuality = new Decimal(0)
    let totalTimeliness = new Decimal(0)
    let totalCost = new Decimal(0)
    let totalCommunication = new Decimal(0)
    let totalTechnical = new Decimal(0)

    for (const eval of evaluations) {
      totalQuality = totalQuality.plus(eval.qualityScore)
      totalTimeliness = totalTimeliness.plus(eval.timelinessScore)
      totalCost = totalCost.plus(eval.costScore)
      totalCommunication = totalCommunication.plus(eval.communicationScore)
      totalTechnical = totalTechnical.plus(eval.technicalScore)
    }

    const avgQuality = totalQuality.div(evaluations.length)
    const avgTimeliness = totalTimeliness.div(evaluations.length)
    const avgCost = totalCost.div(evaluations.length)
    const avgCommunication = totalCommunication.div(evaluations.length)
    const avgTechnical = totalTechnical.div(evaluations.length)

    const overallScore = new Decimal(
      (
        (avgQuality.toNumber() +
          avgTimeliness.toNumber() +
          avgCost.toNumber() +
          avgCommunication.toNumber() +
          avgTechnical.toNumber()) /
        5
      ).toFixed(1)
    )

    const rating =
      overallScore.toNumber() >= 8
        ? 'excellent'
        : overallScore.toNumber() >= 6
          ? 'good'
          : overallScore.toNumber() >= 4
            ? 'satisfactory'
            : 'poor'

    // Update vendor
    await db
      .update(schema.vendors)
      .set({
        overallRating: rating as any,
      })
      .where(eq(schema.vendors.id, vendorId))
  }

  /**
   * Get vendor performance summary
   */
  async getVendorPerformance(vendorId: string): Promise<VendorPerformance> {
    const vendor = await db.query.vendors.findFirst({
      where: eq(schema.vendors.id, vendorId),
    })

    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`)
    }

    // Get recent evaluations
    const evaluations = await db.query.vendor_kpi_evaluations.findMany({
      where: eq(schema.vendor_kpi_evaluations.vendorId, vendorId),
      limit: 4,
    })

    // Calculate average scores
    let avgQuality = new Decimal(0)
    let avgTimeliness = new Decimal(0)
    let avgCost = new Decimal(0)
    let avgCommunication = new Decimal(0)
    let avgTechnical = new Decimal(0)

    if (evaluations.length > 0) {
      avgQuality = evaluations
        .reduce((sum, e) => sum.plus(e.qualityScore), new Decimal(0))
        .div(evaluations.length)
      avgTimeliness = evaluations
        .reduce((sum, e) => sum.plus(e.timelinessScore), new Decimal(0))
        .div(evaluations.length)
      avgCost = evaluations
        .reduce((sum, e) => sum.plus(e.costScore), new Decimal(0))
        .div(evaluations.length)
      avgCommunication = evaluations
        .reduce((sum, e) => sum.plus(e.communicationScore), new Decimal(0))
        .div(evaluations.length)
      avgTechnical = evaluations
        .reduce((sum, e) => sum.plus(e.technicalScore), new Decimal(0))
        .div(evaluations.length)
    }

    return {
      vendorId,
      vendorName: vendor.name,
      totalProjects: vendor.totalProjects,
      successfulProjects: vendor.successfulProjects,
      successRate:
        vendor.totalProjects > 0
          ? (vendor.successfulProjects / vendor.totalProjects) * 100
          : 0,
      averageDeliveryTime: vendor.averageDeliveryTime || 0,
      onTimeDeliveryRate: vendor.onTimeDeliveryRate?.toNumber() || 0,
      totalSpent: vendor.totalSpent,
      averageOrderValue: vendor.averageOrderValue || new Decimal(0),
      overallRating: vendor.overallRating,
      qualityScore: avgQuality,
      timelinessScore: avgTimeliness,
      costScore: avgCost,
      communicationScore: avgCommunication,
      technicalScore: avgTechnical,
    }
  }

  /**
   * Create vendor contract
   */
  async createContract(
    vendorId: string,
    projectId: string,
    contractNumber: string,
    title: string,
    startDate: Date,
    endDate: Date,
    value: Decimal,
    contractType: string = 'supply',
    paymentTerms: string = 'net30',
    description?: string
  ): Promise<string> {
    const vendor = await db.query.vendors.findFirst({
      where: eq(schema.vendors.id, vendorId),
    })

    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`)
    }

    const contractId = `VC-${Date.now()}`

    await db.insert(schema.vendor_contracts).values({
      vendorId,
      projectId: projectId || null,
      contractNumber,
      title,
      description,
      contractType: contractType as any,
      startDate,
      endDate,
      value,
      currency: 'THB',
      paymentTerms,
      status: 'draft',
    })

    return contractId
  }

  /**
   * Sign contract
   */
  async signContract(
    contractId: string,
    signedBy: string,
    signedDate: Date = new Date()
  ): Promise<void> {
    const contract = await db.query.vendor_contracts.findFirst({
      where: eq(schema.vendor_contracts.id, contractId),
    })

    if (!contract) {
      throw new Error(`Contract ${contractId} not found`)
    }

    await db
      .update(schema.vendor_contracts)
      .set({
        status: 'signed',
        signingDate: signedDate,
      })
      .where(eq(schema.vendor_contracts.id, contractId))
  }

  /**
   * Get vendor contracts
   */
  async getVendorContracts(
    vendorId: string,
    status?: string
  ): Promise<Array<any>> {
    const whereConditions: any[] = [
      eq(schema.vendor_contracts.vendorId, vendorId),
    ]

    if (status) {
      whereConditions.push(eq(schema.vendor_contracts.status, status))
    }

    return db.query.vendor_contracts.findMany({
      where: whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0],
    })
  }

  /**
   * Calculate vendor cost competitiveness
   * Lower scores are better (lower cost)
   */
  async getVendorCostAnalysis(
    vendorId: string,
    category?: string
  ): Promise<{
    vendorId: string
    averageCost: Decimal
    costRank: string
    recommendation: string
  }> {
    // Get all vendor payments
    const payments = await db.query.vendor_payments.findMany({
      where: eq(schema.vendor_payments.vendorId, vendorId),
    })

    if (payments.length === 0) {
      return {
        vendorId,
        averageCost: new Decimal(0),
        costRank: 'no-data',
        recommendation: 'Insufficient data for cost analysis',
      }
    }

    const totalCost = payments.reduce(
      (sum, p) => sum.plus(p.amount),
      new Decimal(0)
    )
    const averageCost = totalCost.div(payments.length)

    // Compare with other vendors (simplified)
    const allPayments = await db.query.vendor_payments.findMany({})

    const allAverages = new Map<string, Decimal>()
    for (const payment of allPayments) {
      const current = allAverages.get(payment.vendorId) || new Decimal(0)
      allAverages.set(payment.vendorId, current.plus(payment.amount))
    }

    const avgCosts = Array.from(allAverages.entries())
      .map(([vId, total]) => ({
        vendorId: vId,
        average: total.div(
          payments.filter(p => p.vendorId === vId).length
        ),
      }))
      .sort((a, b) => a.average.toNumber() - b.average.toNumber())

    const rank = avgCosts.findIndex(vc => vc.vendorId === vendorId)
    const percentile =
      ((rank + 1) / Math.max(avgCosts.length, 1)) * 100

    let costRank = 'average'
    let recommendation = 'Maintain current relationship'

    if (percentile <= 33) {
      costRank = 'excellent'
      recommendation = 'Top 33% - Preferred vendor for cost'
    } else if (percentile <= 66) {
      costRank = 'good'
      recommendation = 'Middle tier - Consider for specific needs'
    } else {
      costRank = 'expensive'
      recommendation = 'Review alternatives or negotiate rates'
    }

    return {
      vendorId,
      averageCost,
      costRank,
      recommendation,
    }
  }

  /**
   * Generate vendor scorecard
   */
  async generateVendorScorecard(vendorId: string): Promise<object> {
    const performance = await this.getVendorPerformance(vendorId)
    const costAnalysis = await this.getVendorCostAnalysis(vendorId)

    return {
      vendorName: performance.vendorName,
      overallRating: performance.overallRating,
      
      performanceMetrics: {
        quality: performance.qualityScore.toFixed(1),
        timeliness: performance.timelinessScore.toFixed(1),
        cost: performance.costScore.toFixed(1),
        communication: performance.communicationScore.toFixed(1),
        technical: performance.technicalScore.toFixed(1),
      },

      projectMetrics: {
        totalProjects: performance.totalProjects,
        successRate: `${performance.successRate.toFixed(1)}%`,
        averageDeliveryTime: `${performance.averageDeliveryTime} days`,
        onTimeRate: `${performance.onTimeDeliveryRate.toFixed(1)}%`,
      },

      financialMetrics: {
        totalSpent: performance.totalSpent.toFixed(2),
        averageOrder: performance.averageOrderValue.toFixed(2),
        costRank: costAnalysis.costRank,
        recommendation: costAnalysis.recommendation,
      },

      recommendation: this.generateVendorRecommendation(performance, costAnalysis),
    }
  }

  /**
   * Generate vendor recommendation
   */
  private generateVendorRecommendation(
    performance: VendorPerformance,
    costAnalysis: {
      averageCost: Decimal
      costRank: string
      recommendation: string
    }
  ): string {
    const overallScore =
      (performance.qualityScore.toNumber() +
        performance.timelinessScore.toNumber() +
        performance.costScore.toNumber() +
        performance.communicationScore.toNumber() +
        performance.technicalScore.toNumber()) /
      5

    if (overallScore >= 8 && costAnalysis.costRank !== 'expensive') {
      return 'Excellent vendor - Recommend for primary contracts'
    } else if (overallScore >= 6) {
      return 'Good vendor - Suitable for most projects'
    } else if (overallScore >= 4) {
      return 'Acceptable vendor - Use for specific needs only'
    } else {
      return 'Poor performer - Consider replacement or improvement plan'
    }
  }
}

export default new VendorService()
