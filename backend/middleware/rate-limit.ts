import { Context } from 'hono';

// Simple in-memory rate limiting
// In production, use Redis or a proper rate limiting service
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

export const rateLimit = (options: RateLimitOptions) => {
  const { windowMs, maxRequests, message = 'Too many requests' } = options;

  return async (c: Context, next: () => Promise<void>) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    const key = `${ip}:${c.req.path}`;

    // Clean up old entries
    for (const [k, v] of requestCounts.entries()) {
      if (now > v.resetTime) {
        requestCounts.delete(k);
      }
    }

    const current = requestCounts.get(key);
    
    if (!current) {
      // First request from this IP for this endpoint
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
    } else if (now > current.resetTime) {
      // Window has expired, reset
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
    } else if (current.count >= maxRequests) {
      // Rate limit exceeded
      console.warn(`Rate limit exceeded for ${ip} on ${c.req.path}`);
      return c.json(
        { 
          error: message, 
          retryAfter: Math.ceil((current.resetTime - now) / 1000) 
        }, 
        429
      );
    } else {
      // Increment counter
      current.count++;
    }

    // Add rate limit headers
    const remaining = Math.max(0, maxRequests - (requestCounts.get(key)?.count || 0));
    const resetTime = requestCounts.get(key)?.resetTime || now + windowMs;
    
    c.res.headers.set('X-RateLimit-Limit', maxRequests.toString());
    c.res.headers.set('X-RateLimit-Remaining', remaining.toString());
    c.res.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

    await next();
  };
};

// Predefined rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later'
});

export const generalRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many requests, please slow down'
});

export const strictRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute for sensitive endpoints
  message: 'Rate limit exceeded for this endpoint'
});