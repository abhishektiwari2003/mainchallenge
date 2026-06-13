'use client';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import type { MoodScore } from '@/lib/types';

const MOOD_GRADIENT: Record<MoodScore, string> = {
  1: 'from-rose-500/70 to-red-700/60',
  2: 'from-amber-500/70 to-orange-700/60',
  3: 'from-sky-500/60 to-indigo-600/50',
  4: 'from-teal-400/70 to-emerald-600/60',
  5: 'from-emerald-300/80 to-teal-500/70',
};

export interface MoodOrbProps {
  mood?: MoodScore;
  size?: number;
  className?: string;
  /** Decorative by default; pass a label to expose it to assistive tech. */
  label?: string;
}

/**
 * The MindMirror mascot: a soft orb that gently breathes and reflects the
 * current mood via color. Animation is disabled under prefers-reduced-motion.
 */
export function MoodOrb({ mood = 3, size = 96, className, label }: MoodOrbProps) {
  const reduced = useReducedMotion();
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br shadow-lg',
        MOOD_GRADIENT[mood],
        !reduced && 'animate-orb-breathe',
        className,
      )}
      style={{ width: size, height: size }}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <div className="absolute inset-2 rounded-full bg-background/10 backdrop-blur-sm" />
      <div className="absolute left-1/4 top-1/4 h-1/4 w-1/4 rounded-full bg-white/40 blur-[2px]" />
    </div>
  );
}
