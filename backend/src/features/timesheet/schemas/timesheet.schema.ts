import { z } from 'zod'

// ============================================================================
// Timesheet Validation Schemas
// ============================================================================

export const calculateCostSchema = z.object({
  entryId: z.string().min(1, 'Entry ID required'),
})

export const recordCostSchema = z.object({
  entryId: z.string().min(1, 'Entry ID required'),
})

export const approveCostSchema = z.object({
  entryId: z.string().min(1, 'Entry ID required'),
})

export const processWeeklySchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  weekStartDate: z.string().datetime('Invalid date format'),
  weekEndDate: z.string().datetime('Invalid date format'),
})

export const generateDailySummarySchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  date: z.string().datetime('Invalid date format'),
})

export const getMonthlySchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  year: z.number().min(2000),
  month: z.number().min(1).max(12),
})

export const exportPayrollSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
})

export const batchProcessSchema = z.object({
  limit: z.number().default(100),
})

// Types
export type CalculateCostRequest = z.infer<typeof calculateCostSchema>
export type RecordCostRequest = z.infer<typeof recordCostSchema>
export type ApproveCostRequest = z.infer<typeof approveCostSchema>
export type ProcessWeeklyRequest = z.infer<typeof processWeeklySchema>
export type GenerateDailySummaryRequest = z.infer<typeof generateDailySummarySchema>
export type GetMonthlyRequest = z.infer<typeof getMonthlySchema>
export type ExportPayrollRequest = z.infer<typeof exportPayrollSchema>
export type BatchProcessRequest = z.infer<typeof batchProcessSchema>

export const timesheetSchemas = {
  calculateCost: calculateCostSchema,
  recordCost: recordCostSchema,
  approveCost: approveCostSchema,
  processWeekly: processWeeklySchema,
  generateDailySummary: generateDailySummarySchema,
  getMonthly: getMonthlySchema,
  exportPayroll: exportPayrollSchema,
  batchProcess: batchProcessSchema,
}
