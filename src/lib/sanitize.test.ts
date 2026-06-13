import { describe, expect, it } from 'vitest';
import { escapeHtml, sanitizeText } from './sanitize';

describe('sanitizeText', () => {
  it('removes control characters', () => {
    expect(sanitizeText('hello\u0000\u0007world')).toBe('helloworld');
  });

  it('normalizes CRLF to LF and trims trailing space', () => {
    expect(sanitizeText('line1\r\nline2   ')).toBe('line1\nline2');
  });

  it('keeps normal text intact', () => {
    expect(sanitizeText('A calm, normal sentence.')).toBe('A calm, normal sentence.');
  });
});

describe('escapeHtml', () => {
  it('escapes HTML-significant characters', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });

  it('escapes ampersands and apostrophes', () => {
    expect(escapeHtml(`Tom & Jerry's`)).toBe('Tom &amp; Jerry&#39;s');
  });
});
