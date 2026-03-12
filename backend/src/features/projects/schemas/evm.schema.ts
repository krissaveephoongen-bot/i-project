import { z } from 'zod'

// ============================================================================
// EVM Validation Schemas
// ============================================================================

export const createSnapshotSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  periodStart: z.string().datetime('Invalid date format'),
  periodEnd: z.string().datetime('Invalid date format'),
  calculatedBy: z.string().min(1, 'Calculator ID required'),
})

export const getWBSHierarchySchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
})

export const updateTaskProgressSchema = z.object({
  taskId: z.string().min(1, 'Task ID required'),
  actualProgress: z
    .number()
    .min(0, 'Progress must be >= 0')
    .max(100, 'Progress must be <= 100'),
})

export const getEVMMetricsSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  asOfDate: z.string().datetime('Invalid date format').optional(),
})

export const createBaselineSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  baselineNumber: z.number().min(0, 'Baseline number must be >= 0'),
  baselineType: z
    .enum(['performance', 'budget', 'schedule'])
    .default('performance'),
})

export const getBaselineSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  baselineNumber: z.number().min(0, 'Baseline number must be >= 0'),
})

export const getScurveDataSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  startDate: z.string().datetime('Invalid date format').optional(),
  endDate: z.string().datetime('Invalid date format').optional(),
})

// Types
export type CreateSnapshotRequest = z.infer<typeof createSnapshotSchema>
export type GetWBSHierarchyRequest = z.infer<typeof getWBSHierarchySchema>
export type UpdateTaskProgressRequest = z.infer<typeof updateTaskProgressSchema>
export type GetEVMMetricsRequest = z.infer<typeof getEVMMetricsSchema>
export type CreateBaselineRequest = z.infer<typeof createBaselineSchema>
export type GetBaselineRequest = z.infer<typeof getBaselineSchema>
export type GetScurveDataRequest = z.infer<typeof getScurveDataSchema>

export const evmSchemas = {
  createSnapshot: createSnapshotSchema,
  getWBSHierarchy: getWBSHierarchySchema,
  updateTaskProgress: updateTaskProgressSchema,
  getEVMMetrics: getEVMMetricsSchema,
  createBaseline: createBaselineSchema,
  getBaseline: getBaselineSchema,
  getScurveData: getScurveDataSchema,
}
