import type {
  ChatMessage,
  ExamType,
  Insight,
  JournalEntry,
  Profile,
  StoredInsight,
} from '@/lib/types';

/** Request a fresh Mirror Insights analysis from the secure server route. */
export async function requestInsight(
  examType: ExamType,
  entries: JournalEntry[],
): Promise<Insight> {
  const res = await fetch('/api/insights', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      examType,
      entries: entries.map((e) => ({
        body: e.body,
        moodScore: e.moodScore,
        createdAt: e.createdAt,
      })),
    }),
  });

  if (!res.ok) {
    const message = await safeError(res);
    throw new Error(message);
  }

  const data = (await res.json()) as { insight: Insight };
  return data.insight;
}

export interface StreamChatArgs {
  message: string;
  profile: Profile;
  history: Array<Pick<ChatMessage, 'role' | 'content'>>;
  latestInsight: StoredInsight | null;
  onChunk: (text: string) => void;
  signal?: AbortSignal;
}

/** Stream a companion reply, invoking `onChunk` with each text delta. */
export async function streamCompanionReply({
  message,
  profile,
  history,
  latestInsight,
  onChunk,
  signal,
}: StreamChatArgs): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal,
    body: JSON.stringify({
      message,
      examType: profile.examType,
      displayName: profile.displayName,
      tonePref: profile.tonePref,
      history: history.map((m) => ({ role: m.role, content: m.content })),
      latestInsight: latestInsight
        ? {
            triggers: latestInsight.triggers,
            patterns: latestInsight.patterns,
            burnoutScore: latestInsight.burnoutScore,
            suggestedAction: latestInsight.suggestedAction,
            distressLevel: latestInsight.distressLevel,
          }
        : null,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(await safeError(res));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    full += text;
    onChunk(text);
  }
  return full;
}

async function safeError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
