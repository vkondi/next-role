/** Resume validation utilities */

/** Validates if resume text meets minimum criteria */
export function validateResumeText(text: string): {
  isValid: boolean;
  error?: string;
} {
  if (!text || text.trim().length < 100) {
    return {
      isValid: false,
      error:
        'Resume text is too short. Please provide at least 100 characters of content.',
    };
  }

  const trimmed = text.trim();
  if (trimmed.split(/\s+/).length < 10) {
    return {
      isValid: false,
      error:
        'Resume text is too short. Please provide more details about your experience, skills, and background.',
    };
  }

  // Check for basic resume indicators
  const lowerText = text.toLowerCase();
  const resumeIndicators = [
    'experience',
    'skills',
    'education',
    'work',
    'role',
    'years',
  ];
  const foundIndicators = resumeIndicators.filter((indicator) =>
    lowerText.includes(indicator)
  ).length;

  if (foundIndicators === 0) {
    return {
      isValid: false,
      error:
        "The text doesn't look like a resume. Please include information about your experience, skills, or education.",
    };
  }

  return { isValid: true };
}
