/** Skill gap analyzer prompt module */

import { SkillGapAnalysisSchema } from "../schemas";
import type {
  ResumeProfile,
  CareerPath,
  SkillGapAnalysis,
} from "../schemas";
import { callAI } from "@/lib/api/aiProvider";
import type { AIProvider } from "@/lib/api/aiProvider";
import {
  removeMarkdownBlocks,
  extractStringField,
  normalizeEnumValue,
  repairTruncatedJSON,
} from "@/lib/api/jsonRecovery";

/** Create skill gap analysis prompt */
export function createSkillGapAnalyzerPrompt(
  resumeProfile: ResumeProfile,
  careerPath: CareerPath
): string {
  const topSkills = careerPath.requiredSkills.slice(0, 6);

  return `You are a career development expert. Analyze the skill gaps between a professional's current state and their target role.

Current Role: ${resumeProfile.currentRole}
Years of Experience: ${resumeProfile.yearsOfExperience}
Current Tech Stack: ${resumeProfile.techStack.join(", ")}

Target Role: ${careerPath.roleName}
Required Skills: ${topSkills.join(", ")}

For each required skill, determine:
1. The professional's current level (EXACT: None|Beginner|Intermediate|Advanced|Expert)
2. The required level for the target role (EXACT: None|Beginner|Intermediate|Advanced|Expert)
3. Importance of this skill (EXACT: Low|Medium|High - never use Very High/Very Low)
4. Estimated time to close the gap
5. Overall gap severity (EXACT: Low|Medium|High - never use Very High/Very Low)

Respond with ONLY valid JSON matching this schema:
{
  "careerPathId": "string",
  "careerPathName": "string",
  "skillGaps": [
    {
      "skillName": "string",
      "currentLevel": "None|Beginner|Intermediate|Advanced|Expert",
      "requiredLevel": "None|Beginner|Intermediate|Advanced|Expert",
      "importance": "Low|Medium|High"
    }
  ],
  "overallGapSeverity": "Low|Medium|High",
  "estimatedTimeToClose": "string",
  "summary": "string"
}`;
}

/**
 * Recover skill gap analysis from truncated/malformed response
 * Extracts skill gaps array and other fields using regex
 */
function tryRecoverSkillGapAnalysis(text: string): Record<string, any> | null {
  const recovered: Record<string, any> = {};
  
  // Extract simple fields
  const careerPathId = extractStringField(text, "careerPathId");
  if (careerPathId) recovered.careerPathId = careerPathId;
  
  const careerPathName = extractStringField(text, "careerPathName");
  if (careerPathName) recovered.careerPathName = careerPathName;
  
  const overallGapSeverity = extractStringField(text, "overallGapSeverity");
  if (overallGapSeverity) {
    const normalized = normalizeEnumValue(overallGapSeverity, ["Low", "Medium", "High"]);
    if (normalized) recovered.overallGapSeverity = normalized;
  }
  
  const estimatedTimeToClose = extractStringField(text, "estimatedTimeToClose");
  if (estimatedTimeToClose) recovered.estimatedTimeToClose = estimatedTimeToClose;
  
  const summary = extractStringField(text, "summary");
  if (summary) recovered.summary = summary;
  
  // Extract skillGaps array
  const skillGapsMatch = text.match(/"skillGaps"\s*:\s*\[(.*?)(?:\]|$)/is);
  if (skillGapsMatch) {
    const skillsContent = skillGapsMatch[1];
    // Extract individual skill objects
    const skillPattern = /\{[^}]*"skillName"[^}]*\}/g;
    const skillMatches = skillsContent.match(skillPattern) || [];
    
    if (skillMatches.length > 0) {
      recovered.skillGaps = skillMatches.map((skillStr) => {
        const skill: Record<string, any> = {
          skillName: "",
          currentLevel: "None",
          requiredLevel: "None",
          importance: "Medium",
        };
        
        // Extract skillName
        const nameMatch = skillStr.match(/"skillName"\s*:\s*"([^"]*)"/i);
        if (nameMatch) skill.skillName = nameMatch[1].split('"')[0];
        
        // Extract currentLevel with normalization
        const currentMatch = skillStr.match(/"currentLevel"\s*:\s*"([^"]*)"/i);
        if (currentMatch) {
          const normalized = normalizeEnumValue(
            currentMatch[1].split('"')[0],
            ["None", "Beginner", "Intermediate", "Advanced", "Expert"]
          );
          if (normalized) skill.currentLevel = normalized;
        }
        
        // Extract requiredLevel with normalization
        const requiredMatch = skillStr.match(/"requiredLevel"\s*:\s*"([^"]*)"/i);
        if (requiredMatch) {
          const normalized = normalizeEnumValue(
            requiredMatch[1].split('"')[0],
            ["None", "Beginner", "Intermediate", "Advanced", "Expert"]
          );
          if (normalized) skill.requiredLevel = normalized;
        }
        
        // Extract importance with normalization
        const importanceMatch = skillStr.match(/"importance"\s*:\s*"([^"]*)"/i);
        if (importanceMatch) {
          const normalized = normalizeEnumValue(
            importanceMatch[1].split('"')[0],
            ["Low", "Medium", "High"]
          );
          if (normalized) skill.importance = normalized;
        }
        
        return skill;
      });
    }
  }
  
  return Object.keys(recovered).length > 0 ? recovered : null;
}

