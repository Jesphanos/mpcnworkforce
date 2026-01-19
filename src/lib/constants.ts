/**
 * MPCN Application Constants
 * 
 * Single source of truth for all magic numbers and configuration values.
 * Never hardcode values in components - reference from here.
 */

// ============================================
// AUTHENTICATION
// ============================================
export const AUTH = {
  MIN_PASSWORD_LENGTH: 6,
  PASSWORD_STRENGTH_THRESHOLDS: {
    WEAK: 2,
    MEDIUM: 3,
    STRONG: 4,
  },
  SESSION_REMEMBER_DAYS: 30,
  OTP_LENGTH: 6,
} as const;

// ============================================
// PAGINATION
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
  MAX_ITEMS_PER_PAGE: 100,
  AUDIT_LOG_DEFAULT_LIMIT: 50,
  ACTIVITY_LOG_DEFAULT_LIMIT: 20,
} as const;

// ============================================
// UI DISPLAY
// ============================================
export const DISPLAY = {
  EMPLOYEE_ID_SHORT_LENGTH: 8,
  AVATAR_INITIALS_LENGTH: 2,
  MAX_NOTIFICATIONS_SHOWN: 10,
  TOAST_DURATION_MS: 5000,
  DEBOUNCE_MS: 300,
  SKELETON_COUNT: {
    STATS_CARDS: 5,
    TABLE_ROWS: 5,
    LIST_ITEMS: 3,
  },
} as const;

// ============================================
// FILE UPLOADS
// ============================================
export const UPLOADS = {
  MAX_AVATAR_SIZE_MB: 5,
  MAX_DOCUMENT_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

// ============================================
// TRADING
// ============================================
export const TRADING = {
  DEFAULT_RISK_PERCENTAGE: 1,
  MAX_RISK_PERCENTAGE: 2,
  DEMO_DAYS_REQUIRED: 30,
  CAPITAL_TIERS: [1, 2, 3, 4, 5] as const,
  RISK_TIERS: [1, 2, 3] as const,
} as const;

// ============================================
// INVESTMENTS
// ============================================
export const INVESTMENTS = {
  MIN_INVESTMENT_AMOUNT: 100,
  DEFAULT_HOLDING_PERIOD_DAYS: 90,
  WITHDRAWAL_PROCESSING_DAYS: 5,
} as const;

// ============================================
// SLA & GOVERNANCE
// ============================================
export const GOVERNANCE = {
  SLA_WARNING_HOURS: 24,
  SLA_CRITICAL_HOURS: 4,
  ATTENTION_SIGNAL_THRESHOLD: 3,
  RESOLUTION_REQUEST_SLA_HOURS: 72,
} as const;

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
export const SHORTCUTS = {
  COMMAND_PALETTE: ['Meta+k', 'Ctrl+k'],
  SEARCH: ['Meta+/', 'Ctrl+/'],
  NEW_REPORT: ['Meta+n', 'Ctrl+n'],
  SAVE: ['Meta+s', 'Ctrl+s'],
  ESCAPE: ['Escape'],
} as const;

// ============================================
// ANIMATION DURATIONS (in seconds)
// ============================================
export const ANIMATION = {
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.5,
  PAGE_TRANSITION: 0.2,
} as const;

// ============================================
// API LIMITS
// ============================================
export const API = {
  SUPABASE_DEFAULT_LIMIT: 1000,
  REALTIME_RECONNECT_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 30000,
} as const;
