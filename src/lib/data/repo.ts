import type {
  ChatMessage,
  ChatRole,
  Insight,
  JournalEntry,
  MoodScore,
  Profile,
  StoredInsight,
} from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { LocalRepo } from '@/lib/data/local-repo';
import { SupabaseRepo } from '@/lib/supabase/supabase-repo';

/**
 * Persistence abstraction for all student data. Two implementations:
 *  - `SupabaseRepo`: production storage with Row Level Security.
 *  - `LocalRepo`: browser localStorage fallback used when Supabase is not
 *    configured and in hermetic E2E runs.
 *
 * Both implementations isolate data per authenticated/anonymous user.
 */
export interface Repo {
  getProfile(): Promise<Profile | null>;
  saveProfile(input: Omit<Profile, 'id' | 'consentAt'> & { consent: boolean }): Promise<Profile>;
  listEntries(): Promise<JournalEntry[]>;
  addEntry(input: {
    body: string;
    moodScore: MoodScore;
    createdAt?: string;
  }): Promise<JournalEntry>;
  listInsights(): Promise<StoredInsight[]>;
  getLatestInsight(): Promise<StoredInsight | null>;
  saveInsight(insight: Insight): Promise<StoredInsight>;
  listMessages(): Promise<ChatMessage[]>;
  addMessage(input: { role: ChatRole; content: string }): Promise<ChatMessage>;
  deleteAll(): Promise<void>;
}

let repoSingleton: Repo | null = null;

/** Resolve the active repository implementation for the current environment. */
export function getRepo(): Repo {
  if (repoSingleton) return repoSingleton;
  repoSingleton = isSupabaseConfigured() ? new SupabaseRepo() : new LocalRepo();
  return repoSingleton;
}

/** Test-only helper to reset the cached repository. */
export function __resetRepo(): void {
  repoSingleton = null;
}
