'use client';

import { cn } from '@/lib/utils';
import { ALL_MOODS } from '@/lib/mood/parser';
import type { MoodScore } from '@/lib/types';

export interface MoodPickerProps {
  value: MoodScore;
  onChange: (value: MoodScore) => void;
  /** Accessible group label. */
  label?: string;
}

/**
 * A keyboard-accessible mood pulse selector implemented as a radiogroup.
 */
export function MoodPicker({ value, onChange, label = 'How are you feeling?' }: MoodPickerProps) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {ALL_MOODS.map((mood) => {
        const selected = mood.score === value;
        return (
          <button
            key={mood.score}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${mood.label} (${mood.score} of 5)`}
            onClick={() => onChange(mood.score)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              selected
                ? 'border-primary bg-primary/15 text-foreground'
                : 'border-border bg-background/40 text-muted-foreground hover:border-primary/50',
            )}
          >
            <span aria-hidden="true" className="text-2xl">
              {mood.emoji}
            </span>
            <span>{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}
