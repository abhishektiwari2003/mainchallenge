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
 * Persistence abstraction (port) for all student data.
 *
 * SOLID — Dependency Inversion Principle: feature/UI modules depend on this
 * `Repo` interface, never on a concrete database. Two interchangeable adapters
 * implement it:
 *  - `SupabaseRepo`: production storage with Row Level Security.
 *  - `LocalRepo`: browser localStorage fallback used when Supabase is not
 *    configured and in hermetic E2E runs.
 *
 * SOLID — Interface Segregation: the surface is intentionally small and focused
 * on the operations the app actually needs. Liskov: either adapter is a drop-in
 * substitute. Both implementations isolate data per authenticated/anonymous user.
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

/**
 * Factory that resolves the active repository adapter for the current
 * environment, returning it typed as the `Repo` interface so callers remain
 * decoupled from the concrete implementation (Dependency Inversion).
 *
 * @returns The `Repo` implementation appropriate for this environment.
 */
export function getRepo(): Repo {
  if (repoSingleton) return repoSingleton;
  repoSingleton = isSupabaseConfigured() ? new SupabaseRepo() : new LocalRepo();
  return repoSingleton;
}

/** Test-only helper to reset the cached repository. */
export function __resetRepo(): void {
  repoSingleton = null;
}
