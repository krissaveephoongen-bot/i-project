import { z } from 'zod'

// ============================================================================
// Billing Validation Schemas
// ============================================================================

export const createInvoiceSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  customerId: z.string().min(1, 'Customer ID required'),
  invoiceDate: z.string().datetime('Invalid date format'),
  dueDate: z.string().datetime('Invalid date format'),
  lineItems: z.array(
    z.object({
      description: z.string().min(1, 'Description required'),
      quantity: z.number().positive('Quantity must be positive'),
      unitPrice: z.string().refine(val => !isNaN(parseFloat(val)), 'Invalid price'),
      amount: z.string().refine(val => !isNaN(parseFloat(val)), 'Invalid amount'),
    })
  ),
  notes: z.string().optional(),
})

export const sendInvoiceSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID required'),
  sentDate: z.string().datetime('Invalid date format').optional(),
})

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID required'),
  customerId: z.string().min(1, 'Customer ID required'),
  projectId: z.string().min(1, 'Project ID required'),
  paymentAmount: z.string().refine(val => !isNaN(parseFloat(val)), 'Invalid amount'),
  paymentDate: z.string().datetime('Invalid date format'),
  paymentMethod: z.enum(['bank_transfer', 'cash', 'cheque', 'credit_card', 'online']),
  referenceNumber: z.string().optional(),
  transactionId: z.string().optional(),
})

export const generateInstallmentSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  totalAmount: z.string().refine(val => !isNaN(parseFloat(val)), 'Invalid amount'),
  installmentCount: z.number().min(1, 'Installment count must be >= 1'),
  startDate: z.string().datetime('Invalid date format'),
  intervalDays: z.number().default(30),
})

export const createMilestoneSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
  customerId: z.string().min(1, 'Customer ID required'),
  totalAmount: z.string().refine(val => !isNaN(parseFloat(val)), 'Invalid amount'),
})

export const getInvoiceStatusSchema = z.object({
  customerId: z.string().min(1, 'Customer ID required'),
})

export const getProjectFinancialsSchema = z.object({
  projectId: z.string().min(1, 'Project ID required'),
})

// Types
export type CreateInvoiceRequest = z.infer<typeof createInvoiceSchema>
export type SendInvoiceRequest = z.infer<typeof sendInvoiceSchema>
export type RecordPaymentRequest = z.infer<typeof recordPaymentSchema>
export type GenerateInstallmentRequest = z.infer<typeof generateInstallmentSchema>
export type CreateMilestoneRequest = z.infer<typeof createMilestoneSchema>
export type GetInvoiceStatusRequest = z.infer<typeof getInvoiceStatusSchema>
export type GetProjectFinancialsRequest = z.infer<typeof getProjectFinancialsSchema>

export const billingSchemas = {
  createInvoice: createInvoiceSchema,
  sendInvoice: sendInvoiceSchema,
  recordPayment: recordPaymentSchema,
  generateInstallment: generateInstallmentSchema,
  createMilestone: createMilestoneSchema,
  getInvoiceStatus: getInvoiceStatusSchema,
  getProjectFinancials: getProjectFinancialsSchema,
}
