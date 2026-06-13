import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithClient } from '@/test/utils';
import { JournalView } from './journal-view';

const repo = {
  listEntries: vi.fn().mockResolvedValue([]),
  addEntry: vi.fn().mockResolvedValue({}),
};

vi.mock('@/lib/data/repo', () => ({ getRepo: () => repo }));

beforeEach(() => vi.clearAllMocks());

describe('JournalView', () => {
  it('renders the journaling surface and history heading', async () => {
    renderWithClient(<JournalView />);
    expect(await screen.findByText('Reflective journaling')).toBeInTheDocument();
    expect(screen.getByText(/recent entries/i)).toBeInTheDocument();
  });
});
