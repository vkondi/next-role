/**
 * Career Strategy Dashboard Page
 * Main analysis page showing career paths, skill gaps, and roadmaps
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CareerPathCard,
  SkillGapChart,
  RoadmapTimeline,
} from "@/components";
import type {
  ResumeProfile,
  CareerPath,
  SkillGapAnalysis,
  CareerRoadmap,
} from "@/lib/types";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load profile from localStorage
    const storedProfile = localStorage.getItem("resumeProfile");
    if (!storedProfile) {
      setError("No resume profile found. Please upload your resume first.");
      setLoading(false);
      return;
    }

    try {
      const profile = JSON.parse(storedProfile) as ResumeProfile;
      setResumeProfile(profile);
      loadCareerPaths(profile);
    } catch (err) {
      setError("Failed to load resume profile");
      setLoading(false);
    }
  }, []);

  const loadCareerPaths = async (profile: ResumeProfile) => {
    try {
      const response = await fetch("/api/career-paths/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeProfile: profile, numberOfPaths: 5 }),
      });

      if (!response.ok) throw new Error("Failed to generate career paths");

      const data = await response.json();
      if (data.success) {
        setCareerPaths(data.data);
        // Auto-select first path
        setSelectedPathId(data.data[0].roleId);
      } else {
        setError(data.error || "Failed to generate career paths");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handlePathSelect = async (pathId: string) => {
    setSelectedPathId(pathId);
    setSkillGapAnalysis(null);
    setRoadmap(null);

    if (!resumeProfile) return;

    const selectedPath = careerPaths.find((p) => p.roleId === pathId);
    if (!selectedPath) return;

    // Load skill gap analysis
    try {
      const response = await fetch("/api/skill-gap/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeProfile,
          careerPath: selectedPath,
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze skill gaps");

      const data = await response.json();
      if (data.success) {
        setSkillGapAnalysis(data.data);
        loadRoadmap(resumeProfile, selectedPath, data.data);
      } else {
        setError(data.error || "Failed to analyze skill gaps");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const loadRoadmap = async (
    profile: ResumeProfile,
    path: CareerPath,
    gaps: SkillGapAnalysis
  ) => {
    try {
      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeProfile: profile,
          careerPath: path,
          skillGapAnalysis: gaps,
          timelineMonths: 6,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate roadmap");

      const data = await response.json();
      if (data.success) {
        setRoadmap(data.data);
      } else {
        setError(data.error || "Failed to generate roadmap");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 animate-pulse" />
          <p className="text-lg font-semibold text-slate-900">
            Analyzing your career profile...
          </p>
          <p className="text-sm text-slate-600">This typically takes a few seconds</p>
        </div>
      </main>
    );
  }

  // const selectedPath = careerPaths.find((p) => p.roleId === selectedPathId);

  return (
    <main className="min-h-screen bg-slate-50">
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
            <h1 className="heading-1">Your Career Strategy</h1>
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

        {/* Skill Gap Analysis Section */}
        {skillGapAnalysis && (
          <div className="space-y-6">
            <SkillGapChart analysis={skillGapAnalysis} />
          </div>
        )}

        {/* Detailed Skill Gaps */}
        {skillGapAnalysis && (
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
        {roadmap && (
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
