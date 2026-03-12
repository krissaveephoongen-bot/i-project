import { z } from 'zod'

// ============================================================================
// Vendor Validation Schemas
// ============================================================================

export const createVendorSchema = z.object({
  code: z.string().min(1, 'Vendor code required'),
  name: z.string().min(1, 'Vendor name required'),
  vendorType: z.enum(['supplier', 'contractor', 'equipment', 'outsourcer', 'consultant']),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone required'),
  address: z.string().min(1, 'Address required'),
  city: z.string().min(1, 'City required'),
  country: z.string().min(1, 'Country required'),
  category: z.string().optional(),
  taxId: z.string().optional(),
  licenseNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
})

export const recordPaymentSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID required'),
  contractId: z.string().optional(),
  projectId: z.string().optional(),
  paymentType: z.enum(['advance', 'milestone', 'installment', 'final', 'retainage']),
  amount: z.string().refine(val => !isNaN(parseFloat(val)), 'Invalid amount'),
  dueDate: z.string().datetime('Invalid date format'),
  paymentMethod: z
    .enum(['bank_transfer', 'cash', 'cheque', 'credit_card', 'online'])
    .default('bank_transfer'),
  notes: z.string().optional(),
})

export const confirmPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID required'),
  paidDate: z.string().datetime('Invalid date format'),
  transactionId: z.string().optional(),
})

export const createKPIEvaluationSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID required'),
  projectId: z.string().optional(),
  evaluationPeriod: z.string().min(1, 'Evaluation period required'),
  qualityScore: z
    .string()
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10),
  timelinessScore: z
    .string()
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10),
  costScore: z
    .string()
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10),
  communicationScore: z
    .string()
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10),
  technicalScore: z
    .string()
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10),
  evaluatorId: z.string().min(1, 'Evaluator ID required'),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  recommendations: z.string().optional(),
})

export const createContractSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID required'),
  projectId: z.string().optional(),
  contractNumber: z.string().min(1, 'Contract number required'),
  title: z.string().min(1, 'Contract title required'),
  startDate: z.string().datetime('Invalid date format'),
  endDate: z.string().datetime('Invalid date format'),
  value: z.string().refine(val => !isNaN(parseFloat(val)), 'Invalid value'),
  contractType: z
    .enum(['framework', 'project', 'supply', 'service', 'maintenance'])
    .default('supply'),
  paymentTerms: z
    .enum(['immediate', 'net15', 'net30', 'net45', 'net60', 'custom'])
    .default('net30'),
  description: z.string().optional(),
})

export const signContractSchema = z.object({
  contractId: z.string().min(1, 'Contract ID required'),
  signedBy: z.string().min(1, 'Signed by user ID required'),
  signedDate: z.string().datetime('Invalid date format').optional(),
})

export const getPerformanceSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID required'),
})

export const getCostAnalysisSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID required'),
  category: z.string().optional(),
})

export const getScorecardSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID required'),
})

// Types
export type CreateVendorRequest = z.infer<typeof createVendorSchema>
export type RecordPaymentRequest = z.infer<typeof recordPaymentSchema>
export type ConfirmPaymentRequest = z.infer<typeof confirmPaymentSchema>
export type CreateKPIEvaluationRequest = z.infer<typeof createKPIEvaluationSchema>
export type CreateContractRequest = z.infer<typeof createContractSchema>
export type SignContractRequest = z.infer<typeof signContractSchema>
export type GetPerformanceRequest = z.infer<typeof getPerformanceSchema>
export type GetCostAnalysisRequest = z.infer<typeof getCostAnalysisSchema>
export type GetScorecardRequest = z.infer<typeof getScorecardSchema>

export const vendorSchemas = {
  createVendor: createVendorSchema,
  recordPayment: recordPaymentSchema,
  confirmPayment: confirmPaymentSchema,
  createKPIEvaluation: createKPIEvaluationSchema,
  createContract: createContractSchema,
  signContract: signContractSchema,
  getPerformance: getPerformanceSchema,
  getCostAnalysis: getCostAnalysisSchema,
  getScorecard: getScorecardSchema,
}
