import type { JournalEntry } from '@/lib/types';
import { detectCrisis, distressRank } from '@/lib/crisis/detector';

export type BurnoutBand = 'low' | 'guarded' | 'elevated' | 'high';

export interface BurnoutResult {
  /** 0 (thriving) to 100 (high burnout risk). */
  score: number;
  band: BurnoutBand;
  /** Human-readable contributing factors. */
  factors: string[];
}

export interface MoodTrendPoint {
  date: string;
  mood: number;
  /** Distress (0-3) scaled to the mood axis for overlay readability. */
  distress: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Map a 0-100 score to a qualitative band. */
export function bandForScore(score: number): BurnoutBand {
  if (score >= 70) return 'high';
  if (score >= 45) return 'elevated';
  if (score >= 25) return 'guarded';
  return 'low';
}

/**
 * Compute a burnout-risk score from recent journal entries.
 *
 * The score blends four signals, each contributing independently so the result
 * degrades gracefully with sparse data:
 *  - low average mood
 *  - a declining mood trend (recent worse than earlier)
 *  - high mood volatility
 *  - density of distress language across entries
 *
 * Pure and deterministic for straightforward unit testing.
 */
export function computeBurnoutScore(entries: JournalEntry[]): BurnoutResult {
  if (entries.length === 0) {
    return { score: 0, band: 'low', factors: ['No entries yet'] };
  }

  const ordered = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const moods = ordered.map((e) => e.moodScore);
  const factors: string[] = [];

  // 1. Low average mood (1-5 -> 0-40 points).
  const avgMood = average(moods);
  const moodPenalty = clamp(((5 - avgMood) / 4) * 40, 0, 40);
  if (avgMood <= 2.5) factors.push('Persistently low mood');

  // 2. Declining trend: compare first half vs second half.
  const mid = Math.floor(ordered.length / 2);
  const firstHalf = average(moods.slice(0, mid || 1));
  const secondHalf = average(moods.slice(mid));
  const decline = clamp((firstHalf - secondHalf) * 12, 0, 24);
  if (firstHalf - secondHalf >= 0.75) factors.push('Mood trending downward');

  // 3. Volatility (standard deviation -> 0-16 points).
  const variance = average(moods.map((m) => (m - avgMood) ** 2));
  const stdDev = Math.sqrt(variance);
  const volatility = clamp(stdDev * 10, 0, 16);
  if (stdDev >= 1.1) factors.push('High mood volatility');

  // 4. Distress language density (0-20 points).
  const distressTotal = ordered.reduce(
    (sum, e) => sum + distressRank(detectCrisis(e.body).level),
    0,
  );
  const distressDensity = clamp((distressTotal / (ordered.length * 3)) * 20, 0, 20);
  if (distressDensity >= 8) factors.push('Frequent distress language');

  const score = Math.round(clamp(moodPenalty + decline + volatility + distressDensity, 0, 100));
  if (factors.length === 0) factors.push('Stable, balanced signals');

  return { score, band: bandForScore(score), factors };
}

/** Build a date-ordered series for the Burnout Radar chart. */
export function buildMoodTrend(entries: JournalEntry[]): MoodTrendPoint[] {
  return [...entries]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((e) => ({
      date: e.createdAt,
      mood: e.moodScore,
      // Scale distress (0-3) onto the 1-5 mood axis for a readable overlay.
      distress: 1 + distressRank(detectCrisis(e.body).level) * (4 / 3),
    }));
}
