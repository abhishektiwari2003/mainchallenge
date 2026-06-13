import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithClient } from '@/test/utils';
import { AppShell } from './app-shell';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ replace }),
}));

const repo = {
  getProfile: vi.fn().mockResolvedValue({
    id: 'u',
    examType: 'NEET',
    displayName: 'Asha',
    tonePref: 'gentle',
    consentAt: null,
  }),
  deleteAll: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/lib/data/repo', () => ({ getRepo: () => repo }));

beforeEach(() => vi.clearAllMocks());

describe('AppShell', () => {
  it('renders primary navigation and children', async () => {
    renderWithClient(
      <AppShell>
        <p>Inner content</p>
      </AppShell>,
    );
    expect(await screen.findByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /journal/i })).toBeInTheDocument();
    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  it('exposes a delete-all-data control and crisis number', async () => {
    renderWithClient(
      <AppShell>
        <p>x</p>
      </AppShell>,
    );
    expect(await screen.findByRole('button', { name: /delete all my data/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '14416' })).toBeInTheDocument();
  });
});
