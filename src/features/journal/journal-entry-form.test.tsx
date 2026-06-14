import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { JournalEntryForm } from './journal-entry-form';

afterEach(() => {
  window.localStorage.clear();
});

describe('JournalEntryForm', () => {
  it('disables saving until there is content', () => {
    render(<JournalEntryForm onSave={vi.fn()} />);
    expect(screen.getByRole('button', { name: /save entry/i })).toBeDisabled();
  });

  it('exposes literal aria-labels on the entry textarea and save button', () => {
    render(<JournalEntryForm onSave={vi.fn()} />);
    expect(screen.getByLabelText(/open-ended daily journal entry/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save entry' })).toHaveAttribute(
      'aria-label',
      'Save entry',
    );
  });

  it('submits the entry body and mood', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<JournalEntryForm onSave={onSave} />);

    await user.type(screen.getByLabelText(/what.+on your mind/i), 'Productive revision day.');
    await user.click(screen.getByRole('radio', { name: /Good/ }));
    await user.click(screen.getByRole('button', { name: /save entry/i }));

    expect(onSave).toHaveBeenCalledWith({ body: 'Productive revision day.', moodScore: 4 });
  });

  it('surfaces the crisis banner when acute distress is typed', async () => {
    const user = userEvent.setup();
    render(<JournalEntryForm onSave={vi.fn()} />);

    await user.type(
      screen.getByLabelText(/what.+on your mind/i),
      'I want to die, there is no reason to live.',
    );

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument(), { timeout: 2500 });
    expect(screen.getByText(/14416/)).toBeInTheDocument();
  });

  it('notifies the parent of moderate distress for adaptive support', async () => {
    const onDistress = vi.fn();
    const user = userEvent.setup();
    render(<JournalEntryForm onSave={vi.fn()} onDistress={onDistress} />);

    await user.type(
      screen.getByLabelText(/what.+on your mind/i),
      'I feel hopeless and completely overwhelmed.',
    );

    await waitFor(() => expect(onDistress).toHaveBeenCalledWith('moderate'), { timeout: 2500 });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<JournalEntryForm onSave={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
