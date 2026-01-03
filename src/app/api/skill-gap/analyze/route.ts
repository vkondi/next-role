/**
 * POST /api/skill-gap/analyze
 * Analyzes skill gaps for a selected career path
 */

import { NextRequest, NextResponse } from "next/server";
import { SkillGapAnalyzerRequestSchema } from "@/lib/ai/schemas";
import { analyzeSkillGaps } from "@/lib/ai/prompts/skillGapAnalyzer";
import { generateMockSkillGapAnalysis } from "@/lib/api/mockData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

    // Validate request
    const validatedData = SkillGapAnalyzerRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    const { resumeProfile, careerPath } = validatedData.data;

    let analysis;
    
    if (useMock) {
      // Use mock data
      analysis = generateMockSkillGapAnalysis(resumeProfile, careerPath);
    } else {
      // Call actual AI API
      try {
        analysis = await analyzeSkillGaps(resumeProfile, careerPath);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to analyze skill gaps: ${error instanceof Error ? error.message : String(error)}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Skill gap analyzer error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
