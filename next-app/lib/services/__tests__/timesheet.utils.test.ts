/**
 * Timesheet Utilities Test Suite
 * Tests for time conversion and calculation functions
 */

import { describe, it, expect } from "vitest";
import {
  minutesToTime,
  timeToMinutes,
  decimalHoursToTime,
  timeToDecimalHours,
  calculateHoursBetween,
  calculateMinutesBetween,
  calculateBusinessDays,
  isWeekend,
  getBusinessDaysInMonth,
  roundToNearestQuarter,
  roundToNearestHalf,
  isValidTime,
  isValidTimeRange,
  getTimeOfDay,
  calculateTotalHours,
  calculateHoursByType,
  exceedsDailyLimit,
  meetsMinimum,
  formatDuration,
  isDateInPast,
  isToday,
  isDateInFuture,
  compareTime,
  clampTime,
  addMinutesToTime,
  calculateNetHours,
} from "../timesheet.utils";

describe("Time Conversion Functions", () => {
  describe("minutesToTime", () => {
    it("should convert 0 minutes to 00:00", () => {
      expect(minutesToTime(0)).toBe("00:00");
    });

    it("should convert 60 minutes to 01:00", () => {
      expect(minutesToTime(60)).toBe("01:00");
    });

    it("should convert 90 minutes to 01:30", () => {
      expect(minutesToTime(90)).toBe("01:30");
    });

    it("should convert 540 minutes to 09:00", () => {
      expect(minutesToTime(540)).toBe("09:00");
    });
  });

  describe("timeToMinutes", () => {
    it("should convert 00:00 to 0 minutes", () => {
      expect(timeToMinutes("00:00")).toBe(0);
    });

    it("should convert 01:00 to 60 minutes", () => {
      expect(timeToMinutes("01:00")).toBe(60);
    });

    it("should convert 09:30 to 570 minutes", () => {
      expect(timeToMinutes("09:30")).toBe(570);
    });

    it("should handle single digit hours", () => {
      expect(timeToMinutes("9:30")).toBe(570);
    });
  });

  describe("decimalHoursToTime", () => {
    it("should convert 1.5 hours to 01:30", () => {
      expect(decimalHoursToTime(1.5)).toBe("01:30");
    });

    it("should convert 8.0 hours to 08:00", () => {
      expect(decimalHoursToTime(8)).toBe("08:00");
    });

    it("should convert 0.25 hours to 00:15", () => {
      expect(decimalHoursToTime(0.25)).toBe("00:15");
    });
  });

  describe("timeToDecimalHours", () => {
    it("should convert 01:30 to 1.5 hours", () => {
      expect(timeToDecimalHours("01:30")).toBe(1.5);
    });

    it("should convert 08:00 to 8.0 hours", () => {
      expect(timeToDecimalHours("08:00")).toBe(8);
    });
  });
});

describe("Time Range Functions", () => {
  describe("calculateHoursBetween", () => {
    it("should calculate 8 hours from 09:00 to 17:00", () => {
      expect(calculateHoursBetween("09:00", "17:00")).toBe(8);
    });

    it("should calculate 1.5 hours from 10:00 to 11:30", () => {
      expect(calculateHoursBetween("10:00", "11:30")).toBe(1.5);
    });

    it("should handle overnight shift (22:00 to 02:00)", () => {
      expect(calculateHoursBetween("22:00", "02:00")).toBe(4);
    });
  });

  describe("calculateMinutesBetween", () => {
    it("should calculate 480 minutes from 09:00 to 17:00", () => {
      expect(calculateMinutesBetween("09:00", "17:00")).toBe(480);
    });

    it("should handle overnight (22:00 to 02:00)", () => {
      expect(calculateMinutesBetween("22:00", "02:00")).toBe(240);
    });
  });

  describe("isValidTime", () => {
    it("should accept valid times", () => {
      expect(isValidTime("09:00")).toBe(true);
      expect(isValidTime("23:59")).toBe(true);
      expect(isValidTime("00:00")).toBe(true);
    });

    it("should reject invalid times", () => {
      expect(isValidTime("24:00")).toBe(false);
      expect(isValidTime("12:60")).toBe(false);
      expect(isValidTime("abc")).toBe(false);
    });
  });

  describe("isValidTimeRange", () => {
    it("should accept valid ranges", () => {
      expect(isValidTimeRange("09:00", "17:00")).toBe(true);
      expect(isValidTimeRange("22:00", "02:00")).toBe(true);
    });

    it("should reject same start and end time", () => {
      expect(isValidTimeRange("09:00", "09:00")).toBe(false);
    });

    it("should reject invalid times", () => {
      expect(isValidTimeRange("25:00", "17:00")).toBe(false);
    });
  });
});

