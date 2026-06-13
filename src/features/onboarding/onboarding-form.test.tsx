import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithClient } from '@/test/utils';
import { OnboardingForm } from './onboarding-form';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const saveProfile = vi.fn().mockResolvedValue({});
vi.mock('@/lib/data/repo', () => ({
  getRepo: () => ({ getProfile: vi.fn().mockResolvedValue(null), saveProfile }),
}));

beforeEach(() => vi.clearAllMocks());

describe('OnboardingForm', () => {
  it('blocks submission without consent and shows an error', async () => {
    const user = userEvent.setup();
    renderWithClient(<OnboardingForm />);
    await user.type(screen.getByLabelText(/what should we call you/i), 'Asha');
    await user.click(screen.getByRole('button', { name: /start reflecting/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(saveProfile).not.toHaveBeenCalled();
  });

  it('saves a complete profile and navigates to the dashboard', async () => {
    const user = userEvent.setup();
    renderWithClient(<OnboardingForm />);
    await user.type(screen.getByLabelText(/what should we call you/i), 'Asha');
    await user.click(screen.getByRole('radio', { name: 'JEE' }));
    await user.click(screen.getByRole('radio', { name: /motivational/i }));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /start reflecting/i }));

    await waitFor(() =>
      expect(saveProfile).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'Asha', examType: 'JEE', tonePref: 'motivational' }),
      ),
    );
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithClient(<OnboardingForm />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
