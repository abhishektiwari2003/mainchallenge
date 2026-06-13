import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestInsight, streamCompanionReply } from './api';
import type { JournalEntry, Profile } from '@/lib/types';

const profile: Profile = {
  id: 'u',
  examType: 'NEET',
  displayName: 'Asha',
  tonePref: 'gentle',
  consentAt: null,
};

const entries: JournalEntry[] = [
  { id: '1', userId: 'u', body: 'stressed', moodScore: 2, createdAt: '2026-06-01T00:00:00.000Z' },
];

afterEach(() => vi.restoreAllMocks());

describe('requestInsight', () => {
  it('posts entries and returns the parsed insight', async () => {
    const insight = {
      triggers: ['t'],
      patterns: ['p'],
      burnoutScore: 40,
      suggestedAction: 'rest',
      distressLevel: 'mild',
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ insight }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await requestInsight('NEET', entries);
    expect(result.burnoutScore).toBe(40);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/insights',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws with the server error message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'boom' }), { status: 500 })),
    );
    await expect(requestInsight('NEET', entries)).rejects.toThrow('boom');
  });
});

describe('streamCompanionReply', () => {
  it('accumulates streamed chunks and invokes onChunk', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode('Hello '));
        controller.enqueue(enc.encode('there.'));
        controller.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(stream, { status: 200 })));

    const chunks: string[] = [];
    const full = await streamCompanionReply({
      message: 'hi',
      profile,
      history: [],
      latestInsight: null,
      onChunk: (c) => chunks.push(c),
    });

    expect(full).toBe('Hello there.');
    expect(chunks.join('')).toBe('Hello there.');
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'rate' }), { status: 429 })),
    );
    await expect(
      streamCompanionReply({
        message: 'hi',
        profile,
        history: [],
        latestInsight: null,
        onChunk: () => {},
      }),
    ).rejects.toThrow('rate');
  });
});
