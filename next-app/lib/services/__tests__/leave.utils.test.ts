/**
 * Leave Utilities Test Suite
 * Tests for leave calculation and validation functions
 */

import { describe, it, expect } from "vitest";
import {
  calculateLeaveDays,
  calculateRemainingBalance,
  isSufficientBalance,
  isValidLeaveRequest,
  isFutureLeave,
  canCancelLeaveRequest,
  getLeaveTypeColor,
  getLeaveTypeLabel,
  getLeaveStatusColor,
  getLeaveStatusLabel,
  getLeaveQuotaByType,
  requiresApproval,
  isAutoApproved,
  getRequiredApproverRole,
  getLeaveTypePriority,
  formatLeavePeriod,
  findOverlappingLeaves,
  getMonthLeaveUsage,
  getUpcomingLeaves,
  spansWeekend,
  validateLeaveBalanceForApproval,
  getLeavesSummary,
  hasLeaveEntitlement,
  LeaveTypeEnum,
  LeaveStatusEnum,
} from "../leave.utils";

describe("Leave Calculation Functions", () => {
  describe("calculateLeaveDays", () => {
    it("should count 5 business days Mon-Fri", () => {
      const start = new Date(2026, 1, 2); // Monday
      const end = new Date(2026, 1, 6); // Friday
      expect(calculateLeaveDays(start, end)).toBe(5);
    });

    it("should exclude weekends", () => {
      const start = new Date(2026, 1, 2); // Monday
      const end = new Date(2026, 1, 8); // Sunday
      expect(calculateLeaveDays(start, end)).toBe(5);
    });

    it("should exclude holidays", () => {
      const start = new Date(2026, 1, 2); // Monday
      const end = new Date(2026, 1, 6); // Friday
      const holidays = [new Date(2026, 1, 4)]; // Wednesday
      expect(calculateLeaveDays(start, end, holidays)).toBe(4);
    });

    it("should handle single day", () => {
      const date = new Date(2026, 1, 2); // Monday
      expect(calculateLeaveDays(date, date)).toBe(1);
    });
  });

  describe("calculateRemainingBalance", () => {
    it("should calculate remaining balance correctly", () => {
      const remaining = calculateRemainingBalance(15, 3, 2);
      expect(remaining).toBe(10);
    });

    it("should handle pending leaves", () => {
      const remaining = calculateRemainingBalance(20, 5, 3);
      expect(remaining).toBe(12);
    });

    it("should handle zero pending", () => {
      const remaining = calculateRemainingBalance(15, 5);
      expect(remaining).toBe(10);
    });
  });

  describe("isSufficientBalance", () => {
    it("should return true when balance is sufficient", () => {
      expect(isSufficientBalance(10, 5)).toBe(true);
    });

    it("should return false when balance is insufficient", () => {
      expect(isSufficientBalance(5, 10)).toBe(false);
    });

    it("should return true when balance equals request", () => {
      expect(isSufficientBalance(5, 5)).toBe(true);
    });
  });
});

describe("Leave Request Validation", () => {
  describe("isValidLeaveRequest", () => {
    it("should accept valid request", () => {
      const start = new Date(2026, 2, 1);
      const end = new Date(2026, 2, 5);
      const result = isValidLeaveRequest(
        start,
        end,
        LeaveTypeEnum.ANNUAL,
        "Annual vacation",
      );
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject end before start", () => {
      const start = new Date(2026, 2, 5);
      const end = new Date(2026, 2, 1);
      const result = isValidLeaveRequest(start, end, LeaveTypeEnum.ANNUAL, "");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should require reason", () => {
      const start = new Date(2026, 2, 1);
      const end = new Date(2026, 2, 5);
      const result = isValidLeaveRequest(start, end, LeaveTypeEnum.ANNUAL, "");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Reason"))).toBe(true);
    });

    it("should require leave type", () => {
      const start = new Date(2026, 2, 1);
      const end = new Date(2026, 2, 5);
      const result = isValidLeaveRequest(start, end, "", "reason");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("type"))).toBe(true);
    });
  });

  describe("isFutureLeave", () => {
    it("should identify future leave", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isFutureLeave(tomorrow)).toBe(true);
    });

    it("should not identify past as future", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isFutureLeave(yesterday)).toBe(false);
    });

    it("should identify today as future (for leave requests)", () => {
      const today = new Date();
      expect(isFutureLeave(today)).toBe(true);
    });
  });

  describe("canCancelLeaveRequest", () => {
    it("should allow cancellation before leave date", () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(canCancelLeaveRequest(nextWeek)).toBe(true);
    });

    it("should not allow cancellation after leave date", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(canCancelLeaveRequest(yesterday)).toBe(false);
    });
  });
});

