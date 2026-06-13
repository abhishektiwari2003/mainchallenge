import type {
  ChatMessage,
  ChatRole,
  Insight,
  JournalEntry,
  MoodScore,
  Profile,
  StoredInsight,
} from '@/lib/types';
import type { Repo } from '@/lib/data/repo';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/** Supabase-backed repository. Relies on an anonymous (or real) auth session. */
export class SupabaseRepo implements Repo {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  /** Ensure there is a session; create an anonymous one if needed. */
  private async ensureUserId(): Promise<string> {
    const { data } = await this.supabase.auth.getUser();
    if (data.user) return data.user.id;
    const { data: anon, error } = await this.supabase.auth.signInAnonymously();
    if (error || !anon.user) {
      throw new Error(`Could not establish a session: ${error?.message ?? 'unknown error'}`);
    }
    return anon.user.id;
  }

  async getProfile(): Promise<Profile | null> {
    const userId = await this.ensureUserId();
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      examType: data.exam_type,
      displayName: data.display_name,
      tonePref: data.tone_pref,
      consentAt: data.consent_at,
    };
  }

  async saveProfile(
    input: Omit<Profile, 'id' | 'consentAt'> & { consent: boolean },
  ): Promise<Profile> {
    const userId = await this.ensureUserId();
    const row = {
      id: userId,
      exam_type: input.examType,
      display_name: input.displayName,
      tone_pref: input.tonePref,
      consent_at: input.consent ? new Date().toISOString() : null,
    };
    const { data, error } = await this.supabase.from('profiles').upsert(row).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      examType: data.exam_type,
      displayName: data.display_name,
      tonePref: data.tone_pref,
      consentAt: data.consent_at,
    };
  }

  async listEntries(): Promise<JournalEntry[]> {
    const userId = await this.ensureUserId();
    const { data, error } = await this.supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((e) => ({
      id: e.id,
      userId: e.user_id,
      body: e.body,
      moodScore: e.mood_score as MoodScore,
      createdAt: e.created_at,
    }));
  }

  async addEntry(input: {
    body: string;
    moodScore: MoodScore;
    createdAt?: string;
  }): Promise<JournalEntry> {
    const userId = await this.ensureUserId();
    const row: {
      user_id: string;
      body: string;
      mood_score: MoodScore;
      created_at?: string;
    } = { user_id: userId, body: input.body, mood_score: input.moodScore };
    if (input.createdAt) row.created_at = input.createdAt;
    const { data, error } = await this.supabase
      .from('journal_entries')
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      userId: data.user_id,
      body: data.body,
      moodScore: data.mood_score as MoodScore,
      createdAt: data.created_at,
    };
  }

  async listInsights(): Promise<StoredInsight[]> {
    const userId = await this.ensureUserId();
    const { data, error } = await this.supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(this.mapInsight);
  }

  async getLatestInsight(): Promise<StoredInsight | null> {
    return (await this.listInsights())[0] ?? null;
  }

  async saveInsight(insight: Insight): Promise<StoredInsight> {
    const userId = await this.ensureUserId();
    const { data, error } = await this.supabase
      .from('insights')
      .insert({
        user_id: userId,
        triggers: insight.triggers,
        patterns: insight.patterns,
        burnout_score: insight.burnoutScore,
        suggested_action: insight.suggestedAction,
        distress_level: insight.distressLevel,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return this.mapInsight(data);
  }

  async listMessages(): Promise<ChatMessage[]> {
    const userId = await this.ensureUserId();
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((m) => ({
      id: m.id,
      userId: m.user_id,
      role: m.role as ChatRole,
      content: m.content,
      createdAt: m.created_at,
    }));
  }

  async addMessage(input: { role: ChatRole; content: string }): Promise<ChatMessage> {
    const userId = await this.ensureUserId();
    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert({ user_id: userId, role: input.role, content: input.content })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      userId: data.user_id,
      role: data.role as ChatRole,
      content: data.content,
      createdAt: data.created_at,
    };
  }

  async deleteAll(): Promise<void> {
    await this.ensureUserId();
    const { error } = await this.supabase.rpc('delete_all_user_data');
    if (error) throw new Error(error.message);
    await this.supabase.auth.signOut();
  }

  private mapInsight = (row: {
    id: string;
    user_id: string;
    triggers: string[];
    patterns: string[];
    burnout_score: number;
    suggested_action: string;
    distress_level: StoredInsight['distressLevel'];
    generated_at: string;
  }): StoredInsight => ({
    id: row.id,
    userId: row.user_id,
    triggers: row.triggers,
    patterns: row.patterns,
    burnoutScore: row.burnout_score,
    suggestedAction: row.suggested_action,
    distressLevel: row.distress_level,
    generatedAt: row.generated_at,
  });
}
