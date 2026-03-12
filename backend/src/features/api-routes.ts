import { Router, Request, Response } from 'express'

// Import all controllers
import EVMController from './projects/controllers/evm.controller'
import ScheduleController from './schedule/controllers/schedule.controller'
import BillingController from './billing/controllers/billing.controller'
import VendorController from './vendors/controllers/vendor.controller'
import TimesheetCostController from './timesheet/controllers/timesheet-cost.controller'

// ============================================================================
// API ROUTES SETUP - Phase 3 Complete
// ============================================================================

export function setupAPIRoutes(app: Router) {
  // ========================================================================
  // EVM Routes (7 endpoints)
  // ========================================================================

  // Create EVM snapshot
  app.post('/api/projects/:id/evm/snapshot', (req, res) =>
    EVMController.createSnapshot(req, res)
  )

  // Get EVM metrics
  app.get('/api/projects/:id/evm/metrics', (req, res) =>
    EVMController.getMetrics(req, res)
  )

  // Get WBS hierarchy
  app.get('/api/projects/:id/wbs/hierarchy', (req, res) =>
    EVMController.getWBSHierarchy(req, res)
  )

  // Update task progress
  app.patch('/api/projects/:id/tasks/:taskId/progress', (req, res) =>
    EVMController.updateTaskProgress(req, res)
  )

  // Get S-curve data
  app.get('/api/projects/:id/scurve', (req, res) =>
    EVMController.getScurveData(req, res)
  )

  // Create baseline
  app.post('/api/projects/:id/baseline', (req, res) =>
    EVMController.createBaseline(req, res)
  )

  // Compare to baseline
  app.get('/api/projects/:id/evm/comparison', (req, res) =>
    EVMController.compareToBaseline(req, res)
  )

  // ========================================================================
  // Schedule Routes (9 endpoints)
  // ========================================================================

  // Get schedule health
  app.get('/api/projects/:id/schedule/health', (req, res) =>
    ScheduleController.getScheduleHealth(req, res)
  )

  // Record progress
  app.post('/api/projects/:id/schedule/progress', (req, res) =>
    ScheduleController.recordProgress(req, res)
  )

  // Calculate penalty
  app.post('/api/projects/:id/schedule/penalty/calculate', (req, res) =>
    ScheduleController.calculatePenalty(req, res)
  )

  // Apply penalty
  app.post('/api/projects/:id/schedule/penalty/apply', (req, res) =>
    ScheduleController.applyPenalty(req, res)
  )

  // Waive penalty
  app.patch('/api/projects/:id/schedule/penalty/:penaltyId/waive', (req, res) =>
    ScheduleController.waivePenalty(req, res)
  )

  // Request extension
  app.post('/api/projects/:id/schedule/extension/request', (req, res) =>
    ScheduleController.requestExtension(req, res)
  )

  // Approve extension
  app.post('/api/projects/:id/schedule/extension/:extensionId/approve', (req, res) =>
    ScheduleController.approveExtension(req, res)
  )

  // Generate recovery plan
  app.post('/api/projects/:id/schedule/recovery-plan', (req, res) =>
    ScheduleController.generateRecoveryPlan(req, res)
  )

  // Get compliance
  app.get('/api/projects/:id/schedule/compliance', (req, res) =>
    ScheduleController.getCompliance(req, res)
  )

  // Get milestones
  app.get('/api/projects/:id/schedule/milestones', (req, res) =>
    ScheduleController.getMilestones(req, res)
  )

  // Get penalties
  app.get('/api/projects/:id/schedule/penalties', (req, res) =>
    ScheduleController.getPenalties(req, res)
  )

  // ========================================================================
  // Billing Routes (10 endpoints)
  // ========================================================================

  // Create invoice
  app.post('/api/projects/:id/invoices', (req, res) =>
    BillingController.createInvoice(req, res)
  )

  // Send invoice
  app.post('/api/invoices/:id/send', (req, res) =>
    BillingController.sendInvoice(req, res)
  )

  // Record payment
  app.post('/api/invoices/:id/payment', (req, res) =>
    BillingController.recordPayment(req, res)
  )

  // Get invoice
  app.get('/api/invoices/:id', (req, res) =>
    BillingController.getInvoice(req, res)
  )

  // Get customer invoices
  app.get('/api/customers/:id/invoices', (req, res) =>
    BillingController.getCustomerInvoices(req, res)
  )

  // Get invoice status
  app.get('/api/customers/:id/invoice-status', (req, res) =>
    BillingController.getInvoiceStatus(req, res)
  )

  // Generate installment schedule
  app.post('/api/projects/:id/billing/installment-schedule', (req, res) =>
    BillingController.generateInstallmentSchedule(req, res)
  )

  // Create milestone billing
  app.post('/api/projects/:id/billing/milestone', (req, res) =>
    BillingController.createMilestoneBilling(req, res)
  )

  // Get project financials
  app.get('/api/projects/:id/financials', (req, res) =>
    BillingController.getProjectFinancials(req, res)
  )

  // Check overdue
  app.get('/api/billing/overdue', (req, res) =>
    BillingController.checkOverdue(req, res)
  )

  // ========================================================================
  // Vendor Routes (11 endpoints)
  // ========================================================================

  // Create vendor
  app.post('/api/vendors', (req, res) =>
    VendorController.createVendor(req, res)
  )

  // Get vendor
  app.get('/api/vendors/:id', (req, res) =>
    VendorController.getVendor(req, res)
  )

  // List vendors
  app.get('/api/vendors', (req, res) =>
    VendorController.listVendors(req, res)
  )

  // Record payment
  app.post('/api/vendors/:id/payment', (req, res) =>
    VendorController.recordPayment(req, res)
  )

  // Confirm payment
  app.patch('/api/vendors/:vendorId/payment/:paymentId/confirm', (req, res) =>
    VendorController.confirmPayment(req, res)
  )

  // Create evaluation
  app.post('/api/vendors/:id/evaluation', (req, res) =>
    VendorController.createEvaluation(req, res)
  )

  // Get performance
  app.get('/api/vendors/:id/performance', (req, res) =>
    VendorController.getPerformance(req, res)
  )

  // Create contract
  app.post('/api/vendors/:id/contract', (req, res) =>
    VendorController.createContract(req, res)
  )

  // Sign contract
  app.patch('/api/vendors/:vendorId/contract/:contractId/sign', (req, res) =>
    VendorController.signContract(req, res)
  )

  // Get contracts
  app.get('/api/vendors/:id/contracts', (req, res) =>
    VendorController.getContracts(req, res)
  )

  // Get cost analysis
  app.get('/api/vendors/:id/cost-analysis', (req, res) =>
    VendorController.getCostAnalysis(req, res)
  )

  // Get scorecard
  app.get('/api/vendors/:id/scorecard', (req, res) =>
    VendorController.getScorecard(req, res)
  )

  // ========================================================================
  // Timesheet Routes (8 endpoints)
  // ========================================================================

  // Calculate cost
  app.post('/api/timesheet/:id/cost/calculate', (req, res) =>
    TimesheetCostController.calculateCost(req, res)
  )

  // Record cost
  app.post('/api/timesheet/:id/cost/record', (req, res) =>
    TimesheetCostController.recordCost(req, res)
  )

  // Approve cost
  app.post('/api/timesheet/:id/cost/approve', (req, res) =>
    TimesheetCostController.approveCost(req, res)
  )

  // Process weekly
  app.post('/api/timesheet/weekly/process', (req, res) =>
    TimesheetCostController.processWeekly(req, res)
  )

  // Get daily summary
  app.get('/api/timesheet/:userId/daily/:date', (req, res) =>
    TimesheetCostController.getDailySummary(req, res)
  )

  // Get monthly summary
  app.get('/api/timesheet/:userId/monthly', (req, res) =>
    TimesheetCostController.getMonthly(req, res)
  )

  // Export payroll
  app.get('/api/timesheet/:userId/payroll', (req, res) =>
    TimesheetCostController.exportForPayroll(req, res)
  )

  // Batch process
  app.post('/api/timesheet/batch/process-approved', (req, res) =>
    TimesheetCostController.batchProcessApproved(req, res)
  )

  // Get project labor cost
  app.get('/api/projects/:projectId/labor-cost', (req, res) =>
    TimesheetCostController.getProjectLaborCost(req, res)
  )

  console.log('✅ Phase 3: All 45+ API endpoints registered')
  console.log('')
  console.log('EVM Endpoints: 7')
  console.log('Schedule Endpoints: 11')
  console.log('Billing Endpoints: 10')
  console.log('Vendor Endpoints: 12')
  console.log('Timesheet Endpoints: 9')
  console.log('━━━━━━━━━━━━━━━━━━━━')
  console.log('Total: 49 endpoints')
}

