import { z } from 'zod';

/**
 * Form Validation Schemas using Zod
 * Centralized validation rules for all forms
 */

// Reports & Analytics
export const reportFilterSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  reportType: z.enum(['overview', 'projects', 'tasks', 'team', 'financial']).optional(),
  exportFormat: z.enum(['pdf', 'csv', 'json']).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['startDate'],
  }
);

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;

// Timesheet Approvals
export const timesheetApprovalSchema = z.object({
  approvalId: z.string().min(1, 'Approval ID is required'),
  status: z.enum(['approved', 'rejected']),
  comments: z.string().min(0).max(500, 'Comments must be less than 500 characters').optional(),
  rejectionReason: z.string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must be less than 500 characters')
    .optional(),
}).refine(
  (data) => {
    if (data.status === 'rejected') {
      return data.rejectionReason && data.rejectionReason.length > 0;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting',
    path: ['rejectionReason'],
  }
);

export type TimesheetApprovalInput = z.infer<typeof timesheetApprovalSchema>;

export const bulkTimesheetApprovalSchema = z.object({
  approvalIds: z.array(z.string().min(1)).min(1, 'Select at least one approval'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must be less than 500 characters')
    .optional(),
}).refine(
  (data) => {
    if (data.action === 'reject') {
      return data.rejectionReason && data.rejectionReason.length > 0;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting',
    path: ['rejectionReason'],
  }
);

export type BulkTimesheetApprovalInput = z.infer<typeof bulkTimesheetApprovalSchema>;

// Timesheet Reports
export const timesheetReportFilterSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']),
  year: z.number().int().min(2020).max(new Date().getFullYear() + 1),
  week: z.number().int().min(1).max(52).optional(),
  month: z.number().int().min(1).max(12).optional(),
  userId: z.string().optional(),
  exportFormat: z.enum(['csv', 'pdf', 'json']).optional(),
}).refine(
  (data) => {
    if (data.period === 'week') {
      return data.week !== undefined;
    }
    if (data.period === 'month') {
      return data.month !== undefined;
    }
    return true;
  },
  {
    message: 'Week is required for weekly reports, month for monthly reports',
    path: ['week'],
  }
);

export type TimesheetReportFilterInput = z.infer<typeof timesheetReportFilterSchema>;

// Common schemas for reuse
export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'Start date must be before end date',
    path: ['startDate'],
  }
);

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const requiredStringSchema = z
  .string()
  .min(1, 'This field is required')
  .trim();

export const optionalStringSchema = z
  .string()
  .max(500, 'Text must be less than 500 characters')
  .optional();

// Utility function to extract validation errors
export const getValidationErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};

// Utility function for async validation
export const validateAsync = async <T,>(
  schema: z.ZodSchema,
  data: unknown
): Promise<{ success: boolean; data?: T; errors?: Record<string, string> }> => {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: getValidationErrors(error) };
    }
    return { success: false, errors: { _form: 'Validation failed' } };
  }
};
