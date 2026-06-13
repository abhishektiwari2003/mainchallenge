import { describe, expect, it } from 'vitest';
import { ALL_MOODS, moodMeta, parseMoodScore } from './parser';

describe('parseMoodScore', () => {
  it('passes through valid scores', () => {
    expect(parseMoodScore(1)).toBe(1);
    expect(parseMoodScore(5)).toBe(5);
  });

  it('rounds fractional values', () => {
    expect(parseMoodScore(3.4)).toBe(3);
    expect(parseMoodScore(3.6)).toBe(4);
  });

  it('clamps out-of-range values', () => {
    expect(parseMoodScore(0)).toBe(1);
    expect(parseMoodScore(99)).toBe(5);
    expect(parseMoodScore(-10)).toBe(1);
  });

  it('parses numeric strings', () => {
    expect(parseMoodScore('4')).toBe(4);
  });

  it('falls back to neutral for invalid input', () => {
    expect(parseMoodScore('abc')).toBe(3);
    expect(parseMoodScore(NaN)).toBe(3);
    expect(parseMoodScore(null)).toBe(3);
    expect(parseMoodScore(undefined)).toBe(3);
  });
});

describe('moodMeta', () => {
  it('returns metadata for each mood', () => {
    expect(moodMeta(1).label).toBe('Struggling');
    expect(moodMeta(5).label).toBe('Great');
    expect(ALL_MOODS).toHaveLength(5);
  });
});
