/** Career path generator prompt module */

import { CareerPathSchema, CareerPathMinimalSchema } from "../schemas";
import type { CareerPath, CareerPathMinimal, ResumeProfile } from "../schemas";
import { z } from "zod";
import { callDeepseekAPI } from "@/lib/api/deepseek";

/** Minimal prompt for quick path generation (~50% token reduction) */
export function createCareerPathMinimalPrompt(
  resumeProfile: ResumeProfile,
  numberOfPaths: number = 4
): string {
  const topTechs = resumeProfile.techStack.slice(0, 5).join(",");
  return `You are a career advisor. Generate exactly ${numberOfPaths} career paths.

Profile: ${resumeProfile.currentRole}, ${resumeProfile.yearsOfExperience}yr, ${topTechs}

RESPOND ONLY WITH VALID JSON ARRAY (no other text):
[{"id":"p1","name":"Role","desc":"desc","mkt":85,"ind":90,"skl":["s1","s2"]}]`;
}

/** Detailed prompt for selected path */
export function createCareerPathDetailsPrompt(
  resumeProfile: ResumeProfile,
  pathName: string
): string {
  return `Analyze career path "${pathName}" for ${resumeProfile.currentRole}.

Return ONLY this JSON with EXACT enum values:
{"effortLevel":"Low|Medium|High","rewardPotential":"Low|Medium|High","why":"reason","desc":"info"}`;
}

/**
 * Parses minimal career paths response - FAST, handles malformed responses
 */
export async function parseCareerPathMinimalResponse(
  responseText: string
): Promise<CareerPathMinimal[]> {
  try {
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks
    if (cleanedText.startsWith("```")) {
      const endIdx = cleanedText.lastIndexOf("```");
      if (endIdx > 3) cleanedText = cleanedText.substring(cleanedText.indexOf("\n") + 1, endIdx);
    }
    cleanedText = cleanedText.trim();

    // If response still has text before JSON, extract the JSON array
    if (!cleanedText.startsWith("[")) {
      const jsonStart = cleanedText.indexOf("[");
      if (jsonStart !== -1) {
        const jsonEnd = cleanedText.lastIndexOf("]");
        if (jsonEnd !== -1) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
      }
    }

    const parsed = JSON.parse(cleanedText) as Array<Record<string, unknown>>;
    
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Response is not a valid array");
    }
    
    // Map condensed field names
    const mapped = parsed.map((item) => ({
      roleId: (item.id || item.roleId) as string,
      roleName: (item.name || item.roleName) as string,
      description: (item.desc || item.description) as string,
      marketDemandScore: (item.mkt || item.marketDemandScore) as number,
      industryAlignment: (item.ind || item.industryAlignment) as number,
      requiredSkills: (item.skl || item.requiredSkills) as string[],
    }));
    
    return z.array(CareerPathMinimalSchema).parse(mapped);
  } catch (error) {
    throw new Error(
      `Failed to parse career paths: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Parses detailed path info response - handles malformed JSON and field name mapping
 */
export async function parseCareerPathDetailsResponse(responseText: string) {
  try {
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks
    if (cleanedText.startsWith("```")) {
      const endIdx = cleanedText.lastIndexOf("```");
      if (endIdx > 3) cleanedText = cleanedText.substring(cleanedText.indexOf("\n") + 1, endIdx);
    }
    cleanedText = cleanedText.trim();

    // Extract JSON object if there's text before it
    if (!cleanedText.startsWith("{")) {
      const jsonStart = cleanedText.indexOf("{");
      if (jsonStart !== -1) {
        const jsonEnd = cleanedText.lastIndexOf("}");
        if (jsonEnd !== -1) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
      }
    }

    if (!cleanedText || cleanedText === "{}") {
      throw new Error("Empty or invalid JSON response");
    }

    const parsed = JSON.parse(cleanedText) as Record<string, unknown>;
    
    // Normalize enum values: "Very High" -> "High", "Very Low" -> "Low"
    const normalizeEnum = (value: unknown): string => {
      if (typeof value !== "string") return value as string;
      if (value === "Very High") return "High";
      if (value === "Very Low") return "Low";
      return value;
    };
    
    // Map abbreviated field names to full names
    const mapped = {
      effortLevel: normalizeEnum(parsed.eff || parsed.effortLevel),
      rewardPotential: normalizeEnum(parsed.rew || parsed.rewardPotential),
      reasoning: (parsed.why || parsed.reasoning) as string,
      detailedDescription: (parsed.desc || parsed.detailedDescription) as string,
    };
    
    return z.object({
      effortLevel: z.enum(["Low", "Medium", "High"]),
      rewardPotential: z.enum(["Low", "Medium", "High"]),
      reasoning: z.string(),
      detailedDescription: z.string(),
    }).parse(mapped);
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
