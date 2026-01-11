/** Rate limiter: 5 requests/day per IP */

import { getLogger } from "./logger";

const log = getLogger("API:RateLimiter");

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_DAY: 5,
  WINDOW_SIZE_MS: 24 * 60 * 60 * 1000, // 24 hours
};

/** Check if IP is local (skip rate limiting) */
function isLocalIp(ip: string): boolean {
  if (!ip || ip === "unknown") return false;

  const devLocalIp = process.env.DEV_LOCAL_IP;
  const localhostPatterns = ["127.0.0.1", "::1", "localhost"];
  if (localhostPatterns.includes(ip)) {
    return true;
  }

  if (devLocalIp && ip === devLocalIp) {
    return true;
  }

  return false;
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  if (isLocalIp(ip)) {
    log.debug({ ip }, "Rate limit check - local IP, skipping");
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY,
      resetTime: Date.now() + RATE_LIMIT_CONFIG.WINDOW_SIZE_MS,
    };
  }

  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.WINDOW_SIZE_MS,
    };
    rateLimitStore.set(ip, newRecord);
    log.info({ ip, remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY - 1 }, "Rate limit - new window");
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY - 1,
      resetTime: newRecord.resetTime,
    };
  }

  const isAllowed = record.count < RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY;
  record.count++;

  const remaining = Math.max(
    0,
    RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY - record.count
  );

  if (!isAllowed) {
    log.warn({ ip, remaining, resetTime: record.resetTime }, "Rate limit exceeded");
  } else {
    log.debug({ ip, remaining }, "Rate limit - request allowed");
  }

  return {
    allowed: isAllowed,
    remaining,
    resetTime: record.resetTime,
  };
}

/** Extract client IP from headers (handles proxies) */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/** Cleanup expired entries (prevent memory leak) */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];

  rateLimitStore.forEach((record, ip) => {
    if (now > record.resetTime) {
      entriesToDelete.push(ip);
    }
  });

  if (entriesToDelete.length > 0) {
    log.debug({ count: entriesToDelete.length }, "Rate limit store cleanup");
    entriesToDelete.forEach((ip) => rateLimitStore.delete(ip));
  }
}

// Cleanup every hour
setInterval(() => {
  cleanupRateLimitStore();
}, 60 * 60 * 1000);

/** Wrap handlers with rate limiting */
export function withRateLimit(
  handler: (request: any) => Promise<any>,
  requiresAiIntegration: boolean = true
): (request: any) => Promise<any> {
  return async (request: any) => {
    const useMock = request.nextUrl.searchParams.get("mock") === "true";
    
    if (requiresAiIntegration && !useMock) {
      const clientIp = getClientIp(request.headers);
      const rateLimitResult = checkRateLimit(clientIp);

      if (!rateLimitResult.allowed) {
        const { NextResponse } = await import("next/server");
        const resetTime = new Date(rateLimitResult.resetTime).toLocaleString();
        log.warn({ clientIp, resetTime }, "Rate limit - request rejected");
        return NextResponse.json(
          {
            success: false,
            error: `Daily limit reached (5 requests per 24 hours). Resets at ${resetTime}. Switch to Mock mode to continue testing.`,
          },
          { status: 429 }
        );
      }
    }

    return handler(request);
  };
}
