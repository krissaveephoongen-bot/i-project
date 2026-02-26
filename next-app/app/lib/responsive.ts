// Responsive Design Utilities and Breakpoints

export const BREAKPOINTS = {
  sm: 640, // Small devices (phones)
  md: 768, // Medium devices (tablets)
  lg: 1024, // Large devices (desktops)
  xl: 1280, // Extra large devices (large desktops)
  "2xl": 1536, // 2X large devices
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Responsive utilities for conditional rendering
export function useBreakpoint() {
  // This would typically use a hook like useMediaQuery
  // For now, we'll return a basic implementation
  return {
    isMobile:
      typeof window !== "undefined" && window.innerWidth < BREAKPOINTS.md,
    isTablet:
      typeof window !== "undefined" &&
      window.innerWidth >= BREAKPOINTS.md &&
      window.innerWidth < BREAKPOINTS.lg,
    isDesktop:
      typeof window !== "undefined" && window.innerWidth >= BREAKPOINTS.lg,
    currentBreakpoint: "lg" as Breakpoint,
  };
}

// Grid system utilities
export const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
} as const;

// Responsive grid classes
export const RESPONSIVE_GRID = {
  // Mobile-first approach
  mobile: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  tablet: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  desktop: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  stats: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  cards: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
} as const;

// Spacing utilities
export const SPACING = {
  xs: "space-y-2",
  sm: "space-y-4",
  md: "space-y-6",
  lg: "space-y-8",
  xl: "space-y-12",
} as const;

// Container utilities
export const CONTAINER_CLASSES = {
  narrow: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8",
  standard: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  wide: "max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8",
  full: "w-full px-4 sm:px-6 lg:px-8",
} as const;

// Typography responsive classes
export const TEXT_SIZES = {
  xs: "text-xs sm:text-sm",
  sm: "text-sm sm:text-base",
  base: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
  xl: "text-xl sm:text-2xl",
  "2xl": "text-2xl sm:text-3xl",
  "3xl": "text-3xl sm:text-4xl",
} as const;

// Button responsive classes
export const BUTTON_SIZES = {
  xs: "px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm",
  sm: "px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base",
  md: "px-4 py-2 text-base sm:px-6 sm:py-3",
  lg: "px-6 py-3 text-lg sm:px-8 sm:py-4",
} as const;

// Table responsive utilities
export const TABLE_RESPONSIVE = {
  scroll: "overflow-x-auto",
  stack: "block sm:table",
  hideColumns: "hidden lg:table-cell", // Hide on mobile/tablet
  priority: "table-cell", // Always show
} as const;

// Navigation responsive patterns
export const NAV_PATTERNS = {
  mobileMenu: "fixed inset-0 z-50 lg:hidden",
  desktopMenu: "hidden lg:flex",
  mobileToggle: "lg:hidden",
  breadcrumb: "text-sm overflow-hidden",
} as const;

// Form responsive patterns
export const FORM_LAYOUTS = {
  singleColumn: "space-y-4 sm:space-y-6",
  twoColumn: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
  threeColumn: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
  stacked: "flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4",
} as const;

// Modal/Dialog responsive patterns
export const MODAL_SIZES = {
  xs: "w-full max-w-xs sm:max-w-sm",
  sm: "w-full max-w-sm sm:max-w-md",
  md: "w-full max-w-md sm:max-w-lg",
  lg: "w-full max-w-lg sm:max-w-2xl",
  xl: "w-full max-w-2xl sm:max-w-4xl",
  full: "w-full max-w-full",
} as const;

// Animation utilities for responsive interactions
export const ANIMATIONS = {
  fadeIn: "animate-in fade-in duration-300",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
} as const;

// Touch-friendly utilities
export const TOUCH_TARGETS = {
  minimum: "min-h-[44px] min-w-[44px]", // iOS Human Interface Guidelines
  comfortable: "min-h-[48px] min-w-[48px]",
  spacious: "min-h-[52px] min-w-[52px]",
} as const;

// Accessibility responsive utilities
export const A11Y_RESPONSIVE = {
  focusRing:
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  srOnly: "sr-only sm:not-sr-only", // Show on larger screens
  reducedMotion: "motion-reduce:transition-none",
} as const;

// Performance utilities for responsive loading
export const LOADING_PATTERNS = {
  skeleton: "animate-pulse bg-muted rounded",
  shimmer:
    "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
} as const;
