import { describe, expect, it } from 'vitest';
import { bandForScore, buildMoodTrend, computeBurnoutScore } from './score';
import type { JournalEntry, MoodScore } from '@/lib/types';

function entry(daysAgo: number, mood: MoodScore, body = 'A normal study day.'): JournalEntry {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: `${daysAgo}`,
    userId: 'u',
    body,
    moodScore: mood,
    createdAt: date.toISOString(),
  };
}

describe('computeBurnoutScore', () => {
  it('returns a zero baseline for no entries', () => {
    const result = computeBurnoutScore([]);
    expect(result.score).toBe(0);
    expect(result.band).toBe('low');
  });

  it('keeps the score low for consistently good moods', () => {
    const entries = [entry(3, 5), entry(2, 4), entry(1, 5)];
    const result = computeBurnoutScore(entries);
    expect(result.score).toBeLessThan(25);
    expect(result.band).toBe('low');
  });

  it('produces a high score for low, declining, distressed entries', () => {
    const entries = [
      entry(4, 4, 'Felt okay today.'),
      entry(3, 2, 'I am so stressed and anxious.'),
      entry(2, 1, 'I feel hopeless and completely overwhelmed, exhausted and burned out.'),
      entry(1, 1, 'I cannot cope, everything is too much, I feel worthless.'),
    ];
    const result = computeBurnoutScore(entries);
    expect(result.score).toBeGreaterThan(55);
    expect(['elevated', 'high']).toContain(result.band);
    expect(result.factors.length).toBeGreaterThan(0);
  });

  it('detects a downward trend as a contributing factor', () => {
    const entries = [entry(4, 5), entry(3, 5), entry(2, 2), entry(1, 1)];
    const result = computeBurnoutScore(entries);
    expect(result.factors).toContain('Mood trending downward');
  });

  it('clamps the score within 0-100', () => {
    const entries = Array.from({ length: 6 }, (_, i) =>
      entry(i, 1, 'hopeless worthless overwhelmed cannot cope want to give up'),
    );
    const result = computeBurnoutScore(entries);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('bandForScore', () => {
  it('maps scores to bands', () => {
    expect(bandForScore(10)).toBe('low');
    expect(bandForScore(30)).toBe('guarded');
    expect(bandForScore(50)).toBe('elevated');
    expect(bandForScore(80)).toBe('high');
  });
});

describe('buildMoodTrend', () => {
  it('orders points chronologically', () => {
    const trend = buildMoodTrend([entry(1, 3), entry(3, 5), entry(2, 2)]);
    const times = trend.map((p) => new Date(p.date).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(trend).toHaveLength(3);
  });
});
