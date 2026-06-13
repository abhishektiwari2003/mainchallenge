import { AppShell } from '@/components/app-shell';
import { JournalView } from '@/features/journal/journal-view';

export default function JournalPage() {
  return (
    <AppShell>
      <JournalView />
    </AppShell>
  );
}
