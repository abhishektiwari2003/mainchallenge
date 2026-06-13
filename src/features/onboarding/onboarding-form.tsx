'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { MoodOrb } from '@/components/mood-orb';
import { useSaveProfile } from '@/lib/hooks/queries';
import { profileSchema } from '@/lib/validation/schemas';
import { EXAM_TYPES, TONE_PREFS, type ExamType, type TonePref } from '@/lib/types';

const TONE_LABELS: Record<TonePref, string> = {
  gentle: 'Gentle & reassuring',
  motivational: 'Motivational & energizing',
  practical: 'Practical & concrete',
};

/** Onboarding: name the exam, choose a tone, give explicit consent. */
export function OnboardingForm() {
  const router = useRouter();
  const saveProfile = useSaveProfile();

  const [displayName, setDisplayName] = React.useState('');
  const [examType, setExamType] = React.useState<ExamType>('NEET');
  const [tonePref, setTonePref] = React.useState<TonePref>('gentle');
  const [consent, setConsent] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = profileSchema.safeParse({ displayName, examType, tonePref, consent });
    if (!result.success) {
      setErrors(result.error.issues.map((i) => i.message));
      return;
    }
    setErrors([]);
    await saveProfile.mutateAsync({ displayName, examType, tonePref, consent });
    router.replace('/dashboard');
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader className="items-center text-center">
        <MoodOrb size={72} mood={4} />
        <CardTitle className="text-2xl">Welcome to MindMirror</CardTitle>
        <CardDescription>
          A reflective companion that helps you understand the stress behind the studying.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" aria-label="Onboarding">
          <div className="space-y-2">
            <Label htmlFor="name">What should we call you?</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your first name"
              autoComplete="given-name"
              required
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Which exam are you preparing for?</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Exam">
              {EXAM_TYPES.map((exam) => (
                <button
                  key={exam}
                  type="button"
                  role="radio"
                  aria-checked={examType === exam}
                  onClick={() => setExamType(exam)}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    examType === exam
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50',
                  )}
                >
                  {exam}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">How should your companion talk to you?</legend>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Tone">
              {TONE_PREFS.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  role="radio"
                  aria-checked={tonePref === tone}
                  onClick={() => setTonePref(tone)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    tonePref === tone
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50',
                  )}
                >
                  {TONE_LABELS[tone]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
                aria-describedby="consent-detail"
              />
              <span>
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 text-primary" />I consent to
                  MindMirror storing my journal privately
                </span>
                <span id="consent-detail" className="mt-1 block text-muted-foreground">
                  Your entries are private to you. Only the text you analyze is sent to the AI
                  provider for that request. You can delete everything at any time.
                </span>
              </span>
            </label>
          </div>

          {errors.length > 0 && (
            <ul role="alert" className="space-y-1 text-sm text-destructive">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending && (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            )}
            Start reflecting
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
