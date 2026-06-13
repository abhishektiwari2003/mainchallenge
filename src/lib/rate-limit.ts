/**
 * Minimal in-memory token-bucket rate limiter for the AI route handlers.
 *
 * Suitable for a single-instance hackathon deployment. For horizontal scaling,
 * swap the Map for a shared store (e.g. Upstash Redis) behind the same API.
 */

interface Bucket {
  tokens: number;
  updatedAt: number;
}

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Consume one token for `key`. Returns whether the request is allowed plus
 * metadata for `Retry-After` headers.
 */
export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();
  const refillRate = limit / windowMs;

  const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  bucket.tokens = Math.min(limit, bucket.tokens + elapsed * refillRate);
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const retryAfterMs = Math.ceil((1 - bucket.tokens) / refillRate);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfterMs: 0 };
}

/** Test-only helper to reset limiter state. */
export function __resetRateLimiter(): void {
  buckets.clear();
}
