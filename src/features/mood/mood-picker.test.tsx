import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MoodPicker } from './mood-picker';

describe('MoodPicker', () => {
  it('renders an accessible radiogroup with five options', () => {
    render(<MoodPicker value={3} onChange={() => {}} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('marks the selected mood as checked', () => {
    render(<MoodPicker value={5} onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: /Great/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange when a mood is selected', async () => {
    const onChange = vi.fn();
    render(<MoodPicker value={3} onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: /Struggling/ }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MoodPicker value={3} onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
