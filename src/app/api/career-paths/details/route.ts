/** POST /api/career-paths/details - Generates detailed info for selected path */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCareerPathDetails } from '@/lib/ai/prompts/careerPathGenerator';
import { generateMockCareerPathDetails } from '@/lib/api/mockData';
import { responseCache } from '@/lib/api/cache';
import { getAIProviderFromBody } from '@/lib/api/aiProvider';
import { getLogger } from '@/lib/api/logger';

const log = getLogger('API:CareerPathDetails');

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
    const useMock = request.nextUrl.searchParams.get('mock') === 'true';

    log.info({ useMock }, 'Career path details request received');

    const validatedData = CareerPathDetailsRequestSchema.safeParse(body);
    if (!validatedData.success) {
      log.warn(
        { error: validatedData.error.errors[0].message },
        'Career path details - validation failed'
      );
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    const { resumeProfile, pathBasic } = validatedData.data;

    if (!useMock) {
      const cacheKey = `details_${pathBasic.roleId}_${resumeProfile.currentRole}`;
      const cached = responseCache.get(cacheKey);
      if (cached) {
        log.debug({ cacheKey }, 'Career path details cache hit');
        return NextResponse.json({ success: true, data: cached });
      }
    }

    let details;

    if (useMock) {
      log.debug(
        { role: pathBasic.roleName },
        'Generating mock career path details'
      );
      details = generateMockCareerPathDetails(resumeProfile, pathBasic);
    } else {
      try {
        // Extract provider directly from the parsed body
        const aiProvider = getAIProviderFromBody(body);
        log.info(
          { aiProvider, role: pathBasic.roleName },
          'Generating career path details with AI provider'
        );
        details = await generateCareerPathDetails(
          resumeProfile,
          pathBasic,
          aiProvider
        );
        const cacheKey = `details_${pathBasic.roleId}_${resumeProfile.currentRole}`;
        responseCache.set(cacheKey, details, 7 * 24 * 60 * 60 * 1000);
        log.debug({ cacheKey }, 'Career path details cached');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log.error(
          {
            error: errorMsg,
            role: pathBasic.roleName,
            aiProvider: getAIProviderFromBody(body),
          },
          'Failed to generate path details'
        );
        return NextResponse.json(
          {
            success: false,
            error: `Failed to generate path details: ${errorMsg}`,
          },
          { status: 500 }
        );
      }
    }

    log.info(
      { role: pathBasic.roleName },
      'Career path details generated successfully'
    );
    return NextResponse.json({
      success: true,
      data: details,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error({ error: errorMsg }, 'Career path details request failed');
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
