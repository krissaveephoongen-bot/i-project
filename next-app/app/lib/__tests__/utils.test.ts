import { describe, it, expect } from "vitest";
import { cn } from "../utils";
import { BREAKPOINTS } from "../responsive";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("text-red-500", "bg-blue-500");
      expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle conditional classes", () => {
      const result = cn("text-red-500", false && "bg-blue-500", "p-4");
      expect(result).toBe("text-red-500 p-4");
    });

    it("should merge tailwind classes properly", () => {
      const result = cn("p-4", "p-8");
      expect(result).toBe("p-8");
    });
  });

  describe("Responsive Constants", () => {
    it("should have correct breakpoint values", () => {
      expect(BREAKPOINTS.sm).toBe(640);
      expect(BREAKPOINTS.md).toBe(768);
      expect(BREAKPOINTS.lg).toBe(1024);
      expect(BREAKPOINTS.xl).toBe(1280);
      expect(BREAKPOINTS["2xl"]).toBe(1536);
    });
  });
});
