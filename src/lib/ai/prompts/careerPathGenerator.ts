/**
 * Career Path Generator Prompt Module
 * Suggests 4-6 potential career paths based on user profile
 */

import { CareerPathSchema } from "../schemas";
import type { CareerPath, ResumeProfile } from "../schemas";
import { z } from "zod";

export function createCareerPathGeneratorPrompt(
  resumeProfile: ResumeProfile,
  numberOfPaths: number = 5
): string {
  return `You are an expert career strategist and talent analyst. Your task is to suggest potential career paths based on a professional's profile.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown formatting, no code blocks, no extra text.

Given this professional profile:
- Current Role: ${resumeProfile.currentRole}
- Years of Experience: ${resumeProfile.yearsOfExperience}
- Tech Stack: ${resumeProfile.techStack.join(", ")}
- Strength Areas: ${resumeProfile.strengthAreas.join(", ")}
- Industry Background: ${resumeProfile.industryBackground}
${resumeProfile.certifications && resumeProfile.certifications.length > 0 ? `- Certifications: ${resumeProfile.certifications.join(", ")}` : ""}

Generate exactly ${numberOfPaths} strategic career paths that would be ideal next moves for this professional. Consider:
1. Natural skill progression from their current role
2. Market demand for the suggested roles
3. How their background aligns with each path
4. Growth potential and career satisfaction

Return a JSON array with objects having this exact structure:
[
  {
    "roleId": "string - unique id like 'path_001'",
    "roleName": "string - clear role name",
    "description": "string - 2-3 sentence description of role and responsibilities",
    "marketDemandScore": number - 0-100 indicating market demand,
    "effortLevel": "Low|Medium|High" - effort to transition to this role,
    "rewardPotential": "Low|Medium|High" - career growth and salary potential,
    "reasoning": "string - 2-3 sentences explaining why this path is good for them",
    "requiredSkills": ["array of 5-8 key skills needed for this role"],
    "industryAlignment": number - 0-100 alignment with their background
  }
]

STRICT REQUIREMENTS:
- Return ONLY the JSON array, no additional text
- Include exactly ${numberOfPaths} career paths
- roleId format: "path_001", "path_002", etc.
- marketDemandScore and industryAlignment must be numbers 0-100
- effortLevel and rewardPotential must be exactly "Low", "Medium", or "High"
- Descriptions and reasoning should be insightful and specific to this person
- Required skills should be realistic and obtainable`;
}

/**
 * Parses and validates the AI response for career path generation
 */
export async function parseCareerPathGeneratorResponse(
  responseText: string
): Promise<CareerPath[]> {
  try {
    // Clean up the response
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7);
    }
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    const parsed = JSON.parse(cleanedText);
    
    // Validate array of career paths
    const careerPathsSchema = z.array(CareerPathSchema);
    const validated = careerPathsSchema.parse(parsed);
    return validated;
  } catch (error) {
    throw new Error(
      `Failed to parse career path generator response: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Career Path Generator function
 */
export async function generateCareerPaths(
  _resumeProfile: ResumeProfile,
  _numberOfPaths: number = 5
): Promise<CareerPath[]> {
  // const prompt = createCareerPathGeneratorPrompt(resumeProfile, numberOfPaths);
  
  // TODO: Implement actual API call to Deepseek
  // const response = await callDeepseekAPI(prompt);
  // const paths = await parseCareerPathGeneratorResponse(response);
  
  // return paths;
  throw new Error("Deepseek API not implemented");
}

/**
 * Placeholder for Deepseek API call
 */
// async function callDeepseekAPI(): Promise<string> {
//   throw new Error("Deepseek API not configured");
// }
