/**
 * Timesheet Utility Functions
 * Time conversions, calculations, and formatting utilities
 */

/**
 * Convert minutes to HH:MM format
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Convert HH:MM or H:M format to minutes
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Convert decimal hours to HH:MM format
 */
export function decimalHoursToTime(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Convert HH:MM format to decimal hours
 */
export function timeToDecimalHours(time: string): number {
  const minutes = timeToMinutes(time);
  return minutes / 60;
}

/**
 * Calculate hours between two times
 */
export function calculateHoursBetween(
  startTime: string,
  endTime: string
): number {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  let diff = endMinutes - startMinutes;

  // Handle day wrap-around (e.g., 22:00 to 02:00 next day)
  if (diff < 0) {
    diff += 24 * 60;
  }

  return diff / 60;
}

/**
 * Calculate minutes between two times
 */
export function calculateMinutesBetween(
  startTime: string,
  endTime: string
): number {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  let diff = endMinutes - startMinutes;

  if (diff < 0) {
    diff += 24 * 60;
  }

  return diff;
}

/**
 * Calculate business days between two dates
 */
export function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  weekends: number[] = [0, 6]
): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    if (!weekends.includes(current.getDay())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date, weekends: number[] = [0, 6]): boolean {
  return weekends.includes(date.getDay());
}

/**
 * Get business days in a month
 */
export function getBusinessDaysInMonth(
  year: number,
  month: number,
  weekends: number[] = [0, 6]
): number {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return calculateBusinessDays(startDate, endDate, weekends);
}

/**
 * Round time to nearest 15 minutes
 */
export function roundToNearestQuarter(time: string): string {
  let minutes = timeToMinutes(time);
  minutes = Math.round(minutes / 15) * 15;
  return minutesToTime(minutes);
}

/**
 * Round time to nearest 30 minutes
 */
export function roundToNearestHalf(time: string): string {
  let minutes = timeToMinutes(time);
  minutes = Math.round(minutes / 30) * 30;
  return minutesToTime(minutes);
}

/**
 * Check if time is valid (00:00 - 23:59)
 */
export function isValidTime(time: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}

/**
 * Check if time range is valid
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // End time can be on next day
  return endMinutes !== startMinutes;
}

/**
 * Get time of day (morning, afternoon, evening, night)
 */
export function getTimeOfDay(time: string): string {
  const minutes = timeToMinutes(time);
  const hour = Math.floor(minutes / 60);

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/**
 * Calculate total hours from multiple entries
 */
export function calculateTotalHours(entries: Array<{ hours: number }>): number {
  return entries.reduce((sum, entry) => sum + entry.hours, 0);
}

/**
 * Calculate total hours by work type
 */
export function calculateHoursByType(
  entries: Array<{ workType: string; hours: number }>
): Record<string, number> {
  const result: Record<string, number> = {};

  entries.forEach((entry) => {
    if (!result[entry.workType]) {
      result[entry.workType] = 0;
    }
    result[entry.workType] += entry.hours;
  });

  return result;
}

/**
 * Check if hours exceed daily limit
 */
export function exceedsDailyLimit(
  hours: number,
  dailyLimit: number = 8
): boolean {
  return hours > dailyLimit;
}

/**
 * Check if hours meet minimum requirement
 */
export function meetsMinimum(
  hours: number,
  minimumHours: number = 4
): boolean {
  return hours >= minimumHours;
}

/**
 * Format duration in readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Get date range for a month
 */
export function getMonthDateRange(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return { startDate, endDate };
}

/**
 * Check if date is in the past
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if date is in the future
 */
export function isDateInFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

/**
 * Get start of week
 */
export function getStartOfWeek(date: Date, startDay: number = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1 - startDay);
  return new Date(d.setDate(diff));
}

/**
 * Get end of week
 */
export function getEndOfWeek(date: Date, startDay: number = 0): Date {
  const start = getStartOfWeek(date, startDay);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/**
 * Get week number for a date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Compare times (returns -1, 0, or 1)
 */
export function compareTime(time1: string, time2: string): number {
  const min1 = timeToMinutes(time1);
  const min2 = timeToMinutes(time2);
  return min1 < min2 ? -1 : min1 > min2 ? 1 : 0;
}

/**
 * Clamp time within range
 */
export function clampTime(
  time: string,
  minTime: string,
  maxTime: string
): string {
  const minutes = timeToMinutes(time);
  const minMinutes = timeToMinutes(minTime);
  const maxMinutes = timeToMinutes(maxTime);

  const clamped = Math.max(minMinutes, Math.min(minutes, maxMinutes));
  return minutesToTime(clamped);
}

/**
 * Add minutes to time
 */
export function addMinutesToTime(time: string, minutesToAdd: number): string {
  let minutes = timeToMinutes(time) + minutesToAdd;

  // Handle day overflow
  while (minutes >= 24 * 60) {
    minutes -= 24 * 60;
  }

  // Handle negative minutes
  while (minutes < 0) {
    minutes += 24 * 60;
  }

  return minutesToTime(minutes);
}

/**
 * Calculate break duration
 */
export function calculateBreakDuration(entries: Array<{ breakDuration?: number }>): number {
  return entries.reduce((sum, entry) => sum + (entry.breakDuration || 0), 0);
}

/**
 * Calculate net hours (total - break)
 */
export function calculateNetHours(totalMinutes: number, breakMinutes: number = 0): number {
  return (totalMinutes - breakMinutes) / 60;
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
  if (typeof date === "string") {
    return date;
  }

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Get relative time (Today, Yesterday, etc.)
 */
export function getRelativeDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
