"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Upload, AlertCircle } from "lucide-react";
import { ApiModeToggle } from "@/components";
import { useApiMode, useAIProvider } from "@/lib/context/SettingsContext";
import { useResume } from "@/lib/context/ResumeContext";
import { validateResumeText } from "@/lib/api/resumeValidation";
import { apiRequest, buildApiUrl } from "@/lib/api/apiClient";
import type { ResumeProfile } from "@/lib/types";

export default function UploadPageContent() {
  const { mode } = useApiMode();
  const { provider } = useAIProvider();
  const { setResumeProfile } = useResume();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extractedTextRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const fileErrorRef = useRef<HTMLDivElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"text" | "file">("file");
  const [fileError, setFileError] = useState<string | null>(null);

  // Auto-scroll to extracted text when file is successfully parsed
  useEffect(() => {
    if (resumeText && uploadMethod === "file" && extractedTextRef.current) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        extractedTextRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [resumeText, uploadMethod]);

  // Auto-scroll to error message when validation error occurs
  useEffect(() => {
    if (error && errorRef.current) {
      setTimeout(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [error]);

  // Auto-scroll to file error message when file validation error occurs
  useEffect(() => {
    if (fileError && fileErrorRef.current) {
      setTimeout(() => {
        fileErrorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [fileError]);

  const handleTextSubmit = useCallback(async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume content");
      return;
    }

    // Validate resume text
    const validation = validateResumeText(resumeText);
    if (!validation.isValid) {
      setError(validation.error || "Invalid resume content");
      return;
    }

    setLoading(true);
    setError(null);
    setFileError(null); // Clear any file errors

    try {
      const url = buildApiUrl("/api/resume/interpret", mode === "mock");
      const profile = await apiRequest<ResumeProfile>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, aiProvider: provider }),
      });
      setProfile(profile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[Upload] Resume analysis failed:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [mode, resumeText, provider]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any previous errors when a new file is selected
    setFileError(null);
    setError(null);

    // Validate file type (TXT and PDF supported)
    const validTypes = ["text/plain", "application/pdf"];

    const isTxtFile = file.name.endsWith(".txt");
    const isPdfFile = file.name.endsWith(".pdf");

    if (!validTypes.includes(file.type) && !isTxtFile && !isPdfFile) {
      setFileError("Please upload a TXT or PDF file");
      return;
    }

    // Validate file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setFileError(
        "File size exceeds 10MB limit. Please choose a smaller file."
      );
      return;
    }

    setLoading(true);

    try {
      // Use backend API to parse file
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/parse-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setFileError(data.error || "Failed to parse file");
        setLoading(false);
        return;
      }

      setResumeText(data.text);
      setLoading(false);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Failed to read file");
      setLoading(false);
    }
  };

  if (profile) {
    return (
      <main className="min-h-screen bg-slate-50">
        <ApiModeToggle />
        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200">
          <div className="container flex items-center justify-between h-14 sm:h-16 md:h-20">
            <Link
              href="/"
              className="text-base sm:text-lg md:text-2xl font-bold text-emerald-600 flex-shrink-0"
            >
              NextRole
            </Link>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-emerald-600">
                ✓ Analyzed
              </span>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="section container max-w-4xl">
          <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-1 sm:space-y-2 px-2 sm:px-0">
              <h1 className="heading-1">
                {profile.name
                  ? `${profile.name}, Your Career Profile`
                  : "Your Career Profile"}
              </h1>
              <p className="text-subtitle text-slate-600 text-sm sm:text-base">
                Here&apos;s what we extracted from your resume
              </p>
            </div>

            {/* Profile Display */}
            <div className="card-elevated space-y-4 sm:space-y-6">
              {/* Current Role and Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <p className="text-small font-semibold text-slate-600 text-xs sm:text-sm">
                    CURRENT ROLE
                  </p>
                  <p className="heading-3 text-lg sm:text-2xl">
                    {profile.currentRole}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-small font-semibold text-slate-600 text-xs sm:text-sm">
                    EXPERIENCE
                  </p>
                  <p className="heading-3 text-lg sm:text-2xl">
                    {profile.yearsOfExperience} Years
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-small font-semibold text-slate-600 text-xs sm:text-sm">
                    INDUSTRY
                  </p>
                  <p className="heading-3 text-lg sm:text-2xl">
                    {profile.industryBackground}
                  </p>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="border-t border-slate-200 pt-4 sm:pt-6 space-y-3">
                <p className="text-small font-semibold text-slate-600 text-xs sm:text-sm">
                  TECH STACK
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs sm:text-sm font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strength Areas */}
              <div className="border-t border-slate-200 pt-4 sm:pt-6 space-y-3">
                <p className="text-small font-semibold text-slate-600 text-xs sm:text-sm">
                  STRENGTH AREAS
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.strengthAreas.map((strength) => (
                    <span
                      key={strength}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm font-semibold"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education and Certifications */}
              {(profile.education?.length || 0) > 0 && (
                <div className="border-t border-slate-200 pt-4 sm:pt-6 space-y-3">
                  <p className="text-small font-semibold text-slate-600 text-xs sm:text-sm">
                    EDUCATION
                  </p>
                  <ul className="space-y-2">
                    {profile.education?.map((edu) => (
                      <li
                        key={edu}
                        className="text-xs sm:text-sm text-slate-700 flex items-start gap-2"
                      >
                        <span className="text-emerald-600 mt-0.5 flex-shrink-0">
                          •
                        </span>
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(profile.certifications?.length || 0) > 0 && (
                <div className="border-t border-slate-200 pt-4 sm:pt-6 space-y-3">
                  <p className="text-small font-semibold text-slate-600 text-xs sm:text-sm">
                    CERTIFICATIONS
                  </p>
                  <ul className="space-y-2">
                    {profile.certifications?.map((cert) => (
                      <li
                        key={cert}
                        className="text-xs sm:text-sm text-slate-700 flex items-start gap-2"
                      >
                        <span className="text-emerald-600 mt-0.5 flex-shrink-0">
                          •
                        </span>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Edit Option */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5 md:p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 text-sm sm:text-base">
                  Does this look correct?
                </p>
                <p className="text-small text-slate-600 mt-1">
                  You can edit these details if needed before proceeding. For
                  this MVP, you can proceed directly to the analysis.
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                onClick={() => {
                  setProfile(null);
                  setResumeText("");
                }}
                className="btn btn-secondary order-2 sm:order-1"
              >
                Edit Resume
              </button>
              <Link
                href="/dashboard"
                className="btn btn-primary order-1 sm:order-2"
                onClick={() => {
                  // Store profile in context for dashboard
                  setResumeProfile(profile);
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
      <ApiModeToggle />
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="container flex items-center justify-between h-14 sm:h-16 md:h-20">
          <Link
            href="/"
            className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600"
          >
            NextRole
          </Link>
          <span className="text-xs sm:text-sm font-semibold text-slate-600 flex-shrink-0">
            Step 1: Upload
          </span>
        </div>
      </nav>

      {/* Content */}
      <div className="section container max-w-3xl flex-1">
        <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="heading-1">Upload Your Resume</h1>
            <p className="text-subtitle text-slate-600 text-sm sm:text-base">
              Share your career history so we can analyze your profile and
              suggest strategic next moves.
            </p>
          </div>

          {/* Upload Method Tabs */}
          <div className="flex gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => setUploadMethod("file")}
              className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold border-b-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
                uploadMethod === "file"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setUploadMethod("text")}
              className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold border-b-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
                uploadMethod === "text"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Paste Text
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              ref={errorRef}
              className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 text-sm sm:text-base">
                  Error
                </p>
                <p className="text-xs sm:text-sm text-slate-600">{error}</p>
              </div>
            </div>
          )}

          {/* File Error Message */}
          {fileError && (
            <div
              ref={fileErrorRef}
              className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 text-sm sm:text-base">
                  File Error
                </p>
                <p className="text-xs sm:text-sm text-slate-600">{fileError}</p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="card-elevated">
              <div className="flex items-center justify-center gap-3 sm:gap-4 flex-col sm:flex-row">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 animate-pulse flex-shrink-0" />
                <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
                  <p className="text-base sm:text-lg font-semibold text-slate-900">
                    Analyzing your resume...
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Extracting profile information and skills
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input Section - Only show when not loading */}
          {!loading && (
            <>
              {uploadMethod === "text" ? (
                <div className="card-elevated space-y-4">
                  <label className="block space-y-2">
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">
                      Resume Text
                    </p>
                    <p className="text-small text-slate-600 text-xs sm:text-sm">
                      Paste your resume content (plain text)
                    </p>
                    <textarea
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        setError(null); // Clear error when user starts typing
                      }}
                      placeholder="Paste your resume here..."
                      className="textarea min-h-64 sm:min-h-80 text-sm sm:text-base"
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
                <div className="space-y-4">
                  <div className="card-elevated">
                    <label htmlFor="file-input" className="block">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                        <Upload className="w-8 sm:w-12 h-8 sm:h-12 text-slate-400 mx-auto mb-2 sm:mb-3" />
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                          Choose a file to upload
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          PDF or TXT format (max 10MB)
                        </p>
                      </div>
                      <input
                        id="file-input"
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,text/plain,application/pdf"
                        onChange={handleFileUpload}
                        disabled={loading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Extracted Text Preview */}
                  {resumeText && (
                    <div
                      ref={extractedTextRef}
                      className="card-elevated space-y-4"
                    >
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                          Extracted Resume Text
                        </p>
                        <p className="text-small text-slate-600 text-xs sm:text-sm">
                          Review the extracted text before analyzing
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto border border-slate-200">
                        <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap">
                          {resumeText}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                        <button
                          onClick={handleTextSubmit}
                          disabled={loading || !resumeText.trim()}
                          className="btn btn-primary flex-1 text-sm sm:text-base"
                        >
                          {loading ? "Processing..." : "Analyze Resume"}
                        </button>
                        <button
                          onClick={() => {
                            setResumeText("");
                            setFileError(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          disabled={loading}
                          className="btn btn-secondary flex-1 text-sm sm:text-base"
                        >
                          Clear & Upload Different File
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Sample Resume Info */}
          <div className="bg-slate-100 rounded-lg p-4 sm:p-6 space-y-3">
            <p className="font-semibold text-slate-900 text-sm sm:text-base">
              💡 Tips for Best Results
            </p>
            <ul className="space-y-2">
              <li className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                <span className="text-emerald-600 font-bold flex-shrink-0">
                  •
                </span>
                Include your current role and years of experience
              </li>
              <li className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                <span className="text-emerald-600 font-bold flex-shrink-0">
                  •
                </span>
                List the technologies and tools you&apos;ve worked with
              </li>
              <li className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                <span className="text-emerald-600 font-bold flex-shrink-0">
                  •
                </span>
                Highlight your main areas of strength
              </li>
              <li className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                <span className="text-emerald-600 font-bold flex-shrink-0">
                  •
                </span>
                Include education and relevant certifications
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