describe("Business Day Calculations", () => {
  describe("calculateBusinessDays", () => {
    it("should count 5 business days for Mon-Fri", () => {
      const start = new Date(2026, 1, 2); // Monday
      const end = new Date(2026, 1, 6); // Friday
      expect(calculateBusinessDays(start, end)).toBe(5);
    });

    it("should exclude weekends", () => {
      const start = new Date(2026, 1, 2); // Monday
      const end = new Date(2026, 1, 8); // Sunday
      expect(calculateBusinessDays(start, end)).toBe(5);
    });

    it("should count single day correctly", () => {
      const start = new Date(2026, 1, 2); // Monday
      expect(calculateBusinessDays(start, start)).toBe(1);
    });
  });

  describe("isWeekend", () => {
    it("should identify Saturday as weekend", () => {
      const saturday = new Date(2026, 1, 7); // Saturday
      expect(isWeekend(saturday)).toBe(true);
    });

    it("should identify Sunday as weekend", () => {
      const sunday = new Date(2026, 1, 1); // Sunday
      expect(isWeekend(sunday)).toBe(true);
    });

    it("should identify weekday as not weekend", () => {
      const monday = new Date(2026, 1, 2); // Monday
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe("getBusinessDaysInMonth", () => {
    it("should count business days in February 2026", () => {
      const businessDays = getBusinessDaysInMonth(2026, 2);
      // February 2026 has ~21 business days
      expect(businessDays).toBeGreaterThan(18);
      expect(businessDays).toBeLessThan(23);
    });
  });
});

describe("Rounding Functions", () => {
  describe("roundToNearestQuarter", () => {
    it("should round 09:08 to 09:15", () => {
      expect(roundToNearestQuarter("09:08")).toBe("09:15");
    });

    it("should round 09:12 to 09:15", () => {
      expect(roundToNearestQuarter("09:12")).toBe("09:15");
    });

    it("should round 09:37 to 09:30", () => {
      expect(roundToNearestQuarter("09:37")).toBe("09:30");
    });
  });

  describe("roundToNearestHalf", () => {
    it("should round 09:10 to 09:00", () => {
      expect(roundToNearestHalf("09:10")).toBe("09:00");
    });

    it("should round 09:20 to 09:30", () => {
      expect(roundToNearestHalf("09:20")).toBe("09:30");
    });
  });
});

describe("Time Analysis Functions", () => {
  describe("getTimeOfDay", () => {
    it("should identify 09:00 as morning", () => {
      expect(getTimeOfDay("09:00")).toBe("morning");
    });

    it("should identify 14:00 as afternoon", () => {
      expect(getTimeOfDay("14:00")).toBe("afternoon");
    });

    it("should identify 19:00 as evening", () => {
      expect(getTimeOfDay("19:00")).toBe("evening");
    });

    it("should identify 23:00 as night", () => {
      expect(getTimeOfDay("23:00")).toBe("night");
    });
  });

  describe("compareTime", () => {
    it("should return -1 when first time is earlier", () => {
      expect(compareTime("09:00", "10:00")).toBe(-1);
    });

    it("should return 1 when first time is later", () => {
      expect(compareTime("10:00", "09:00")).toBe(1);
    });

    it("should return 0 when times are equal", () => {
      expect(compareTime("09:00", "09:00")).toBe(0);
    });
  });

  describe("clampTime", () => {
    it("should clamp to minimum", () => {
      expect(clampTime("08:00", "09:00", "17:00")).toBe("09:00");
    });

    it("should clamp to maximum", () => {
      expect(clampTime("18:00", "09:00", "17:00")).toBe("17:00");
    });

    it("should not clamp if within range", () => {
      expect(clampTime("12:00", "09:00", "17:00")).toBe("12:00");
    });
  });
});

describe("Hour Validation Functions", () => {
  describe("exceedsDailyLimit", () => {
    it("should return false for 8 hours", () => {
      expect(exceedsDailyLimit(8)).toBe(false);
    });

    it("should return true for 12 hours", () => {
      expect(exceedsDailyLimit(12)).toBe(true);
    });

    it("should accept custom limit", () => {
      expect(exceedsDailyLimit(12, 14)).toBe(false);
    });
  });

  describe("meetsMinimum", () => {
    it("should return true for 4 hours", () => {
      expect(meetsMinimum(4)).toBe(true);
    });

    it("should return false for 2 hours", () => {
      expect(meetsMinimum(2)).toBe(false);
    });

    it("should accept custom minimum", () => {
      expect(meetsMinimum(2, 2)).toBe(true);
    });
  });
});

describe("Formatting Functions", () => {
  describe("formatDuration", () => {
    it("should format 30 minutes as 30m", () => {
      expect(formatDuration(30)).toBe("30m");
    });

    it("should format 120 minutes as 2h", () => {
      expect(formatDuration(120)).toBe("2h");
    });

    it("should format 150 minutes as 2h 30m", () => {
      expect(formatDuration(150)).toBe("2h 30m");
    });
  });
});

describe("Date Functions", () => {
  describe("isDateInPast", () => {
    it("should identify yesterday as past", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isDateInPast(yesterday)).toBe(true);
    });

    it("should not identify today as past", () => {
      const today = new Date();
      expect(isDateInPast(today)).toBe(false);
    });

    it("should not identify future date as past", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isDateInPast(tomorrow)).toBe(false);
    });
  });

  describe("isToday", () => {
    it("should identify today correctly", () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it("should not identify yesterday as today", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe("isDateInFuture", () => {
    it("should identify future date correctly", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isDateInFuture(tomorrow)).toBe(true);
    });

    it("should not identify past as future", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isDateInFuture(yesterday)).toBe(false);
    });
  });
});