/** Parses skill gap analysis response */
export async function parseSkillGapAnalyzerResponse(
  responseText: string
): Promise<SkillGapAnalysis> {
  try {
    let cleanedText = removeMarkdownBlocks(responseText.trim());
    
    if (!cleanedText.startsWith("{")) {
      const jsonStart = cleanedText.indexOf("{");
      if (jsonStart !== -1) {
        const jsonEnd = cleanedText.lastIndexOf("}");
        if (jsonEnd !== -1) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
      }
    }
    
    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (jsonError) {
      // First, try to repair truncated JSON by adding missing braces/brackets
      try {
        const repaired = repairTruncatedJSON(cleanedText);
        parsed = JSON.parse(repaired);
      } catch {
        // If repair fails, try recovery via regex extraction
        const recovered = tryRecoverSkillGapAnalysis(cleanedText);
        if (!recovered) {
          throw jsonError;
        }
        parsed = recovered;
      }
    }
    
    // Ensure required skillGaps array has a default if missing from recovery
    if (!parsed.skillGaps || !Array.isArray(parsed.skillGaps)) {
      parsed.skillGaps = [];
    }
    
    // Normalize all severity and importance fields
    if (parsed.overallGapSeverity) {
      const normalized = normalizeEnumValue(parsed.overallGapSeverity, ["Low", "Medium", "High"]);
      if (normalized) parsed.overallGapSeverity = normalized;
    }
    
    if (Array.isArray(parsed.skillGaps)) {
      parsed.skillGaps = parsed.skillGaps.map((gap: any) => {
        const importance = normalizeEnumValue(gap.importance, ["Low", "Medium", "High"]);
        return {
          ...gap,
          importance: importance || gap.importance,
        };
      });
      
      // Sort by importance: High > Medium > Low
      const importancePriority = { "High": 3, "Medium": 2, "Low": 1 };
      parsed.skillGaps.sort((a: any, b: any) => {
        const aPriority = importancePriority[a.importance as keyof typeof importancePriority] || 0;
        const bPriority = importancePriority[b.importance as keyof typeof importancePriority] || 0;
        return bPriority - aPriority;
      });
    }
    
    const validated = SkillGapAnalysisSchema.parse(parsed);
    return validated;
  } catch (error) {
    throw new Error(
      `Failed to parse skill gap response: ${error instanceof Error ? error.message : "Invalid JSON"}`
    );
  }
}

export async function analyzeSkillGaps(
  resumeProfile: ResumeProfile,
  careerPath: CareerPath,
  aiProvider: AIProvider = "deepseek"
): Promise<SkillGapAnalysis> {
  const prompt = createSkillGapAnalyzerPrompt(resumeProfile, careerPath);
  const response = await callAI(aiProvider, prompt, 1100);
  const analysis = await parseSkillGapAnalyzerResponse(response);
  return analysis;
}
