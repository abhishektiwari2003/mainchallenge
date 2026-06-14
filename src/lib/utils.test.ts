import { describe, expect, it } from 'vitest';
import { cn, formatShortDate } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('resolves conflicting Tailwind utilities (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});

describe('formatShortDate', () => {
  it('formats an ISO string into a short human date', () => {
    const formatted = formatShortDate('2026-06-09T10:00:00.000Z');
    expect(formatted).toMatch(/Jun/);
    expect(formatted).toMatch(/\d/);
  });
});
