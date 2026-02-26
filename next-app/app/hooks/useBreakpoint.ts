import { useState, useEffect } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("lg");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set initial breakpoint
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setDimensions({ width, height: window.innerHeight });

      if (width >= BREAKPOINTS["2xl"]) {
        setBreakpoint("2xl");
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint("xl");
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint("lg");
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint("md");
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint("sm");
      } else {
        setBreakpoint("xs");
      }
    };

    // Set initial value
    updateBreakpoint();

    // Add event listener
    window.addEventListener("resize", updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return {
    breakpoint,
    dimensions,
    isMobile: breakpoint === "xs" || breakpoint === "sm",
    isTablet: breakpoint === "md",
    isDesktop:
      breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl",
    isXs: breakpoint === "xs",
    isSm: breakpoint === "sm",
    isMd: breakpoint === "md",
    isLg: breakpoint === "lg",
    isXl: breakpoint === "xl",
    is2Xl: breakpoint === "2xl",
    // Utility functions
    greaterThan: (bp: Breakpoint) => {
      const currentIndex = Object.keys(BREAKPOINTS).indexOf(breakpoint);
      const targetIndex = Object.keys(BREAKPOINTS).indexOf(bp);
      return currentIndex > targetIndex;
    },
    lessThan: (bp: Breakpoint) => {
      const currentIndex = Object.keys(BREAKPOINTS).indexOf(breakpoint);
      const targetIndex = Object.keys(BREAKPOINTS).indexOf(bp);
      return currentIndex < targetIndex;
    },
    between: (min: Breakpoint, max: Breakpoint) => {
      const currentIndex = Object.keys(BREAKPOINTS).indexOf(breakpoint);
      const minIndex = Object.keys(BREAKPOINTS).indexOf(min);
      const maxIndex = Object.keys(BREAKPOINTS).indexOf(max);
      return currentIndex >= minIndex && currentIndex <= maxIndex;
    },
  };
}

// Hook for conditional rendering based on breakpoint
export function useResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T,
): T {
  const { breakpoint } = useBreakpoint();
  return values[breakpoint] ?? defaultValue;
}

// Hook for responsive classes
export function useResponsiveClass(
  classes: Partial<Record<Breakpoint, string>>,
  baseClass = "",
): string {
  const { breakpoint } = useBreakpoint();
  const responsiveClass = classes[breakpoint] || "";
  return `${baseClass} ${responsiveClass}`.trim();
}
