import { AppShell } from '@/components/app-shell';
import { ChatView } from '@/features/chat/chat-view';

export default function ChatPage() {
  return (
    <AppShell>
      <ChatView />
    </AppShell>
  );
}
