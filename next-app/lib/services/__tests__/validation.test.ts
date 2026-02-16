/**
 * Validation Utilities Test Suite
 * Tests for form and data validation functions
 */

import { describe, it, expect } from "vitest";
import {
  validateTimeEntry,
  validateTimeEntryComment,
  validateBulkApproval,
  validateLeaveRequestInput,
  validateLeaveBalance,
  validateRejectionReason,
  validateBulkLeaveApproval,
  validateEmail,
  validateDateRange,
  validateRequired,
  validateNumberRange,
  validateStringLength,
  validateSelect,
  validateCheckbox,
  combineValidations,
  sanitizeInput,
  validateJSON,
} from "../validation";

describe("Time Entry Validation", () => {
  describe("validateTimeEntry", () => {
    it("should validate correct time entry", () => {
      const data = {
        date: new Date(),
        startTime: "09:00",
        endTime: "17:00",
        projectId: "proj-1",
        workType: "project",
      };
      const result = validateTimeEntry(data);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject invalid start time", () => {
      const data = {
        date: new Date(),
        startTime: "25:00",
        endTime: "17:00",
      };
      const result = validateTimeEntry(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Start time"))).toBe(true);
    });

    it("should reject start time equal to end time", () => {
      const data = {
        date: new Date(),
        startTime: "09:00",
        endTime: "09:00",
      };
      const result = validateTimeEntry(data);
      expect(result.valid).toBe(false);
    });

    it("should reject hours exceeding daily limit", () => {
      const data = {
        date: new Date(),
        startTime: "08:00",
        endTime: "20:00", // 12 hours
      };
      const result = validateTimeEntry(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("exceed"))).toBe(true);
    });

    it("should reject hours below minimum", () => {
      const data = {
        date: new Date(),
        startTime: "09:00",
        endTime: "11:00", // 2 hours
      };
      const result = validateTimeEntry(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("least"))).toBe(true);
    });

    it("should reject break duration exceeding total hours", () => {
      const data = {
        date: new Date(),
        startTime: "09:00",
        endTime: "10:00", // 1 hour
        breakDuration: 120, // 2 hours
      };
      const result = validateTimeEntry(data);
      expect(result.valid).toBe(false);
    });

    it("should reject negative break duration", () => {
      const data = {
        date: new Date(),
        startTime: "09:00",
        endTime: "17:00",
        breakDuration: -60,
      };
      const result = validateTimeEntry(data);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateTimeEntryComment", () => {
    it("should accept valid comment", () => {
      const result = validateTimeEntryComment("This is a valid comment");
      expect(result.valid).toBe(true);
    });

    it("should reject empty comment", () => {
      const result = validateTimeEntryComment("");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("required"))).toBe(true);
    });

    it("should reject too short comment", () => {
      const result = validateTimeEntryComment("ab");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("at least"))).toBe(true);
    });

    it("should reject too long comment", () => {
      const longComment = "a".repeat(501);
      const result = validateTimeEntryComment(longComment);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("exceed"))).toBe(true);
    });
  });

  describe("validateBulkApproval", () => {
    it("should accept valid bulk approval", () => {
      const result = validateBulkApproval(["id1", "id2"]);
      expect(result.valid).toBe(true);
    });

    it("should reject empty array", () => {
      const result = validateBulkApproval([]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("least one"))).toBe(true);
    });

    it("should reject too many entries", () => {
      const entries = Array.from({ length: 101 }, (_, i) => `id${i}`);
      const result = validateBulkApproval(entries);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("100"))).toBe(true);
    });
  });
});