describe("Leave Type Functions", () => {
  describe("getLeaveTypeColor", () => {
    it("should return blue for annual leave", () => {
      expect(getLeaveTypeColor(LeaveTypeEnum.ANNUAL)).toContain("blue");
    });

    it("should return red for sick leave", () => {
      expect(getLeaveTypeColor(LeaveTypeEnum.SICK)).toContain("red");
    });

    it("should return default for unknown type", () => {
      expect(getLeaveTypeColor("unknown")).toContain("gray");
    });
  });

  describe("getLeaveTypeLabel", () => {
    it("should return English label", () => {
      expect(getLeaveTypeLabel(LeaveTypeEnum.ANNUAL, "en")).toBe(
        "Annual Leave",
      );
    });

    it("should return Thai label", () => {
      expect(getLeaveTypeLabel(LeaveTypeEnum.ANNUAL, "th")).toBe("ลาประจำปี");
    });

    it("should default to English", () => {
      expect(getLeaveTypeLabel(LeaveTypeEnum.SICK)).toBe("Sick Leave");
    });
  });

  describe("getLeaveQuotaByType", () => {
    it("should return 15 for annual leave", () => {
      expect(getLeaveQuotaByType(LeaveTypeEnum.ANNUAL, 2026)).toBe(15);
    });

    it("should return 30 for sick leave", () => {
      expect(getLeaveQuotaByType(LeaveTypeEnum.SICK, 2026)).toBe(30);
    });

    it("should return 0 for unpaid leave", () => {
      expect(getLeaveQuotaByType(LeaveTypeEnum.UNPAID, 2026)).toBe(0);
    });
  });

  describe("requiresApproval", () => {
    it("should require approval for annual", () => {
      expect(requiresApproval(LeaveTypeEnum.ANNUAL)).toBe(true);
    });

    it("should not require approval for sick", () => {
      expect(requiresApproval(LeaveTypeEnum.SICK)).toBe(false);
    });

    it("should require approval for maternity", () => {
      expect(requiresApproval(LeaveTypeEnum.MATERNITY)).toBe(true);
    });
  });

  describe("isAutoApproved", () => {
    it("should auto-approve sick leave", () => {
      expect(isAutoApproved(LeaveTypeEnum.SICK)).toBe(true);
    });

    it("should auto-approve personal leave", () => {
      expect(isAutoApproved(LeaveTypeEnum.PERSONAL)).toBe(true);
    });

    it("should not auto-approve annual", () => {
      expect(isAutoApproved(LeaveTypeEnum.ANNUAL)).toBe(false);
    });
  });

  describe("getRequiredApproverRole", () => {
    it("should require manager for annual", () => {
      expect(getRequiredApproverRole(LeaveTypeEnum.ANNUAL)).toBe("manager");
    });

    it("should require admin for maternity", () => {
      expect(getRequiredApproverRole(LeaveTypeEnum.MATERNITY)).toBe("admin");
    });

    it("should default to manager", () => {
      expect(getRequiredApproverRole("unknown")).toBe("manager");
    });
  });

  describe("getLeaveTypePriority", () => {
    it("should prioritize maternity over other leave", () => {
      expect(getLeaveTypePriority(LeaveTypeEnum.MATERNITY)).toBeLessThan(
        getLeaveTypePriority(LeaveTypeEnum.ANNUAL),
      );
    });

    it("should prioritize annual over personal", () => {
      expect(getLeaveTypePriority(LeaveTypeEnum.ANNUAL)).toBeLessThan(
        getLeaveTypePriority(LeaveTypeEnum.PERSONAL),
      );
    });
  });
});

