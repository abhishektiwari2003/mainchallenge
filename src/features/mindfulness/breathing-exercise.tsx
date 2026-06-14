'use client';

import * as React from 'react';
import { Wind, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import type { DistressLevel } from '@/lib/types';

interface Phase {
  label: string;
  seconds: number;
}

/** Box breathing (calming) vs. a longer exhale (down-regulating) by severity. */
function phasesFor(level: DistressLevel): Phase[] {
  if (level === 'acute' || level === 'moderate') {
    return [
      { label: 'Breathe in', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Breathe out slowly', seconds: 6 },
    ];
  }
  return [
    { label: 'Breathe in', seconds: 4 },
    { label: 'Breathe out', seconds: 4 },
  ];
}

export interface BreathingExerciseProps {
  level?: DistressLevel;
  onClose?: () => void;
}

/**
 * Adaptive mindfulness: a breathing/grounding exercise whose pattern adapts to
 * the detected distress level, paired with motivational encouragement. Under
 * prefers-reduced-motion the orb stays still and only the text cue changes, so
 * it never overwhelms an anxious user.
 */
export function BreathingExercise({ level = 'mild', onClose }: BreathingExerciseProps) {
  const reduced = useReducedMotion();
  // PERF: memoized — the breathing pattern only recomputes when severity changes.
  const phases = React.useMemo(() => phasesFor(level), [level]);
  const [phaseIndex, setPhaseIndex] = React.useState(0);

  React.useEffect(() => {
    const current = phases[phaseIndex] ?? phases[0]!;
    const id = setTimeout(
      () => setPhaseIndex((i) => (i + 1) % phases.length),
      current.seconds * 1000,
    );
    return () => clearTimeout(id);
  }, [phaseIndex, phases]);

  const current = phases[phaseIndex] ?? phases[0]!;
  const expanding = current.label.toLowerCase().includes('in') || current.label === 'Hold';

  return (
    <Card aria-label="Guided breathing exercise" className="border-primary/40">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wind aria-hidden="true" className="h-4 w-4 text-primary" />A moment to breathe
        </CardTitle>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close breathing exercise"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <div
          aria-hidden="true"
          className={cn(
            'flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-accent/40',
            !reduced && 'transition-transform ease-in-out [transition-duration:4000ms]',
            !reduced && (expanding ? 'scale-110' : 'scale-90'),
          )}
        >
          <div className="h-24 w-24 rounded-full bg-background/30" />
        </div>
        <p role="status" aria-live="polite" className="text-xl font-medium text-foreground">
          {current.label}
        </p>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Follow the rhythm for a few rounds. There&rsquo;s nothing else you need to do right now.
        </p>
      </CardContent>
    </Card>
  );
}
