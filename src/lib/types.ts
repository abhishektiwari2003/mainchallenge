/**
 * Shared domain types for MindMirror. Kept framework-agnostic so they can be
 * imported by pure logic modules, UI, and tests alike.
 */

/** Competitive exams supported during onboarding. */
export const EXAM_TYPES = ['NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC'] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

/** Conversational tone the companion adopts. */
export const TONE_PREFS = ['gentle', 'motivational', 'practical'] as const;
export type TonePref = (typeof TONE_PREFS)[number];

/** Quick mood pulse on a 1 (very low) to 5 (great) scale. */
export type MoodScore = 1 | 2 | 3 | 4 | 5;

/** Severity of detected distress, ordered from least to most severe. */
export const DISTRESS_LEVELS = ['none', 'mild', 'moderate', 'acute'] as const;
export type DistressLevel = (typeof DISTRESS_LEVELS)[number];

export interface Profile {
  id: string;
  examType: ExamType;
  displayName: string;
  tonePref: TonePref;
  consentAt: string | null;
}

export interface JournalEntry {
  id: string;
  userId: string;
  body: string;
  moodScore: MoodScore;
  createdAt: string;
}

export interface Insight {
  triggers: string[];
  patterns: string[];
  burnoutScore: number;
  suggestedAction: string;
  distressLevel: DistressLevel;
}

export interface StoredInsight extends Insight {
  id: string;
  userId: string;
  generatedAt: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  userId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}
