/**
 * Shared constants for UI styling and status management
 * Used across payment flow and subscription management components
 */

/**
 * Status badge color schemes
 */
export const STATUS_COLORS = {
  SUCCESS: {
    text: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    className: "text-green-600 bg-green-50 border-green-200"
  },
  PENDING: {
    text: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    className: "text-yellow-600 bg-yellow-50 border-yellow-200"
  },
  FAILED: {
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    className: "text-red-600 bg-red-50 border-red-200"
  },
  EXPIRED: {
    text: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    className: "text-gray-600 bg-gray-50 border-gray-200"
  },
  CANCELED: {
    text: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    className: "text-gray-600 bg-gray-50 border-gray-200"
  },
  ACTIVE: {
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    className: "text-blue-600 bg-blue-50 border-blue-200"
  },
  INACTIVE: {
    text: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    className: "text-gray-600 bg-gray-50 border-gray-200"
  }
} as const;

/**
 * Subscription status types
 */
export type SubscriptionStatus = keyof typeof STATUS_COLORS;

/**
 * Get status color configuration
 */
export const getStatusColor = (status: string) => {
  const normalizedStatus = status.toUpperCase() as SubscriptionStatus;
  return STATUS_COLORS[normalizedStatus] || STATUS_COLORS.PENDING;
};

/**
 * Gradient background classes
 */
export const GRADIENT_BACKGROUNDS = {
  default: "bg-gradient-to-br from-background via-background to-muted/30",
  success: "bg-gradient-to-b from-green-50 to-background",
  card: "bg-gradient-to-r from-primary/10 to-secondary/10",
  subtle: "bg-gradient-to-br from-muted/20 to-background"
} as const;

/**
 * Loading spinner sizes
 */
export const SPINNER_SIZES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
  xl: "h-16 w-16"
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 1000
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  dropdown: 1000,
  modal: 1100,
  toast: 1200,
  tooltip: 1300
} as const;
