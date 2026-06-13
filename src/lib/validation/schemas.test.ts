import { describe, expect, it } from 'vitest';
import {
  chatRequestSchema,
  insightRequestSchema,
  journalEntrySchema,
  profileSchema,
} from './schemas';

describe('profileSchema', () => {
  it('accepts a complete, consented profile', () => {
    const result = profileSchema.safeParse({
      examType: 'JEE',
      displayName: 'Asha',
      tonePref: 'gentle',
      consent: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects when consent is not given', () => {
    const result = profileSchema.safeParse({
      examType: 'JEE',
      displayName: 'Asha',
      tonePref: 'gentle',
      consent: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown exam', () => {
    const result = profileSchema.safeParse({
      examType: 'SAT',
      displayName: 'Asha',
      tonePref: 'gentle',
      consent: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty name', () => {
    const result = profileSchema.safeParse({
      examType: 'JEE',
      displayName: '   ',
      tonePref: 'gentle',
      consent: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('journalEntrySchema', () => {
  it('accepts a valid entry', () => {
    expect(journalEntrySchema.safeParse({ body: 'Hello', moodScore: 3 }).success).toBe(true);
  });

  it('rejects empty body and out-of-range mood', () => {
    expect(journalEntrySchema.safeParse({ body: '', moodScore: 3 }).success).toBe(false);
    expect(journalEntrySchema.safeParse({ body: 'ok', moodScore: 9 }).success).toBe(false);
  });
});

describe('insightRequestSchema', () => {
  it('requires at least one entry', () => {
    expect(insightRequestSchema.safeParse({ examType: 'NEET', entries: [] }).success).toBe(false);
  });

  it('accepts a valid analysis request', () => {
    const result = insightRequestSchema.safeParse({
      examType: 'NEET',
      entries: [{ body: 'a', moodScore: 3, createdAt: new Date().toISOString() }],
    });
    expect(result.success).toBe(true);
  });
});

describe('chatRequestSchema', () => {
  it('applies defaults for history and latestInsight', () => {
    const result = chatRequestSchema.safeParse({
      message: 'hi',
      examType: 'CAT',
      tonePref: 'practical',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.history).toEqual([]);
      expect(result.data.latestInsight).toBeNull();
    }
  });

  it('rejects an empty message', () => {
    expect(
      chatRequestSchema.safeParse({ message: '', examType: 'CAT', tonePref: 'practical' }).success,
    ).toBe(false);
  });
});