describe("Calculation Functions", () => {
  describe("calculateTotalHours", () => {
    it("should sum hours from multiple entries", () => {
      const entries = [{ hours: 4 }, { hours: 4 }, { hours: 2 }];
      expect(calculateTotalHours(entries)).toBe(10);
    });

    it("should return 0 for empty entries", () => {
      expect(calculateTotalHours([])).toBe(0);
    });
  });

  describe("calculateHoursByType", () => {
    it("should group hours by work type", () => {
      const entries = [
        { workType: "project", hours: 4 },
        { workType: "project", hours: 2 },
        { workType: "training", hours: 2 },
      ];
      const result = calculateHoursByType(entries);
      expect(result.project).toBe(6);
      expect(result.training).toBe(2);
    });
  });

  describe("calculateNetHours", () => {
    it("should calculate net hours after break", () => {
      const totalMinutes = 480; // 8 hours
      const breakMinutes = 60; // 1 hour
      expect(calculateNetHours(totalMinutes, breakMinutes)).toBe(7);
    });
  });
});

describe("Time Arithmetic", () => {
  describe("addMinutesToTime", () => {
    it("should add 30 minutes to 09:00", () => {
      expect(addMinutesToTime("09:00", 30)).toBe("09:30");
    });

    it("should handle day overflow", () => {
      expect(addMinutesToTime("23:30", 60)).toBe("00:30");
    });

    it("should handle negative addition", () => {
      expect(addMinutesToTime("09:00", -60)).toBe("08:00");
    });

    it("should handle large additions", () => {
      expect(addMinutesToTime("09:00", 480)).toBe("17:00");
    });
  });
});
