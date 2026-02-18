import Joi from 'joi';
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '@/lib/enums';

export const createExpenseSchema = Joi.object({
  date: Joi.date().required().messages({
    'any.required': 'Date is required',
    'date.base': 'Date must be a valid date',
  }),
  projectId: Joi.string().uuid().required().messages({
    'any.required': 'Project ID is required',
    'string.guid': 'Project ID must be a valid UUID',
  }),
  taskId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().required().messages({
    'any.required': 'User ID is required',
    'string.guid': 'User ID must be a valid UUID',
  }),
  amount: Joi.number().positive().required().messages({
    'any.required': 'Amount is required',
    'number.positive': 'Amount must be greater than 0',
  }),
  category: Joi.string()
    .valid(...EXPENSE_CATEGORIES)
    .required()
    .messages({
      'any.required': 'Category is required',
      'any.only': `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
    }),
  description: Joi.string().max(500).required().messages({
    'any.required': 'Description is required',
    'string.max': 'Description cannot exceed 500 characters',
  }),
  receiptUrl: Joi.string().uri().optional(),
  notes: Joi.string().max(1000).optional(),
});

export const updateExpenseSchema = Joi.object({
  date: Joi.date().optional(),
  projectId: Joi.string().uuid().optional(),
  taskId: Joi.string().uuid().optional().allow(null),
  amount: Joi.number().positive().optional(),
  category: Joi.string()
    .valid(...EXPENSE_CATEGORIES)
    .optional(),
  description: Joi.string().max(500).optional(),
  receiptUrl: Joi.string().uri().optional().allow(null),
  notes: Joi.string().max(1000).optional(),
  status: Joi.string()
    .valid(...EXPENSE_STATUSES)
    .optional(),
});

export const approveExpenseSchema = Joi.object({
  approvedBy: Joi.string().uuid().required().messages({
    'any.required': 'Approver ID is required',
  }),
});

export const rejectExpenseSchema = Joi.object({
  approvedBy: Joi.string().uuid().required().messages({
    'any.required': 'Approver ID is required',
  }),
  reason: Joi.string().max(500).optional(),
});
