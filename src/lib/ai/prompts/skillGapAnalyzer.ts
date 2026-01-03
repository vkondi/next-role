/**
 * Skill Gap Analyzer Prompt Module
 * Analyzes gaps between current skills and target role requirements
 */

import { SkillGapAnalysisSchema } from "../schemas";
import type {
  ResumeProfile,
  CareerPath,
  SkillGapAnalysis,
} from "../schemas";
import { callDeepseekAPI } from "@/lib/api/deepseek";

export function createSkillGapAnalyzerPrompt(
  resumeProfile: ResumeProfile,
  careerPath: CareerPath
): string {
  return `You are an expert skill development strategist. Your task is to analyze skill gaps between a professional's current abilities and a target role's requirements.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown formatting, no code blocks, no extra text.

Current Professional Profile:
- Current Role: ${resumeProfile.currentRole}
- Years of Experience: ${resumeProfile.yearsOfExperience}
- Current Tech Stack: ${resumeProfile.techStack.join(", ")}
- Strength Areas: ${resumeProfile.strengthAreas.join(", ")}

Target Career Path:
- Role Name: ${careerPath.roleName}
- Description: ${careerPath.description}
- Required Skills: ${careerPath.requiredSkills.join(", ")}

Analyze the skill gaps comprehensively and estimate:
1. Current proficiency level for each required skill (if known from tech stack)
2. Required proficiency level for each skill
3. Importance of each gap
4. Learning resources for closing gaps

Return a JSON object with this exact structure:
{
  "careerPathId": "${careerPath.roleId}",
  "careerPathName": "${careerPath.roleName}",
  "skillGaps": [
    {
      "skillName": "string - name of the skill",
      "currentLevel": "None|Beginner|Intermediate|Advanced|Expert",
      "requiredLevel": "None|Beginner|Intermediate|Advanced|Expert",
      "importance": "Low|Medium|High",
      "learningResources": ["optional array of resource suggestions"]
    }
  ],
  "overallGapSeverity": "Low|Medium|High",
  "estimatedTimeToClose": "string - e.g. '3-6 months' or '6-12 months'",
  "summary": "string - brief summary of the key gaps and challenges"
}

STRICT REQUIREMENTS:
- Return ONLY the JSON object, no additional text
- skillGaps must include all required skills from the career path
- currentLevel should reflect expertise from their tech stack and experience
- requiredLevel should be realistic for the role
- importance must be "Low", "Medium", or "High"
- Learning resources should be specific and actionable
- estimatedTimeToClose should be realistic and achievable
- summary should be encouraging but honest about the effort needed`;
}

/**
 * Parses and validates the AI response for skill gap analysis
 */
export async function parseSkillGapAnalyzerResponse(
  responseText: string
): Promise<SkillGapAnalysis> {
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
    const validated = SkillGapAnalysisSchema.parse(parsed);
    return validated;
  } catch (error) {
    throw new Error(
      `Failed to parse skill gap analyzer response: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Skill Gap Analyzer function
 */
export async function analyzeSkillGaps(
  resumeProfile: ResumeProfile,
  careerPath: CareerPath
): Promise<SkillGapAnalysis> {
  const prompt = createSkillGapAnalyzerPrompt(resumeProfile, careerPath);

  // Call Deepseek API
  const response = await callDeepseekAPI(prompt);
  const analysis = await parseSkillGapAnalyzerResponse(response);

  return analysis;
}
