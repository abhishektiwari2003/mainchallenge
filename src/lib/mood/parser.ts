import type { MoodScore } from '@/lib/types';

export interface MoodMeta {
  score: MoodScore;
  label: string;
  emoji: string;
  /** Tailwind text color token. */
  tone: string;
}

const MOOD_META: Record<MoodScore, MoodMeta> = {
  1: { score: 1, label: 'Struggling', emoji: '😣', tone: 'text-destructive' },
  2: { score: 2, label: 'Low', emoji: '😔', tone: 'text-warning' },
  3: { score: 3, label: 'Okay', emoji: '😐', tone: 'text-muted-foreground' },
  4: { score: 4, label: 'Good', emoji: '🙂', tone: 'text-primary' },
  5: { score: 5, label: 'Great', emoji: '😄', tone: 'text-success' },
};

/**
 * Coerce an arbitrary numeric input into a valid 1-5 MoodScore, clamping and
 * rounding as needed. Non-finite input falls back to a neutral 3.
 */
export function parseMoodScore(raw: unknown): MoodScore {
  const num = typeof raw === 'string' ? Number(raw) : raw;
  if (typeof num !== 'number' || !Number.isFinite(num)) return 3;
  const rounded = Math.round(num);
  const clamped = Math.min(5, Math.max(1, rounded));
  return clamped as MoodScore;
}

/** Look up display metadata for a mood score. */
export function moodMeta(score: MoodScore): MoodMeta {
  return MOOD_META[score];
}

export const ALL_MOODS: MoodMeta[] = [1, 2, 3, 4, 5].map((s) => MOOD_META[s as MoodScore]);
