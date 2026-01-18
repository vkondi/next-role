/**
 * Career Strategy Dashboard Page
 * Main analysis page showing career paths, skill gaps, and roadmaps
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CareerPathsCarousel,
  SkillGapChart,
  RoadmapTimeline,
  ApiModeToggle,
} from "@/components";
import MockModeToast from "@/components/MockModeToast";
import { useApiMode, useAIProvider } from "@/lib/context/SettingsContext";
import { useResume } from "@/lib/context/ResumeContext";
import { apiRequest, buildApiUrl } from "@/lib/api/apiClient";
import { calculateTimelineMonths } from "@/lib/utils/timelineUtils";
import type {
  ResumeProfile,
  CareerPath,
  CareerPathMinimal,
  SkillGapAnalysis,
  CareerRoadmap,
} from "@/lib/types";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { mode } = useApiMode();
  const { provider } = useAIProvider();
  const { resumeProfile } = useResume();
  const initialLoadRef = useRef(true);
  const [careerPathsMinimal, setCareerPathsMinimal] = useState<CareerPathMinimal[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [skillGapAnalysis, setSkillGapAnalysis] =
    useState<SkillGapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailedLoading, setDetailedLoading] = useState(false);
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch MINIMAL career paths (fast, for carousel)
  const fetchCareerPathsMinimal = useCallback(
    async (profile: ResumeProfile, apiMode: string) => {
      try {
        const url = buildApiUrl(
          "/api/career-paths/generate",
          apiMode === "mock"
        );
        const paths = await apiRequest<CareerPathMinimal[]>(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeProfile: profile, numberOfPaths: 5, aiProvider: provider }),
        });
        setCareerPathsMinimal(paths);
        // NO auto-selection - guide user to select one
        setSelectedPathId(null);
        setSelectedPath(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [provider]
  );

  // Unified effect: Handle initial load and mode changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Check if user has resume context
    if (!resumeProfile) {
      // If first time loading, redirect to upload
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        router.push("/upload");
      }
      return;
    }

    // First time: load career paths
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      setLoading(true);
      fetchCareerPathsMinimal(resumeProfile, mode);
      return;
    }

    // Subsequent times: reload when mode changes
    if (!loading) {
      setLoading(true);
      setCareerPathsMinimal([]);
      setSelectedPathId(null);
      setSelectedPath(null);
      setSkillGapAnalysis(null);
      setRoadmap(null);
      setError(null);

      fetchCareerPathsMinimal(resumeProfile, mode);
    }
  }, [mode, resumeProfile, fetchCareerPathsMinimal, router]);

  const loadRoadmap = useCallback(
    async (
      profile: ResumeProfile,
      path: CareerPath,
      gaps: SkillGapAnalysis
    ) => {
      setRoadmapLoading(true);
      try {
        // Calculate timeline dynamically based on skill gap analysis
        const timelineMonths = calculateTimelineMonths(
          gaps.estimatedTimeToClose,
          gaps.overallGapSeverity
        );

        const url = buildApiUrl("/api/roadmap/generate", mode === "mock");
        const roadmapData = await apiRequest<CareerRoadmap>(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeProfile: profile,
            careerPath: path,
            skillGapAnalysis: gaps,
            timelineMonths,
            aiProvider: provider,
          }),
        });
        setRoadmap(roadmapData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setRoadmapLoading(false);
      }
    },
    [mode, provider]
  );

  const handlePathSelect = useCallback(
    async (pathId: string) => {
      setSelectedPathId(pathId);
      setSelectedPath(null);
      setSkillGapAnalysis(null);
      setRoadmap(null);
      setError(null);

      if (!resumeProfile) return;

      const minimalPath = careerPathsMinimal.find((p) => p.roleId === pathId);
      if (!minimalPath) return;

      // Fetch detailed info for this path
      setDetailedLoading(true);
      let detailedPath: CareerPath | null = null;
      
      try {
        const url = buildApiUrl(
          "/api/career-paths/details",
          mode === "mock"
        );
        const details = await apiRequest<CareerPath>(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeProfile,
            pathBasic: {
              roleId: minimalPath.roleId,
              roleName: minimalPath.roleName,
            },
            aiProvider: provider,
          }),
        });
        // Merge with minimal data
        detailedPath = {
          ...minimalPath,
          ...details,
        } as CareerPath;
        setSelectedPath(detailedPath);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setDetailedLoading(false);
        return;
      }

      setDetailedLoading(false);

      // Once we have detailed path, fetch skill gap analysis
      if (!detailedPath) {
        setError("Failed to load path details");
        return;
      }

      setSkillGapLoading(true);
      try {
        const url = buildApiUrl("/api/skill-gap/analyze", mode === "mock");
        const gapAnalysis = await apiRequest<SkillGapAnalysis>(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeProfile,
            careerPath: detailedPath,
            aiProvider: provider,
          }),
        });
        setSkillGapAnalysis(gapAnalysis);
        setSkillGapLoading(false);
        loadRoadmap(resumeProfile, detailedPath, gapAnalysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setSkillGapLoading(false);
      }
    },
    [mode, provider, resumeProfile, careerPathsMinimal, loadRoadmap]
  );

  if (error && !resumeProfile) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <p className="heading-3">{error}</p>
          <Link href="/upload" className="btn btn-primary">
            Upload Resume
          </Link>
        </div>
      </main>
    );
  }

  // Show loading while checking for resume context on initial load
  if (loading || !resumeProfile) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 animate-pulse" />
          <p className="text-lg font-semibold text-slate-900">
            Loading your career analysis...
          </p>
          <p className="text-sm text-slate-600">
            This typically takes a few seconds
          </p>
        </div>
      </main>
    );
  }

  // const selectedPath = careerPaths.find((p) => p.roleId === selectedPathId);

  return (
    <main className="min-h-screen bg-slate-50">
      <ApiModeToggle />
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container flex items-center justify-between h-14 sm:h-16 md:h-20">
          <Link href="/" className="text-base sm:text-lg md:text-2xl font-bold text-emerald-600 flex-shrink-0">
            NextRole
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-emerald-600 flex-shrink-0">
              ✓ Complete
            </span>
            <Link href="/upload" className="btn btn-secondary btn-sm flex-shrink-0">
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden xs:inline">New</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="section container space-y-8 sm:space-y-12">
        {/* Header */}
        {resumeProfile && (
          <div className="space-y-2 sm:space-y-4 px-2 sm:px-0">
            <h1 className="heading-1">
              {resumeProfile.name
                ? `${resumeProfile.name}'s Career Strategy`
                : "Your Career Strategy"}
            </h1>
            <p className="text-subtitle text-slate-600 text-sm sm:text-base">
              Based on your profile as a {resumeProfile.currentRole} with{" "}
              {resumeProfile.yearsOfExperience} years of experience
            </p>
          </div>
        )}

        {/* Mock Mode Toast - Only show in mock mode */}
        {mode === "mock" && (
          <div className="px-2 sm:px-0">
            <MockModeToast />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-700">{error}</p>
          </div>
        )}

        {/* Career Paths Carousel Section */}
        <div className="space-y-6">
          <CareerPathsCarousel
            paths={careerPathsMinimal}
            selectedPathId={selectedPathId}
            onSelect={handlePathSelect}
            isLoading={loading}
          />
        </div>

        {/* Detailed Path Info - Shown after selection */}
        {selectedPath && !detailedLoading && (
          <div className="space-y-6">
            <div className="card">
              <div className="space-y-4">
                <h3 className="heading-3 text-lg sm:text-2xl">{selectedPath.roleName}</h3>
                <p className="text-body text-slate-700 text-sm sm:text-base">{selectedPath.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  <div className="bg-slate-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Market Demand</p>
                    <p className="heading-4 text-emerald-600 text-lg">{selectedPath.marketDemandScore}%</p>
                  </div>
                  <div className="bg-slate-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Industry Fit</p>
                    <p className="heading-4 text-emerald-600 text-lg">{selectedPath.industryAlignment}%</p>
                  </div>
                  <div className="bg-slate-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Effort</p>
                    <p className="heading-4 text-slate-900 text-lg">{selectedPath.effortLevel}</p>
                  </div>
                  <div className="bg-slate-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Reward</p>
                    <p className="heading-4 text-slate-900 text-lg">{selectedPath.rewardPotential}</p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-semibold text-emerald-900 mb-2">Why This Path?</p>
                  <p className="text-xs sm:text-sm text-emerald-800">{selectedPath.reasoning}</p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Path Loading Indicator */}
        {selectedPathId && detailedLoading && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-center gap-3 sm:gap-4 flex-col sm:flex-row">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
                <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
                  <p className="text-base sm:text-lg font-semibold text-slate-900">
                    Loading path details...
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Gathering comprehensive information
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skill Gap Loading Indicator */}
        {skillGapLoading && (
          <div className="space-y-6">
            <div className="card-elevated">
              <div className="flex items-center justify-center gap-3 sm:gap-4 flex-col sm:flex-row">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 animate-pulse flex-shrink-0" />
                <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
                  <p className="text-base sm:text-lg font-semibold text-slate-900">
                    Analyzing skill gaps...
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    This may take a few moments while we assess your skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skill Gap Analysis Section */}
        {skillGapAnalysis && !skillGapLoading && (
          <div className="space-y-6">
            <SkillGapChart analysis={skillGapAnalysis} />
          </div>
        )}

        {/* Detailed Skill Gaps */}
        {skillGapAnalysis && !skillGapLoading && (
          <div className="card space-y-4 sm:space-y-6">
            <h3 className="heading-2 text-xl sm:text-2xl md:text-4xl">Skill Gap Details</h3>

            <div className="space-y-3 sm:space-y-4">
              {skillGapAnalysis.skillGaps.map((gap, index) => (
                <div
                  key={index}
                  className="border-l-4 border-emerald-500 pl-3 sm:pl-4 py-2 sm:py-3"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-4 flex-col sm:flex-row">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm sm:text-base break-words">
                        {gap.skillName}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        {gap.currentLevel} → {gap.requiredLevel}
                      </p>
                    </div>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0 ${
                        gap.importance === "High"
                          ? "bg-red-100 text-red-700"
                          : gap.importance === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {gap.importance} Priority
                    </span>
                  </div>

                  {gap.learningResources &&
                    gap.learningResources.length > 0 && (
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-200">
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-1 sm:mb-2">
                          Learning Resources:
                        </p>
                        <ul className="space-y-1">
                          {gap.learningResources.map((resource, i) => (
                            <li
                              key={i}
                              className="text-xs sm:text-sm text-slate-600 flex items-start gap-2"
                            >
                              <span className="text-emerald-600 mt-0.5 flex-shrink-0">•</span>
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap Loading Indicator */}
        {skillGapAnalysis && roadmapLoading && (
          <div className="card-elevated">
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-col sm:flex-row">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 animate-pulse flex-shrink-0" />
              <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
                <p className="text-base sm:text-lg font-semibold text-slate-900">
                  Generating your career roadmap...
                </p>
                <p className="text-xs sm:text-sm text-slate-600">
                  Creating a personalized development plan based on your skill gaps
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Career Roadmap Section */}
        {roadmap && !roadmapLoading && (
          <div className="space-y-6">
            <RoadmapTimeline roadmap={roadmap} />
          </div>
        )}

        {/* Export/Share Section */}
        <div className="card text-center space-y-3 sm:space-y-4">
          <p className="heading-4 text-lg sm:text-2xl">Ready to Get Started?</p>
          <p className="text-body text-slate-600 text-sm sm:text-base">
            Download your personalized career strategy or share it with a
            mentor.
          </p>
          <button className="btn btn-primary mx-auto text-sm sm:text-base">
            📥 Download as PDF (Coming Soon)
          </button>
        </div>
      </div>
    </main>
  );
}
