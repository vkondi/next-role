/**
 * Application configuration constants
 * Central place for all configurable application settings
 */

/**
 * Career path analysis configuration
 */
export const CAREER_PATH_CONFIG = {
  // Number of career paths to suggest in carousel
  DEFAULT_NUMBER_OF_PATHS: 5,
  // Minimum and maximum possible paths
  MIN_PATHS: 1,
  MAX_PATHS: 10,
} as const;

/**
 * Timeline constraints for career roadmaps
 */
export const TIMELINE_CONFIG = {
  // Minimum timeline in months
  MIN_TIMELINE_MONTHS: 3,
  // Maximum timeline in months
  MAX_TIMELINE_MONTHS: 24,
  // Default timeline (used if estimate cannot be determined)
  DEFAULT_TIMELINE_MONTHS: 6,
  // Additional buffer added based on gap severity
  BUFFER_BY_SEVERITY: {
    Low: 0,
    Medium: 1,
    High: 2,
  },
} as const;

/**
 * Skill gap configuration
 */
export const SKILL_GAP_CONFIG = {
  // Maximum number of skill gaps to display
  MAX_DISPLAYED_SKILLS: 8,
  // Minimum gap importance to highlight
  MIN_HIGHLIGHT_IMPORTANCE: "Medium" as const,
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  // Number of cards visible in carousel at once
  CAROUSEL_VISIBLE_CARDS: 1.5,
  // Animated pulse duration in milliseconds
  PULSE_ANIMATION_MS: 1000,
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  // Request timeout in milliseconds
  REQUEST_TIMEOUT_MS: 60000,
  // Maximum retries for failed requests
  MAX_RETRIES: 3,
  // Retry delay in milliseconds
  RETRY_DELAY_MS: 1000,
} as const;