// ============================================================================
// ENDPOINT SUMMARY
// ============================================================================

export const endpointSummary = {
  evm: {
    createSnapshot: 'POST /api/projects/:id/evm/snapshot',
    getMetrics: 'GET /api/projects/:id/evm/metrics',
    getWBSHierarchy: 'GET /api/projects/:id/wbs/hierarchy',
    updateTaskProgress: 'PATCH /api/projects/:id/tasks/:taskId/progress',
    getScurveData: 'GET /api/projects/:id/scurve',
    createBaseline: 'POST /api/projects/:id/baseline',
    compareToBaseline: 'GET /api/projects/:id/evm/comparison',
  },
  schedule: {
    getScheduleHealth: 'GET /api/projects/:id/schedule/health',
    recordProgress: 'POST /api/projects/:id/schedule/progress',
    calculatePenalty: 'POST /api/projects/:id/schedule/penalty/calculate',
    applyPenalty: 'POST /api/projects/:id/schedule/penalty/apply',
    waivePenalty: 'PATCH /api/projects/:id/schedule/penalty/:penaltyId/waive',
    requestExtension: 'POST /api/projects/:id/schedule/extension/request',
    approveExtension: 'POST /api/projects/:id/schedule/extension/:extensionId/approve',
    generateRecoveryPlan: 'POST /api/projects/:id/schedule/recovery-plan',
    getCompliance: 'GET /api/projects/:id/schedule/compliance',
    getMilestones: 'GET /api/projects/:id/schedule/milestones',
    getPenalties: 'GET /api/projects/:id/schedule/penalties',
  },
  billing: {
    createInvoice: 'POST /api/projects/:id/invoices',
    sendInvoice: 'POST /api/invoices/:id/send',
    recordPayment: 'POST /api/invoices/:id/payment',
    getInvoice: 'GET /api/invoices/:id',
    getCustomerInvoices: 'GET /api/customers/:id/invoices',
    getInvoiceStatus: 'GET /api/customers/:id/invoice-status',
    generateInstallmentSchedule: 'POST /api/projects/:id/billing/installment-schedule',
    createMilestoneBilling: 'POST /api/projects/:id/billing/milestone',
    getProjectFinancials: 'GET /api/projects/:id/financials',
    checkOverdue: 'GET /api/billing/overdue',
  },
  vendor: {
    createVendor: 'POST /api/vendors',
    getVendor: 'GET /api/vendors/:id',
    listVendors: 'GET /api/vendors',
    recordPayment: 'POST /api/vendors/:id/payment',
    confirmPayment: 'PATCH /api/vendors/:vendorId/payment/:paymentId/confirm',
    createEvaluation: 'POST /api/vendors/:id/evaluation',
    getPerformance: 'GET /api/vendors/:id/performance',
    createContract: 'POST /api/vendors/:id/contract',
    signContract: 'PATCH /api/vendors/:vendorId/contract/:contractId/sign',
    getContracts: 'GET /api/vendors/:id/contracts',
    getCostAnalysis: 'GET /api/vendors/:id/cost-analysis',
    getScorecard: 'GET /api/vendors/:id/scorecard',
  },
  timesheet: {
    calculateCost: 'POST /api/timesheet/:id/cost/calculate',
    recordCost: 'POST /api/timesheet/:id/cost/record',
    approveCost: 'POST /api/timesheet/:id/cost/approve',
    processWeekly: 'POST /api/timesheet/weekly/process',
    getDailySummary: 'GET /api/timesheet/:userId/daily/:date',
    getMonthly: 'GET /api/timesheet/:userId/monthly',
    exportPayroll: 'GET /api/timesheet/:userId/payroll',
    batchProcessApproved: 'POST /api/timesheet/batch/process-approved',
    getProjectLaborCost: 'GET /api/projects/:projectId/labor-cost',
  },
}
