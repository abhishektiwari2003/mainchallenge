'use client';

import * as React from 'react';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MoodOrb } from '@/components/mood-orb';
import { CrisisBanner } from '@/features/crisis/crisis-banner';
import { streamCompanionReply } from '@/lib/api';
import { getRepo } from '@/lib/data/repo';
import { detectCrisis } from '@/lib/crisis/detector';
import { useInsights, useMessages, useProfile } from '@/lib/hooks/queries';
import type { ChatMessage } from '@/lib/types';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Adaptive Companion: a conversational AI that acts as an empathetic,
 * always-available digital companion. It streams hyper-personalized, contextual
 * wellness support — real-time tailored coping strategies and motivational
 * encouragement — and is exam-aware and crisis-safe.
 */
export function ChatView() {
  const { data: profile } = useProfile();
  const { data: persisted } = useMessages();
  const { data: insights = [] } = useInsights();

  const [messages, setMessages] = React.useState<DisplayMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const [acute, setAcute] = React.useState(false);
  const [error, setError] = React.useState('');
  const listEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (persisted) {
      setMessages(
        persisted.map((m: ChatMessage) => ({ id: m.id, role: m.role, content: m.content })),
      );
    }
  }, [persisted]);

  React.useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  // PERF: stable handler via useCallback so child controls don't re-bind each
  // render; the reply is streamed (onChunk) for instant perceived response.
  const handleSend = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const text = input.trim();
      if (!text || streaming || !profile) return;

      setError('');
      if (detectCrisis(text).isAcute) setAcute(true);

      const userMsg: DisplayMessage = { id: crypto.randomUUID(), role: 'user', content: text };
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '' },
      ]);
      setInput('');
      setStreaming(true);

      const repo = getRepo();
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      try {
        await repo.addMessage({ role: 'user', content: text });
        // PERF: stream the companion reply chunk-by-chunk for low perceived latency.
        const full = await streamCompanionReply({
          message: text,
          profile,
          history,
          latestInsight: insights[0] ?? null,
          onChunk: (chunk) =>
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
            ),
        });
        await repo.addMessage({ role: 'assistant', content: full });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setStreaming(false);
      }
    },
    [input, streaming, profile, messages, insights],
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      {acute && <CrisisBanner />}

      <Card className="flex min-h-[60vh] flex-col">
        <CardContent className="flex flex-1 flex-col gap-4 p-4">
          <div
            className="flex-1 space-y-4 overflow-y-auto"
            role="log"
            aria-live="polite"
            aria-label="Conversation with your companion"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <MoodOrb size={72} mood={4} />
                <p className="max-w-sm text-sm text-muted-foreground">
                  Hi{profile ? ` ${profile.displayName}` : ''}, I&rsquo;m here for you. Tell me how
                  your {profile?.examType ?? 'exam'} prep is feeling today.
                </p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex animate-fade-in',
                  m.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <p
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                    m.role === 'user'
                      ? 'rounded-br-md bg-primary text-primary-foreground shadow-primary/20'
                      : 'rounded-bl-md border border-border/60 bg-secondary text-secondary-foreground',
                  )}
                >
                  {m.content || (streaming ? '…' : '')}
                </p>
              </div>
            ))}
            <div ref={listEndRef} />
          </div>

          {/* Streaming status announced to screen readers as the companion replies. */}
          <p
            role="status"
            aria-live="polite"
            aria-label="Companion response status"
            className={cn('text-xs text-muted-foreground', !streaming && 'sr-only')}
          >
            {streaming ? 'Your companion is typing…' : ''}
          </p>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <form onSubmit={handleSend} className="flex items-end gap-2" aria-label="Send a message">
            <div className="flex-1">
              <label htmlFor="chat-input" className="sr-only">
                Message your companion
              </label>
              <Textarea
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend(e);
                  }
                }}
                placeholder="Share what's on your mind…"
                aria-label="Message your companion"
                className="min-h-[52px]"
                disabled={streaming}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={streaming || input.trim().length === 0}
              aria-label="Send message"
            >
              {streaming ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Send aria-hidden="true" className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
