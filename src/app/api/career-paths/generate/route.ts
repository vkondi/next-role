/**
 * POST /api/career-paths/generate
 * Generates possible career paths based on resume profile
 */

import { NextRequest, NextResponse } from "next/server";
import { CareerPathGeneratorRequestSchema } from "@/lib/ai/schemas";
import { generateCareerPaths } from "@/lib/ai/prompts/careerPathGenerator";
import { generateMockCareerPaths } from "@/lib/api/mockData";
import { withRateLimit } from "@/lib/api/rateLimiter";

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

    // Validate request
    const validatedData = CareerPathGeneratorRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    const { resumeProfile, numberOfPaths = 5 } = validatedData.data;

    let paths;
    
    if (useMock) {
      // Use mock data
      paths = generateMockCareerPaths(resumeProfile);
    } else {
      // Call actual AI API
      try {
        paths = await generateCareerPaths(resumeProfile, numberOfPaths);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to generate career paths: ${error instanceof Error ? error.message : String(error)}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: paths,
    });
  } catch (error) {
    console.error("Career paths generator error:", error);
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
