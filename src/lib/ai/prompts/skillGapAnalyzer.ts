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
  // OPTIMIZATION: Only analyze top 6 most important skills
  const topSkills = careerPath.requiredSkills.slice(0, 6);

  return `Analyze skill gaps for: ${careerPath.roleName}

Profile: ${resumeProfile.currentRole} (${resumeProfile.yearsOfExperience}y)
Current: ${resumeProfile.techStack.join(", ")}
Target: ${topSkills.join(", ")}

CRITICAL ENUM CONSTRAINTS:
- currentLevel MUST be one of: "None", "Beginner", "Intermediate", "Advanced", "Expert"
- requiredLevel MUST be one of: "None", "Beginner", "Intermediate", "Advanced", "Expert"
- importance MUST be one of: "Low", "Medium", "High"
- overallGapSeverity MUST be one of: "Low", "Medium", "High" (NEVER "None")

Respond with ONLY valid JSON:
{
  "careerPathId": "${careerPath.roleId}",
  "careerPathName": "${careerPath.roleName}",
  "skillGaps": [
    {"skillName": "skill1", "currentLevel": "Beginner", "requiredLevel": "Advanced", "importance": "High"},
    {"skillName": "skill2", "currentLevel": "None", "requiredLevel": "Intermediate", "importance": "Medium"}
  ],
  "overallGapSeverity": "High",
  "estimatedTimeToClose": "6-9 months",
  "summary": "Brief analysis of skill gaps and effort needed"
}`;
}

/**
 * Parses and validates the AI response for skill gap analysis
 * Includes JSON repair for truncated responses
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

    if (!cleanedText || cleanedText === "{}") {
      throw new Error("Empty or invalid JSON response");
    }

    // Try to parse as-is first
    try {
      const parsed = JSON.parse(cleanedText);
      const validated = SkillGapAnalysisSchema.parse(parsed);
      return validated;
    } catch (parseError) {
      // If parsing fails, try to repair truncated JSON
      if (parseError instanceof SyntaxError && cleanedText.includes("{")) {
        // Likely truncated - try to fix common truncation patterns
        let repaired = cleanedText;
        
        // Count unclosed brackets
        const openBraces = (repaired.match(/{/g) || []).length;
        const closeBraces = (repaired.match(/}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/]/g) || []).length;
        
        // Add closing brackets if truncated
        repaired += "]".repeat(Math.max(0, openBrackets - closeBrackets));
        repaired += "}".repeat(Math.max(0, openBraces - closeBraces));
        
        // Try parsing the repaired version
        const parsed = JSON.parse(repaired);
        const validated = SkillGapAnalysisSchema.parse(parsed);
        return validated;
      }
      throw parseError;
    }
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

  // Call Deepseek API with higher max_tokens for complex analysis
  const response = await callDeepseekAPI(prompt, 1500);
  const analysis = await parseSkillGapAnalyzerResponse(response);

  return analysis;
}
