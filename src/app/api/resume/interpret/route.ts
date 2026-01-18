/** POST /api/resume/interpret - Interprets resume text to structured profile */

import { NextRequest, NextResponse } from "next/server";
import { ResumeInterpreterRequestSchema } from "@/lib/ai/schemas";
import { interpretResume } from "@/lib/ai/prompts/resumeInterpreter";
import { generateMockResumeProfile } from "@/lib/api/mockData";
import { withRateLimit } from "@/lib/api/rateLimiter";
import { getAIProviderFromBody } from "@/lib/api/aiProvider";
import { responseCache } from "@/lib/api/cache";
import { getLogger } from "@/lib/api/logger";
import crypto from "crypto";

const log = getLogger("API:ResumeInterpret");

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get("mock") === "true";

    log.info({ useMock }, "Resume interpretation request received");

    const validatedData = ResumeInterpreterRequestSchema.safeParse(body);
    if (!validatedData.success) {
      log.warn(
        { error: validatedData.error.errors[0].message },
        "Resume interpretation - validation failed"
      );
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    const { resumeText } = validatedData.data;
    // Extract provider directly from the parsed body
    const aiProvider = getAIProviderFromBody(body);

    let profile;
    
    if (useMock) {
      log.debug("Generating mock resume profile");
      profile = generateMockResumeProfile(resumeText);
    } else {
      const cacheKey = crypto.createHash("sha256").update(resumeText).digest("hex");
      const cachedProfile = responseCache.get(cacheKey);
      
      if (cachedProfile) {
        log.debug({ cacheKey }, "Resume profile cache hit");
        profile = cachedProfile;
      } else {
        try {
          log.info({ aiProvider }, "Interpreting resume with AI provider");
          profile = await interpretResume(resumeText, aiProvider);
          
          // Only cache if the profile has valid tech stack or experience details
          const hasValidTechStack = profile.techStack && profile.techStack.length > 0;
          const hasExperienceDetails = profile.yearsOfExperience > 0;
          
          if (hasValidTechStack && hasExperienceDetails) {
            responseCache.set(cacheKey, profile, 24 * 60 * 60 * 1000);
            log.debug({ cacheKey }, "Resume profile cached");
          } else {
            log.warn(
              { hasValidTechStack, hasExperienceDetails },
              "Resume profile not cached - missing tech stack or experience details (possible interpretation failure)"
            );
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          log.error(
            { error: errorMsg, aiProvider },
            "Failed to interpret resume"
          );
          return NextResponse.json(
            {
              success: false,
              error: `Failed to interpret resume: ${errorMsg}`,
            },
            { status: 500 }
          );
        }
      }
    }

    log.info("Resume interpreted successfully");
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error({ error: errorMsg }, "Resume interpretation request failed");
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(handler);
