/**
 * Validation Utilities
 * Form validation and data validation functions
 */

import {
  isValidTime,
  isValidTimeRange,
  calculateHoursBetween,
  isToday,
  isDateInPast,
  isDateInFuture,
} from "./timesheet.utils";
import { isValidLeaveRequest, isDateInPast as isLeaveInPast } from "./leave.utils";
import {
  TIMESHEET_DEFAULTS,
  LEAVE_DEFAULTS,
  VALIDATION,
} from "@/lib/config";

// Time Entry Validation

/**
 * Validate time entry input
 */
export function validateTimeEntry(data: {
  date: Date;
  startTime: string;
  endTime: string;
  projectId?: string;
  workType?: string;
  breakDuration?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate date
  if (!data.date) {
    errors.push("Date is required");
  } else if (isDateInPast(data.date) && !isToday(data.date)) {
    errors.push("Cannot create entries for past dates");
  }

  // Validate times
  if (!isValidTime(data.startTime)) {
    errors.push("Start time is invalid");
  } else if (!isValidTime(data.endTime)) {
    errors.push("End time is invalid");
  } else if (!isValidTimeRange(data.startTime, data.endTime)) {
    errors.push("Start time must be different from end time");
  }

  // Validate hours
  const hours = calculateHoursBetween(data.startTime, data.endTime);
  if (hours > TIMESHEET_DEFAULTS.MAXIMUM_DAILY_HOURS) {
    errors.push(
      `Hours exceed maximum daily limit of ${TIMESHEET_DEFAULTS.MAXIMUM_DAILY_HOURS} hours`
    );
  }

  if (hours < TIMESHEET_DEFAULTS.MINIMUM_HOURS) {
    errors.push(
      `Hours must be at least ${TIMESHEET_DEFAULTS.MINIMUM_HOURS} hours`
    );
  }

  // Validate break duration
  if (data.breakDuration !== undefined) {
    if (data.breakDuration < 0) {
      errors.push("Break duration cannot be negative");
    }
    if (data.breakDuration > hours * 60) {
      errors.push("Break duration cannot exceed total hours");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate time entry comment
 */
export function validateTimeEntryComment(comment: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!comment || comment.trim().length === 0) {
    errors.push("Comment is required");
  } else if (comment.length < VALIDATION.MIN_COMMENT_LENGTH) {
    errors.push(
      `Comment must be at least ${VALIDATION.MIN_COMMENT_LENGTH} characters`
    );
  } else if (comment.length > VALIDATION.MAX_COMMENT_LENGTH) {
    errors.push(
      `Comment must not exceed ${VALIDATION.MAX_COMMENT_LENGTH} characters`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate bulk time entry approval
 */
export function validateBulkApproval(
  entryIds: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!entryIds || entryIds.length === 0) {
    errors.push("At least one entry must be selected");
  }

  if (entryIds.length > 100) {
    errors.push("Cannot approve more than 100 entries at once");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Leave Request Validation

/**
 * Validate leave request input
 */
export function validateLeaveRequestInput(data: {
  startDate: Date;
  endDate: Date;
  leaveType: string;
  reason: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate dates
  if (!data.startDate) {
    errors.push("Start date is required");
  } else if (!data.endDate) {
    errors.push("End date is required");
  } else {
    const dateValidation = isValidLeaveRequest(
      data.startDate,
      data.endDate,
      data.leaveType,
      data.reason
    );

    if (!dateValidation.valid) {
      errors.push(...dateValidation.errors);
    }
  }

  // Validate leave type
  if (!data.leaveType) {
    errors.push("Leave type is required");
  }

  // Validate reason
  if (!data.reason || data.reason.trim().length === 0) {
    errors.push("Reason is required");
  } else if (data.reason.length < VALIDATION.MIN_REASON_LENGTH) {
    errors.push(
      `Reason must be at least ${VALIDATION.MIN_REASON_LENGTH} characters`
    );
  } else if (data.reason.length > VALIDATION.MAX_REASON_LENGTH) {
    errors.push(
      `Reason must not exceed ${VALIDATION.MAX_REASON_LENGTH} characters`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate leave balance before creation
 */
export function validateLeaveBalance(
  allocated: number,
  used: number,
  requested: number,
  pending: number = 0
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const remaining = allocated - used - pending;

  if (remaining < 0) {
    errors.push("Invalid leave allocation");
  }

  if (remaining < requested) {
    errors.push(
      `Insufficient leave balance. Available: ${remaining} days, Requested: ${requested} days`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate leave approval rejection reason
 */
export function validateRejectionReason(reason: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!reason || reason.trim().length === 0) {
    errors.push("Rejection reason is required");
  } else if (reason.length < VALIDATION.MIN_REASON_LENGTH) {
    errors.push(
      `Reason must be at least ${VALIDATION.MIN_REASON_LENGTH} characters`
    );
  } else if (reason.length > VALIDATION.MAX_REASON_LENGTH) {
    errors.push(
      `Reason must not exceed ${VALIDATION.MAX_REASON_LENGTH} characters`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate bulk leave approval
 */
export function validateBulkLeaveApproval(
  requestIds: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!requestIds || requestIds.length === 0) {
    errors.push("At least one request must be selected");
  }

  if (requestIds.length > 50) {
    errors.push("Cannot approve more than 50 requests at once");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// General Validation

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (startDate > endDate) {
    errors.push("Start date cannot be after end date");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required fields
 */
export function validateRequired(
  fields: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  Object.entries(fields).forEach(([key, value]) => {
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      errors.push(`${key} is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = "Value"
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (isNaN(value)) {
    errors.push(`${fieldName} must be a number`);
  } else if (value < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  } else if (value > max) {
    errors.push(`${fieldName} must not exceed ${max}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  min: number,
  max: number,
  fieldName: string = "Value"
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!value) {
    errors.push(`${fieldName} is required`);
  } else if (value.length < min) {
    errors.push(`${fieldName} must be at least ${min} characters`);
  } else if (value.length > max) {
    errors.push(`${fieldName} must not exceed ${max} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate select field
 */
export function validateSelect(
  value: string | undefined,
  validOptions: string[],
  fieldName: string = "Selection"
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!value) {
    errors.push(`${fieldName} is required`);
  } else if (!validOptions.includes(value)) {
    errors.push(`${fieldName} is invalid`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate checkbox field
 */
export function validateCheckbox(
  value: boolean,
  fieldName: string = "Confirmation"
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!value) {
    errors.push(`${fieldName} must be checked`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Combine multiple validations
 */
export function combineValidations(
  validations: Array<{ valid: boolean; errors: string[] }>
): { valid: boolean; errors: string[] } {
  const allErrors: string[] = [];

  validations.forEach((validation) => {
    if (!validation.valid) {
      allErrors.push(...validation.errors);
    }
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Parse and validate JSON
 */
export function validateJSON(jsonString: string): {
  valid: boolean;
  data?: any;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString);
    return { valid: true, data };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}
