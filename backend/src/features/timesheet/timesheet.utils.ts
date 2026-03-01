/**
 * Timesheet Utility Functions
 * Handles time calculations, validations, and formatting
 */

/**
 * Parse time string (HH:mm) into minutes since midnight
 * @param time - Time in HH:mm format
 * @returns Minutes since midnight
 */
export function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time format: ${time}. Use HH:mm`);
  }
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string
 * @param minutes - Minutes since midnight
 * @returns Time in HH:mm format
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Calculate hours worked between two times
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @param breakMinutes - Break duration in minutes (default 0)
 * @returns Hours worked as decimal
 */
export function calculateHours(
  startTime: string,
  endTime: string,
  breakMinutes: number = 0,
): number {
  try {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (endMin <= startMin) {
      throw new Error("End time must be after start time");
    }

    const totalMinutes = endMin - startMin - breakMinutes;
    if (totalMinutes < 0) {
      throw new Error("Break duration cannot exceed work time");
    }

    return Number((totalMinutes / 60).toFixed(2));
  } catch (error) {
    throw new Error(
      `Failed to calculate hours: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Validate time format (HH:mm)
 * @param time - Time string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validate time range (start before end)
 * @param startTime - Start time in HH:mm
 * @param endTime - End time in HH:mm
 * @returns true if valid range
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  try {
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      return false;
    }
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    return endMin > startMin;
  } catch {
    return false;
  }
}

/**
 * Check if value is valid break duration (0-480 minutes / 0-8 hours)
 * @param minutes - Break duration in minutes
 * @returns true if valid
 */
export function isValidBreakDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 0 && minutes <= 480;
}

/**
 * Check if hours value is valid
 * @param hours - Hours as decimal
 * @returns true if valid (positive number)
 */
export function isValidHours(hours: number): boolean {
  return typeof hours === "number" && hours > 0 && hours <= 24;
}

/**
 * Get date range for a month
 * @param month - Month number (1-12)
 * @param year - Year number
 * @returns Object with start and end dates
 */
export function getMonthDateRange(
  month: number,
  year: number,
): { start: Date; end: Date } {
  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  return { start, end };
}

/**
 * Check if date is a weekend
 * @param date - Date to check
 * @returns true if weekend (Saturday=6, Sunday=0)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if date is a business day (not weekend)
 * @param date - Date to check
 * @returns true if business day
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Count business days between two dates (inclusive)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of business days
 */
export function countBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    if (isBusinessDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Format decimal hours to readable string
 * @param hours - Hours as decimal
 * @returns Formatted string (e.g., "7h 30m")
 */
export function formatHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Check if time entry can be edited (based on status)
 * @param status - Current status
 * @returns true if editable
 */
export function canEditTimeEntry(status: string): boolean {
  // Can only edit pending or rejected entries
  return status === "pending" || status === "rejected";
}

/**
 * Check if time entry can be approved
 * @param status - Current status
 * @returns true if approvable
 */
export function canApproveTimeEntry(status: string): boolean {
  // Can only approve pending entries
  return status === "pending";
}

/**
 * Check if time entry can be rejected
 * @param status - Current status
 * @returns true if rejectable
 */
export function canRejectTimeEntry(status: string): boolean {
  // Can only reject pending or in_review entries
  return status === "pending" || status === "in_review";
}

/**
 * Calculate leave hours from date range (business days only)
 * @param startDate - Leave start date
 * @param endDate - Leave end date
 * @returns Number of leave hours (assuming 8-hour workday)
 */
export function calculateLeaveHours(startDate: Date, endDate: Date): number {
  const businessDays = countBusinessDays(startDate, endDate);
  return businessDays * 8; // Assuming 8-hour workday
}

/**
 * Format date to ISO string
 * @param date - Date to format
 * @returns ISO string
 */
export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  }
  return date.toISOString().split("T")[0];
}

/**
 * Parse ISO date string to Date object
 * @param dateString - ISO date string
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return date;
}

/**
 * Check if date is in the past
 * @param date - Date to check
 * @returns true if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const checkDate = typeof date === "string" ? parseDate(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Check if date is today
 * @param date - Date to check
 * @returns true if date is today
 */
export function isToday(date: Date | string): boolean {
  const checkDate = typeof date === "string" ? parseDate(date) : date;
  const today = new Date();
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the future
 * @param date - Date to check
 * @returns true if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const checkDate = typeof date === "string" ? parseDate(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkDate > today;
}
