import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { BreathingExercise } from './breathing-exercise';

describe('BreathingExercise', () => {
  it('shows a breathing cue via a live region', () => {
    render(<BreathingExercise level="moderate" />);
    expect(screen.getByRole('status')).toHaveTextContent(/breathe in/i);
  });

  it('can be dismissed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<BreathingExercise level="mild" onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /close breathing exercise/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<BreathingExercise level="acute" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
