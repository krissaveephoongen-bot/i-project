import Joi from 'joi';
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from '@/lib/enums';

export const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Project name must be at least 2 characters long',
    'string.max': 'Project name cannot exceed 100 characters',
    'any.required': 'Project name is required',
  }),
  description: Joi.string().max(500).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional().messages({
    'date.min': 'End date must be after start date',
  }),
  budget: Joi.number().min(0).optional(),
  clientId: Joi.string().uuid().optional(),
  teamMembers: Joi.array().items(Joi.string().uuid()).optional(),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional().messages({
    'date.min': 'End date must be after start date',
  }),
  budget: Joi.number().min(0).optional(),
  status: Joi.string().valid(...PROJECT_STATUSES).optional(),
  progress: Joi.number().min(0).max(100).optional(),
  actualCost: Joi.number().min(0).optional(),
  priority: Joi.string().valid(...PROJECT_PRIORITIES).optional(),
  category: Joi.string().max(50).optional(),
  clientId: Joi.string().uuid().optional(),
});

export const addTeamMemberSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'any.required': 'User ID is required',
    'string.guid': 'User ID must be a valid UUID',
  }),
});
