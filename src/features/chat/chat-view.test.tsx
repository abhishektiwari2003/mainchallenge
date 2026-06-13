import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithClient } from '@/test/utils';
import { ChatView } from './chat-view';
import type { Profile } from '@/lib/types';

const profile: Profile = {
  id: 'user-1',
  examType: 'NEET',
  displayName: 'Asha',
  tonePref: 'gentle',
  consentAt: new Date().toISOString(),
};

const addMessage = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/data/repo', () => ({
  getRepo: () => ({
    getProfile: async () => profile,
    listMessages: async () => [],
    listInsights: async () => [],
    addMessage,
  }),
}));

const streamMock = vi.fn();
vi.mock('@/lib/api', () => ({
  streamCompanionReply: (args: { onChunk: (t: string) => void }) => streamMock(args),
}));

beforeEach(() => {
  addMessage.mockClear();
  streamMock.mockReset();
});

describe('ChatView', () => {
  it('greets the student with exam-aware copy', async () => {
    renderWithClient(<ChatView />);
    expect(await screen.findByText(/NEET prep is feeling/i)).toBeInTheDocument();
  });

  it('streams a companion reply and renders it', async () => {
    streamMock.mockImplementation(async (args: { onChunk: (t: string) => void }) => {
      args.onChunk('Take a slow breath. ');
      args.onChunk('You are doing better than you think.');
      return 'Take a slow breath. You are doing better than you think.';
    });

    const user = userEvent.setup();
    renderWithClient(<ChatView />);
    await screen.findByText(/NEET prep is feeling/i);

    await user.type(screen.getByLabelText(/message your companion/i), 'I feel behind on revision');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() =>
      expect(screen.getByText(/doing better than you think/i)).toBeInTheDocument(),
    );
    expect(streamMock).toHaveBeenCalledOnce();
    expect(addMessage).toHaveBeenCalledWith({ role: 'user', content: 'I feel behind on revision' });
  });

  it('shows the crisis banner when the student expresses acute distress', async () => {
    streamMock.mockResolvedValue('I hear you. Please reach out to someone right now.');
    const user = userEvent.setup();
    renderWithClient(<ChatView />);
    await screen.findByText(/NEET prep is feeling/i);

    await user.type(screen.getByLabelText(/message your companion/i), 'I want to die');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/14416/)).toBeInTheDocument();
  });
});
