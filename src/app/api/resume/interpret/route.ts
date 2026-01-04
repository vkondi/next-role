/**
 * POST /api/resume/interpret
 * Interprets uploaded resume text and extracts structured profile
 */

import { NextRequest, NextResponse } from "next/server";
import { ResumeInterpreterRequestSchema } from "@/lib/ai/schemas";
import { interpretResume } from "@/lib/ai/prompts/resumeInterpreter";
import { generateMockResumeProfile } from "@/lib/api/mockData";
import { withRateLimit } from "@/lib/api/rateLimiter";

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
      // Call actual AI API
      try {
        profile = await interpretResume(resumeText);
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

export const POST = withRateLimit(handler);
