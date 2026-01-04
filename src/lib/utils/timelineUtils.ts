/**
 * Timeline utilities for career roadmap planning
 * Handles parsing estimated time strings and calculating optimal timeline
 */

import { TIMELINE_CONFIG } from "@/lib/config/appConfig";

/**
 * Extracts numeric months from an estimated time string
 * Examples: "3-6 months" -> [3, 6], "6-12 months" -> [6, 12], "3 months" -> [3, 3]
 */
export function extractMonthsFromEstimate(estimatedTime: string): { min: number; max: number } {
  const match = estimatedTime.match(/(\d+)(?:\s*-\s*(\d+))?\s*months?/i);
  if (!match) {
    // Default to configured default if parsing fails
    return { min: TIMELINE_CONFIG.DEFAULT_TIMELINE_MONTHS, max: TIMELINE_CONFIG.DEFAULT_TIMELINE_MONTHS };
  }

  const minMonths = parseInt(match[1], 10);
  const maxMonths = match[2] ? parseInt(match[2], 10) : minMonths;

  return {
    min: Math.max(minMonths, TIMELINE_CONFIG.MIN_TIMELINE_MONTHS),
    max: Math.min(maxMonths, TIMELINE_CONFIG.MAX_TIMELINE_MONTHS),
  };
}

/**
 * Calculates the recommended timeline based on skill gap severity and estimated time
 * Uses the maximum estimated months as the timeline to be realistic
 */
export function calculateTimelineMonths(
  estimatedTimeToClose: string,
  overallGapSeverity: "Low" | "Medium" | "High"
): number {
  const { max } = extractMonthsFromEstimate(estimatedTimeToClose);

  // Use max of the range as the timeline, but add buffer based on severity
  let timeline = max;

  // Add buffer based on severity for unforeseen challenges
  const buffer = TIMELINE_CONFIG.BUFFER_BY_SEVERITY[overallGapSeverity];
  timeline = Math.min(timeline + buffer, TIMELINE_CONFIG.MAX_TIMELINE_MONTHS);

  // Ensure within bounds
  return Math.max(TIMELINE_CONFIG.MIN_TIMELINE_MONTHS, Math.min(timeline, TIMELINE_CONFIG.MAX_TIMELINE_MONTHS));
}

/**
 * Validates a timeline is within acceptable bounds
 */
export function validateTimeline(months: number): number {
  return Math.max(TIMELINE_CONFIG.MIN_TIMELINE_MONTHS, Math.min(months, TIMELINE_CONFIG.MAX_TIMELINE_MONTHS));
}
