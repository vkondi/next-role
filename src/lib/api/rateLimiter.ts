/**
 * Rate Limiter Utility
 * Tracks API requests by IP address to enforce rate limits
 * Limits: 5 requests per day per IP
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limit tracking
const rateLimitStore = new Map<string, RateLimitRecord>();

const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_DAY: 5,
  WINDOW_SIZE_MS: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Check if a request from an IP should be rate limited
 * @param ip - IP address of the requester
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // If no record exists or window has expired, reset
  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.WINDOW_SIZE_MS,
    };
    rateLimitStore.set(ip, newRecord);
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY - 1,
      resetTime: newRecord.resetTime,
    };
  }

  // Window exists and hasn't expired
  const isAllowed = record.count < RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY;
  record.count++;

  return {
    allowed: isAllowed,
    remaining: Math.max(
      0,
      RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_DAY - record.count
    ),
    resetTime: record.resetTime,
  };
}

/**
 * Get the client IP from request headers
 * Handles proxied requests (X-Forwarded-For, CF-Connecting-IP, etc.)
 */
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

/**
 * Cleanup old entries from rate limit store (run periodically)
 * Removes entries older than 24 hours to prevent memory leak
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];

  rateLimitStore.forEach((record, ip) => {
    if (now > record.resetTime) {
      entriesToDelete.push(ip);
    }
  });

  entriesToDelete.forEach((ip) => rateLimitStore.delete(ip));
}

// Run cleanup every hour
setInterval(() => {
  cleanupRateLimitStore();
}, 60 * 60 * 1000);

/**
 * Higher-order function to wrap route handlers with rate limiting
 * Only applies rate limit to real API calls, not mock requests
 * @param handler - The actual route handler function
 * @returns Wrapped handler that checks rate limit before executing (skip for mock=true)
 */
export function withRateLimit(
  handler: (request: any) => Promise<any>
): (request: any) => Promise<any> {
  return async (request: any) => {
    // Skip rate limiting for mock requests
    const useMock = request.nextUrl.searchParams.get("mock") === "true";
    
    if (!useMock) {
      const clientIp = getClientIp(request.headers);
      const rateLimitResult = checkRateLimit(clientIp);

      if (!rateLimitResult.allowed) {
        const { NextResponse } = await import("next/server");
        const resetTime = new Date(rateLimitResult.resetTime).toLocaleString();
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
