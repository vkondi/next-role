/** Timeline utilities for career roadmap planning */

import { TIMELINE_CONFIG } from '@/lib/config/appConfig';

/** Extracts numeric months from estimated time strings */
export function extractMonthsFromEstimate(estimatedTime: string): {
  min: number;
  max: number;
} {
  const match = estimatedTime.match(/(\d+)(?:\s*-\s*(\d+))?\s*months?/i);
  if (!match) {
    return {
      min: TIMELINE_CONFIG.DEFAULT_TIMELINE_MONTHS,
      max: TIMELINE_CONFIG.DEFAULT_TIMELINE_MONTHS,
    };
  }

  const minMonths = parseInt(match[1], 10);
  const maxMonths = match[2] ? parseInt(match[2], 10) : minMonths;

  return {
    min: Math.max(minMonths, TIMELINE_CONFIG.MIN_TIMELINE_MONTHS),
    max: Math.min(maxMonths, TIMELINE_CONFIG.MAX_TIMELINE_MONTHS),
  };
}

/** Calculates recommended timeline based on skill gap severity */
export function calculateTimelineMonths(
  estimatedTimeToClose: string,
  overallGapSeverity: 'Low' | 'Medium' | 'High'
): number {
  const { max } = extractMonthsFromEstimate(estimatedTimeToClose);

  let timeline = max;
  const buffer = TIMELINE_CONFIG.BUFFER_BY_SEVERITY[overallGapSeverity];
  timeline = Math.min(timeline + buffer, TIMELINE_CONFIG.MAX_TIMELINE_MONTHS);

  return Math.max(
    TIMELINE_CONFIG.MIN_TIMELINE_MONTHS,
    Math.min(timeline, TIMELINE_CONFIG.MAX_TIMELINE_MONTHS)
  );
}

/** Validates timeline is within acceptable bounds */
export function validateTimeline(months: number): number {
  return Math.max(
    TIMELINE_CONFIG.MIN_TIMELINE_MONTHS,
    Math.min(months, TIMELINE_CONFIG.MAX_TIMELINE_MONTHS)
  );
}

/** Formats month range for display (e.g., "Month 1-3" or "Month 6") */
export function formatMonthRange(startMonth: number, endMonth: number): string {
  if (startMonth === endMonth) {
    return `Month ${startMonth}`;
  }
  return `Month ${startMonth}-${endMonth}`;
}
