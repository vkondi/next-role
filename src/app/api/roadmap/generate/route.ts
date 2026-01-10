/** POST /api/roadmap/generate - Generates career transition roadmap */

import { NextRequest, NextResponse } from "next/server";
import { RoadmapGeneratorRequestSchema } from "@/lib/ai/schemas";
import { generateRoadmap } from "@/lib/ai/prompts/roadmapGenerator";
import { generateMockRoadmap } from "@/lib/api/mockData";
import { withRateLimit } from "@/lib/api/rateLimiter";
import { responseCache } from "@/lib/api/cache";

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

    const validatedData = RoadmapGeneratorRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    const { resumeProfile, careerPath, skillGapAnalysis, timelineMonths = 6 } =
      validatedData.data;

    // OPTIMIZATION: Check cache before AI call
    if (!useMock) {
      const cacheKey = `roadmap_${careerPath.roleId}_${timelineMonths}_${resumeProfile.currentRole}`;
      const cached = responseCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: cached });
      }
    }

    let roadmap;
    
    if (useMock) {
      // Use mock data
      roadmap = generateMockRoadmap(resumeProfile, careerPath, skillGapAnalysis, timelineMonths);
    } else {
      // Call actual AI API
      try {
        roadmap = await generateRoadmap(resumeProfile, careerPath, skillGapAnalysis, timelineMonths);
        
        // OPTIMIZATION: Cache for 30 days
        const cacheKey = `roadmap_${careerPath.roleId}_${timelineMonths}_${resumeProfile.currentRole}`;
        responseCache.set(cacheKey, roadmap, 30 * 24 * 60 * 60 * 1000);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to generate roadmap: ${error instanceof Error ? error.message : String(error)}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error("Roadmap generator error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(handler); // Uses AI to generate roadmap
