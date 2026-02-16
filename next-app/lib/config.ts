/**
 * API Configuration
 * Centralized configuration for API endpoints and defaults
 */

// Base API URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API Endpoints
export const API_ENDPOINTS = {
  // Timesheet
  TIMESHEET: "/api/timesheet",
  TIMESHEET_ENTRIES: "/api/timesheet/entries",
  TIMESHEET_SUMMARY: "/api/timesheet/summary",
  TIMESHEET_APPROVALS: "/api/timesheet/approvals",
  TIMESHEET_EXPORT: "/api/timesheet/export",

  // Leave
  LEAVE: "/api/leave",
  LEAVE_REQUESTS: "/api/leave/requests",
  LEAVE_ALLOCATION: "/api/leave/allocation",
  LEAVE_BALANCE: "/api/leave/balance",
  LEAVE_APPROVALS: "/api/leave/approvals",

  // Projects
  PROJECTS: "/api/projects",

  // Users
  USERS: "/api/users",
};

// Default timesheet settings
export const TIMESHEET_DEFAULTS = {
  DAILY_HOURS: 8,
  MINIMUM_HOURS: 4,
  MAXIMUM_DAILY_HOURS: 10,
  BREAK_DURATION_MINUTES: 60,
  TIME_PICKER_INTERVAL: 15, // minutes
  BUSINESS_DAYS: [1, 2, 3, 4, 5], // Mon-Fri
  WORKING_HOURS_START: "08:00",
  WORKING_HOURS_END: "17:00",
};

// Default leave settings
export const LEAVE_DEFAULTS = {
  ANNUAL_LEAVE_PER_YEAR: 15,
  SICK_LEAVE_PER_YEAR: 30,
  PERSONAL_LEAVE_PER_YEAR: 3,
  MATERNITY_LEAVE_DAYS: 90,
  WEEKEND_DAYS: [0, 6], // Sun, Sat
};

// API Request timeout (ms)
export const API_TIMEOUT = 30000;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Form validation defaults
export const VALIDATION = {
  MIN_COMMENT_LENGTH: 3,
  MAX_COMMENT_LENGTH: 500,
  MIN_REASON_LENGTH: 5,
  MAX_REASON_LENGTH: 500,
};

// Cache settings
export const CACHE = {
  TIMESHEET_ENTRIES_TTL: 5 * 60 * 1000, // 5 minutes
  LEAVE_BALANCE_TTL: 10 * 60 * 1000, // 10 minutes
  USER_ALLOCATIONS_TTL: 60 * 60 * 1000, // 1 hour
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  TIMEOUT: "Request timeout. Please try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "An error occurred on the server. Please try again later.",
  INSUFFICIENT_BALANCE: "Insufficient leave balance.",
  INVALID_DATE_RANGE: "Invalid date range.",
  OVERLAPPING_LEAVE: "Leave request overlaps with existing leave.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  ENTRY_CREATED: "Time entry created successfully.",
  ENTRY_UPDATED: "Time entry updated successfully.",
  ENTRY_DELETED: "Time entry deleted successfully.",
  ENTRY_SUBMITTED: "Time entries submitted for approval.",
  LEAVE_CREATED: "Leave request created successfully.",
  LEAVE_UPDATED: "Leave request updated successfully.",
  LEAVE_CANCELLED: "Leave request cancelled successfully.",
  APPROVAL_GRANTED: "Leave approved successfully.",
  APPROVAL_REJECTED: "Leave rejected successfully.",
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "MMM d, yyyy",
  DISPLAY_WITH_DAY: "EEE, MMM d, yyyy",
  ISO: "yyyy-MM-dd",
  API: "yyyy-MM-dd",
  DISPLAY_SHORT: "M/d",
  DISPLAY_LONG: "MMMM d, yyyy",
};

// Time formats
export const TIME_FORMATS = {
  DISPLAY: "HH:mm",
  ISO: "HH:mm:ss",
  API: "HH:mm",
};

// Work types
export const WORK_TYPES = {
  GENERAL: "general",
  PROJECT: "project",
  TRAINING: "training",
  LEAVE: "leave",
  OVERTIME: "overtime",
};

// Leave types
export const LEAVE_TYPES = {
  ANNUAL: "annual",
  SICK: "sick",
  PERSONAL: "personal",
  MATERNITY: "maternity",
  UNPAID: "unpaid",
};

// Entry statuses
export const ENTRY_STATUSES = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Approval statuses
export const APPROVAL_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Language settings
export const LANGUAGES = {
  EN: "en",
  TH: "th",
};

// Feature flags
export const FEATURES = {
  ENABLE_TIMER: true,
  ENABLE_TIME_PICKER: true,
  ENABLE_COMMENTS: true,
  ENABLE_BULK_ACTIONS: true,
  ENABLE_EXPORT: true,
  ENABLE_LEAVE_MANAGEMENT: true,
};

// Notification settings
export const NOTIFICATIONS = {
  TOAST_DURATION: 3000,
  TOAST_POSITION: "top-right" as const,
};
