import { z } from 'zod'

// ============================================================================
// Schedule & Penalty Validation Schemas
// ============================================================================

export const getScheduleHealthSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  asOfDate: z.string().datetime('Invalid date format').optional(),
})

export const recordProgressSchema = z.object({
  scheduleId: z.string().min(1, 'Schedule ID required'),
  dataDate: z.string().datetime('Invalid date format'),
  actualProgress: z
    .number()
    .min(0, 'Progress must be >= 0')
    .max(100, 'Progress must be <= 100'),
})

export const calculatePenaltySchema = z.object({
  scheduleId: z.string().min(1, 'Schedule ID required'),
  penaltyStructureId: z.string().min(1, 'Structure ID required'),
  daysLate: z.number().min(0, 'Days late must be >= 0'),
  startDate: z.string().datetime('Invalid date format'),
})

export const applyPenaltySchema = z.object({
  scheduleId: z.string().min(1, 'Schedule ID required'),
  penaltyStructureId: z.string().min(1, 'Structure ID required'),
  daysLate: z.number().min(0, 'Days late must be >= 0'),
  startDate: z.string().datetime('Invalid date format'),
  approvedBy: z.string().min(1, 'Approver ID required'),
  notes: z.string().optional(),
})

export const waivePenaltySchema = z.object({
  penaltyId: z.string().min(1, 'Penalty ID required'),
  waivedAmount: z.string().refine(val => !isNaN(parseFloat(val)), 'Invalid decimal'),
  reason: z.string().min(1, 'Waiver reason required'),
  waivedBy: z.string().min(1, 'Waived by user ID required'),
})

export const requestExtensionSchema = z.object({
  scheduleId: z.string().min(1, 'Schedule ID required'),
  requestedDays: z.number().min(1, 'Extension days must be >= 1'),
  reason: z.string().min(1, 'Extension reason required'),
  requestedBy: z.string().min(1, 'Requester ID required'),
  notes: z.string().optional(),
})

export const approveExtensionSchema = z.object({
  extensionId: z.string().min(1, 'Extension ID required'),
  approvedDays: z.number().min(1, 'Approved days must be >= 1'),
  approvedBy: z.string().min(1, 'Approver ID required'),
})

export const generateRecoveryPlanSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  triggerDate: z.string().datetime('Invalid date format').optional(),
})

export const getMilestoneSchema = z.object({
  scheduleId: z.string().min(1, 'Schedule ID required'),
})

// Types
export type GetScheduleHealthRequest = z.infer<typeof getScheduleHealthSchema>
export type RecordProgressRequest = z.infer<typeof recordProgressSchema>
export type CalculatePenaltyRequest = z.infer<typeof calculatePenaltySchema>
export type ApplyPenaltyRequest = z.infer<typeof applyPenaltySchema>
export type WaivePenaltyRequest = z.infer<typeof waivePenaltySchema>
export type RequestExtensionRequest = z.infer<typeof requestExtensionSchema>
export type ApproveExtensionRequest = z.infer<typeof approveExtensionSchema>
export type GenerateRecoveryPlanRequest = z.infer<typeof generateRecoveryPlanSchema>
export type GetMilestoneRequest = z.infer<typeof getMilestoneSchema>

export const scheduleSchemas = {
  getHealth: getScheduleHealthSchema,
  recordProgress: recordProgressSchema,
  calculatePenalty: calculatePenaltySchema,
  applyPenalty: applyPenaltySchema,
  waivePenalty: waivePenaltySchema,
  requestExtension: requestExtensionSchema,
  approveExtension: approveExtensionSchema,
  generateRecoveryPlan: generateRecoveryPlanSchema,
  getMilestone: getMilestoneSchema,
}
