/**
 * Roadmap Generator Prompt Module
 * Generates month-by-month career roadmap
 */

import { CareerRoadmapSchema } from "../schemas";
import type {
  ResumeProfile,
  CareerPath,
  SkillGapAnalysis,
  CareerRoadmap,
} from "../schemas";
import { callDeepseekAPI } from "@/lib/api/deepseek";

export function createRoadmapGeneratorPrompt(
  resumeProfile: ResumeProfile,
  careerPath: CareerPath,
  skillGapAnalysis: SkillGapAnalysis,
  timelineMonths: number = 6
): string {
  // OPTIMIZATION: Only top 3 critical skills (reduced from 4)
  const criticalSkills = skillGapAnalysis.skillGaps
    .filter((sg) => sg.importance === "High")
    .slice(0, 3)
    .map((sg) => sg.skillName)
    .join(", ");

  // OPTIMIZATION: Max 3 phases (reduced from 4)
  const phaseCount = Math.min(3, Math.ceil(timelineMonths / 2));

  return `Create ${phaseCount}-phase ${timelineMonths}-month roadmap: ${careerPath.roleName}

Profile: ${resumeProfile.currentRole} (${resumeProfile.yearsOfExperience}y)
Skills: ${criticalSkills}
Severity: ${skillGapAnalysis.overallGapSeverity}

CRITICAL: Return ONLY valid, complete JSON (no markdown, no truncation, no extra text):
{
  "careerPathId": "${careerPath.roleId}",
  "careerPathName": "${careerPath.roleName}",
  "timelineMonths": ${timelineMonths},
  "phases": [
    {
      "phaseNumber": 1,
      "duration": "Month 1-2",
      "skillsFocus": ["Skill1", "Skill2"],
      "learningDirection": "Focus on fundamentals",
      "projectIdeas": ["Small project"],
      "milestones": ["Complete online course"],
      "actionItems": ["Start learning"]
    },
    {
      "phaseNumber": 2,
      "duration": "Month 3-4",
      "skillsFocus": ["Skill2", "Skill3"],
      "learningDirection": "Build practical skills",
      "projectIdeas": ["Medium project"],
      "milestones": ["Finish project"],
      "actionItems": ["Build and deploy"]
    },
    {
      "phaseNumber": 3,
      "duration": "Month 5-6",
      "skillsFocus": ["Skill3"],
      "learningDirection": "Refine expertise",
      "projectIdeas": ["Professional project"],
      "milestones": ["Ready for role"],
      "actionItems": ["Polish portfolio"]
    }
  ],
  "successMetrics": ["Completed projects", "Skill proficiency"],
  "riskFactors": ["Time constraints"]
}`;
}

/**
 * Parses and validates the AI response for roadmap generation
 * Includes JSON repair for truncated responses
 */
export async function parseRoadmapGeneratorResponse(
  responseText: string
): Promise<CareerRoadmap> {
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
      const validated = CareerRoadmapSchema.parse(parsed);
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
        const validated = CareerRoadmapSchema.parse(parsed);
        return validated;
      }
      throw parseError;
    }
  } catch (error) {
    throw new Error(
      `Failed to parse roadmap generator response: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Roadmap Generator function
 */
export async function generateRoadmap(
  resumeProfile: ResumeProfile,
  careerPath: CareerPath,
  skillGapAnalysis: SkillGapAnalysis,
  timelineMonths: number = 6
): Promise<CareerRoadmap> {
  const prompt = createRoadmapGeneratorPrompt(
    resumeProfile,
    careerPath,
    skillGapAnalysis,
    timelineMonths
  );

  // Call Deepseek API with higher max_tokens for roadmap (more complex output)
  const response = await callDeepseekAPI(prompt, 2000);
  const roadmap = await parseRoadmapGeneratorResponse(response);

  return roadmap;
}
