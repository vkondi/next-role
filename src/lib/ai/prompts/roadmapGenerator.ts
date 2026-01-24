/**
 * Roadmap Generator Prompt Module
 * Generates month-by-month career roadmap with dynamic phase count (2-5 phases)
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
import { ROADMAP_CONFIG, TOKEN_CONFIG } from "@/lib/config/appConfig";
import { getLogger } from "@/lib/api/logger";
import { getSystemMessage } from "./systemMessages";
import { formatMonthRange } from "@/lib/utils/timelineUtils";
import {
  removeMarkdownBlocks,
  extractStringField,
  extractNumberField,
  repairTruncatedJSON,
} from "@/lib/api/jsonRecovery";

const log = getLogger("RoadmapGenerator");

/**
 * Calculate recommended number of phases based on gap severity and timeline
 * This helps guide the AI to choose appropriate phase count
 */
function getRecommendedPhaseCount(
  overallGapSeverity: string,
  timelineMonths: number
): number {
  const severity = overallGapSeverity as keyof typeof ROADMAP_CONFIG.PHASE_COUNT_BY_SEVERITY;
  const severityConfig = ROADMAP_CONFIG.PHASE_COUNT_BY_SEVERITY[severity];
  
  if (!severityConfig) {
    // Default to Medium if severity is not recognized
    return ROADMAP_CONFIG.PHASE_COUNT_BY_SEVERITY.Medium.medium;
  }
  
  // Determine timeline category
  const SHORT_MAX = ROADMAP_CONFIG.TIMELINE_BREAKPOINTS.SHORT_MAX;
  const MEDIUM_MAX = ROADMAP_CONFIG.TIMELINE_BREAKPOINTS.MEDIUM_MAX;
  
  if (timelineMonths <= SHORT_MAX) {
    return severityConfig.short;
  } else if (timelineMonths <= MEDIUM_MAX) {
    return severityConfig.medium;
  } else {
    return severityConfig.long;
  }
}

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

  const recommendedPhases = getRecommendedPhaseCount(
    skillGapAnalysis.overallGapSeverity,
    timelineMonths
  );

  // Calculate months per phase
  const monthsPerPhase = Math.ceil(timelineMonths / recommendedPhases);

  return `Create a ${timelineMonths}-month career roadmap to transition to: ${careerPath.roleName}
Current role: ${resumeProfile.currentRole} (${resumeProfile.yearsOfExperience} years)
Gap severity: ${skillGapAnalysis.overallGapSeverity}
Critical skills to develop: ${criticalSkills}

Generate exactly ${recommendedPhases} phases (MUST be ${recommendedPhases} phases):
- Each phase covers approximately ${monthsPerPhase} months
- Each phase must have all required fields with multiple items where specified
- Use realistic, actionable content for each phase
- IMPORTANT: Each phase MUST have 1-3 milestones and 1-3 action items (not just 1)

RESPOND WITH ONLY VALID JSON (no markdown, no text before/after):
{
  "careerPathId": "${careerPath.roleId}",
  "careerPathName": "${careerPath.roleName}",
  "timelineMonths": ${timelineMonths},
  "phases": [
${Array.from({ length: recommendedPhases }, (_, i) => {
  const startMonth = i * monthsPerPhase + 1;
  const endMonth = i === recommendedPhases - 1 ? timelineMonths : (i + 1) * monthsPerPhase;
  const durationStr = formatMonthRange(startMonth, endMonth);
  return `    {
      "phaseNumber": ${i + 1},
      "duration": "${durationStr}",
      "skillsFocus": ["${['foundational skill', 'core framework', 'advanced technique', 'specialization', 'mastery'][i] || 'key skill'}"],
      "learningDirection": "Brief description of learning goals",
      "projectIdeas": ["Practical project aligned with phase goals"],
      "milestones": ["Milestone 1", "Milestone 2"],
      "actionItems": ["Action 1", "Action 2"]
    }`;
}).join(',')}
  ],
  "successMetrics": ["Portfolio completion", "Technical proficiency", "Interview readiness"],
  "riskFactors": ["Time commitment", "Learning complexity"]
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
 * Handles variable phase count (2-5 phases)
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
      log.debug({ phasesCount: parsed.phases?.length }, "AI response parsed successfully");
    } catch (jsonError) {
      log.debug("JSON parse failed, attempting repair");
      // First, try to repair truncated JSON by adding missing braces/brackets
      try {
        const repaired = repairTruncatedJSON(cleanedText);
        parsed = JSON.parse(repaired);
        log.debug({ phasesCount: parsed.phases?.length }, "AI response repaired and parsed");
      } catch {
        // If repair fails, try recovery via regex extraction
        log.debug("Repair failed, attempting recovery via regex");
        const recovered = tryRecoverRoadmap(cleanedText);
        if (!recovered) {
          log.warn("Recovery failed");
          throw jsonError;
        }
        parsed = recovered;
        log.debug({ phasesCount: parsed.phases?.length }, "AI response recovered via regex");
      }
    }
    
    // Ensure required arrays have defaults if missing from recovery
    if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
      log.warn({ responseText: responseText.substring(0, 200) }, "No phases in AI response, using fallback");
      // Create default phases based on timeline - this is a fallback when AI response fails
      // Mark that we used fallback so we can notify the user
      const timelineMonths = parsed.timelineMonths || 6;
      const recommendedPhases = getRecommendedPhaseCount(
        parsed.gapSeverity || "Medium",
        timelineMonths
      );
      
      parsed.phases = generateDefaultPhases(timelineMonths, recommendedPhases);
      parsed._usedFallback = true; // Mark that fallback was used
      log.warn({ phaseCount: parsed.phases.length }, "Generated default phases as fallback");
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
    
    // Preserve fallback flag in the validated roadmap
    const result = validated as any;
    if (parsed._usedFallback) {
      result._usedFallback = true;
    }
    
    log.info({ phaseCount: validated.phases.length, usedFallback: !!result._usedFallback }, "Roadmap parsed and validated");
    return result;
  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : String(error) }, "Failed to parse roadmap response");
    throw new Error(
      `Failed to parse roadmap generator response: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate default phases as fallback when AI response fails
 * Creates N evenly-spaced phases based on timeline
 */
