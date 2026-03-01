import Joi from "joi";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/enums";

export const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required().messages({
    "string.min": "Task title must be at least 2 characters long",
    "string.max": "Task title cannot exceed 200 characters",
    "any.required": "Task title is required",
  }),
  description: Joi.string().max(1000).optional(),
  projectId: Joi.string().uuid().required().messages({
    "any.required": "Project ID is required",
    "string.guid": "Project ID must be a valid UUID",
  }),
  assigneeId: Joi.string().uuid().optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.string()
    .valid(...TASK_PRIORITIES)
    .optional(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string()
    .valid(...TASK_STATUSES)
    .optional(),
  priority: Joi.string()
    .valid(...TASK_PRIORITIES)
    .optional(),
  assigneeId: Joi.string().uuid().optional(),
  dueDate: Joi.date().optional(),
});