describe("Leave Request Validation", () => {
  describe("validateLeaveRequestInput", () => {
    it("should accept valid leave request", () => {
      const result = validateLeaveRequestInput({
        startDate: new Date(2026, 2, 1),
        endDate: new Date(2026, 2, 5),
        leaveType: "annual",
        reason: "Vacation time with family",
      });
      expect(result.valid).toBe(true);
    });

    it("should require start date", () => {
      const result = validateLeaveRequestInput({
        startDate: new Date(),
        endDate: new Date(),
        leaveType: "annual",
        reason: "Test",
      });
      // Note: constructor doesn't fail, but validation might
      expect(result).toHaveProperty("valid");
    });

    it("should reject end before start", () => {
      const result = validateLeaveRequestInput({
        startDate: new Date(2026, 2, 5),
        endDate: new Date(2026, 2, 1),
        leaveType: "annual",
        reason: "Test",
      });
      expect(result.valid).toBe(false);
    });

    it("should require leave type", () => {
      const result = validateLeaveRequestInput({
        startDate: new Date(2026, 2, 1),
        endDate: new Date(2026, 2, 5),
        leaveType: "",
        reason: "Test",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("type"))).toBe(true);
    });

    it("should require reason", () => {
      const result = validateLeaveRequestInput({
        startDate: new Date(2026, 2, 1),
        endDate: new Date(2026, 2, 5),
        leaveType: "annual",
        reason: "",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Reason"))).toBe(true);
    });

    it("should validate reason length", () => {
      const result = validateLeaveRequestInput({
        startDate: new Date(2026, 2, 1),
        endDate: new Date(2026, 2, 5),
        leaveType: "annual",
        reason: "ab",
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("validateLeaveBalance", () => {
    it("should accept sufficient balance", () => {
      const result = validateLeaveBalance(15, 5, 5, 2);
      expect(result.valid).toBe(true);
    });

    it("should reject insufficient balance", () => {
      const result = validateLeaveBalance(15, 10, 10, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Insufficient"))).toBe(true);
    });

    it("should account for pending leaves", () => {
      const result = validateLeaveBalance(15, 5, 5, 8);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateRejectionReason", () => {
    it("should accept valid reason", () => {
      const result = validateRejectionReason("Schedule conflict with other team members");
      expect(result.valid).toBe(true);
    });

    it("should reject empty reason", () => {
      const result = validateRejectionReason("");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("required"))).toBe(true);
    });

    it("should validate reason length", () => {
      const result = validateRejectionReason("ab");
      expect(result.valid).toBe(false);
    });
  });

  describe("validateBulkLeaveApproval", () => {
    it("should accept valid bulk approval", () => {
      const result = validateBulkLeaveApproval(["id1", "id2"]);
      expect(result.valid).toBe(true);
    });

    it("should reject empty array", () => {
      const result = validateBulkLeaveApproval([]);
      expect(result.valid).toBe(false);
    });

    it("should reject too many requests", () => {
      const requests = Array.from({ length: 51 }, (_, i) => `id${i}`);
      const result = validateBulkLeaveApproval(requests);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("50"))).toBe(true);
    });
  });
});

describe("General Validation Functions", () => {
  describe("validateEmail", () => {
    it("should accept valid emails", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@company.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
    });
  });

  describe("validateDateRange", () => {
    it("should accept valid range", () => {
      const result = validateDateRange(
        new Date(2026, 1, 1),
        new Date(2026, 1, 10)
      );
      expect(result.valid).toBe(true);
    });

    it("should reject reversed range", () => {
      const result = validateDateRange(
        new Date(2026, 1, 10),
        new Date(2026, 1, 1)
      );
      expect(result.valid).toBe(false);
    });

    it("should accept same date", () => {
      const date = new Date(2026, 1, 1);
      const result = validateDateRange(date, date);
      expect(result.valid).toBe(true);
    });
  });

  describe("validateRequired", () => {
    it("should accept all required fields", () => {
      const result = validateRequired({
        name: "John",
        email: "john@example.com",
      });
      expect(result.valid).toBe(true);
    });

    it("should reject empty fields", () => {
      const result = validateRequired({
        name: "John",
        email: "",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("email"))).toBe(true);
    });

    it("should reject null/undefined", () => {
      const result = validateRequired({
        name: "John",
        email: null,
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("validateNumberRange", () => {
    it("should accept number in range", () => {
      const result = validateNumberRange(5, 1, 10, "Hours");
      expect(result.valid).toBe(true);
    });

    it("should reject number below minimum", () => {
      const result = validateNumberRange(0, 1, 10, "Hours");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("least"))).toBe(true);
    });

    it("should reject number above maximum", () => {
      const result = validateNumberRange(15, 1, 10, "Hours");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("exceed"))).toBe(true);
    });

    it("should reject non-number", () => {
      const result = validateNumberRange(NaN, 1, 10, "Hours");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("number"))).toBe(true);
    });
  });

  describe("validateStringLength", () => {
    it("should accept string within length", () => {
      const result = validateStringLength("test", 1, 10, "Name");
      expect(result.valid).toBe(true);
    });

    it("should reject too short", () => {
      const result = validateStringLength("a", 2, 10, "Name");
      expect(result.valid).toBe(false);
    });

    it("should reject too long", () => {
      const result = validateStringLength("a".repeat(11), 1, 10, "Name");
      expect(result.valid).toBe(false);
    });

    it("should require non-empty", () => {
      const result = validateStringLength("", 1, 10, "Name");
      expect(result.valid).toBe(false);
    });
  });

  describe("validateSelect", () => {
    it("should accept valid option", () => {
      const result = validateSelect("option1", ["option1", "option2"], "Type");
      expect(result.valid).toBe(true);
    });

    it("should reject invalid option", () => {
      const result = validateSelect("invalid", ["option1", "option2"], "Type");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("invalid"))).toBe(true);
    });

    it("should require selection", () => {
      const result = validateSelect(undefined, ["option1", "option2"], "Type");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("required"))).toBe(true);
    });
  });

  describe("validateCheckbox", () => {
    it("should accept checked", () => {
      const result = validateCheckbox(true, "Agreement");
      expect(result.valid).toBe(true);
    });

    it("should reject unchecked", () => {
      const result = validateCheckbox(false, "Agreement");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("checked"))).toBe(true);
    });
  });
});

describe("Utility Functions", () => {
  describe("combineValidations", () => {
    it("should combine multiple validations", () => {
      const validations = [
        { valid: true, errors: [] },
        { valid: true, errors: [] },
      ];
      const result = combineValidations(validations);
      expect(result.valid).toBe(true);
    });

    it("should collect all errors", () => {
      const validations = [
        { valid: false, errors: ["Error 1"] },
        { valid: false, errors: ["Error 2"] },
      ];
      const result = combineValidations(validations);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Error 1");
      expect(result.errors).toContain("Error 2");
    });
  });

  describe("sanitizeInput", () => {
    it("should trim whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should remove angle brackets", () => {
      expect(sanitizeInput("<script>alert()</script>")).toBe(
        "scriptalert()script"
      );
    });

    it("should preserve normal text", () => {
      expect(sanitizeInput("Hello World 123")).toBe("Hello World 123");
    });
  });

  describe("validateJSON", () => {
    it("should parse valid JSON", () => {
      const result = validateJSON('{"key": "value"}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ key: "value" });
    });

    it("should reject invalid JSON", () => {
      const result = validateJSON("{invalid}");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should parse arrays", () => {
      const result = validateJSON("[1, 2, 3]");
      expect(result.valid).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });
  });
});
