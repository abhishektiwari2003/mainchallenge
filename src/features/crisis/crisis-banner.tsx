'use client';

import { LifeBuoy, Phone } from 'lucide-react';
import { HELPLINES, NOT_A_THERAPIST_DISCLAIMER } from '@/lib/crisis/helplines';

/**
 * Persistent, accessible crisis support panel. Rendered when the crisis
 * detector flags acute distress. Uses `role="alert"` so screen readers
 * announce it immediately.
 */
export function CrisisBanner() {
  return (
    <section
      role="alert"
      aria-label="Crisis support"
      className="animate-fade-in rounded-2xl border-2 border-destructive/60 bg-destructive/10 p-5"
    >
      <div className="flex items-center gap-2 text-destructive">
        <LifeBuoy aria-hidden="true" className="h-5 w-5" />
        <h2 className="text-base font-semibold">You don&rsquo;t have to go through this alone</h2>
      </div>
      <p className="mt-2 text-sm text-foreground">
        It sounds like you&rsquo;re carrying something really heavy right now. Please consider
        reaching out to a trained, caring human — free and confidential, any time:
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {HELPLINES.map((line) => (
          <li key={line.name}>
            <a
              href={`tel:${line.dial}`}
              aria-label={`Call ${line.name} at ${line.number}`}
              className="flex h-full flex-col gap-1 rounded-xl border border-destructive/40 bg-background/60 p-3 transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Phone aria-hidden="true" className="h-4 w-4" />
                {line.name}
              </span>
              <span className="text-sm font-semibold text-destructive">{line.number}</span>
              <span className="text-xs text-muted-foreground">
                {line.description} · {line.hours}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">{NOT_A_THERAPIST_DISCLAIMER}</p>
    </section>
  );
}
