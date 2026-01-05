// Global Application Constants and Configuration
export const APP_CONFIG = {
  // Application Metadata
  APP_NAME: 'UltraProject',
  APP_VERSION: '2.0.0',
  APP_DESCRIPTION: 'Ultimate Project Management Platform',

  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.ultraproject.com/v1',
  API_TIMEOUT: 30000, // 30 seconds
  API_RETRY_COUNT: 3,

  // UI Configuration
  DEFAULT_THEME: 'system',
  SUPPORTED_THEMES: ['light', 'dark', 'system'] as const,
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'zh'] as const,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,

  // Date & Time Formats
  DATE_FORMATS: {
    DEFAULT: 'MMM D, YYYY',
    SHORT: 'MM/DD/YYYY',
    LONG: 'MMMM D, YYYY',
    TIME: 'h:mm A',
    DATETIME: 'MMM D, YYYY h:mm A',
    ISO: 'YYYY-MM-DD'
  },

  // Animation & Transition Durations
  ANIMATION_DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    ENTRANCE: 400,
    EXIT: 250
  },

  // Error Handling
  ERROR_MESSAGES: {
    GENERIC: 'An unexpected error occurred. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    AUTHENTICATION: 'Authentication failed. Please login again.',
    VALIDATION: 'Validation failed. Please check your input.',
    NOT_FOUND: 'Resource not found.',
    FORBIDDEN: 'You do not have permission to perform this action.'
  },

  // Toast Notifications
  TOAST_CONFIG: {
    SUCCESS_DURATION: 5000,
    ERROR_DURATION: 8000,
    INFO_DURATION: 4000,
    POSITION: 'top-right' as const,
    MAX_TOASTS: 5
  },

  // AI Service Configuration
  AI_SERVICE: {
    TIMEOUT: 15000,
    RETRY_COUNT: 2,
    CONFIDENCE_THRESHOLD: 0.85,
    DEFAULT_ESTIMATE: 8 // hours
  },

  // Collaboration Service
  COLLABORATION: {
    RECONNECT_DELAY: 5000,
    PRESENCE_TIMEOUT: 30000,
    MESSAGE_HISTORY_LIMIT: 100
  },

  // Analytics Configuration
  ANALYTICS: {
    HEALTH_SCORE_THRESHOLDS: {
      CRITICAL: 40,
      AT_RISK: 60,
      STABLE: 80,
      HEALTHY: 90
    },
    RISK_LEVELS: ['low', 'medium', 'high', 'critical'] as const
  },

  // Resource Management
  RESOURCE_MANAGEMENT: {
    MAX_WORKLOAD: 40, // hours per week
    IDEAL_UTILIZATION: 0.8, // 80%
    OVERLOAD_THRESHOLD: 0.9, // 90%
    UNDERUTILIZED_THRESHOLD: 0.5 // 50%
  },

  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_STRONG_LENGTH: 12,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FILE_TYPES: ['jpg', 'png', 'pdf', 'docx', 'xlsx'] as const
  },

  // Feature Flags
  FEATURE_FLAGS: {
    AI_POWERED_FEATURES: true,
    REALTIME_COLLABORATION: true,
    ADVANCED_ANALYTICS: true,
    CUSTOM_WORKFLOWS: true,
    TWO_FACTOR_AUTH: true
  }
};

// Color Palette - Modern Professional Design System
export const COLORS = {
  PRIMARY: {
    50: '#f0f7ff',
    100: '#e0f0fe',
    200: '#bae0fd',
    300: '#7ccfff',
    400: '#3ea1f1',
    500: '#0e88e6',
    600: '#026bc4',
    700: '#0659a0',
    800: '#0b4a82',
    900: '#0d3d69',
    DEFAULT: '#0e88e6'
  },
  SECONDARY: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    DEFAULT: '#ec4899'
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    DEFAULT: '#22c55e'
  },
  WARNING: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    DEFAULT: '#eab308'
  },
  DANGER: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    DEFAULT: '#ef4444'
  },
  INFO: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    DEFAULT: '#3b82f6'
  },
  GRAY: {
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
    DEFAULT: '#6b7280'
  },
  DARK: '#1f2937',
  LIGHT: '#f9fafb'
};

// Typography Configuration
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    PRIMARY: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    SECONDARY: 'Georgia, serif',
    MONO: '"Fira Code", "Courier New", monospace'
  },
  FONT_SIZES: {
    XS: '0.75rem',     // 12px
    SM: '0.875rem',    // 14px
    BASE: '1rem',      // 16px
    LG: '1.125rem',    // 18px
    XL: '1.25rem',     // 20px
    '2XL': '1.5rem',   // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem',  // 36px
    '5XL': '3rem',     // 48px
    '6XL': '3.75rem'    // 60px
  },
  FONT_WEIGHTS: {
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800,
    BLACK: 900
  },
  LINE_HEIGHTS: {
    NONE: 1,
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.625,
    LOOSE: 2
  }
};

