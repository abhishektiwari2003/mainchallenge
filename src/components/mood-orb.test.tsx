import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MoodOrb } from './mood-orb';

describe('MoodOrb', () => {
  it('exposes a label to assistive tech when provided', () => {
    render(<MoodOrb mood={4} label="Calm companion" />);
    expect(screen.getByRole('img', { name: 'Calm companion' })).toBeInTheDocument();
  });

  it('is decorative (hidden) without a label', () => {
    const { container } = render(<MoodOrb mood={3} />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
