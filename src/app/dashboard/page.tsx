/**
 * Career Strategy Dashboard Page
 * Main analysis page showing career paths, skill gaps, and roadmaps
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CareerPathCard,
  SkillGapChart,
  RoadmapTimeline,
  ApiModeToggle,
} from "@/components";
import { useApiMode } from "@/lib/context/ApiModeContext";
import { useResume } from "@/lib/context/ResumeContext";
import { apiRequest, buildApiUrl } from "@/lib/api/apiClient";
import type {
  ResumeProfile,
  CareerPath,
  SkillGapAnalysis,
  CareerRoadmap,
} from "@/lib/types";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { mode } = useApiMode();
  const { resumeProfile } = useResume();
  const initialLoadRef = useRef(true);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch career paths based on profile and API mode
  const fetchCareerPaths = useCallback(async (profile: ResumeProfile, apiMode: string) => {
    try {
      const url = buildApiUrl("/api/career-paths/generate", apiMode === "mock");
      const paths = await apiRequest<CareerPath[]>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeProfile: profile, numberOfPaths: 5 }),
      });
      setCareerPaths(paths);
      // Auto-select first path
      setSelectedPathId(paths[0].roleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Unified effect: Handle initial load and mode changes
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
      fetchCareerPaths(resumeProfile, mode);
      return;
    }

    // Subsequent times: reload when mode changes
    setLoading(true);
    setCareerPaths([]);
    setSelectedPathId(null);
    setSkillGapAnalysis(null);
    setRoadmap(null);
    setError(null);

    fetchCareerPaths(resumeProfile, mode);
  }, [mode, resumeProfile, fetchCareerPaths, router]);

  const loadRoadmap = useCallback(
    async (profile: ResumeProfile, path: CareerPath, gaps: SkillGapAnalysis) => {
      setRoadmapLoading(true);
      try {
        const url = buildApiUrl("/api/roadmap/generate", mode === "mock");
        const roadmapData = await apiRequest<CareerRoadmap>(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeProfile: profile,
            careerPath: path,
            skillGapAnalysis: gaps,
            timelineMonths: 6,
          }),
        });
        setRoadmap(roadmapData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setRoadmapLoading(false);
      }
    },
    [mode]
  );

  const handlePathSelect = useCallback(
    async (pathId: string) => {
      setSelectedPathId(pathId);
      setSkillGapAnalysis(null);
      setRoadmap(null);
      setError(null);

      if (!resumeProfile) return;

      const selectedPath = careerPaths.find((p) => p.roleId === pathId);
      if (!selectedPath) return;

      // Load skill gap analysis
      setSkillGapLoading(true);
      try {
        const url = buildApiUrl("/api/skill-gap/analyze", mode === "mock");
        const gapAnalysis = await apiRequest<SkillGapAnalysis>(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeProfile,
            careerPath: selectedPath,
          }),
        });
        setSkillGapAnalysis(gapAnalysis);
        setSkillGapLoading(false);
        loadRoadmap(resumeProfile, selectedPath, gapAnalysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setSkillGapLoading(false);
      }
    },
    [mode, resumeProfile, careerPaths, loadRoadmap]
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
          <p className="text-sm text-slate-600">This typically takes a few seconds</p>
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
        <div className="container flex items-center justify-between h-20">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            NextRole
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-emerald-600">
              ✓ Analysis Complete
            </span>
            <Link href="/upload" className="btn btn-secondary btn-sm">
              <ArrowLeft className="w-4 h-4" />
              New Analysis
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="section container space-y-12">
        {/* Header */}
        {resumeProfile && (
          <div className="space-y-4">
            <h1 className="heading-1">
              {resumeProfile.name 
                ? `${resumeProfile.name}'s Career Strategy` 
                : "Your Career Strategy"}
            </h1>
            <p className="text-subtitle text-slate-600">
              Based on your profile as a {resumeProfile.currentRole} with{" "}
              {resumeProfile.yearsOfExperience} years of experience
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">{error}</p>
          </div>
        )}

        {/* Career Paths Section */}
        <div className="space-y-6">
          <div>
            <h2 className="heading-2">Recommended Career Paths</h2>
            <p className="text-subtitle text-slate-600 mt-2">
              4-6 strategic next moves aligned with your background
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerPaths.map((path) => (
              <CareerPathCard
                key={path.roleId}
                path={path}
                isSelected={selectedPathId === path.roleId}
                onSelect={handlePathSelect}
              />
            ))}
          </div>
        </div>

        {/* Skill Gap Loading Indicator */}
        {skillGapLoading && (
          <div className="space-y-6">
            <div className="card-elevated p-8">
              <div className="flex items-center justify-center gap-4">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 animate-pulse" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-slate-900">Analyzing skill gaps...</p>
                  <p className="text-sm text-slate-600">This may take a few moments while we assess your skills</p>
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

        {/* Roadmap Loading Indicator */}
        {skillGapAnalysis && roadmapLoading && (
          <div className="card-elevated p-8">
            <div className="flex items-center justify-center gap-4">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 animate-pulse" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-900">Generating your career roadmap...</p>
                <p className="text-sm text-slate-600">Creating a personalized 6-month development plan</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Skill Gaps */}
        {skillGapAnalysis && !skillGapLoading && (
          <div className="card p-6 space-y-6">
            <h3 className="heading-2">Skill Gap Details</h3>

            <div className="space-y-4">
              {skillGapAnalysis.skillGaps.map((gap, index) => (
                <div
                  key={index}
                  className="border-l-4 border-emerald-500 pl-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {gap.skillName}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {gap.currentLevel} → {gap.requiredLevel}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
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

                  {gap.learningResources && gap.learningResources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-sm font-semibold text-slate-700 mb-2">
                        Learning Resources:
                      </p>
                      <ul className="space-y-1">
                        {gap.learningResources.map((resource, i) => (
                          <li
                            key={i}
                            className="text-sm text-slate-600 flex items-start gap-2"
                          >
                            <span className="text-emerald-600 mt-1">•</span>
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

        {/* Career Roadmap Section */}
        {roadmap && !roadmapLoading && (
          <div className="space-y-6">
            <RoadmapTimeline roadmap={roadmap} />
          </div>
        )}

        {/* Export/Share Section */}
        <div className="card p-6 space-y-4 text-center">
          <p className="heading-4">Ready to Get Started?</p>
          <p className="text-body text-slate-600">
            Download your personalized career strategy or share it with a mentor.
          </p>
          <button className="btn btn-primary mx-auto">
            📥 Download as PDF (Coming Soon)
          </button>
        </div>
      </div>
    </main>
  );
}
