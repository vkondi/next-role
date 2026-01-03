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
    .map((sg) => sg.skillName)
    .join(", ");

  return `You are an expert career coach and learning strategist. Your task is to create a detailed, actionable career transition roadmap.

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown formatting, no code blocks, no extra text.

Professional Context:
- Current Role: ${resumeProfile.currentRole}
- Target Role: ${careerPath.roleName}
- Experience Level: ${resumeProfile.yearsOfExperience} years
- Timeline: ${timelineMonths} months
- Critical Skills to Develop: ${criticalSkills}

Overall Skill Gap Severity: ${skillGapAnalysis.overallGapSeverity}
Estimated Time to Close Gaps: ${skillGapAnalysis.estimatedTimeToClose}

Create a ${timelineMonths}-month roadmap with ${Math.ceil(timelineMonths / 2)}-${Math.ceil(timelineMonths / 1.5)} phases. Each phase should build progressively toward the target role.

Return a JSON object with this exact structure:
{
  "careerPathId": "${careerPath.roleId}",
  "careerPathName": "${careerPath.roleName}",
  "timelineMonths": ${timelineMonths},
  "phases": [
    {
      "phaseNumber": 1,
      "duration": "string - e.g., 'Month 1-2'",
      "skillsFocus": ["array of 3-5 skills to focus on in this phase"],
      "learningDirection": "string - clear learning goal for this phase",
      "projectIdeas": ["array of 2-3 concrete project ideas to apply learning"],
      "milestones": ["array of 2-3 measurable milestones"],
      "actionItems": ["array of 4-6 specific weekly/bi-weekly actions"]
    }
  ],
  "successMetrics": ["array of 3-5 metrics to measure success"],
  "riskFactors": ["array of 2-3 potential challenges to watch for"],
  "supportResources": ["array of resources: courses, communities, mentors, etc."]
}

STRICT REQUIREMENTS:
- Return ONLY the JSON object, no additional text
- Create ${Math.ceil(timelineMonths / 2)}-${Math.ceil(timelineMonths / 1.5)} phases
- Each phase should be 1-3 months duration
- Project ideas must be specific and realistic
- Action items must be concrete and achievable
- Milestones should be measurable (e.g., "complete X course", "build Y project")
- Success metrics should be tangible and relevant to the target role
- Support resources should include specific courses, communities, or mentorship paths
- Each phase should build on the previous one progressively`;
}

/**
 * Parses and validates the AI response for roadmap generation
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

    const parsed = JSON.parse(cleanedText);
    const validated = CareerRoadmapSchema.parse(parsed);
    return validated;
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

  // Call Deepseek API
  const response = await callDeepseekAPI(prompt);
  const roadmap = await parseRoadmapGeneratorResponse(response);

  return roadmap;
}
