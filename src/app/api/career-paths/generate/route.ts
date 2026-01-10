/** POST /api/career-paths/generate - Generates minimal career path options */

import { NextRequest, NextResponse } from "next/server";
import { CareerPathGeneratorRequestSchema } from "@/lib/ai/schemas";
import { generateCareerPathsMinimal } from "@/lib/ai/prompts/careerPathGenerator";
import { generateMockCareerPathsMinimal } from "@/lib/api/mockData";
import { withRateLimit } from "@/lib/api/rateLimiter";
import { responseCache } from "@/lib/api/cache";
import crypto from "crypto";

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

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

    const { resumeProfile, numberOfPaths = 4 } = validatedData.data;

    // Check cache first (improved cache key for better hit rate)
    if (!useMock) {
      const cacheKey = crypto
        .createHash("sha256")
        .update(`${numberOfPaths}_${resumeProfile.currentRole}_${resumeProfile.yearsOfExperience}_${resumeProfile.techStack.slice(0, 3).join("_")}`)
        .digest("hex");
      const cachedResult = responseCache.get(cacheKey);
      if (cachedResult) {
        return NextResponse.json({
          success: true,
          data: cachedResult,
        });
      }
    }

    let paths;
    
    if (useMock) {
      // Use mock data
      paths = generateMockCareerPathsMinimal(resumeProfile);
    } else {
      // Call actual AI API with minimal prompt (MUCH FASTER)
      try {
        paths = await generateCareerPathsMinimal(resumeProfile, numberOfPaths);
        // Cache for 3 hours (higher TTL since tech stack is fairly stable)
        const cacheKey = crypto
          .createHash("sha256")
          .update(`${numberOfPaths}_${resumeProfile.currentRole}_${resumeProfile.yearsOfExperience}_${resumeProfile.techStack.slice(0, 3).join("_")}`)
          .digest("hex");
        responseCache.set(cacheKey, paths, 3 * 60 * 60 * 1000);
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
