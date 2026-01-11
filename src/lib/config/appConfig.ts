/** Application configuration constants */

export const CAREER_PATH_CONFIG = {
  DEFAULT_NUMBER_OF_PATHS: 5,
  MIN_PATHS: 1,
  MAX_PATHS: 10,
} as const;

export const TIMELINE_CONFIG = {
  MIN_TIMELINE_MONTHS: 3,
  MAX_TIMELINE_MONTHS: 24,
  DEFAULT_TIMELINE_MONTHS: 6,
  BUFFER_BY_SEVERITY: {
    Low: 0,
    Medium: 1,
    High: 2,
  },
} as const;

export const SKILL_GAP_CONFIG = {
  MAX_DISPLAYED_SKILLS: 8,
  MIN_HIGHLIGHT_IMPORTANCE: "Medium" as const,
} as const;

export const UI_CONFIG = {
  CAROUSEL_VISIBLE_CARDS: 1.5,
  PULSE_ANIMATION_MS: 1000,
} as const;

export const API_CONFIG = {
  REQUEST_TIMEOUT_MS: 60000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
} as const;

export const GEMINI_CONFIG = {
  MODEL: (process.env.GEMINI_MODEL || "gemini-2.5-flash") as string,
  DEFAULT_MODEL: "gemini-2.5-flash" as const,
  SUPPORTED_MODELS: ["gemini-2.5-flash", "gemini-3-flash-preview"] as const,
} as const;
