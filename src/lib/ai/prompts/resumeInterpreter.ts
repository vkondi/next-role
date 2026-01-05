/**
 * Resume Interpreter Prompt Module
 * Converts resume text into structured JSON format
 */

import { ResumeProfileSchema } from "../schemas";
import type { ResumeProfile } from "../schemas";
import { callDeepseekAPI } from "@/lib/api/deepseek";

export function createResumeInterpreterPrompt(
  resumeText: string
): string {
  return `You are an expert career analyst and resume parser. Your task is to extract and structure resume information.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown formatting, no code blocks, no extra text.

Given the following resume text, extract and structure the information:

<resume>
${resumeText}
</resume>

Return a JSON object with this exact structure:
{
  "name": "string - person's name (optional, null if not found)",
  "currentRole": "string - current/most recent job title",
  "yearsOfExperience": number - total years of professional experience,
  "techStack": ["array of technologies, programming languages, tools"],
  "strengthAreas": ["array of key competencies and strengths"],
  "industryBackground": "string - industry or domain expertise",
  "certifications": ["array of professional certifications or null/empty if none"],
  "education": ["array of educational background or null/empty if none"]
}

STRICT REQUIREMENTS:
- Return ONLY the JSON object, no additional text
- Ensure all strings are properly escaped
- Years of experience should be a number, not a string
- Tech stack and strength areas should be arrays of strings
- If information is not available, use empty arrays []
- For yearsOfExperience, estimate based on work history if exact number is not stated`;
}

/**
 * Parses and validates the AI response for resume interpretation
 */
export async function parseResumeInterpreterResponse(
  responseText: string
): Promise<ResumeProfile> {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7); // Remove ```json
    }
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.substring(3); // Remove ```
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    if (!cleanedText || cleanedText === "{}") {
      throw new Error("Empty or invalid JSON response");
    }

    const parsed = JSON.parse(cleanedText);
    const validated = ResumeProfileSchema.parse(parsed);
    return validated;
  } catch (error) {
    throw new Error(
      `Failed to parse resume interpreter response: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Resume Interpreter function - combines prompt creation and response parsing
 */
export async function interpretResume(resumeText: string): Promise<ResumeProfile> {
  const prompt = createResumeInterpreterPrompt(resumeText);
  
  // Call Deepseek API
  const response = await callDeepseekAPI(prompt);
  const profile = await parseResumeInterpreterResponse(response);
  
  return profile;
}
