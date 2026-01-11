/** Career path generator prompt module */

import { CareerPathSchema, CareerPathMinimalSchema } from "../schemas";
import type { CareerPath, CareerPathMinimal, ResumeProfile } from "../schemas";
import { z } from "zod";
import { callAI } from "@/lib/api/aiProvider";
import { getLogger } from "@/lib/api/logger";
import type { AIProvider } from "@/lib/api/aiProvider";
import {
  removeMarkdownBlocks,
  normalizeEnumValue,
} from "@/lib/api/jsonRecovery";

const log = getLogger("LIB:CareerPathGenerator");

/** Minimal prompt for quick path generation (~50% token reduction) */
export function createCareerPathMinimalPrompt(
  resumeProfile: ResumeProfile,
  numberOfPaths: number = 4
): string {
  const topTechs = resumeProfile.techStack.slice(0, 5).join(",");
  return `You are a career advisor. Generate exactly ${numberOfPaths} career paths.

Profile: ${resumeProfile.currentRole}, ${resumeProfile.yearsOfExperience}yr, ${topTechs}

RESPOND ONLY WITH VALID JSON ARRAY (no other text):
[{"id":"p1","name":"Role","desc":"desc","mkt":0-100,"ind":0-100,"skl":["s1","s2"]}]`;
}

/** Detailed prompt for selected path */
export function createCareerPathDetailsPrompt(
  resumeProfile: ResumeProfile,
  pathName: string
): string {
  return `Analyze career path "${pathName}" for ${resumeProfile.currentRole}.

Use EXACT enum values. Return ONLY this JSON:
{"effortLevel":"Low|Medium|High","rewardPotential":"Low|Medium|High","why":"reason","desc":"info"}`;
}

/**
 * Recover career path minimal array from truncated/malformed AI response
 * Extracts individual path objects using regex when JSON parsing fails
 */
function tryRecoverCareerPathMinimalArray(
  text: string
): Array<Record<string, any>> | null {
  const items: Array<Record<string, any>> = [];

  // Try to extract individual path objects using regex
  const objPattern = /\{[^}]+\}/g;
  const matches = text.match(objPattern) || [];

  if (matches.length === 0) {
    return null;
  }

  matches.forEach((objStr) => {
    const item: Record<string, any> = {
      id: "",
      name: "",
      desc: "",
      mkt: 0,
      ind: 0,
      skl: [],
    };

    // Extract id (string)
    const idMatch = objStr.match(/"?id"?\s*:\s*"([^"]+)"/i);
    if (idMatch) item.id = idMatch[1];

    // Extract name (string)
    const nameMatch = objStr.match(/"?name"?\s*:\s*"([^"]+)"/i);
    if (nameMatch) item.name = nameMatch[1];

    // Extract desc (string)
    const descMatch = objStr.match(/"?desc"?\s*:\s*"([^"]+)"/i);
    if (descMatch) item.desc = descMatch[1];

    // Extract mkt (number)
    const mktMatch = objStr.match(/"?mkt"?\s*:\s*(\d+)/i);
    if (mktMatch) item.mkt = parseInt(mktMatch[1], 10);

    // Extract ind (number)
    const indMatch = objStr.match(/"?ind"?\s*:\s*(\d+)/i);
    if (indMatch) item.ind = parseInt(indMatch[1], 10);

    // Extract skl (array)
    const sklMatch = objStr.match(/"?skl"?\s*:\s*\[([^\]]+)\]/i);
    if (sklMatch) {
      item.skl = sklMatch[1]
        .split(",")
        .map((s: string) => s.trim().replace(/"/g, ""))
        .filter((s: string) => s.length > 0);
    }

    items.push(item);
  });

  return items.length > 0 ? items : null;
}

/**
 * Recover career path details object from truncated/malformed response
 * Extracts fields using regex when JSON parsing fails
 */
function tryRecoverCareerPathDetails(text: string): Record<string, any> | null {
  const recovered: Record<string, any> = {};

  // Extract effortLevel
  const effortMatch = text.match(/"?effortLevel"?\s*:\s*"([^"]+)"/i);
  if (effortMatch) {
    const normalized = normalizeEnumValue(effortMatch[1], [
      "Low",
      "Medium",
      "High",
    ]);
    if (normalized) recovered.effortLevel = normalized;
  }

  // Extract rewardPotential
  const rewardMatch = text.match(/"?rewardPotential"?\s*:\s*"([^"]+)"/i);
  if (rewardMatch) {
    const normalized = normalizeEnumValue(rewardMatch[1], [
      "Low",
      "Medium",
      "High",
    ]);
    if (normalized) recovered.rewardPotential = normalized;
  }

  // Extract why/reasoning (may be truncated)
  const whyMatch = text.match(/"?why"?\s*:\s*"([^"]*)"/i);
  if (whyMatch) {
    recovered.reasoning = whyMatch[1].split('"')[0];
  }

  // Extract desc/description (may be truncated)
  const descMatch = text.match(/"?desc"?\s*:\s*"([^"]*)"/i);
  if (descMatch) {
    recovered.detailedDescription = descMatch[1].split('"')[0];
  }

  return Object.keys(recovered).length > 0 ? recovered : null;
}

