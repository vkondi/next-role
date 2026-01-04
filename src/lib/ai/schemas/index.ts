/**
 * Zod schemas for validating API requests and responses
 * Ensures type safety and proper data validation from AI responses
 */

import { z } from "zod";

// Skill level enum
const SkillLevelSchema = z.enum([
  "None",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
]);

const SeveritySchema = z.enum(["Low", "Medium", "High"]);
const EffortRewardSchema = z.enum(["Low", "Medium", "High"]);

/**
 * ResumeProfile Schema - Validates extracted resume data
 */
export const ResumeProfileSchema = z.object({
  name: z.string().optional().describe("Person's full name from resume"),
  currentRole: z.string().describe("Current job title or role"),
  yearsOfExperience: z
    .number()
    .min(0)
    .describe("Total years of professional experience"),
  techStack: z
    .array(z.string())
    .describe("Technologies and languages known"),
  strengthAreas: z
    .array(z.string())
    .describe("Key strength areas and competencies"),
  industryBackground: z.string().describe("Industry or domain experience"),
  certifications: z
    .array(z.string())
    .optional()
    .describe("Professional certifications"),
  education: z.array(z.string()).optional().describe("Educational background"),
  rawText: z
    .string()
    .optional()
    .describe("Original resume text for reference"),
});

export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;

/**
 * CareerPath Schema - Validates suggested career paths
 */
export const CareerPathSchema = z.object({
  roleId: z.string().describe("Unique identifier for this career path"),
  roleName: z.string().describe("Name of the target role"),
  description: z.string().describe("Description of the role and responsibilities"),
  marketDemandScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Market demand as percentage (0-100)"),
  effortLevel: EffortRewardSchema.describe("Effort required to transition"),
  rewardPotential: EffortRewardSchema.describe(
    "Career growth and salary potential"
  ),
  reasoning: z
    .string()
    .describe("Explanation of why this path suits the user"),
  requiredSkills: z
    .array(z.string())
    .describe("Skills needed for this role"),
  industryAlignment: z
    .number()
    .min(0)
    .max(100)
    .describe("How well it aligns with user background (0-100)"),
});

export type CareerPath = z.infer<typeof CareerPathSchema>;

/**
 * SkillGap Schema - Individual skill gap
 */
export const SkillGapSchema = z.object({
  skillName: z.string().describe("Name of the skill"),
  currentLevel: SkillLevelSchema.describe("User's current skill level"),
  requiredLevel: SkillLevelSchema.describe("Required skill level for the role"),
  importance: SeveritySchema.describe("How critical this skill is"),
  learningResources: z
    .array(z.string())
    .optional()
    .describe("Suggested resources to learn this skill"),
});

export type SkillGap = z.infer<typeof SkillGapSchema>;

/**
 * SkillGapAnalysis Schema - Complete skill gap analysis
 */
export const SkillGapAnalysisSchema = z.object({
  careerPathId: z.string().describe("ID of the related career path"),
  careerPathName: z.string().describe("Name of the career path"),
  skillGaps: z.array(SkillGapSchema).describe("Individual skill gaps"),
  overallGapSeverity: SeveritySchema.describe("Overall severity of gaps"),
  estimatedTimeToClose: z
    .string()
    .describe("Estimated time to close skill gaps"),
  summary: z.string().describe("Summary of the skill gap analysis"),
});

export type SkillGapAnalysis = z.infer<typeof SkillGapAnalysisSchema>;

/**
 * RoadmapPhase Schema - Individual roadmap phase
 */
export const RoadmapPhaseSchema = z.object({
  phaseNumber: z.number().min(1).describe("Phase number in the roadmap"),
  duration: z.string().describe("Duration (e.g., 'Month 1-2')"),
  skillsFocus: z
    .array(z.string())
    .describe("Skills to focus on in this phase"),
  learningDirection: z.string().describe("Learning direction and goals"),
  projectIdeas: z
    .array(z.string())
    .describe("Project ideas to apply learning"),
  milestones: z.array(z.string()).describe("Key milestones to achieve"),
  actionItems: z
    .array(z.string())
    .describe("Specific action items for this phase"),
});

export type RoadmapPhase = z.infer<typeof RoadmapPhaseSchema>;

/**
 * CareerRoadmap Schema - Complete career roadmap
 */
export const CareerRoadmapSchema = z.object({
  careerPathId: z.string().describe("ID of the related career path"),
  careerPathName: z.string().describe("Name of the career path"),
  timelineMonths: z
    .number()
    .min(1)
    .max(24)
    .describe("Total timeline in months"),
  phases: z
    .array(RoadmapPhaseSchema)
    .min(1)
    .describe("Phases of the roadmap"),
  successMetrics: z
    .array(z.string())
    .describe("Metrics to measure success"),
  riskFactors: z.array(z.string()).describe("Potential challenges or risks"),
  supportResources: z
    .array(z.string())
    .describe("Resources and support needed"),
});

export type CareerRoadmap = z.infer<typeof CareerRoadmapSchema>;

/**
 * API Request Schemas
 */

export const ResumeInterpreterRequestSchema = z.object({
  resumeText: z.string().min(10).describe("Resume text to interpret"),
});

export const CareerPathGeneratorRequestSchema = z.object({
  resumeProfile: ResumeProfileSchema,
  numberOfPaths: z.number().min(1).max(10).default(5).optional(),
});

export const SkillGapAnalyzerRequestSchema = z.object({
  resumeProfile: ResumeProfileSchema,
  careerPath: CareerPathSchema,
});

export const RoadmapGeneratorRequestSchema = z.object({
  resumeProfile: ResumeProfileSchema,
  careerPath: CareerPathSchema,
  skillGapAnalysis: SkillGapAnalysisSchema,
  timelineMonths: z.number().min(3).max(24).default(6).optional(),
});

/**
 * API Response Schemas
 */

export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});
