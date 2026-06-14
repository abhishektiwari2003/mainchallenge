import { describe, expect, it } from 'vitest';
import { clientKey, isSameOrigin, jsonError } from './http';

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

describe('isSameOrigin', () => {
  it('allows a matching Origin host', () => {
    const req = new Request('http://app.test/api/chat', {
      method: 'POST',
      headers: { host: 'app.test', origin: 'http://app.test' },
    });
    expect(isSameOrigin(req)).toBe(true);
  });

  it('falls back to the Referer host when Origin is absent', () => {
    const req = new Request('http://app.test/api/chat', {
      method: 'POST',
      headers: { host: 'app.test', referer: 'http://app.test/journal' },
    });
    expect(isSameOrigin(req)).toBe(true);
  });

  it('rejects a cross-site Origin', () => {
    const req = new Request('http://app.test/api/chat', {
      method: 'POST',
      headers: { host: 'app.test', origin: 'http://evil.test' },
    });
    expect(isSameOrigin(req)).toBe(false);
  });

  it('treats requests with no Origin/Referer as same-origin', () => {
    const req = new Request('http://app.test/api/chat', {
      method: 'POST',
      headers: { host: 'app.test' },
    });
    expect(isSameOrigin(req)).toBe(true);
  });

  it('rejects when the host header is missing', () => {
    const req = new Request('http://app.test/api/chat', { method: 'POST' });
    req.headers.delete('host');
    expect(isSameOrigin(req)).toBe(false);
  });

  it('rejects a malformed Origin value', () => {
    const req = new Request('http://app.test/api/chat', {
      method: 'POST',
      headers: { host: 'app.test', origin: 'not a url' },
    });
    expect(isSameOrigin(req)).toBe(false);
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
