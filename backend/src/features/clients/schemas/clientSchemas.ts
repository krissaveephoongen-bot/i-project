import Joi from 'joi';

export const createClientSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Client name must be at least 2 characters long',
    'string.max': 'Client name cannot exceed 200 characters',
    'any.required': 'Client name is required',
  }),
  email: Joi.string().email().optional().allow(null).messages({
    'string.email': 'Invalid email format',
  }),
  phone: Joi.string().max(20).optional().allow(null).messages({
    'string.max': 'Phone number cannot exceed 20 characters',
  }),
  taxId: Joi.string()
    .regex(/^\d{13}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Tax ID must be exactly 13 digits',
    }),
  address: Joi.string().max(500).optional().allow(null).messages({
    'string.max': 'Address cannot exceed 500 characters',
  }),
  notes: Joi.string().max(1000).optional().allow(null).messages({
    'string.max': 'Notes cannot exceed 1000 characters',
  }),
});

export const updateClientSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  email: Joi.string().email().optional().allow(null),
  phone: Joi.string().max(20).optional().allow(null),
  taxId: Joi.string()
    .regex(/^\d{13}$/)
    .optional()
    .allow(null),
  address: Joi.string().max(500).optional().allow(null),
  notes: Joi.string().max(1000).optional().allow(null),
});
