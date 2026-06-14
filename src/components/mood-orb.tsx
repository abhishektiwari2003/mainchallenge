'use client';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import type { MoodScore } from '@/lib/types';

const MOOD_GRADIENT: Record<MoodScore, string> = {
  1: 'from-rose-400/80 via-rose-500/60 to-red-700/60',
  2: 'from-amber-300/80 via-orange-400/60 to-orange-700/55',
  3: 'from-sky-400/70 via-indigo-400/55 to-indigo-600/50',
  4: 'from-teal-300/80 via-teal-400/65 to-emerald-600/60',
  5: 'from-emerald-200/90 via-teal-300/75 to-teal-500/70',
};

const MOOD_GLOW: Record<MoodScore, string> = {
  1: 'shadow-rose-500/30',
  2: 'shadow-amber-500/30',
  3: 'shadow-indigo-500/30',
  4: 'shadow-teal-500/30',
  5: 'shadow-emerald-400/40',
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
        'relative flex items-center justify-center rounded-full bg-gradient-to-br shadow-xl',
        MOOD_GRADIENT[mood],
        MOOD_GLOW[mood],
        !reduced && 'animate-orb-breathe',
        className,
      )}
      style={{ width: size, height: size }}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Soft outer halo */}
      <div
        aria-hidden="true"
        className="absolute -inset-2 rounded-full bg-gradient-to-br opacity-40 blur-xl"
        style={{ backgroundImage: 'inherit' }}
      />
      {/* Inner glass core */}
      <div className="absolute inset-2 rounded-full bg-background/10 backdrop-blur-sm" />
      {/* Specular highlight */}
      <div className="absolute left-[22%] top-[20%] h-1/4 w-1/4 rounded-full bg-white/50 blur-[2px]" />
    </div>
  );
}
