import type { DistressLevel } from '@/lib/types';

/**
 * Acute phrases that, on their own, should always trigger the crisis layer.
 * Matched as word-ish substrings against normalized text.
 */
const ACUTE_PATTERNS: readonly RegExp[] = [
  /\bkill myself\b/,
  /\bkilling myself\b/,
  /\bend my life\b/,
  /\bending my life\b/,
  /\btake my (own )?life\b/,
  /\bsuicid/, // suicide, suicidal
  /\bdon'?t want to (be alive|live)\b/,
  /\bwant to die\b/,
  /\bbetter off dead\b/,
  /\bno reason to live\b/,
  /\bself[\s-]?harm/,
  /\bhurt myself\b/,
  /\bcut myself\b/,
  /\bcan'?t go on\b/,
  /\bworthless and (hopeless|alone)\b/,
];

/** Strong distress signals that escalate severity but are not necessarily acute. */
const MODERATE_TERMS: readonly string[] = [
  'hopeless',
  'worthless',
  'can’t cope',
  "can't cope",
  'cannot cope',
  'overwhelmed',
  'breaking down',
  'panic attack',
  'panicking',
  'numb',
  'empty',
  'give up',
  'giving up',
  'exhausted',
  'burned out',
  'burnt out',
];

/** Milder stress signals. */
const MILD_TERMS: readonly string[] = [
  'stressed',
  'stress',
  'anxious',
  'anxiety',
  'worried',
  'scared',
  'tired',
  'pressure',
  'failing',
  'failure',
  'lonely',
  'sad',
];

export interface CrisisResult {
  level: DistressLevel;
  /** True when the safety layer (helplines) must be shown. */
  isAcute: boolean;
  /** The distress terms/phrases that matched, for transparency and testing. */
  matched: string[];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function countMatches(haystack: string, terms: readonly string[]): string[] {
  return terms.filter((term) => haystack.includes(term));
}

/**
 * Detect distress level from free-text. Pure and deterministic so it can run
 * identically on the client (instant feedback) and the server (authoritative).
 *
 * The result is intentionally conservative: any acute pattern immediately
 * returns `acute` regardless of length or surrounding text.
 */
export function detectCrisis(text: string): CrisisResult {
  const normalized = normalize(text ?? '');
  if (normalized.length === 0) {
    return { level: 'none', isAcute: false, matched: [] };
  }

  const acuteMatches = ACUTE_PATTERNS.filter((re) => re.test(normalized)).map((re) =>
    re.source.replace(/\\b|\(.*?\)|\\/g, '').trim(),
  );
  if (acuteMatches.length > 0) {
    return { level: 'acute', isAcute: true, matched: acuteMatches };
  }

  const moderateMatches = countMatches(normalized, MODERATE_TERMS);
  const mildMatches = countMatches(normalized, MILD_TERMS);

  // Two or more moderate signals, or one moderate + multiple mild, => moderate.
  if (moderateMatches.length >= 2 || (moderateMatches.length >= 1 && mildMatches.length >= 2)) {
    return { level: 'moderate', isAcute: false, matched: [...moderateMatches, ...mildMatches] };
  }
  if (moderateMatches.length >= 1 || mildMatches.length >= 2) {
    return { level: 'mild', isAcute: false, matched: [...moderateMatches, ...mildMatches] };
  }
  if (mildMatches.length === 1) {
    return { level: 'mild', isAcute: false, matched: mildMatches };
  }

  return { level: 'none', isAcute: false, matched: [] };
}

/** Rank used to compare/merge distress levels from multiple sources. */
export function distressRank(level: DistressLevel): number {
  return { none: 0, mild: 1, moderate: 2, acute: 3 }[level];
}

/** Return the more severe of two distress levels. */
export function maxDistress(a: DistressLevel, b: DistressLevel): DistressLevel {
  return distressRank(a) >= distressRank(b) ? a : b;
}