describe("Leave Status Functions", () => {
  describe("getLeaveStatusColor", () => {
    it("should return yellow for pending", () => {
      expect(getLeaveStatusColor(LeaveStatusEnum.PENDING)).toContain("yellow");
    });

    it("should return green for approved", () => {
      expect(getLeaveStatusColor(LeaveStatusEnum.APPROVED)).toContain("green");
    });

    it("should return red for rejected", () => {
      expect(getLeaveStatusColor(LeaveStatusEnum.REJECTED)).toContain("red");
    });
  });

  describe("getLeaveStatusLabel", () => {
    it("should return English status", () => {
      expect(getLeaveStatusLabel(LeaveStatusEnum.APPROVED, "en")).toBe(
        "Approved",
      );
    });

    it("should return Thai status", () => {
      expect(getLeaveStatusLabel(LeaveStatusEnum.APPROVED, "th")).toBe(
        "อนุมัติ",
      );
    });
  });
});

describe("Leave Overlap Detection", () => {
  describe("findOverlappingLeaves", () => {
    it("should find overlapping leave", () => {
      const requestStart = new Date(2026, 2, 1);
      const requestEnd = new Date(2026, 2, 10);
      const existingLeaves = [
        {
          startDate: new Date(2026, 2, 5),
          endDate: new Date(2026, 2, 15),
        },
      ];

      const overlapping = findOverlappingLeaves(
        requestStart,
        requestEnd,
        existingLeaves,
      );
      expect(overlapping.length).toBe(1);
    });

    it("should not find non-overlapping leave", () => {
      const requestStart = new Date(2026, 2, 1);
      const requestEnd = new Date(2026, 2, 5);
      const existingLeaves = [
        {
          startDate: new Date(2026, 2, 10),
          endDate: new Date(2026, 2, 15),
        },
      ];

      const overlapping = findOverlappingLeaves(
        requestStart,
        requestEnd,
        existingLeaves,
      );
      expect(overlapping.length).toBe(0);
    });

    it("should find partially overlapping leaves", () => {
      const requestStart = new Date(2026, 2, 1);
      const requestEnd = new Date(2026, 2, 15);
      const existingLeaves = [
        {
          startDate: new Date(2026, 2, 10),
          endDate: new Date(2026, 2, 20),
        },
      ];

      const overlapping = findOverlappingLeaves(
        requestStart,
        requestEnd,
        existingLeaves,
      );
      expect(overlapping.length).toBe(1);
    });
  });

  describe("spansWeekend", () => {
    it("should detect weekend span", () => {
      const start = new Date(2026, 1, 5); // Thursday
      const end = new Date(2026, 1, 9); // Monday
      expect(spansWeekend(start, end)).toBe(true);
    });

    it("should not detect weekend in weekday range", () => {
      const start = new Date(2026, 1, 2); // Monday
      const end = new Date(2026, 1, 6); // Friday
      expect(spansWeekend(start, end)).toBe(false);
    });
  });
});

