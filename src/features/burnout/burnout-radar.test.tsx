import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BurnoutRadar } from './burnout-radar';
import type { JournalEntry, MoodScore } from '@/lib/types';

function entry(daysAgo: number, mood: MoodScore, body = 'study day'): JournalEntry {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return { id: `${daysAgo}`, userId: 'u', body, moodScore: mood, createdAt: date.toISOString() };
}

describe('BurnoutRadar', () => {
  it('renders the score, band, and an accessible chart label', () => {
    const entries = [entry(3, 2, 'hopeless and overwhelmed'), entry(2, 2), entry(1, 1)];
    render(<BurnoutRadar entries={entries} />);
    expect(screen.getByText('Burnout Radar')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /burnout radar chart/i })).toBeInTheDocument();
  });

  it('provides a screen-reader data table for the trend', () => {
    render(<BurnoutRadar entries={[entry(1, 3)]} />);
    expect(screen.getByText(/Mood and distress by date/i)).toBeInTheDocument();
  });
});
