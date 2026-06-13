import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { CrisisBanner } from './crisis-banner';

describe('CrisisBanner', () => {
  it('shows verified helplines and a non-clinical disclaimer', () => {
    render(<CrisisBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/14416/)).toBeInTheDocument();
    expect(screen.getByText('AASRA')).toBeInTheDocument();
    expect(screen.getByText(/not a therapist/i)).toBeInTheDocument();
  });

  it('renders dialable tel links', () => {
    render(<CrisisBanner />);
    const link = screen.getByRole('link', { name: /Tele-MANAS/i });
    expect(link).toHaveAttribute('href', 'tel:14416');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CrisisBanner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
