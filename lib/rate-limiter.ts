/**
 * Simple In-Memory Rate Limiter
 * 
 * Uses a sliding window approach to limit requests per IP address.
 * For production at scale, consider using Redis-based rate limiting.
 * 
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 });
 *   const result = limiter.check(ipAddress);
 *   if (!result.allowed) { return 429 response }
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimiterConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory store (note: resets on cold starts, not shared across instances)
const stores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(config: RateLimiterConfig) {
  const { windowMs, maxRequests } = config;
  const storeId = `${windowMs}-${maxRequests}`;
  
  if (!stores.has(storeId)) {
    stores.set(storeId, new Map());
  }
  const store = stores.get(storeId)!;

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetTime < now) {
        store.delete(key);
      }
    }
  }, windowMs);

  return {
    /**
     * Check if a request is allowed for the given identifier (usually IP)
     */
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(identifier);

      // No existing entry or window expired
      if (!entry || entry.resetTime < now) {
        store.set(identifier, {
          count: 1,
          resetTime: now + windowMs,
        });
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetTime: now + windowMs,
        };
      }

      // Within window
      if (entry.count < maxRequests) {
        entry.count++;
        return {
          allowed: true,
          remaining: maxRequests - entry.count,
          resetTime: entry.resetTime,
        };
      }

      // Rate limited
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    },

    /**
     * Get headers for rate limit response
     */
    getHeaders(result: RateLimitResult): Record<string, string> {
      return {
        'X-RateLimit-Limit': String(maxRequests),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
      };
    },
  };
}

/**
 * Get client IP from request headers (works with Vercel)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

// =============================================================================
// Pre-configured rate limiters for common use cases
// =============================================================================

// Registration: 5 attempts per 15 minutes per IP
export const registrationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
});

// Checkout: 10 attempts per minute per IP
export const checkoutLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});

// General API: 100 requests per minute per IP
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});
