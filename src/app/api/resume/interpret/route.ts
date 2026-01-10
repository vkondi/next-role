/**
 * POST /api/resume/interpret
 * Interprets uploaded resume text and extracts structured profile
 */

import { NextRequest, NextResponse } from "next/server";
import { ResumeInterpreterRequestSchema } from "@/lib/ai/schemas";
import { interpretResume } from "@/lib/ai/prompts/resumeInterpreter";
import { generateMockResumeProfile } from "@/lib/api/mockData";
import { withRateLimit } from "@/lib/api/rateLimiter";
import { responseCache } from "@/lib/api/cache";
import crypto from "crypto";

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

    // Validate request
    const validatedData = ResumeInterpreterRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    const { resumeText } = validatedData.data;

    let profile;
    
    if (useMock) {
      // Use mock data
      profile = generateMockResumeProfile(resumeText);
    } else {
      // Check cache first (avoid redundant API calls)
      const cacheKey = crypto.createHash("sha256").update(resumeText).digest("hex");
      const cachedProfile = responseCache.get(cacheKey);
      
      if (cachedProfile) {
        profile = cachedProfile;
      } else {
        // Call actual AI API
        try {
          profile = await interpretResume(resumeText);
          // Cache the result for 24 hours
          responseCache.set(cacheKey, profile, 24 * 60 * 60 * 1000);
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to interpret resume: ${error instanceof Error ? error.message : String(error)}`,
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Resume interpreter error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(handler); // Uses AI to interpret resume
