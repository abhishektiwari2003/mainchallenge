'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalEntryForm } from '@/features/journal/journal-entry-form';
import { EntryList } from '@/features/journal/entry-list';
import { BreathingExercise } from '@/features/mindfulness/breathing-exercise';
import { useAddEntry, useEntries } from '@/lib/hooks/queries';
import type { DistressLevel } from '@/lib/types';

/** The journaling page body: write entries, see history, get calming support. */
export function JournalView() {
  const { data: entries = [] } = useEntries();
  const addEntry = useAddEntry();
  const [distress, setDistress] = React.useState<DistressLevel | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Reflective journaling</CardTitle>
            <CardDescription>
              Write openly. MindMirror analyzes patterns over time — it never judges a single day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JournalEntryForm
              isSaving={addEntry.isPending}
              onSave={async (input) => {
                await addEntry.mutateAsync(input);
              }}
              onDistress={setDistress}
            />
          </CardContent>
        </Card>

        {distress && (distress === 'moderate' || distress === 'acute') && (
          <BreathingExercise level={distress} onClose={() => setDistress(null)} />
        )}
      </div>

      <section aria-label="Journal history" className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Recent entries</h2>
        <EntryList entries={entries} />
      </section>
    </div>
  );
}