describe("Leave History and Statistics", () => {
  describe("getMonthLeaveUsage", () => {
    it("should calculate approved leave in month", () => {
      const leaves = [
        {
          startDate: new Date(2026, 1, 1),
          endDate: new Date(2026, 1, 5),
          status: LeaveStatusEnum.APPROVED,
        },
      ];
      const usage = getMonthLeaveUsage(2026, 2, leaves);
      expect(usage).toBeGreaterThan(0);
    });

    it("should exclude pending leaves", () => {
      const leaves = [
        {
          startDate: new Date(2026, 1, 1),
          endDate: new Date(2026, 1, 5),
          status: LeaveStatusEnum.PENDING,
        },
      ];
      const usage = getMonthLeaveUsage(2026, 2, leaves);
      expect(usage).toBe(0);
    });
  });

  describe("getUpcomingLeaves", () => {
    it("should find upcoming approved leaves", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const leaves = [
        {
          startDate: nextWeek,
          status: LeaveStatusEnum.APPROVED,
          userName: "John",
        },
      ];

      const upcoming = getUpcomingLeaves(leaves, 30);
      expect(upcoming.length).toBe(1);
    });

    it("should exclude past leaves", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const leaves = [
        {
          startDate: yesterday,
          status: LeaveStatusEnum.APPROVED,
        },
      ];

      const upcoming = getUpcomingLeaves(leaves, 30);
      expect(upcoming.length).toBe(0);
    });

    it("should exclude pending leaves", () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const leaves = [
        {
          startDate: nextWeek,
          status: LeaveStatusEnum.PENDING,
        },
      ];

      const upcoming = getUpcomingLeaves(leaves, 30);
      expect(upcoming.length).toBe(0);
    });
  });

  describe("getLeavesSummary", () => {
    it("should summarize leave by type", () => {
      const leaves = [
        {
          leaveType: LeaveTypeEnum.ANNUAL,
          leaveDays: 5,
          status: LeaveStatusEnum.APPROVED,
        },
        {
          leaveType: LeaveTypeEnum.ANNUAL,
          leaveDays: 3,
          status: LeaveStatusEnum.APPROVED,
        },
        {
          leaveType: LeaveTypeEnum.SICK,
          leaveDays: 1,
          status: LeaveStatusEnum.APPROVED,
        },
      ];

      const summary = getLeavesSummary(leaves);
      expect(summary[LeaveTypeEnum.ANNUAL].days).toBe(8);
      expect(summary[LeaveTypeEnum.ANNUAL].count).toBe(2);
      expect(summary[LeaveTypeEnum.SICK].days).toBe(1);
    });

    it("should exclude non-approved leaves", () => {
      const leaves = [
        {
          leaveType: LeaveTypeEnum.ANNUAL,
          leaveDays: 5,
          status: LeaveStatusEnum.PENDING,
        },
      ];

      const summary = getLeavesSummary(leaves);
      expect(summary[LeaveTypeEnum.ANNUAL]).toBeUndefined();
    });
  });
});

describe("Leave Entitlement Check", () => {
  describe("hasLeaveEntitlement", () => {
    it("should allow unpaid leave without entitlement", () => {
      expect(hasLeaveEntitlement(LeaveTypeEnum.UNPAID, 0, 0)).toBe(true);
    });

    it("should allow when allocated > used", () => {
      expect(hasLeaveEntitlement(LeaveTypeEnum.ANNUAL, 15, 5)).toBe(true);
    });

    it("should deny when allocated <= used", () => {
      expect(hasLeaveEntitlement(LeaveTypeEnum.ANNUAL, 15, 15)).toBe(false);
    });
  });

  describe("validateLeaveBalanceForApproval", () => {
    it("should validate sufficient balance", () => {
      const result = validateLeaveBalanceForApproval(
        10,
        5,
        LeaveTypeEnum.ANNUAL,
      );
      expect(result.valid).toBe(true);
    });

    it("should reject insufficient balance", () => {
      const result = validateLeaveBalanceForApproval(
        5,
        10,
        LeaveTypeEnum.ANNUAL,
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it("should allow unpaid leave", () => {
      const result = validateLeaveBalanceForApproval(
        0,
        10,
        LeaveTypeEnum.UNPAID,
      );
      expect(result.valid).toBe(true);
    });
  });
});

describe("Formatting Functions", () => {
  describe("formatLeavePeriod", () => {
    it("should format short period", () => {
      const start = new Date(2026, 1, 1);
      const end = new Date(2026, 1, 5);
      const formatted = formatLeavePeriod(start, end, "short");
      expect(formatted).toContain(" - ");
    });

    it("should format long period", () => {
      const start = new Date(2026, 1, 1);
      const end = new Date(2026, 1, 5);
      const formatted = formatLeavePeriod(start, end, "long");
      expect(formatted).toContain(" - ");
    });
  });
});
