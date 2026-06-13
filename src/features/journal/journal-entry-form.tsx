'use client';

import * as React from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MoodPicker } from '@/features/mood/mood-picker';
import { CrisisBanner } from '@/features/crisis/crisis-banner';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { detectCrisis } from '@/lib/crisis/detector';
import type { MoodScore } from '@/lib/types';

const DRAFT_KEY = 'mindmirror:draft';
const MAX_LEN = 5000;

export interface JournalEntryFormProps {
  onSave: (input: { body: string; moodScore: MoodScore }) => Promise<void> | void;
  isSaving?: boolean;
  /** Surface a calming exercise when moderate+ distress is detected. */
  onDistress?: (level: ReturnType<typeof detectCrisis>['level']) => void;
}

/**
 * Free-text journaling form with a quick mood pulse. Drafts autosave (debounced)
 * to localStorage so nothing is lost, and live crisis detection surfaces the
 * safety layer instantly as the student types.
 */
export function JournalEntryForm({ onSave, isSaving = false, onDistress }: JournalEntryFormProps) {
  const [body, setBody] = React.useState('');
  const [mood, setMood] = React.useState<MoodScore>(3);
  const [draftStatus, setDraftStatus] = React.useState('');
  const debouncedBody = useDebouncedValue(body, 800);

  React.useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY);
    if (saved) setBody(saved);
  }, []);

  React.useEffect(() => {
    if (debouncedBody.length === 0) {
      window.localStorage.removeItem(DRAFT_KEY);
      setDraftStatus('');
      return;
    }
    window.localStorage.setItem(DRAFT_KEY, debouncedBody);
    setDraftStatus('Draft saved');
  }, [debouncedBody]);

  const crisis = React.useMemo(() => detectCrisis(debouncedBody), [debouncedBody]);

  React.useEffect(() => {
    if (crisis.level === 'moderate' || crisis.level === 'acute') onDistress?.(crisis.level);
  }, [crisis.level, onDistress]);

  const trimmed = body.trim();
  const canSave = trimmed.length > 0 && trimmed.length <= MAX_LEN && !isSaving;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    await onSave({ body: trimmed, moodScore: mood });
    setBody('');
    setMood(3);
    window.localStorage.removeItem(DRAFT_KEY);
    setDraftStatus('Entry saved');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="New journal entry">
      <div className="space-y-2">
        <Label htmlFor="journal-body">What&rsquo;s on your mind today?</Label>
        <Textarea
          id="journal-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={MAX_LEN}
          placeholder="Write freely — about studying, pressure, wins, worries… MindMirror reads between the lines."
          aria-describedby="journal-help char-count"
          className="min-h-[160px]"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span id="journal-help">Your words stay private to you.</span>
          <span id="char-count" aria-live="off">
            {trimmed.length}/{MAX_LEN}
          </span>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Quick mood pulse</legend>
        <MoodPicker value={mood} onChange={setMood} />
      </fieldset>

      {crisis.isAcute && <CrisisBanner />}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!canSave}>
          {isSaving ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="h-4 w-4" />
          )}
          Save entry
        </Button>
        <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
          {draftStatus}
        </span>
      </div>
    </form>
  );
}