/**
 * Parses minimal career paths response - FAST, handles malformed responses
 */
export async function parseCareerPathMinimalResponse(
  responseText: string
): Promise<CareerPathMinimal[]> {
  try {
    let cleanedText = removeMarkdownBlocks(responseText.trim());

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

    let parsed: any;
    try {
      parsed = JSON.parse(cleanedText) as Array<Record<string, unknown>>;
    } catch (e) {
      // JSON parsing failed - try recovery via regex reconstruction
      const recovered = tryRecoverCareerPathMinimalArray(cleanedText);
      if (!recovered) {
        throw e; // If recovery fails, throw original error
      }
      parsed = recovered;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Response is not a valid array");
    }

    // Map condensed field names
    const mapped = parsed.map((item) => ({
      roleId: (item.id || item.roleId || "") as string,
      roleName: (item.name || item.roleName || "") as string,
      description: (item.desc || item.description || "") as string,
      marketDemandScore: (item.mkt || item.marketDemandScore || 0) as number,
      industryAlignment: (item.ind || item.industryAlignment || 0) as number,
      requiredSkills: (item.skl || item.requiredSkills || []) as string[],
    }));

    return z.array(CareerPathMinimalSchema).parse(mapped);
  } catch (error) {
    log.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to parse career paths response"
    );
    throw new Error(
      `Failed to parse career paths: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Parses detailed path info response - handles malformed JSON and field name mapping
 */
export async function parseCareerPathDetailsResponse(responseText: string) {
  try {
    let cleanedText = removeMarkdownBlocks(responseText.trim());

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

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleanedText) as Record<string, unknown>;
    } catch (parseError) {
      // JSON parsing failed - try recovery via regex extraction
      const recovered = tryRecoverCareerPathDetails(cleanedText);
      if (!recovered) {
        throw parseError;
      }
      parsed = recovered;
    }

    // Normalize enum values: "Very High" -> "High", "Very Low" -> "Low"
    const normalizeEnum = (value: unknown): string => {
      if (typeof value !== "string") return value as string;
      return (
        normalizeEnumValue(value, ["Low", "Medium", "High"]) ||
        (value as string)
      );
    };

    // Map abbreviated field names to full names
    const mapped = {
      effortLevel: normalizeEnum(parsed.eff || parsed.effortLevel),
      rewardPotential: normalizeEnum(parsed.rew || parsed.rewardPotential),
      reasoning: (parsed.why || parsed.reasoning) as string,
      detailedDescription: (parsed.desc ||
        parsed.detailedDescription) as string,
    };

    return z
      .object({
        effortLevel: z.enum(["Low", "Medium", "High"]),
        rewardPotential: z.enum(["Low", "Medium", "High"]),
        reasoning: z.string(),
        detailedDescription: z.string(),
      })
      .parse(mapped);
  } catch (error) {
    throw new Error(
      `Failed to parse path details: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Generate MINIMAL career paths (fast, for carousel)
 */
export async function generateCareerPathsMinimal(
  resumeProfile: ResumeProfile,
  numberOfPaths: number = 5,
  aiProvider: AIProvider = "deepseek"
): Promise<CareerPathMinimal[]> {
  log.info(
    { aiProvider, numberOfPaths, currentRole: resumeProfile.currentRole },
    "Generating minimal career paths"
  );
  const prompt = createCareerPathMinimalPrompt(resumeProfile, numberOfPaths);
  const response = await callAI(aiProvider, prompt, 1200);
  const paths = await parseCareerPathMinimalResponse(response);
  log.info({ count: paths.length }, "Career paths generated successfully");
  return paths;
}

/**
 * Generate detailed info for a specific path (slower, but selective)
 */
export async function generateCareerPathDetails(
  resumeProfile: ResumeProfile,
  pathBasic: { roleId: string; roleName: string },
  aiProvider: AIProvider = "deepseek"
) {
  log.info(
    { aiProvider, role: pathBasic.roleName },
    "Generating career path details"
  );
  const prompt = createCareerPathDetailsPrompt(
    resumeProfile,
    pathBasic.roleName
  );
  const response = await callAI(aiProvider, prompt, 1000);
  const details = await parseCareerPathDetailsResponse(response);
  log.info({ role: pathBasic.roleName }, "Career path details generated");
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
${
  resumeProfile.certifications && resumeProfile.certifications.length > 0
    ? `- Certifications: ${resumeProfile.certifications.join(", ")}`
    : ""
}

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
      `Failed to parse career path generator response: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Career Path Generator function (original, full data)
 */
export async function generateCareerPaths(
  resumeProfile: ResumeProfile,
  numberOfPaths: number = 5,
  aiProvider: AIProvider = "deepseek"
): Promise<CareerPath[]> {
  const prompt = createCareerPathGeneratorPrompt(resumeProfile, numberOfPaths);

  const response = await callAI(aiProvider, prompt, 1200);
  const paths = await parseCareerPathGeneratorResponse(response);

  return paths;
}
