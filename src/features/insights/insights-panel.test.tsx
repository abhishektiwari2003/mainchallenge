import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithClient } from '@/test/utils';
import { InsightsPanel } from './insights-panel';
import type { JournalEntry, StoredInsight } from '@/lib/types';

const insight: StoredInsight = {
  id: 'i1',
  userId: 'u',
  triggers: ['Stress spikes the night before mock tests, not the test itself'],
  patterns: ['Mood recovers the day of the exam'],
  burnoutScore: 58,
  suggestedAction: 'Plan a calming wind-down ritual the night before each mock.',
  distressLevel: 'moderate',
  generatedAt: new Date().toISOString(),
};

const entries: JournalEntry[] = [
  {
    id: '1',
    userId: 'u',
    body: 'worried about mocks',
    moodScore: 2,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

const repo = {
  getProfile: vi.fn().mockResolvedValue({
    id: 'u',
    examType: 'NEET',
    displayName: 'Asha',
    tonePref: 'gentle',
    consentAt: null,
  }),
  listInsights: vi.fn().mockResolvedValue([insight]),
  listEntries: vi.fn().mockResolvedValue(entries),
  saveInsight: vi.fn().mockResolvedValue(insight),
};

vi.mock('@/lib/data/repo', () => ({ getRepo: () => repo }));
const requestInsight = vi.fn().mockResolvedValue(insight);
vi.mock('@/lib/api', () => ({ requestInsight: (...args: unknown[]) => requestInsight(...args) }));

beforeEach(() => vi.clearAllMocks());

describe('InsightsPanel', () => {
  it('leads with the hidden trigger reveal', async () => {
    renderWithClient(<InsightsPanel />);
    expect(await screen.findByText(/night before mock tests/i)).toBeInTheDocument();
    expect(screen.getByText(/Burnout estimate: 58\/100/)).toBeInTheDocument();
  });

  it('runs a fresh analysis when the button is clicked', async () => {
    const user = userEvent.setup();
    renderWithClient(<InsightsPanel />);
    await screen.findByText(/night before mock tests/i);
    await user.click(screen.getByRole('button', { name: /re-analyze journal/i }));
    await waitFor(() => expect(requestInsight).toHaveBeenCalled());
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithClient(<InsightsPanel />);
    await screen.findByText(/night before mock tests/i);
    expect(await axe(container)).toHaveNoViolations();
  });
});
