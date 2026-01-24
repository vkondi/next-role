/** POST /api/career-paths/generate - Generates minimal career path options */

import { NextRequest, NextResponse } from 'next/server';
import { CareerPathGeneratorRequestSchema } from '@/lib/ai/schemas';
import { generateCareerPathsMinimal } from '@/lib/ai/prompts/careerPathGenerator';
import { generateMockCareerPathsMinimal } from '@/lib/api/mockData';
import { withRateLimit } from '@/lib/api/rateLimiter';
import { responseCache } from '@/lib/api/cache';
import { getAIProviderFromBody } from '@/lib/api/aiProvider';
import { getLogger } from '@/lib/api/logger';
import crypto from 'crypto';

const log = getLogger('API:CareerPathGenerate');

const handler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const useMock = request.nextUrl.searchParams.get('mock') === 'true';

    log.info({ useMock }, 'Career path generation request received');

    const validatedData = CareerPathGeneratorRequestSchema.safeParse(body);
    if (!validatedData.success) {
      log.warn(
        { error: validatedData.error.errors[0].message },
        'Career path generation - validation failed'
      );
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
        .createHash('sha256')
        .update(
          `${numberOfPaths}_${resumeProfile.currentRole}_${resumeProfile.yearsOfExperience}_${resumeProfile.techStack.slice(0, 3).join('_')}`
        )
        .digest('hex');
      const cachedResult = responseCache.get(cacheKey);
      if (cachedResult) {
        log.debug({ cacheKey }, 'Career path generation cache hit');
        return NextResponse.json({
          success: true,
          data: cachedResult,
        });
      }
    }

    let paths;

    if (useMock) {
      log.debug('Generating mock career paths');
      // Use mock data
      paths = generateMockCareerPathsMinimal(resumeProfile);
    } else {
      // Call actual AI API with minimal prompt (MUCH FASTER)
      try {
        // Extract provider directly from the parsed body
        const aiProvider = getAIProviderFromBody(body);
        log.info(
          { aiProvider, numberOfPaths, role: resumeProfile.currentRole },
          'Generating career paths with AI provider'
        );
        paths = await generateCareerPathsMinimal(
          resumeProfile,
          numberOfPaths,
          aiProvider
        );
        // Cache for 3 hours (higher TTL since tech stack is fairly stable)
        const cacheKey = crypto
          .createHash('sha256')
          .update(
            `${numberOfPaths}_${resumeProfile.currentRole}_${resumeProfile.yearsOfExperience}_${resumeProfile.techStack.slice(0, 3).join('_')}`
          )
          .digest('hex');
        responseCache.set(cacheKey, paths, 3 * 60 * 60 * 1000);
        log.debug({ cacheKey }, 'Career paths cached');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log.error(
          { error: errorMsg, aiProvider: getAIProviderFromBody(body) },
          'Failed to generate career paths'
        );
        return NextResponse.json(
          {
            success: false,
            error: `Failed to generate career paths: ${errorMsg}`,
          },
          { status: 500 }
        );
      }
    }

    log.info(
      { pathCount: paths.length },
      'Career paths generated successfully'
    );
    return NextResponse.json({
      success: true,
      data: paths,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error({ error: errorMsg }, 'Career path generation request failed');
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
