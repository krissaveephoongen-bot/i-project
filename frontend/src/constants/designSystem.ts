/**
 * Design System - Color Palette, Typography, and Component Standards
 * Professional SaaS Style with Deep Blue/Indigo primary color
 */

export const COLORS = {
  // Primary Colors (Deep Blue/Indigo)
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c1d3ff',
    300: '#a2bdff',
    400: '#8ca9ff',
    500: '#6b7dff', // Primary
    600: '#5566e6',
    700: '#4450cc',
    800: '#333ab3',
    900: '#222599',
  },
  
  // Neutral Colors (Grays)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Status Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    300: '#86efac',
    500: '#22c55e', // Completed
    600: '#16a34a',
    700: '#15803d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    300: '#fcd34d',
    500: '#f59e0b', // Pending
    600: '#d97706',
    700: '#b45309',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    300: '#fca5a5',
    500: '#ef4444', // Overdue
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Semantic
  background: '#ffffff',
  surface: '#f9fafb',
  border: '#e5e7eb',
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    muted: '#9ca3af',
  },
};

export const TYPOGRAPHY = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
};

export const SHADOWS = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
};

export const BORDER_RADIUS = {
  none: '0px',
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  full: '9999px',
};

export const STATUS_CONFIG = {
  todo: {
    label: 'To Do',
    backgroundColor: COLORS.neutral[100],
    textColor: COLORS.neutral[700],
    borderColor: COLORS.neutral[300],
    icon: '○',
  },
  in_progress: {
    label: 'In Progress',
    backgroundColor: COLORS.primary[50],
    textColor: COLORS.primary[700],
    borderColor: COLORS.primary[300],
    icon: '▶',
  },
  pending: {
    label: 'Pending',
    backgroundColor: COLORS.warning[50],
    textColor: COLORS.warning[700],
    borderColor: COLORS.warning[300],
    icon: '⏱',
  },
  completed: {
    label: 'Completed',
    backgroundColor: COLORS.success[50],
    textColor: COLORS.success[700],
    borderColor: COLORS.success[300],
    icon: '✓',
  },
  overdue: {
    label: 'Overdue',
    backgroundColor: COLORS.error[50],
    textColor: COLORS.error[700],
    borderColor: COLORS.error[300],
    icon: '⚠',
  },
  done: {
    label: 'Done',
    backgroundColor: COLORS.success[50],
    textColor: COLORS.success[700],
    borderColor: COLORS.success[300],
    icon: '✓',
  },
};

export const COMPONENT_STYLES = {
  button: {
    base: `
      font-family: ${TYPOGRAPHY.fontFamily.sans}
      font-weight: ${TYPOGRAPHY.fontWeight.medium}
      border-radius: ${BORDER_RADIUS.lg}
      transition: all 0.2s ease-in-out
      focus-visible: outline-offset-2
    `,
    primary: `
      background-color: ${COLORS.primary[500]}
      color: white
      hover:bg-${COLORS.primary[600]}
      active:bg-${COLORS.primary[700]}
      shadow-sm
      hover:shadow-md
    `,
    secondary: `
      background-color: ${COLORS.neutral[100]}
      color: ${COLORS.neutral[700]}
      border: 1px solid ${COLORS.neutral[300]}
      hover:bg-${COLORS.neutral[200]}
      hover:border-${COLORS.neutral[400]}
    `,
    danger: `
      background-color: ${COLORS.error[500]}
      color: white
      hover:bg-${COLORS.error[600]}
      active:bg-${COLORS.error[700]}
    `,
  },
  input: {
    base: `
      font-family: ${TYPOGRAPHY.fontFamily.sans}
      border: 1px solid ${COLORS.border}
      border-radius: ${BORDER_RADIUS.lg}
      padding: ${SPACING.md}
      font-size: ${TYPOGRAPHY.fontSize.base}
      transition: all 0.2s ease-in-out
      focus:border-${COLORS.primary[500]}
      focus:ring: 2px ${COLORS.primary[100]}
    `,
  },
  card: {
    base: `
      background-color: ${COLORS.background}
      border: 1px solid ${COLORS.border}
      border-radius: ${BORDER_RADIUS.lg}
      padding: ${SPACING.lg}
      box-shadow: ${SHADOWS.sm}
      transition: all 0.2s ease-in-out
    `,
    hover: `
      hover:shadow-${SHADOWS.md}
      hover:border-${COLORS.primary[200]}
    `,
  },
};
