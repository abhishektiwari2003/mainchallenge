import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { EntryList } from './entry-list';
import type { JournalEntry } from '@/lib/types';

const entries: JournalEntry[] = [
  {
    id: '1',
    userId: 'u',
    body: 'A calm day of revision.',
    moodScore: 4,
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: '2',
    userId: 'u',
    body: 'Anxious before mocks.',
    moodScore: 2,
    createdAt: '2026-06-02T10:00:00.000Z',
  },
];

describe('EntryList', () => {
  it('renders an empty state', () => {
    render(<EntryList entries={[]} />);
    expect(screen.getByText(/no entries yet/i)).toBeInTheDocument();
  });

  it('renders each entry with its mood', () => {
    render(<EntryList entries={entries} />);
    expect(screen.getByText('A calm day of revision.')).toBeInTheDocument();
    expect(screen.getByText('Anxious before mocks.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<EntryList entries={entries} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
