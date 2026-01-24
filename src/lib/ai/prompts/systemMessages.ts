/** System messages for AI providers - consistent across Deepseek and Gemini */

export type PromptType = 'resumeInterpreter' | 'careerPathGenerator' | 'skillGapAnalyzer' | 'roadmapGenerator';

/**
 * System messages that define the AI's role and behavior for each prompt type.
 * These are used consistently across both Deepseek and Gemini APIs.
 * 
 */
const SYSTEM_MESSAGES: Record<PromptType, string> = {
  resumeInterpreter: `You are an expert resume analyzer. Extract and structure career profile data. Identify skills, experience, industry background, and certifications. Return ONLY valid JSON with no additional text.`,

  careerPathGenerator: `You are a career advisor specializing in career path generation. Generate realistic career options, assess market demand and industry alignment, and evaluate transition effort/reward. Return ONLY valid JSON with no markdown.`,

  skillGapAnalyzer: `You are a skills assessment expert. Analyze gaps between current and target roles. Evaluate proficiency levels, skill importance, learning timelines, and quick wins. Use standardized proficiency levels. Return ONLY valid JSON.`,

  roadmapGenerator: `You are a career coach specializing in transition planning. Create actionable month-by-month roadmaps with realistic phases. Balance skill development and application. Return ONLY valid JSON.`,
};

/**
 * Cache for system messages to avoid repeated lookups
 */
const messageCache = new Map<PromptType, string>();

/**
 * Get system message for a specific prompt type
 * Uses in-memory caching to avoid repeated object lookups
 * @param promptType The type of prompt
 * @returns The system message to use with the AI provider
 */
export function getSystemMessage(promptType: PromptType): string {
  let message = messageCache.get(promptType);
  if (!message) {
    message = SYSTEM_MESSAGES[promptType];
    messageCache.set(promptType, message);
  }
  return message;
}
