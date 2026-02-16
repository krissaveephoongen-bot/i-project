/**
 * Timesheet Validation Functions
 * Validates all timesheet-related inputs
 */

import {
  isValidTimeFormat,
  isValidTimeRange,
  isValidBreakDuration,
  isValidHours,
  calculateHours,
  parseDate,
} from './timesheet.utils';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate time entry input
 * @param data - Time entry data to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateTimeEntry(data: {
  startTime?: string;
  endTime?: string;
  breakDuration?: number;
  hours?: number;
  date?: string;
  workType?: string;
  description?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate startTime
  if (!data.startTime) {
    errors.push({ field: 'startTime', message: 'Start time is required' });
  } else if (!isValidTimeFormat(data.startTime)) {
    errors.push({
      field: 'startTime',
      message: 'Start time must be in HH:mm format (00:00-23:59)',
    });
  }

  // Validate endTime
  if (!data.endTime) {
    errors.push({ field: 'endTime', message: 'End time is required' });
  } else if (!isValidTimeFormat(data.endTime)) {
    errors.push({
      field: 'endTime',
      message: 'End time must be in HH:mm format (00:00-23:59)',
    });
  }

  // Validate time range
  if (
    data.startTime &&
    data.endTime &&
    !isValidTimeRange(data.startTime, data.endTime)
  ) {
    errors.push({
      field: 'timeRange',
      message: 'End time must be after start time',
    });
  }

  // Validate breakDuration
  if (
    data.breakDuration !== undefined &&
    !isValidBreakDuration(data.breakDuration)
  ) {
    errors.push({
      field: 'breakDuration',
      message: 'Break duration must be between 0 and 480 minutes',
    });
  }

  // Validate hours (if provided)
  if (data.hours !== undefined) {
    if (!isValidHours(data.hours)) {
      errors.push({
        field: 'hours',
        message: 'Hours must be a positive number up to 24',
      });
    }

    // If startTime and endTime provided, verify calculated hours match
    if (data.startTime && data.endTime) {
      try {
        const calculatedHours = calculateHours(
          data.startTime,
          data.endTime,
          data.breakDuration || 0
        );
        if (Math.abs(calculatedHours - data.hours) > 0.01) {
          // Allow 1 minute tolerance
          errors.push({
            field: 'hours',
            message: `Hours mismatch. Expected ${calculatedHours}, got ${data.hours}`,
          });
        }
      } catch (error) {
        // Already caught in time validation above
      }
    }
  }

  // Validate date
  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else {
    try {
      parseDate(data.date);
    } catch {
      errors.push({
        field: 'date',
        message: 'Date must be a valid ISO date string (YYYY-MM-DD)',
      });
    }
  }

  // Validate workType
  const validWorkTypes = ['project', 'office', 'training', 'leave', 'overtime', 'other'];
  if (!data.workType) {
    errors.push({ field: 'workType', message: 'Work type is required' });
  } else if (!validWorkTypes.includes(data.workType)) {
    errors.push({
      field: 'workType',
      message: `Work type must be one of: ${validWorkTypes.join(', ')}`,
    });
  }

  // Validate description (optional, but if provided should be non-empty)
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push({
      field: 'description',
      message: 'Description must be a string',
    });
  }

  return errors;
}

/**
 * Validate leave request input
 * @param data - Leave request data
 * @returns Array of validation errors (empty if valid)
 */
export function validateLeaveRequest(data: {
  startDate?: string;
  endDate?: string;
  leaveType?: string;
  reason?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate startDate
  if (!data.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  } else {
    try {
      parseDate(data.startDate);
    } catch {
      errors.push({
        field: 'startDate',
        message: 'Start date must be a valid ISO date string (YYYY-MM-DD)',
      });
    }
  }

  // Validate endDate
  if (!data.endDate) {
    errors.push({ field: 'endDate', message: 'End date is required' });
  } else {
    try {
      parseDate(data.endDate);
    } catch {
      errors.push({
        field: 'endDate',
        message: 'End date must be a valid ISO date string (YYYY-MM-DD)',
      });
    }
  }

  // Validate date range
  if (data.startDate && data.endDate) {
    try {
      const start = parseDate(data.startDate);
      const end = parseDate(data.endDate);
      if (end < start) {
        errors.push({
          field: 'dateRange',
          message: 'End date must be after or equal to start date',
        });
      }
    } catch {
      // Already caught above
    }
  }

  // Validate leaveType
  const validLeaveTypes = ['annual', 'sick', 'personal', 'maternity', 'unpaid'];
  if (!data.leaveType) {
    errors.push({ field: 'leaveType', message: 'Leave type is required' });
  } else if (!validLeaveTypes.includes(data.leaveType)) {
    errors.push({
      field: 'leaveType',
      message: `Leave type must be one of: ${validLeaveTypes.join(', ')}`,
    });
  }

  // Validate reason
  if (!data.reason) {
    errors.push({ field: 'reason', message: 'Reason is required' });
  } else if (typeof data.reason !== 'string' || data.reason.trim().length === 0) {
    errors.push({
      field: 'reason',
      message: 'Reason must be a non-empty string',
    });
  } else if (data.reason.length > 1000) {
    errors.push({
      field: 'reason',
      message: 'Reason must not exceed 1000 characters',
    });
  }

  return errors;
}

/**
 * Validate approval action
 * @param data - Approval data
 * @param requireReason - Whether rejection reason is required
 * @returns Array of validation errors (empty if valid)
 */
export function validateApprovalAction(data: {
  action?: 'approve' | 'reject';
  reason?: string;
}, requireReason = false): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.action) {
    errors.push({ field: 'action', message: 'Action is required' });
  } else if (!['approve', 'reject'].includes(data.action)) {
    errors.push({
      field: 'action',
      message: 'Action must be either "approve" or "reject"',
    });
  }

  if (data.action === 'reject' && requireReason) {
    if (!data.reason) {
      errors.push({
        field: 'reason',
        message: 'Rejection reason is required',
      });
    } else if (typeof data.reason !== 'string' || data.reason.trim().length === 0) {
      errors.push({
        field: 'reason',
        message: 'Reason must be a non-empty string',
      });
    }
  }

  return errors;
}

/**
 * Validate pagination params
 * @param page - Page number
 * @param limit - Items per page
 * @returns Array of validation errors (empty if valid)
 */
export function validatePagination(page?: number, limit?: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (page === undefined || page === null) {
    // page is optional, default to 1
  } else if (!Number.isInteger(page) || page < 1) {
    errors.push({
      field: 'page',
      message: 'Page must be a positive integer',
    });
  }

  if (limit === undefined || limit === null) {
    // limit is optional, default to 20
  } else if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    errors.push({
      field: 'limit',
      message: 'Limit must be an integer between 1 and 100',
    });
  }

  return errors;
}

/**
 * Check if validation errors exist
 * @param errors - Array of validation errors
 * @returns true if there are errors
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

/**
 * Format validation errors for response
 * @param errors - Array of validation errors
 * @returns Object mapping field names to error messages
 */
export function formatValidationErrors(
  errors: ValidationError[]
): Record<string, string> {
  const formatted: Record<string, string> = {};
  errors.forEach((error) => {
    formatted[error.field] = error.message;
  });
  return formatted;
}
