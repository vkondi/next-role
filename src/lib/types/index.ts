/**
 * Core domain types for the Career Strategy Copilot
 * These types represent the fundamental data models used throughout the application
 */

/**
 * Represents a user's extracted career profile from their resume
 */
export interface ResumeProfile {
  name?: string;
  currentRole: string;
  yearsOfExperience: number;
  techStack: string[];
  strengthAreas: string[];
  industryBackground: string;
  certifications?: string[];
  education?: string[];
  rawText?: string;
}

/**
 * Represents a potential career path the user could pursue
 */
export interface CareerPath {
  roleId: string;
  roleName: string;
  description: string;
  marketDemandScore: number; // 0-100
  effortLevel: "Low" | "Medium" | "High"; // Effort to transition
  rewardPotential: "Low" | "Medium" | "High"; // Career growth/salary potential
  reasoning: string; // Why this path makes sense for the user
  requiredSkills: string[];
  industryAlignment: number; // 0-100, how well it aligns with user's background
}

/**
 * Represents the gap between current and required skills for a career path
 */
export interface SkillGapAnalysis {
  careerPathId: string;
  careerPathName: string;
  skillGaps: SkillGap[];
  overallGapSeverity: "Low" | "Medium" | "High";
  estimatedTimeToClose: string; // e.g., "3-6 months"
  summary: string;
}

/**
 * Individual skill gap
 */
export interface SkillGap {
  skillName: string;
  currentLevel: "None" | "Beginner" | "Intermediate" | "Advanced" | "Expert";
  requiredLevel: "None" | "Beginner" | "Intermediate" | "Advanced" | "Expert";
  importance: "Low" | "Medium" | "High";
  learningResources?: string[];
}

/**
 * Represents a single roadmap phase (month or quarter)
 */
export interface RoadmapPhase {
  phaseNumber: number;
  duration: string; // e.g., "Month 1-2"
  skillsFocus: string[];
  learningDirection: string;
  projectIdeas: string[];
  milestones: string[];
  actionItems: string[];
}

/**
 * Complete career roadmap for a selected path
 */
export interface CareerRoadmap {
  careerPathId: string;
  careerPathName: string;
  timelineMonths: number; // Total duration (6-12 months typically)
  phases: RoadmapPhase[];
  successMetrics: string[];
  riskFactors: string[];
  supportResources: string[];
}

/**
 * Complete career analysis response from the dashboard
 */
export interface CareerAnalysis {
  resumeProfile: ResumeProfile;
  careerPaths: CareerPath[];
  selectedPathId?: string;
  skillGapAnalysis?: SkillGapAnalysis;
  roadmap?: CareerRoadmap;
  generatedAt: string;
}

/**
 * API Request/Response types
 */

export interface ResumeInterpreterRequest {
  resumeText: string;
}

export interface ResumeInterpreterResponse {
  success: boolean;
  data: ResumeProfile;
  error?: string;
}

export interface CareerPathGeneratorRequest {
  resumeProfile: ResumeProfile;
  numberOfPaths?: number; // Default: 5
}

export interface CareerPathGeneratorResponse {
  success: boolean;
  data: CareerPath[];
  error?: string;
}

export interface SkillGapAnalyzerRequest {
  resumeProfile: ResumeProfile;
  careerPath: CareerPath;
}

export interface SkillGapAnalyzerResponse {
  success: boolean;
  data: SkillGapAnalysis;
  error?: string;
}

export interface RoadmapGeneratorRequest {
  resumeProfile: ResumeProfile;
  careerPath: CareerPath;
  skillGapAnalysis: SkillGapAnalysis;
  timelineMonths?: number; // Default: 6
}

export interface RoadmapGeneratorResponse {
  success: boolean;
  data: CareerRoadmap;
  error?: string;
}
