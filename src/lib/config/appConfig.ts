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

export const ROADMAP_CONFIG = {
  MIN_PHASES: 2,
  MAX_PHASES: 5,
  // Phase count recommendation based on gap severity and timeline
  PHASE_COUNT_BY_SEVERITY: {
    Low: {
      short: 2, // 3-6 months
      medium: 2, // 7-12 months
      long: 3, // 13+ months
    },
    Medium: {
      short: 2, // 3-6 months
      medium: 3, // 7-12 months
      long: 4, // 13+ months
    },
    High: {
      short: 3, // 3-6 months
      medium: 4, // 7-12 months
      long: 5, // 13+ months
    },
  },
  // Timeline breakpoints for severity classification
  TIMELINE_BREAKPOINTS: {
    SHORT_MAX: 6, // 3-6 months = short
    MEDIUM_MAX: 12, // 7-12 months = medium
    // 13+ months = long
  },
} as const;

/**
 * AI Provider Token Configuration
 * Controls max output tokens for each AI prompt type
 * Can be overridden with environment variables:
 * - MAX_TOKENS_DEFAULT: Default for all prompts
 * - MAX_TOKENS_RESUME: Resume interpreter
 * - MAX_TOKENS_CAREER_PATH: Career path generator
 * - MAX_TOKENS_SKILL_GAP: Skill gap analyzer
 * - MAX_TOKENS_ROADMAP: Roadmap generator
 */
export const TOKEN_CONFIG = {
  DEFAULT: parseInt(process.env.MAX_TOKENS_DEFAULT || "1500", 10),
  RESUME_INTERPRETER: parseInt(process.env.MAX_TOKENS_RESUME || "1600", 10),
  CAREER_PATH_GENERATOR: parseInt(
    process.env.MAX_TOKENS_CAREER_PATH || "2000",
    10
  ),
  SKILL_GAP_ANALYZER: parseInt(process.env.MAX_TOKENS_SKILL_GAP || "1600", 10),
  ROADMAP_GENERATOR: parseInt(process.env.MAX_TOKENS_ROADMAP || "2500", 10),
} as const;
