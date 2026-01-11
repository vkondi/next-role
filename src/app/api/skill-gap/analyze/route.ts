/** POST /api/skill-gap/analyze - Analyzes skill gaps for selected path */

import { NextRequest, NextResponse } from "next/server";
import { SkillGapAnalyzerRequestSchema } from "@/lib/ai/schemas";
import { analyzeSkillGaps } from "@/lib/ai/prompts/skillGapAnalyzer";
import { generateMockSkillGapAnalysis } from "@/lib/api/mockData";
import { responseCache } from "@/lib/api/cache";
import { getAIProviderFromBody } from "@/lib/api/aiProvider";
import { getLogger } from "@/lib/api/logger";

const log = getLogger("API:SkillGapAnalyze");

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

    log.info({ useMock }, "Skill gap analysis request received");

    const validatedData = SkillGapAnalyzerRequestSchema.safeParse(body);
    if (!validatedData.success) {
      log.warn(
        { error: validatedData.error.errors[0].message },
        "Skill gap analysis - validation failed"
      );
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    const { resumeProfile, careerPath } = validatedData.data;

    if (!useMock) {
      const techKey = resumeProfile.techStack.slice(0, 3).join("_");
      const cacheKey = `skillgap_${careerPath.roleId}_${resumeProfile.currentRole}_${resumeProfile.yearsOfExperience}_${techKey}`;
      const cached = responseCache.get(cacheKey);
      if (cached) {
        log.debug({ cacheKey }, "Skill gap analysis cache hit");
        return NextResponse.json({ success: true, data: cached });
      }
    }

    let analysis;
    
    if (useMock) {
      log.debug("Generating mock skill gap analysis");
      analysis = generateMockSkillGapAnalysis(resumeProfile, careerPath);
    } else {
      try {
        // Extract provider directly from the parsed body
        const aiProvider = getAIProviderFromBody(body);
        log.info(
          { aiProvider, role: careerPath.roleName },
          "Analyzing skill gaps with AI provider"
        );
        analysis = await analyzeSkillGaps(resumeProfile, careerPath, aiProvider);
        
        const techKey = resumeProfile.techStack.slice(0, 3).join("_");
        const cacheKey = `skillgap_${careerPath.roleId}_${resumeProfile.currentRole}_${resumeProfile.yearsOfExperience}_${techKey}`;
        responseCache.set(cacheKey, analysis, 14 * 24 * 60 * 60 * 1000);
        log.debug({ cacheKey }, "Skill gap analysis cached");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log.error(
          { error: errorMsg, aiProvider: getAIProviderFromBody(body) },
          "Failed to analyze skill gaps"
        );
        return NextResponse.json(
          {
            success: false,
            error: `Failed to analyze skill gaps: ${errorMsg}`,
          },
          { status: 500 }
        );
      }
    }

    log.info("Skill gap analysis completed successfully");
    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error({ error: errorMsg }, "Skill gap analysis request failed");
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