function generateDefaultPhases(timelineMonths: number, phaseCount: number): any[] {
  const monthsPerPhase = Math.floor(timelineMonths / phaseCount);
  const phases = [];
  
  for (let i = 0; i < phaseCount; i++) {
    const startMonth = i * monthsPerPhase + 1;
    const endMonth = i === phaseCount - 1 
      ? timelineMonths 
      : (i + 1) * monthsPerPhase;
    
    const phaseDescriptions = [
      { direction: "Build foundational skills", focus: "Core fundamentals" },
      { direction: "Develop intermediate expertise", focus: "Practical application" },
      { direction: "Advance specialized skills", focus: "Advanced concepts" },
      { direction: "Prepare for transition", focus: "Portfolio and preparation" },
      { direction: "Final specialization", focus: "Market readiness" },
    ];
    
    const desc = phaseDescriptions[i] || phaseDescriptions[0];
    
    phases.push({
      phaseNumber: i + 1,
      duration: `Month ${startMonth}-${endMonth}`,
      skillsFocus: [desc.focus],
      learningDirection: desc.direction,
      projectIdeas: [`Phase ${i + 1} project`],
      milestones: [`Complete phase ${i + 1}`],
      actionItems: [`Work on phase ${i + 1} objectives`],
    });
  }
  
  return phases;
}

/**
 * Roadmap Generator function
 * Generates N phases (2-5) based on gap severity and timeline
 * Max tokens: configurable via MAX_TOKENS_ROADMAP env variable (default: 1800)
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

  const systemMessage = getSystemMessage("roadmapGenerator");
  const response = await callAI(aiProvider, prompt, TOKEN_CONFIG.ROADMAP_GENERATOR, systemMessage);
  const roadmap = await parseRoadmapGeneratorResponse(response);

  return roadmap;
}
