import { describe, expect, it } from 'vitest';
import { sanitizeText } from './sanitize';

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
