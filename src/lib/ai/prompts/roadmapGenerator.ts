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
  const criticalSkills = skillGapAnalysis.skillGaps
    .filter((sg) => sg.importance === "High")
    .slice(0, 3)
    .map((sg) => sg.skillName)
    .join(", ");

  return `Create 2-phase ${timelineMonths}-month roadmap: ${careerPath.roleName}
Current: ${resumeProfile.currentRole} (${resumeProfile.yearsOfExperience}y)
Skills: ${criticalSkills}
Severity: ${skillGapAnalysis.overallGapSeverity} (EXACT: Low|Medium|High - never Very High)

Return ONLY valid JSON:
{
  "careerPathId": "${careerPath.roleId}",
  "careerPathName": "${careerPath.roleName}",
  "timelineMonths": ${timelineMonths},
  "phases": [
    {
      "phaseNumber": 1,
      "duration": "Month 1-${Math.ceil(timelineMonths / 2)}",
      "skillsFocus": ["skill1", "skill2"],
      "learningDirection": "Build foundation",
      "projectIdeas": ["1-2 projects"],
      "milestones": ["Course + basic project"],
      "actionItems": ["Learn and build"]
    },
    {
      "phaseNumber": 2,
      "duration": "Month ${Math.ceil(timelineMonths / 2) + 1}-${timelineMonths}",
      "skillsFocus": ["skill2", "skill3"],
      "learningDirection": "Gain expertise",
      "projectIdeas": ["Advanced project"],
      "milestones": ["Portfolio ready"],
      "actionItems": ["Refine and prepare"]
    }
  ],
  "successMetrics": ["Portfolio"],
  "riskFactors": ["Time"]
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

    let parsed = JSON.parse(cleanedText);
    
    // Try to parse as-is first
    try {
      const validated = CareerRoadmapSchema.parse(parsed);
      return validated;
    } catch (parseError) {
      // If parsing fails, try to repair truncated JSON
      if (parseError instanceof SyntaxError && cleanedText.includes("{")) {
        let repaired = cleanedText;
        const openBraces = (repaired.match(/{/g) || []).length;
        const closeBraces = (repaired.match(/}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/]/g) || []).length;
        
        repaired += "]".repeat(Math.max(0, openBrackets - closeBrackets));
        repaired += "}".repeat(Math.max(0, openBraces - closeBraces));
        
        parsed = JSON.parse(repaired);
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

  const response = await callDeepseekAPI(prompt, 1200);
  const roadmap = await parseRoadmapGeneratorResponse(response);

  return roadmap;
}
