/** Skill gap analyzer prompt module */

import { SkillGapAnalysisSchema } from "../schemas";
import type {
  ResumeProfile,
  CareerPath,
  SkillGapAnalysis,
} from "../schemas";
import { callDeepseekAPI } from "@/lib/api/deepseek";

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

/** Parses skill gap analysis response */
export async function parseSkillGapAnalyzerResponse(
  responseText: string
): Promise<SkillGapAnalysis> {
  try {
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, "");
    }
    
    // Extract JSON if wrapped in text
    if (!cleanedText.startsWith("{")) {
      const jsonStart = cleanedText.indexOf("{");
      if (jsonStart !== -1) {
        const jsonEnd = cleanedText.lastIndexOf("}");
        if (jsonEnd !== -1) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
      }
    }
    
    const parsed = JSON.parse(cleanedText);
    
    // Normalize enum values: "Very High"/"Very Low" -> "High"/"Low"
    const normalizeEnum = (value: unknown): string => {
      if (typeof value !== "string") return String(value);
      if (value === "Very High" || value === "Very Low") return value === "Very High" ? "High" : "Low";
      return value;
    };
    
    // Normalize all severity and importance fields
    if (parsed.overallGapSeverity) {
      parsed.overallGapSeverity = normalizeEnum(parsed.overallGapSeverity);
    }
    if (Array.isArray(parsed.skillGaps)) {
      parsed.skillGaps = parsed.skillGaps.map((gap: any) => ({
        ...gap,
        importance: normalizeEnum(gap.importance),
      }));
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
  careerPath: CareerPath
): Promise<SkillGapAnalysis> {
  const prompt = createSkillGapAnalyzerPrompt(resumeProfile, careerPath);
  const response = await callDeepseekAPI(prompt, 1100);
  const analysis = await parseSkillGapAnalyzerResponse(response);
  return analysis;
}
