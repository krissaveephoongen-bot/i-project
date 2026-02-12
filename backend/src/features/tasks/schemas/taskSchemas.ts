import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Task title must be at least 2 characters long',
    'string.max': 'Task title cannot exceed 200 characters',
    'any.required': 'Task title is required',
  }),
  description: Joi.string().max(1000).optional(),
  projectId: Joi.string().uuid().required().messages({
    'any.required': 'Project ID is required',
    'string.guid': 'Project ID must be a valid UUID',
  }),
  assigneeId: Joi.string().uuid().optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid('todo', 'in_progress', 'in_review', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  assigneeId: Joi.string().uuid().optional(),
  dueDate: Joi.date().optional(),
});
