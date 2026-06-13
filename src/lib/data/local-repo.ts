import type {
  ChatMessage,
  ChatRole,
  Insight,
  JournalEntry,
  MoodScore,
  Profile,
  StoredInsight,
} from '@/lib/types';
import type { Repo } from './repo';

const STORAGE_KEY = 'mindmirror:v1';

interface LocalState {
  userId: string;
  profile: Profile | null;
  entries: JournalEntry[];
  insights: StoredInsight[];
  messages: ChatMessage[];
}

function emptyState(): LocalState {
  return {
    userId: crypto.randomUUID(),
    profile: null,
    entries: [],
    insights: [],
    messages: [],
  };
}

/**
 * localStorage-backed repository. Requires no external services, so the app
 * runs instantly before Supabase is configured and stays hermetic in E2E.
 */
export class LocalRepo implements Repo {
  private read(): LocalState {
    if (typeof window === 'undefined') return emptyState();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = emptyState();
      this.write(fresh);
      return fresh;
    }
    try {
      return JSON.parse(raw) as LocalState;
    } catch {
      const fresh = emptyState();
      this.write(fresh);
      return fresh;
    }
  }

  private write(state: LocalState): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async getProfile(): Promise<Profile | null> {
    return this.read().profile;
  }

  async saveProfile(
    input: Omit<Profile, 'id' | 'consentAt'> & { consent: boolean },
  ): Promise<Profile> {
    const state = this.read();
    const profile: Profile = {
      id: state.userId,
      examType: input.examType,
      displayName: input.displayName,
      tonePref: input.tonePref,
      consentAt: input.consent ? new Date().toISOString() : null,
    };
    state.profile = profile;
    this.write(state);
    return profile;
  }

  async listEntries(): Promise<JournalEntry[]> {
    return [...this.read().entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async addEntry(input: {
    body: string;
    moodScore: MoodScore;
    createdAt?: string;
  }): Promise<JournalEntry> {
    const state = this.read();
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      userId: state.userId,
      body: input.body,
      moodScore: input.moodScore,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    state.entries.push(entry);
    this.write(state);
    return entry;
  }

  async listInsights(): Promise<StoredInsight[]> {
    return [...this.read().insights].sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
    );
  }

  async getLatestInsight(): Promise<StoredInsight | null> {
    return (await this.listInsights())[0] ?? null;
  }

  async saveInsight(insight: Insight): Promise<StoredInsight> {
    const state = this.read();
    const stored: StoredInsight = {
      ...insight,
      id: crypto.randomUUID(),
      userId: state.userId,
      generatedAt: new Date().toISOString(),
    };
    state.insights.push(stored);
    this.write(state);
    return stored;
  }

  async listMessages(): Promise<ChatMessage[]> {
    return [...this.read().messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  async addMessage(input: { role: ChatRole; content: string }): Promise<ChatMessage> {
    const state = this.read();
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      userId: state.userId,
      role: input.role,
      content: input.content,
      createdAt: new Date().toISOString(),
    };
    state.messages.push(message);
    this.write(state);
    return message;
  }

  async deleteAll(): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
