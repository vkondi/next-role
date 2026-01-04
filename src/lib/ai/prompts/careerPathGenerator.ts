/**
 * Career Path Generator Prompt Module
 * Suggests 4-6 potential career paths based on user profile
 */

import { CareerPathSchema, CareerPathMinimalSchema } from "../schemas";
import type { CareerPath, CareerPathMinimal, ResumeProfile } from "../schemas";
import { z } from "zod";
import { callDeepseekAPI } from "@/lib/api/deepseek";

/**
 * Minimal prompt - Returns quick overview without detailed reasoning
 * This is MUCH faster since we don't ask for lengthy explanations
 */
export function createCareerPathMinimalPrompt(
  resumeProfile: ResumeProfile,
  numberOfPaths: number = 5
): string {
  return `You are an expert career strategist. Generate strategic career paths based on a professional's profile.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no code blocks, no extra text.

Professional Profile:
- Current Role: ${resumeProfile.currentRole}
- Years of Experience: ${resumeProfile.yearsOfExperience}
- Tech Stack: ${resumeProfile.techStack.join(", ")}
- Strength Areas: ${resumeProfile.strengthAreas.join(", ")}
- Industry Background: ${resumeProfile.industryBackground}

Generate exactly ${numberOfPaths} career path options. Return ONLY this JSON structure:
[
  {
    "roleId": "path_001",
    "roleName": "Role Name",
    "description": "One short sentence description",
    "marketDemandScore": number,
    "industryAlignment": number,
    "requiredSkills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"]
  }
]

REQUIREMENTS:
- Return ONLY JSON array, no additional text
- roleId format: "path_001", "path_002", etc.
- Description: ONE short sentence only
- Scores: 0-100 numbers
- Skills: 5 key skills only
- Keep response concise and fast to generate`;
}

/**
 * Detailed prompt - For a selected path only
 * Fetched AFTER user selects from carousel
 */
export function createCareerPathDetailsPrompt(
  resumeProfile: ResumeProfile,
  pathName: string
): string {
  return `You are an expert career strategist. Provide detailed analysis for a specific career path.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no code blocks, no extra text.

Professional Profile:
- Current Role: ${resumeProfile.currentRole}
- Years of Experience: ${resumeProfile.yearsOfExperience}
- Strengths: ${resumeProfile.strengthAreas.join(", ")}
- Background: ${resumeProfile.industryBackground}

Provide comprehensive details for: "${pathName}"

Return ONLY this JSON structure:
{
  "effortLevel": "Low|Medium|High",
  "rewardPotential": "Low|Medium|High",
  "reasoning": "2-3 sentences explaining why this path fits",
  "detailedDescription": "3-4 sentences about responsibilities and growth potential"
}

REQUIREMENTS:
- Return ONLY JSON, no additional text
- Effort/Reward: Must be exactly "Low", "Medium", or "High"
- Reasoning: Specific to this person's background
- Description: Detailed but concise`;
}

/**
 * Parses minimal career paths response
 */
export async function parseCareerPathMinimalResponse(
  responseText: string
): Promise<CareerPathMinimal[]> {
  try {
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) cleanedText = cleanedText.substring(7);
    if (cleanedText.startsWith("```")) cleanedText = cleanedText.substring(3);
    if (cleanedText.endsWith("```")) cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    cleanedText = cleanedText.trim();

    const parsed = JSON.parse(cleanedText);
    const schema = z.array(CareerPathMinimalSchema);
    return schema.parse(parsed);
  } catch (error) {
    throw new Error(
      `Failed to parse career paths: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Parses detailed path info response
 */
export async function parseCareerPathDetailsResponse(responseText: string) {
  try {
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) cleanedText = cleanedText.substring(7);
    if (cleanedText.startsWith("```")) cleanedText = cleanedText.substring(3);
    if (cleanedText.endsWith("```")) cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    cleanedText = cleanedText.trim();

    const parsed = JSON.parse(cleanedText);
    return z.object({
      effortLevel: z.enum(["Low", "Medium", "High"]),
      rewardPotential: z.enum(["Low", "Medium", "High"]),
      reasoning: z.string(),
      detailedDescription: z.string(),
    }).parse(parsed);
  } catch (error) {
    throw new Error(
      `Failed to parse path details: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate MINIMAL career paths (fast, for carousel)
 */
export async function generateCareerPathsMinimal(
  resumeProfile: ResumeProfile,
  numberOfPaths: number = 5
): Promise<CareerPathMinimal[]> {
  const prompt = createCareerPathMinimalPrompt(resumeProfile, numberOfPaths);
  const response = await callDeepseekAPI(prompt);
  return parseCareerPathMinimalResponse(response);
}

/**
 * Generate detailed info for a specific path (slower, but selective)
 */
export async function generateCareerPathDetails(
  resumeProfile: ResumeProfile,
  pathBasic: { roleId: string; roleName: string }
) {
  const prompt = createCareerPathDetailsPrompt(resumeProfile, pathBasic.roleName);
  const response = await callDeepseekAPI(prompt);
  const details = await parseCareerPathDetailsResponse(response);
  return {
    ...pathBasic,
    ...details,
  };
}

/**
 * Original function - kept for backward compatibility if needed
 */
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
 * Career Path Generator function (original, full data)
 */
export async function generateCareerPaths(
  resumeProfile: ResumeProfile,
  numberOfPaths: number = 5
): Promise<CareerPath[]> {
  const prompt = createCareerPathGeneratorPrompt(resumeProfile, numberOfPaths);
  
  // Call Deepseek API
  const response = await callDeepseekAPI(prompt);
  const paths = await parseCareerPathGeneratorResponse(response);
  
  return paths;
}
