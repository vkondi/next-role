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
import { callAI } from "@/lib/api/aiProvider";
import type { AIProvider } from "@/lib/api/aiProvider";
import {
  removeMarkdownBlocks,
  extractStringField,
  extractNumberField,
  repairTruncatedJSON,
} from "@/lib/api/jsonRecovery";

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
 * Recover roadmap object from truncated/malformed AI response
 * Extracts fields using regex and array patterns when JSON parsing fails
 */
function tryRecoverRoadmap(text: string): Record<string, any> | null {
  const recovered: Record<string, any> = {};
  
  // Extract simple fields
  const careerPathId = extractStringField(text, "careerPathId");
  if (careerPathId) recovered.careerPathId = careerPathId;
  
  const careerPathName = extractStringField(text, "careerPathName");
  if (careerPathName) recovered.careerPathName = careerPathName;
  
  const timelineMonths = extractNumberField(text, "timelineMonths");
  if (timelineMonths) recovered.timelineMonths = timelineMonths;
  
  // Extract phases array
  const phasesMatch = text.match(/"phases"\s*:\s*\[(.*?)(?:\]|$)/i);
  if (phasesMatch) {
    const phasesContent = phasesMatch[1];
    // Try to extract individual phase objects
    const phasePattern = /\{[^}]*"phaseNumber"[^}]*\}/g;
    const phaseMatches = phasesContent.match(phasePattern) || [];
    
    if (phaseMatches.length > 0) {
      recovered.phases = phaseMatches.map((phaseStr, idx) => {
        const phase: Record<string, any> = {
          phaseNumber: idx + 1,
          duration: `Phase ${idx + 1}`,
          skillsFocus: [],
          learningDirection: "",
          projectIdeas: [],
          milestones: [],
          actionItems: [],
        };
        
        // Extract phase number
        const phaseNumMatch = phaseStr.match(/"phaseNumber"\s*:\s*(\d+)/i);
        if (phaseNumMatch) phase.phaseNumber = parseInt(phaseNumMatch[1], 10);
        
        // Extract duration
        const durationMatch = phaseStr.match(/"duration"\s*:\s*"([^"]*)"/i);
        if (durationMatch) phase.duration = durationMatch[1].split('"')[0];
        
        // Extract learningDirection
        const dirMatch = phaseStr.match(/"learningDirection"\s*:\s*"([^"]*)"/i);
        if (dirMatch) phase.learningDirection = dirMatch[1].split('"')[0];
        
        // Extract skillsFocus array
        const skillsMatch = phaseStr.match(/"skillsFocus"\s*:\s*\[([^\]]*)\]/i);
        if (skillsMatch) {
          phase.skillsFocus = skillsMatch[1]
            .split(",")
            .map((s: string) => s.trim().replace(/"/g, ""))
            .filter((s: string) => s.length > 0);
        }
        
        // Extract projectIdeas array
        const projectsMatch = phaseStr.match(/"projectIdeas"\s*:\s*\[([^\]]*)\]/i);
        if (projectsMatch) {
          phase.projectIdeas = projectsMatch[1]
            .split(",")
            .map((p: string) => p.trim().replace(/"/g, ""))
            .filter((p: string) => p.length > 0);
        }
        
        // Extract milestones array
        const milestonesMatch = phaseStr.match(/"milestones"\s*:\s*\[([^\]]*)\]/i);
        if (milestonesMatch) {
          phase.milestones = milestonesMatch[1]
            .split(",")
            .map((m: string) => m.trim().replace(/"/g, ""))
            .filter((m: string) => m.length > 0);
        }
        
        // Extract actionItems array
        const actionMatch = phaseStr.match(/"actionItems"\s*:\s*\[([^\]]*)\]/i);
        if (actionMatch) {
          phase.actionItems = actionMatch[1]
            .split(",")
            .map((a: string) => a.trim().replace(/"/g, ""))
            .filter((a: string) => a.length > 0);
        }
        
        return phase;
      });
    }
  }
  
  // Extract successMetrics array
  const metricsMatch = text.match(/"successMetrics"\s*:\s*\[([^\]]*)\]/i);
  if (metricsMatch) {
    recovered.successMetrics = metricsMatch[1]
      .split(",")
      .map((m: string) => m.trim().replace(/"/g, ""))
      .filter((m: string) => m.length > 0);
  }
  
  // Extract riskFactors array
  const riskMatch = text.match(/"riskFactors"\s*:\s*\[([^\]]*)\]/i);
  if (riskMatch) {
    recovered.riskFactors = riskMatch[1]
      .split(",")
      .map((r: string) => r.trim().replace(/"/g, ""))
      .filter((r: string) => r.length > 0);
  }
  
  return Object.keys(recovered).length > 0 ? recovered : null;
}

/**
 * Parses and validates the AI response for roadmap generation
 * Includes JSON repair for truncated responses
 */
export async function parseRoadmapGeneratorResponse(
  responseText: string
): Promise<CareerRoadmap> {
  try {
    let cleanedText = removeMarkdownBlocks(responseText.trim());

    if (!cleanedText || cleanedText === "{}") {
      throw new Error("Empty or invalid JSON response");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (jsonError) {
      // First, try to repair truncated JSON by adding missing braces/brackets
      try {
        const repaired = repairTruncatedJSON(cleanedText);
        parsed = JSON.parse(repaired);
      } catch {
        // If repair fails, try recovery via regex extraction
        const recovered = tryRecoverRoadmap(cleanedText);
        if (!recovered) {
          throw jsonError;
        }
        parsed = recovered;
      }
    }
    
    // Ensure required arrays have defaults if missing from recovery
    if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
      // Create a default phase if none exist
      // Note: This is a fallback when AI response fails - ideally this shouldn't happen
      const timelineMonths = parsed.timelineMonths || 6;
      const halfway = Math.ceil(timelineMonths / 2);
      
      parsed.phases = [
        {
          phaseNumber: 1,
          duration: `Month 1-${halfway}`,
          skillsFocus: ["Core skill development"],
          learningDirection: "Build foundation in target domain",
          projectIdeas: ["Foundational hands-on project"],
          milestones: ["Complete foundational learning", "Build first project"],
          actionItems: ["Study key concepts", "Start foundational project"],
        },
        {
          phaseNumber: 2,
          duration: `Month ${halfway + 1}-${timelineMonths}`,
          skillsFocus: ["Advanced skill development"],
          learningDirection: "Deepen expertise and prepare for transition",
          projectIdeas: ["Advanced portfolio project"],
          milestones: ["Complete advanced learning", "Polish portfolio"],
          actionItems: ["Advance skills", "Refine projects for portfolio"],
        },
      ];
    }
    if (!parsed.successMetrics || !Array.isArray(parsed.successMetrics)) {
      parsed.successMetrics = [
        "Foundational skills acquired",
        "Portfolio projects completed",
        "Ready for target role interviews",
      ];
    }
    if (!parsed.riskFactors || !Array.isArray(parsed.riskFactors)) {
      parsed.riskFactors = [
        "Learning curve steepness",
        "Time commitment",
        "Technology changes",
      ];
    }
    
    // Validate against schema
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
  timelineMonths: number = 6,
  aiProvider: AIProvider = "deepseek"
): Promise<CareerRoadmap> {
  const prompt = createRoadmapGeneratorPrompt(
    resumeProfile,
    careerPath,
    skillGapAnalysis,
    timelineMonths
  );

  const response = await callAI(aiProvider, prompt, 1500);
  const roadmap = await parseRoadmapGeneratorResponse(response);

  return roadmap;
}
