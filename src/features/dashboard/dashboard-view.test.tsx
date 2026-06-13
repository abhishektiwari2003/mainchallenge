import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithClient } from '@/test/utils';
import { DashboardView } from './dashboard-view';

const repo = {
  getProfile: vi.fn().mockResolvedValue({
    id: 'u',
    examType: 'JEE',
    displayName: 'Asha',
    tonePref: 'gentle',
    consentAt: null,
  }),
  listEntries: vi.fn().mockResolvedValue([]),
  listInsights: vi.fn().mockResolvedValue([]),
};

vi.mock('@/lib/data/repo', () => ({ getRepo: () => repo }));
vi.mock('@/lib/api', () => ({ requestInsight: vi.fn() }));
vi.mock('@/lib/data/seed', () => ({ seedDemoData: vi.fn().mockResolvedValue(8) }));

beforeEach(() => vi.clearAllMocks());

describe('DashboardView', () => {
  it('greets the student by name and exam', async () => {
    renderWithClient(<DashboardView />);
    expect(await screen.findByText(/Hello, Asha/)).toBeInTheDocument();
    expect(screen.getByText(/preparing for JEE/i)).toBeInTheDocument();
  });

  it('offers a demo seed when there are no entries', async () => {
    renderWithClient(<DashboardView />);
    expect(await screen.findByRole('button', { name: /load 7-day demo/i })).toBeInTheDocument();
  });
});
