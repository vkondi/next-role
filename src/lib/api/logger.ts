/** Logger utility for backend logging with configurable log levels
 * Optimized for both local development and Vercel serverless deployment
 */

import pino from 'pino';

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Get the configured log level from environment or use default (ERROR)
 * Valid levels: trace, debug, info, warn, error, fatal
 */
function getLogLevel(): LogLevel {
  const envLevel = (process.env.LOG_LEVEL || 'error').toLowerCase();
  const validLevels: LogLevel[] = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
  ];

  if (validLevels.includes(envLevel as LogLevel)) {
    return envLevel as LogLevel;
  }

  console.warn(`Invalid LOG_LEVEL: ${envLevel}, defaulting to 'error'`);
  return 'error';
}

/**
 * Create pino logger instance optimized for both local dev and Vercel
 * Configuration:
 * - No worker threads (prevents serverless conflicts)
 * - Structured JSON output (optimal for log aggregation services like Vercel, DataDog, etc.)
 * - Includes timestamp and environment info for better debugging
 * - Compatible with Vercel's log streaming and retention
 */
const logger = pino({
  level: getLogLevel(),
  // Vercel-optimized settings
  transport: undefined, // No worker threads - critical for serverless
  base: {
    environment: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime, // ISO 8601 format - standard for log aggregation
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});

/**
 * Create a namespaced logger with a consistent prefix
 * Usage: const log = getLogger("API:CareerPath");
 *
 * This creates a child logger with the module namespace,
 * which will be included in every log entry for better traceability
 */
export function getLogger(namespace: string) {
  return logger.child({ module: namespace });
}

/**
 * Export the base logger for direct use
 */
export default logger;
