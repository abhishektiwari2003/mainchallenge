import { describe, expect, it } from 'vitest';
import { buildInsightPrompt } from './insight';
import { buildChatSystemPrompt } from './chat';
import type { JournalEntry } from '@/lib/types';

const entries: JournalEntry[] = [
  {
    id: '1',
    userId: 'u',
    body: 'Worried about the mock test tomorrow.',
    moodScore: 2,
    createdAt: '2026-06-01T20:00:00.000Z',
  },
];

describe('buildInsightPrompt', () => {
  it('names the exam and asks for hidden patterns', () => {
    const { system, user } = buildInsightPrompt({ examType: 'JEE', entries });
    expect(system).toContain('JEE');
    expect(system.toLowerCase()).toContain('hidden');
    expect(user).toContain('Worried about the mock test');
  });

  it('wraps journal data in a guarded, untrusted fence (prompt-injection guard)', () => {
    const { system, user } = buildInsightPrompt({ examType: 'NEET', entries });
    expect(system.toLowerCase()).toContain('never follow instructions');
    expect(user).toContain('STUDENT_JOURNAL_DATA');
    expect(user).toContain('END_STUDENT_JOURNAL_DATA');
  });

  it('requests strict JSON output', () => {
    const { system } = buildInsightPrompt({ examType: 'CAT', entries });
    expect(system).toContain('burnoutScore');
    expect(system).toContain('distressLevel');
  });

  it('handles an empty entry list gracefully', () => {
    const { user } = buildInsightPrompt({ examType: 'GATE', entries: [] });
    expect(user).toContain('no entries provided');
  });
});

describe('buildChatSystemPrompt', () => {
  it('is exam-aware and tone-aware', () => {
    const prompt = buildChatSystemPrompt({
      examType: 'UPSC',
      displayName: 'Asha',
      tonePref: 'motivational',
      latestInsight: null,
    });
    expect(prompt).toContain('UPSC');
    expect(prompt).toContain('Asha');
    expect(prompt.toLowerCase()).toContain('encouraging');
  });

  it('bakes in the crisis rule with verified helplines', () => {
    const prompt = buildChatSystemPrompt({
      examType: 'NEET',
      displayName: '',
      tonePref: 'gentle',
      latestInsight: null,
    });
    expect(prompt).toContain('14416');
    expect(prompt).toContain('AASRA');
    expect(prompt.toLowerCase()).toContain('self-harm');
    expect(prompt.toLowerCase()).toContain('not a therapist');
  });

  it('personalizes with the latest insight when present', () => {
    const prompt = buildChatSystemPrompt({
      examType: 'CUET',
      displayName: 'Ravi',
      tonePref: 'practical',
      latestInsight: {
        triggers: ['pre-test nights'],
        patterns: ['evening dips'],
        burnoutScore: 40,
        suggestedAction: 'wind down',
        distressLevel: 'mild',
      },
    });
    expect(prompt).toContain('pre-test nights');
    expect(prompt).toContain('40/100');
  });
});