// Spacing System (rem-based for accessibility)
export const SPACING = {
  '0': '0rem',
  '0.5': '0.125rem',   // 2px
  '1': '0.25rem',      // 4px
  '1.5': '0.375rem',   // 6px
  '2': '0.5rem',       // 8px
  '2.5': '0.625rem',   // 10px
  '3': '0.75rem',      // 12px
  '3.5': '0.875rem',   // 14px
  '4': '1rem',         // 16px
  '5': '1.25rem',      // 20px
  '6': '1.5rem',       // 24px
  '7': '1.75rem',      // 28px
  '8': '2rem',         // 32px
  '9': '2.25rem',      // 36px
  '10': '2.5rem',      // 40px
  '12': '3rem',        // 48px
  '14': '3.5rem',      // 56px
  '16': '4rem',        // 64px
  '20': '5rem',        // 80px
  '24': '6rem',        // 96px
  '28': '7rem',        // 112px
  '32': '8rem',        // 128px
  '36': '9rem',        // 144px
  '40': '10rem',       // 160px
  '48': '12rem',       // 192px
  '64': '16rem',       // 256px
  '80': '20rem',       // 320px
  '96': '24rem'        // 384px
};

// Border Radius Configuration
export const BORDER_RADIUS = {
  NONE: '0px',
  SM: '0.125rem',     // 2px
  DEFAULT: '0.25rem', // 4px
  MD: '0.375rem',     // 6px
  LG: '0.5rem',       // 8px
  XL: '0.75rem',      // 12px
  '2XL': '1rem',       // 16px
  '3XL': '1.5rem',     // 24px
  FULL: '9999px'
};

// Box Shadow Configuration
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2XL': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  INNER: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
};

// Animation Configuration
export const ANIMATIONS = {
  FADE_IN: 'fadeIn 0.3s ease-in-out',
  FADE_OUT: 'fadeOut 0.2s ease-in-out',
  SLIDE_UP: 'slideUp 0.3s ease-out',
  SLIDE_DOWN: 'slideDown 0.3s ease-out',
  SLIDE_LEFT: 'slideLeft 0.3s ease-out',
  SLIDE_RIGHT: 'slideRight 0.3s ease-out',
  SCALE_IN: 'scaleIn 0.2s ease-out',
  SCALE_OUT: 'scaleOut 0.2s ease-in',
  PULSE: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  SPIN: 'spin 1s linear infinite',
  BOUNCE: 'bounce 1s infinite'
};

// Breakpoints for Responsive Design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

// Z-Index Configuration
export const Z_INDICES = {
  HIDDEN: -1,
  AUTO: 'auto',
  BASE: 0,
  DOCKED: 10,
  DROPDOWN: 20,
  STICKY: 30,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  TOOLTIP: 60,
  POPUP: 70,
  TOAST: 80,
  MAX: 9999
};

// API Endpoint Configuration
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me'
  },
  PROJECTS: {
    LIST: '/projects',
    DETAIL: (id: string) => `/projects/${id}`,
    CREATE: '/projects',
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`
  },
  TASKS: {
    LIST: (projectId?: string) => projectId ? `/projects/${projectId}/tasks` : '/tasks',
    DETAIL: (id: string) => `/tasks/${id}`,
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    PROJECT: (id: string) => `/analytics/projects/${id}`,
    REPORTS: '/analytics/reports'
  },
  AI: {
    PRIORITIZE: '/ai/prioritize',
    ALLOCATE: '/ai/allocate',
    ESTIMATE: '/ai/estimate',
    ANALYZE: '/ai/analyze'
  }
};

// Error Code Mapping
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_FAILED: 'AUTH_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_INPUT: 'INVALID_INPUT'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ultraproject_auth_token',
  USER_PREFERENCES: 'ultraproject_user_prefs',
  THEME: 'ultraproject_theme',
  LAST_ACTIVE: 'ultraproject_last_active',
  ONBOARDING: 'ultraproject_onboarding_complete'
};

// Feature Configuration
export const FEATURE_CONFIG = {
  ENABLE_AI_FEATURES: true,
  ENABLE_REALTIME: true,
  ENABLE_ANALYTICS: true,
  ENABLE_CUSTOMIZATION: true,
  MAX_FILE_UPLOAD: 50 * 1024 * 1024, // 50MB
  MAX_TEAM_SIZE: 100,
  MAX_PROJECTS: 500
};

// Export all constants for easy import
export default {
  APP_CONFIG,
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATIONS,
  BREAKPOINTS,
  Z_INDICES,
  API_ENDPOINTS,
  ERROR_CODES,
  STORAGE_KEYS,
  FEATURE_CONFIG
};