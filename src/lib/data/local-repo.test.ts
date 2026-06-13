import { afterEach, describe, expect, it } from 'vitest';
import { LocalRepo } from './local-repo';
import { __resetRepo, getRepo } from './repo';

afterEach(() => {
  window.localStorage.clear();
  __resetRepo();
});

describe('LocalRepo', () => {
  it('saves and reads a profile', async () => {
    const repo = new LocalRepo();
    const saved = await repo.saveProfile({
      examType: 'NEET',
      displayName: 'Asha',
      tonePref: 'gentle',
      consent: true,
    });
    expect(saved.consentAt).not.toBeNull();
    expect((await repo.getProfile())?.displayName).toBe('Asha');
  });

  it('returns entries newest-first', async () => {
    const repo = new LocalRepo();
    await repo.addEntry({ body: 'older', moodScore: 3, createdAt: '2026-01-01T00:00:00.000Z' });
    await repo.addEntry({ body: 'newer', moodScore: 4, createdAt: '2026-02-01T00:00:00.000Z' });
    const entries = await repo.listEntries();
    expect(entries[0]!.body).toBe('newer');
  });

  it('stores and retrieves the latest insight', async () => {
    const repo = new LocalRepo();
    await repo.saveInsight({
      triggers: ['t'],
      patterns: ['p'],
      burnoutScore: 50,
      suggestedAction: 'rest',
      distressLevel: 'mild',
    });
    const latest = await repo.getLatestInsight();
    expect(latest?.burnoutScore).toBe(50);
  });

  it('appends chat messages in chronological order', async () => {
    const repo = new LocalRepo();
    await repo.addMessage({ role: 'user', content: 'hi' });
    await repo.addMessage({ role: 'assistant', content: 'hello' });
    const messages = await repo.listMessages();
    expect(messages.map((m) => m.role)).toEqual(['user', 'assistant']);
  });

  it('deletes all data', async () => {
    const repo = new LocalRepo();
    await repo.addEntry({ body: 'x', moodScore: 3 });
    await repo.deleteAll();
    expect(await repo.listEntries()).toHaveLength(0);
  });

  it('recovers from corrupted storage', async () => {
    window.localStorage.setItem('mindmirror:v1', 'not json');
    const repo = new LocalRepo();
    expect(await repo.getProfile()).toBeNull();
  });
});

describe('getRepo', () => {
  it('returns the LocalRepo when Supabase is not configured', () => {
    expect(getRepo()).toBeInstanceOf(LocalRepo);
  });

  it('returns a stable singleton', () => {
    expect(getRepo()).toBe(getRepo());
  });
});
