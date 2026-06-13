import { beforeEach, describe, expect, it } from 'vitest';
import { __resetRateLimiter, rateLimit } from './rate-limit';

describe('rateLimit', () => {
  beforeEach(() => __resetRateLimiter());

  it('allows requests under the limit', () => {
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit('a', opts).allowed).toBe(true);
    expect(rateLimit('a', opts).allowed).toBe(true);
    expect(rateLimit('a', opts).allowed).toBe(true);
  });

  it('blocks requests once the bucket is empty', () => {
    const opts = { limit: 2, windowMs: 60_000 };
    rateLimit('b', opts);
    rateLimit('b', opts);
    const blocked = rateLimit('b', opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('tracks separate keys independently', () => {
    const opts = { limit: 1, windowMs: 60_000 };
    expect(rateLimit('user-1', opts).allowed).toBe(true);
    expect(rateLimit('user-2', opts).allowed).toBe(true);
    expect(rateLimit('user-1', opts).allowed).toBe(false);
  });
});
