/**
 * POST /api/career-paths/details
 * Generates detailed information for a specific career path
 * Called AFTER user selects a path from the carousel
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateCareerPathDetails } from "@/lib/ai/prompts/careerPathGenerator";
import { generateMockCareerPathDetails } from "@/lib/api/mockData";
import { withRateLimit } from "@/lib/api/rateLimiter";

// Request schema for details
const CareerPathDetailsRequestSchema = z.object({
  resumeProfile: z.object({
    currentRole: z.string(),
    yearsOfExperience: z.number(),
    techStack: z.array(z.string()),
    strengthAreas: z.array(z.string()),
    industryBackground: z.string(),
  }),
  pathBasic: z.object({
    roleId: z.string(),
    roleName: z.string(),
  }),
});

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

    // Validate request
    const validatedData = CareerPathDetailsRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    const { resumeProfile, pathBasic } = validatedData.data;

    let details;

    if (useMock) {
      // Use mock data
      details = generateMockCareerPathDetails(resumeProfile, pathBasic);
    } else {
      // Call actual AI API for detailed information
      try {
        details = await generateCareerPathDetails(resumeProfile, pathBasic);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to generate path details: ${error instanceof Error ? error.message : String(error)}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error("Career path details error:", error);
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
