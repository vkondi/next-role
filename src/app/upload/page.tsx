/**
 * Resume Upload Page
 * Allows users to upload and preview their resume data
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Upload, AlertCircle } from "lucide-react";
import type { ResumeProfile } from "@/lib/types";

export default function UploadPage() {
  const [resumeText, setResumeText] = useState("");
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"text" | "file">("text");

  const handleTextSubmit = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume content");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/resume/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        throw new Error("Failed to interpret resume");
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.error || "Failed to process resume");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, we'll just read the text content from plain text files
    // In production, you'd use a PDF parser library for PDF files
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setResumeText(text);
    };
    reader.readAsText(file);
  };

  if (profile) {
    return (
      <main className="min-h-screen bg-slate-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200">
          <div className="container flex items-center justify-between h-20">
            <Link href="/" className="text-xl font-bold text-emerald-600">
              NextRole
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-emerald-600">
                ✓ Resume Analyzed
              </span>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="section container max-w-4xl">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="heading-1">Your Career Profile</h1>
              <p className="text-subtitle text-slate-600">
                Here&apos;s what we extracted from your resume
              </p>
            </div>

            {/* Profile Display */}
            <div className="card-elevated space-y-6 p-8">
              {/* Current Role and Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-small font-semibold text-slate-600">
                    CURRENT ROLE
                  </p>
                  <p className="heading-3">{profile.currentRole}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-small font-semibold text-slate-600">
                    EXPERIENCE
                  </p>
                  <p className="heading-3">
                    {profile.yearsOfExperience} Years
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-small font-semibold text-slate-600">
                    INDUSTRY
                  </p>
                  <p className="heading-3">{profile.industryBackground}</p>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <p className="text-small font-semibold text-slate-600">
                  TECH STACK
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strength Areas */}
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <p className="text-small font-semibold text-slate-600">
                  STRENGTH AREAS
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.strengthAreas.map((strength) => (
                    <span
                      key={strength}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education and Certifications */}
              {(profile.education?.length || 0) > 0 && (
                <div className="border-t border-slate-200 pt-6 space-y-3">
                  <p className="text-small font-semibold text-slate-600">
                    EDUCATION
                  </p>
                  <ul className="space-y-2">
                    {profile.education?.map((edu) => (
                      <li
                        key={edu}
                        className="text-sm text-slate-700 flex items-start gap-2"
                      >
                        <span className="text-emerald-600 mt-1">•</span>
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(profile.certifications?.length || 0) > 0 && (
                <div className="border-t border-slate-200 pt-6 space-y-3">
                  <p className="text-small font-semibold text-slate-600">
                    CERTIFICATIONS
                  </p>
                  <ul className="space-y-2">
                    {profile.certifications?.map((cert) => (
                      <li
                        key={cert}
                        className="text-sm text-slate-700 flex items-start gap-2"
                      >
                        <span className="text-emerald-600 mt-1">•</span>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Edit Option */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">
                  Does this look correct?
                </p>
                <p className="text-small text-slate-600 mt-1">
                  You can edit these details if needed before proceeding. For
                  this MVP, you can proceed directly to the analysis.
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => {
                  setProfile(null);
                  setResumeText("");
                }}
                className="btn btn-secondary"
              >
                Edit Resume
              </button>
              <Link
                href="/dashboard"
                className="btn btn-primary"
                onClick={() => {
                  // Store profile in session/localStorage for dashboard
                  if (typeof window !== "undefined") {
                    localStorage.setItem(
                      "resumeProfile",
                      JSON.stringify(profile)
                    );
                  }
                }}
              >
                Continue to Analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="container flex items-center justify-between h-20">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            NextRole
          </Link>
          <span className="text-sm font-semibold text-slate-600">
            Step 1: Upload Resume
          </span>
        </div>
      </nav>

      {/* Content */}
      <div className="section container max-w-3xl flex-1">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="heading-1">Upload Your Resume</h1>
            <p className="text-subtitle text-slate-600">
              Share your career history so we can analyze your profile and suggest
              strategic next moves.
            </p>
          </div>

          {/* Upload Method Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setUploadMethod("text")}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                uploadMethod === "text"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setUploadMethod("file")}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                uploadMethod === "file"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Upload File
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Error</p>
                <p className="text-sm text-slate-600">{error}</p>
              </div>
            </div>
          )}

          {/* Input Section */}
          {uploadMethod === "text" ? (
            <div className="card-elevated p-8 space-y-4">
              <label className="block space-y-2">
                <p className="font-semibold text-slate-900">Resume Text</p>
                <p className="text-small text-slate-600">
                  Paste your resume content (plain text)
                </p>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume here..."
                  className="textarea min-h-80"
                  disabled={loading}
                />
              </label>
              <button
                onClick={handleTextSubmit}
                disabled={loading || !resumeText.trim()}
                className="btn btn-primary w-full"
              >
                {loading ? "Processing..." : "Analyze Resume"}
              </button>
            </div>
          ) : (
            <div className="card-elevated p-8">
              <label className="block space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900">
                    Choose a file to upload
                  </p>
                  <p className="text-small text-slate-600 mt-1">
                    PDF or TXT format (max 5MB)
                  </p>
                  <input
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    disabled={loading}
                    className="hidden"
                  />
                </div>
              </label>
              {resumeText && (
                <button
                  onClick={handleTextSubmit}
                  disabled={loading}
                  className="btn btn-primary w-full mt-4"
                >
                  {loading ? "Processing..." : "Analyze Resume"}
                </button>
              )}
            </div>
          )}

          {/* Sample Resume Info */}
          <div className="bg-slate-100 rounded-lg p-6 space-y-3">
            <p className="font-semibold text-slate-900">💡 Tips for Best Results</p>
            <ul className="space-y-2">
              <li className="text-small text-slate-700 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                Include your current role and years of experience
              </li>
              <li className="text-small text-slate-700 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                List the technologies and tools you&apos;ve worked with
              </li>
              <li className="text-small text-slate-700 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                Highlight your main areas of strength
              </li>
              <li className="text-small text-slate-700 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                Include education and relevant certifications
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
