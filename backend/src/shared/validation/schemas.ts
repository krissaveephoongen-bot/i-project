/**
 * Joi Validation Schemas
 * Centralized validation for all API endpoints
 */

import Joi from "joi";

// Common field schemas
const emailSchema = Joi.string().email().required().trim().lowercase();
const passwordSchema = Joi.string().min(8).required();
const idSchema = Joi.string().uuid().required();
const dateSchema = Joi.date().iso().required();
const dateOptional = Joi.date().iso();
const numberPositive = Joi.number().positive().required();
const stringRequired = Joi.string().required().trim();
const stringOptional = Joi.string().trim();

// ===================
// AUTH SCHEMAS
// ===================
export const authSchemas = {
  login: Joi.object({
    email: emailSchema,
    password: passwordSchema,
  }),

  register: Joi.object({
    name: stringRequired.max(255),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    role: Joi.string().valid("admin", "manager", "employee").optional(),
  }),

  forgotPassword: Joi.object({
    email: emailSchema,
  }),

  resetPassword: Joi.object({
    token: stringRequired,
    password: passwordSchema,
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  }),

  changePassword: Joi.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};

// ===================
// PROJECT SCHEMAS
// ===================
export const projectSchemas = {
  create: Joi.object({
    name: stringRequired.max(255),
    description: stringOptional.max(1000),
    budget: numberPositive,
    managerId: idSchema,
    startDate: dateSchema,
    endDate: dateOptional,
  }),

  update: Joi.object({
    name: stringOptional.max(255),
    description: stringOptional.max(1000),
    budget: Joi.number().positive().optional(),
    managerId: Joi.string().uuid().optional(),
    startDate: dateOptional,
    endDate: dateOptional,
    status: Joi.string()
      .valid("planning", "active", "completed", "archived")
      .optional(),
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string()
      .valid("planning", "active", "completed", "archived")
      .optional(),
    search: stringOptional,
    sortBy: Joi.string()
      .valid("name", "budget", "startDate", "createdAt")
      .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),

  delete: Joi.object({
    id: idSchema,
  }),
};

// ===================
// TASK SCHEMAS
// ===================
export const taskSchemas = {
  create: Joi.object({
    projectId: idSchema,
    title: stringRequired.max(255),
    description: stringOptional.max(1000),
    priority: Joi.string()
      .valid("low", "medium", "high", "critical")
      .default("medium"),
    assignedTo: Joi.string().uuid().optional(),
    dueDate: dateOptional,
  }),

  update: Joi.object({
    title: stringOptional.max(255),
    description: stringOptional.max(1000),
    status: Joi.string()
      .valid("open", "in_progress", "completed", "cancelled")
      .optional(),
    priority: Joi.string()
      .valid("low", "medium", "high", "critical")
      .optional(),
    assignedTo: Joi.string().uuid().optional(),
    dueDate: dateOptional,
    progress: Joi.number().min(0).max(100).optional(),
  }),

  list: Joi.object({
    projectId: Joi.string().uuid().optional(),
    status: Joi.string()
      .valid("open", "in_progress", "completed", "cancelled")
      .optional(),
    priority: Joi.string()
      .valid("low", "medium", "high", "critical")
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

// ===================
// TIMESHEET SCHEMAS
// ===================
export const timesheetSchemas = {
  createEntry: Joi.object({
    projectId: idSchema,
    taskId: Joi.string().uuid().optional(),
    date: dateSchema,
    hours: Joi.number().min(0).max(24).required(),
    description: stringOptional,
    workType: Joi.string()
      .valid("project", "office", "other")
      .default("project"),
  }),

  submitTimesheet: Joi.object({
    month: Joi.string()
      .pattern(/^\d{4}-\d{2}$/)
      .required(), // YYYY-MM format
    entries: Joi.array()
      .items(
        Joi.object({
          id: idSchema,
          date: dateSchema,
          hours: Joi.number().min(0).max(24).required(),
        }),
      )
      .min(1)
      .required(),
  }),

  list: Joi.object({
    userId: Joi.string().uuid().optional(),
    startDate: dateOptional,
    endDate: dateOptional,
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

// ===================
// EXPENSE SCHEMAS
// ===================
export const expenseSchemas = {
  create: Joi.object({
    projectId: Joi.string().uuid().optional(),
    amount: numberPositive,
    category: stringRequired.max(100),
    description: stringRequired.max(500),
    date: dateSchema,
    receipt: stringOptional,
  }),

  update: Joi.object({
    amount: Joi.number().positive().optional(),
    category: stringOptional.max(100),
    description: stringOptional.max(500),
    date: dateOptional,
    status: Joi.string()
      .valid("draft", "submitted", "approved", "rejected", "paid")
      .optional(),
  }),

  list: Joi.object({
    status: Joi.string()
      .valid("draft", "submitted", "approved", "rejected", "paid")
      .optional(),
    startDate: dateOptional,
    endDate: dateOptional,
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  approve: Joi.object({
    id: idSchema,
  }),

  reject: Joi.object({
    id: idSchema,
    reason: stringRequired.max(500),
  }),
};

// ===================
// CLIENT SCHEMAS
// ===================
export const clientSchemas = {
  create: Joi.object({
    name: stringRequired.max(255),
    email: emailSchema,
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-()]{7,}$/)
      .optional(),
    companyName: stringOptional.max(255),
    address: stringOptional.max(500),
    taxId: stringOptional.max(50),
  }),

  update: Joi.object({
    name: stringOptional.max(255),
    email: Joi.string().email().optional().trim().lowercase(),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-()]{7,}$/)
      .optional(),
    companyName: stringOptional.max(255),
    address: stringOptional.max(500),
    taxId: stringOptional.max(50),
    status: Joi.string().valid("active", "inactive", "archived").optional(),
  }),

  list: Joi.object({
    status: Joi.string().valid("active", "inactive", "archived").optional(),
    search: stringOptional,
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

// ===================
// USER SCHEMAS
// ===================
export const userSchemas = {
  create: Joi.object({
    name: stringRequired.max(255),
    email: emailSchema,
    password: passwordSchema,
    role: Joi.string().valid("admin", "manager", "employee").required(),
    department: stringOptional.max(100),
    position: stringOptional.max(100),
  }),

  update: Joi.object({
    name: stringOptional.max(255),
    email: Joi.string().email().optional().trim().lowercase(),
    role: Joi.string().valid("admin", "manager", "employee").optional(),
    department: stringOptional.max(100),
    position: stringOptional.max(100),
    status: Joi.string().valid("active", "inactive").optional(),
  }),

  list: Joi.object({
    role: Joi.string().valid("admin", "manager", "employee").optional(),
    status: Joi.string().valid("active", "inactive").optional(),
    search: stringOptional,
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

// ===================
// PAGINATION SCHEMAS
// ===================
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: stringOptional,
  sortOrder: Joi.string().valid("asc", "desc").optional(),
});
