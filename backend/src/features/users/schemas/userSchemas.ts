import Joi from "joi";

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  avatar: Joi.string().uri().optional(),
  department: Joi.string().max(100).optional(),
  position: Joi.string().max(100).optional(),
  phone: Joi.string().max(20).optional(),
  hourlyRate: Joi.number().min(0).optional(),
  role: Joi.string().valid("admin", "manager", "employee", "vendor").optional(),
  isActive: Joi.boolean().optional(),
});
