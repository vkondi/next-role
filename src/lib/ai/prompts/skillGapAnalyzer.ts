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
1. The professional's current level (None, Beginner, Intermediate, Advanced, Expert)
2. The required level for the target role
3. Importance of this skill (Low, Medium, High)
4. Estimated time to close the gap
5. Overall gap severity (Low, Medium, High)

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
