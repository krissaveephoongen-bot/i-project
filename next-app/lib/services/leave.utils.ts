/**
 * Leave Management Utility Functions
 * Calculations and helper functions for leave management
 */

import {
  calculateBusinessDays,
  getMonthDateRange,
  isDateInPast,
} from "./timesheet.utils";

export { isDateInPast };

export enum LeaveTypeEnum {
  ANNUAL = "annual",
  SICK = "sick",
  PERSONAL = "personal",
  MATERNITY = "maternity",
  UNPAID = "unpaid",
}

export enum LeaveStatusEnum {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

/**
 * Calculate leave days (excluding weekends and holidays)
 */
export function calculateLeaveDays(
  startDate: Date,
  endDate: Date,
  holidays: Date[] = [],
  weekends: number[] = [0, 6],
): number {
  let count = 0;
  const current = new Date(startDate);

  const holidayStrings = holidays.map((d) => d.toDateString());

  while (current <= endDate) {
    const isWeekend = weekends.includes(current.getDay());
    const isHoliday = holidayStrings.includes(current.toDateString());

    if (!isWeekend && !isHoliday) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Calculate remaining leave balance
 */
export function calculateRemainingBalance(
  allocated: number,
  used: number,
  pending: number = 0,
): number {
  return allocated - used - pending;
}

/**
 * Check if leave balance is sufficient
 */
export function isSufficientBalance(
  remaining: number,
  requested: number,
): boolean {
  return remaining >= requested;
}

/**
 * Check if leave request is valid
 */
export function isValidLeaveRequest(
  startDate: Date,
  endDate: Date,
  leaveType: string,
  reason: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (startDate > endDate) {
    errors.push("Start date cannot be after end date");
  }

  if (!reason || reason.trim().length === 0) {
    errors.push("Reason is required");
  }

  if (!leaveType) {
    errors.push("Leave type is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if date range includes future dates only
 */
export function isFutureLeave(startDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return startDate >= today;
}

/**
 * Check if leave request can be cancelled
 */
export function canCancelLeaveRequest(requestDate: Date): boolean {
  const today = new Date();
  today.setDate(today.getDate() + 1); // Can cancel until tomorrow
  return requestDate > today;
}

/**
 * Get leave type color
 */
export function getLeaveTypeColor(leaveType: string): string {
  const colorMap: Record<string, string> = {
    [LeaveTypeEnum.ANNUAL]: "bg-blue-100 text-blue-800",
    [LeaveTypeEnum.SICK]: "bg-red-100 text-red-800",
    [LeaveTypeEnum.PERSONAL]: "bg-yellow-100 text-yellow-800",
    [LeaveTypeEnum.MATERNITY]: "bg-pink-100 text-pink-800",
    [LeaveTypeEnum.UNPAID]: "bg-gray-100 text-gray-800",
  };
  return colorMap[leaveType] || "bg-gray-100 text-gray-800";
}

/**
 * Get leave type label (with Thai support)
 */
export function getLeaveTypeLabel(
  leaveType: string,
  lang: string = "en",
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [LeaveTypeEnum.ANNUAL]: "Annual Leave",
      [LeaveTypeEnum.SICK]: "Sick Leave",
      [LeaveTypeEnum.PERSONAL]: "Personal Leave",
      [LeaveTypeEnum.MATERNITY]: "Maternity Leave",
      [LeaveTypeEnum.UNPAID]: "Unpaid Leave",
    },
    th: {
      [LeaveTypeEnum.ANNUAL]: "ลาประจำปี",
      [LeaveTypeEnum.SICK]: "ลาป่วย",
      [LeaveTypeEnum.PERSONAL]: "ลาส่วนตัว",
      [LeaveTypeEnum.MATERNITY]: "ลาคลอดบุตร",
      [LeaveTypeEnum.UNPAID]: "ลาไม่รับค่าจ้าง",
    },
  };

  return labels[lang]?.[leaveType] || leaveType;
}

/**
 * Get leave status color
 */
export function getLeaveStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    [LeaveStatusEnum.PENDING]: "bg-yellow-100 text-yellow-800",
    [LeaveStatusEnum.APPROVED]: "bg-green-100 text-green-800",
    [LeaveStatusEnum.REJECTED]: "bg-red-100 text-red-800",
    [LeaveStatusEnum.CANCELLED]: "bg-gray-100 text-gray-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}

/**
 * Get leave status label (with Thai support)
 */
export function getLeaveStatusLabel(
  status: string,
  lang: string = "en",
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      [LeaveStatusEnum.PENDING]: "Pending",
      [LeaveStatusEnum.APPROVED]: "Approved",
      [LeaveStatusEnum.REJECTED]: "Rejected",
      [LeaveStatusEnum.CANCELLED]: "Cancelled",
    },
    th: {
      [LeaveStatusEnum.PENDING]: "รอการอนุมัติ",
      [LeaveStatusEnum.APPROVED]: "อนุมัติ",
      [LeaveStatusEnum.REJECTED]: "ปฏิเสธ",
      [LeaveStatusEnum.CANCELLED]: "ยกเลิก",
    },
  };

  return labels[lang]?.[status] || status;
}

/**
 * Calculate leave quota by type for a year
 */
export function getLeaveQuotaByType(leaveType: string, year: number): number {
  const quotas: Record<string, number> = {
    [LeaveTypeEnum.ANNUAL]: 15, // Standard annual leave
    [LeaveTypeEnum.SICK]: 30, // Sick leave in minutes (e.g., 30 mins)
    [LeaveTypeEnum.PERSONAL]: 3, // Personal leave days
    [LeaveTypeEnum.MATERNITY]: 90, // Maternity leave days
    [LeaveTypeEnum.UNPAID]: 0, // No limit on unpaid
  };

  return quotas[leaveType] || 0;
}

/**
 * Check if leave type requires approval
 */
export function requiresApproval(leaveType: string): boolean {
  const requiresApprovalTypes = [LeaveTypeEnum.ANNUAL, LeaveTypeEnum.MATERNITY];
  return requiresApprovalTypes.includes(leaveType as LeaveTypeEnum);
}

/**
 * Check if leave type is auto-approved
 */
export function isAutoApproved(leaveType: string): boolean {
  const autoApprovedTypes = [LeaveTypeEnum.SICK, LeaveTypeEnum.PERSONAL];
  return autoApprovedTypes.includes(leaveType as LeaveTypeEnum);
}

/**
 * Get required approver role for leave type
 */
export function getRequiredApproverRole(leaveType: string): string {
  const roleMap: Record<string, string> = {
    [LeaveTypeEnum.ANNUAL]: "manager",
    [LeaveTypeEnum.SICK]: "manager",
    [LeaveTypeEnum.PERSONAL]: "manager",
    [LeaveTypeEnum.MATERNITY]: "admin",
    [LeaveTypeEnum.UNPAID]: "manager",
  };

  return roleMap[leaveType] || "manager";
}

/**
 * Get leave type priority for display
 */
export function getLeaveTypePriority(leaveType: string): number {
  const priorities: Record<string, number> = {
    [LeaveTypeEnum.ANNUAL]: 1,
    [LeaveTypeEnum.MATERNITY]: 2,
    [LeaveTypeEnum.SICK]: 3,
    [LeaveTypeEnum.PERSONAL]: 4,
    [LeaveTypeEnum.UNPAID]: 5,
  };

  return priorities[leaveType] || 999;
}

/**
 * Format leave period for display
 */
export function formatLeavePeriod(
  startDate: Date,
  endDate: Date,
  format: "short" | "long" = "short",
): string {
  const dateFormat = {
    short: { month: "short", day: "numeric" } as const,
    long: { month: "long", day: "numeric", year: "numeric" } as const,
  };

  const start = startDate.toLocaleDateString("en-US", dateFormat[format]);
  const end = endDate.toLocaleDateString("en-US", dateFormat[format]);

  return `${start} - ${end}`;
}

/**
 * Get overlapping leave requests
 */
export function findOverlappingLeaves(
  startDate: Date,
  endDate: Date,
  existingLeaves: Array<{ startDate: Date; endDate: Date }>,
): typeof existingLeaves {
  return existingLeaves.filter((leave) => {
    const leaveStart = new Date(leave.startDate);
    const leaveEnd = new Date(leave.endDate);

    return !(endDate < leaveStart || startDate > leaveEnd);
  });
}

/**
 * Calculate leave taken in a month
 */
export function getMonthLeaveUsage(
  year: number,
  month: number,
  leaveRequests: Array<{
    startDate: Date;
    endDate: Date;
    status: string;
  }>,
): number {
  const { startDate: monthStart, endDate: monthEnd } = getMonthDateRange(
    year,
    month,
  );

  let totalDays = 0;

  leaveRequests
    .filter((req) => req.status === LeaveStatusEnum.APPROVED)
    .forEach((req) => {
      const reqStart = new Date(req.startDate);
      const reqEnd = new Date(req.endDate);

      // Find overlap with month
      const overlapStart = new Date(
        Math.max(monthStart.getTime(), reqStart.getTime()),
      );
      const overlapEnd = new Date(
        Math.min(monthEnd.getTime(), reqEnd.getTime()),
      );

      if (overlapStart <= overlapEnd) {
        totalDays += calculateBusinessDays(overlapStart, overlapEnd);
      }
    });

  return totalDays;
}

/**
 * Get upcoming leaves for a team
 */
export function getUpcomingLeaves(
  leaves: Array<{
    startDate: Date;
    status: string;
    userName?: string;
  }>,
  daysAhead: number = 30,
): typeof leaves {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return leaves
    .filter(
      (leave) =>
        new Date(leave.startDate) >= today &&
        new Date(leave.startDate) <= futureDate &&
        leave.status === LeaveStatusEnum.APPROVED,
    )
    .sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
}

/**
 * Check if leave request spans across weekend
 */
export function spansWeekend(
  startDate: Date,
  endDate: Date,
  weekends: number[] = [0, 6],
): boolean {
  const current = new Date(startDate);

  while (current <= endDate) {
    if (weekends.includes(current.getDay())) {
      return true;
    }
    current.setDate(current.getDate() + 1);
  }

  return false;
}

/**
 * Validate leave balance before approval
 */
export function validateLeaveBalanceForApproval(
  remaining: number,
  requestedDays: number,
  leaveType: string,
): { valid: boolean; reason?: string } {
  if (leaveType === LeaveTypeEnum.UNPAID) {
    return { valid: true };
  }

  if (remaining < requestedDays) {
    return {
      valid: false,
      reason: `Insufficient leave balance. Available: ${remaining} days, Requested: ${requestedDays} days`,
    };
  }

  return { valid: true };
}

/**
 * Get leave summary for a period
 */
export function getLeavesSummary(
  leaves: Array<{
    leaveType: string;
    leaveDays: number;
    status: string;
  }>,
) {
  const summary: Record<string, { days: number; count: number }> = {};

  leaves
    .filter((leave) => leave.status === LeaveStatusEnum.APPROVED)
    .forEach((leave) => {
      if (!summary[leave.leaveType]) {
        summary[leave.leaveType] = { days: 0, count: 0 };
      }
      summary[leave.leaveType].days += leave.leaveDays;
      summary[leave.leaveType].count += 1;
    });

  return summary;
}

/**
 * Check if employee can take leave (has entitlement)
 */
export function hasLeaveEntitlement(
  leaveType: string,
  allocated: number,
  used: number,
): boolean {
  if (leaveType === LeaveTypeEnum.UNPAID) {
    return true; // Unpaid leave always allowed
  }

  return allocated > used;
}
