/** POST /api/roadmap/generate - Generates career transition roadmap */

import { NextRequest, NextResponse } from "next/server";
import { RoadmapGeneratorRequestSchema } from "@/lib/ai/schemas";
import { generateRoadmap } from "@/lib/ai/prompts/roadmapGenerator";
import { generateMockRoadmap } from "@/lib/api/mockData";
import { responseCache } from "@/lib/api/cache";
import { getAIProviderFromBody } from "@/lib/api/aiProvider";
import { getLogger } from "@/lib/api/logger";

const log = getLogger("API:RoadmapGenerate");

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

    log.info({ useMock }, "Roadmap generation request received");

    const validatedData = RoadmapGeneratorRequestSchema.safeParse(body);
    if (!validatedData.success) {
      log.warn(
        { error: validatedData.error.errors[0].message },
        "Roadmap generation - validation failed"
      );
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

    if (!useMock) {
      const skillKey = skillGapAnalysis.skillGaps
        .filter((sg) => sg.importance === "High")
        .slice(0, 3)
        .map((sg) => sg.skillName)
        .join("_");
      const cacheKey = `roadmap_${careerPath.roleId}_${timelineMonths}_${skillKey}`;
      const cached = responseCache.get(cacheKey);
      if (cached) {
        log.debug({ cacheKey }, "Roadmap generation cache hit");
        return NextResponse.json({ success: true, data: cached });
      }
    }

    let roadmap;
    
    if (useMock) {
      log.debug("Generating mock roadmap");
      // Use mock data
      roadmap = generateMockRoadmap(resumeProfile, careerPath, skillGapAnalysis, timelineMonths);
    } else {
      // Call actual AI API
      try {
        // Extract provider directly from the parsed body
        const aiProvider = getAIProviderFromBody(body);
        log.info(
          { aiProvider, timelineMonths, role: careerPath.roleName },
          "Generating roadmap with AI provider"
        );
        roadmap = await generateRoadmap(resumeProfile, careerPath, skillGapAnalysis, timelineMonths, aiProvider);
        
        const skillKey = skillGapAnalysis.skillGaps
          .filter((sg) => sg.importance === "High")
          .slice(0, 3)
          .map((sg) => sg.skillName)
          .join("_");
        const cacheKey = `roadmap_${careerPath.roleId}_${timelineMonths}_${skillKey}`;
        responseCache.set(cacheKey, roadmap, 30 * 24 * 60 * 60 * 1000);
        log.debug({ cacheKey }, "Roadmap cached");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log.error(
          { error: errorMsg, aiProvider: getAIProviderFromBody(body) },
          "Failed to generate roadmap"
        );
        return NextResponse.json(
          {
            success: false,
            error: `Failed to generate roadmap: ${errorMsg}`,
          },
          { status: 500 }
        );
      }
    }

    log.info({ phases: roadmap.phases.length }, "Roadmap generated successfully");
    return NextResponse.json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error({ error: errorMsg }, "Roadmap generation request failed");
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
};

export const POST = handler;
