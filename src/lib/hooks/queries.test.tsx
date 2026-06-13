import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { JournalEntry, Profile } from '@/lib/types';

const profile: Profile = {
  id: 'u',
  examType: 'NEET',
  displayName: 'Asha',
  tonePref: 'gentle',
  consentAt: null,
};

const entries: JournalEntry[] = [
  {
    id: '1',
    userId: 'u',
    body: 'stressed about mocks',
    moodScore: 2,
    createdAt: '2026-06-01T00:00:00.000Z',
  },
];

const repo = {
  getProfile: vi.fn().mockResolvedValue(profile),
  listEntries: vi.fn().mockResolvedValue(entries),
  addEntry: vi.fn().mockResolvedValue(entries[0]),
  listInsights: vi.fn().mockResolvedValue([]),
  saveInsight: vi.fn().mockResolvedValue({}),
  listMessages: vi.fn().mockResolvedValue([]),
  deleteAll: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/lib/data/repo', () => ({ getRepo: () => repo }));
vi.mock('@/lib/api', () => ({
  requestInsight: vi.fn().mockResolvedValue({
    triggers: ['pre-test nights'],
    patterns: ['evening dips'],
    burnoutScore: 55,
    suggestedAction: 'wind down',
    distressLevel: 'moderate',
  }),
}));
vi.mock('@/lib/data/seed', () => ({ seedDemoData: vi.fn().mockResolvedValue(8) }));

import {
  useAddEntry,
  useDeleteAll,
  useEntries,
  useGenerateInsight,
  useProfile,
  useSeedDemo,
} from './queries';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => vi.clearAllMocks());

describe('query hooks', () => {
  it('useProfile loads the profile', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    await waitFor(() => expect(result.current.data?.displayName).toBe('Asha'));
  });

  it('useEntries loads entries', async () => {
    const { result } = renderHook(() => useEntries(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
  });

  it('useAddEntry persists an entry', async () => {
    const { result } = renderHook(() => useAddEntry(), { wrapper });
    await result.current.mutateAsync({ body: 'new', moodScore: 3 });
    expect(repo.addEntry).toHaveBeenCalledWith({ body: 'new', moodScore: 3 });
  });

  it('useGenerateInsight analyzes and saves', async () => {
    const { result } = renderHook(() => useGenerateInsight(), { wrapper });
    await result.current.mutateAsync();
    expect(repo.saveInsight).toHaveBeenCalledWith(
      expect.objectContaining({ burnoutScore: 55, distressLevel: 'moderate' }),
    );
  });

  it('useSeedDemo seeds demo data', async () => {
    const { result } = renderHook(() => useSeedDemo(), { wrapper });
    const count = await result.current.mutateAsync();
    expect(count).toBe(8);
  });

  it('useDeleteAll clears data', async () => {
    const { result } = renderHook(() => useDeleteAll(), { wrapper });
    await result.current.mutateAsync();
    expect(repo.deleteAll).toHaveBeenCalled();
  });
});
