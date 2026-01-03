/**
 * POST /api/roadmap/generate
 * Generates a month-by-month career transition roadmap
 */

import { NextRequest, NextResponse } from "next/server";
import { RoadmapGeneratorRequestSchema } from "@/lib/ai/schemas";
import { generateRoadmap } from "@/lib/ai/prompts/roadmapGenerator";
import { generateMockRoadmap } from "@/lib/api/mockData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

    // Validate request
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

    let roadmap;
    
    if (useMock) {
      // Use mock data
      roadmap = generateMockRoadmap(resumeProfile, careerPath, skillGapAnalysis, timelineMonths);
    } else {
      // Call actual AI API
      try {
        roadmap = await generateRoadmap(resumeProfile, careerPath, skillGapAnalysis, timelineMonths);
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
}
