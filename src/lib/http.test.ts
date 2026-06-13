import { describe, expect, it } from 'vitest';
import { clientKey, jsonError } from './http';

describe('clientKey', () => {
  it('uses the first x-forwarded-for IP', () => {
    const req = new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } });
    expect(clientKey(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = new Request('http://x', { headers: { 'x-real-ip': '9.9.9.9' } });
    expect(clientKey(req)).toBe('9.9.9.9');
  });

  it('falls back to anonymous', () => {
    expect(clientKey(new Request('http://x'))).toBe('anonymous');
  });
});

describe('jsonError', () => {
  it('returns a JSON error with the given status', async () => {
    const res = jsonError('nope', 429, { 'retry-after': '5' });
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('5');
    expect(await res.json()).toEqual({ error: 'nope' });
  });
});
