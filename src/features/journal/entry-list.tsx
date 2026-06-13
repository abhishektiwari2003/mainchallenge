'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatShortDate } from '@/lib/utils';
import { moodMeta } from '@/lib/mood/parser';
import type { JournalEntry } from '@/lib/types';

export function EntryList({ entries }: { entries: JournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No entries yet. Your reflections will appear here.
      </p>
    );
  }

  return (
    <ol className="space-y-3" aria-label="Past journal entries">
      {entries.map((entry) => {
        const mood = moodMeta(entry.moodScore);
        return (
          <li key={entry.id}>
            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <time dateTime={entry.createdAt}>{formatShortDate(entry.createdAt)}</time>
                  <span className={mood.tone}>
                    <span aria-hidden="true">{mood.emoji}</span> {mood.label}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground">{entry.body}</p>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
