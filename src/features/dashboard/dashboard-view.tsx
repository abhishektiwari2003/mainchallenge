'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { MoodOrb } from '@/components/mood-orb';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightsPanel } from '@/features/insights/insights-panel';
import { useEntries, useProfile, useSeedDemo } from '@/lib/hooks/queries';

// PERF: lazy-loaded — the Recharts-powered Burnout Radar is code-split with
// next/dynamic (ssr: false) so the heavy charting library stays off the
// initial bundle and only loads on the dashboard.
const BurnoutRadar = dynamic(
  () => import('@/features/burnout/burnout-radar').then((m) => m.BurnoutRadar),
  {
    ssr: false,
    loading: () => (
      <Card aria-busy="true" aria-label="Loading Burnout Radar">
        <CardContent className="space-y-4 p-6">
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-56 w-full animate-pulse rounded-xl bg-muted/60" />
          <div className="flex gap-2">
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    ),
  },
);

export function DashboardView() {
  const { data: profile } = useProfile();
  const { data: entries = [] } = useEntries();
  const seed = useSeedDemo();
  // PERF: memoized derivation so the mood orb only recolors when entries change.
  const latestMood = React.useMemo(() => entries[0]?.moodScore ?? 3, [entries]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <MoodOrb mood={latestMood} size={88} label={`Your companion, reflecting a calm mood`} />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile ? `Hello, ${profile.displayName}` : 'Hello'} 👋
          </h1>
          <p className="max-w-prose text-muted-foreground">
            {profile
              ? `You're preparing for ${profile.examType}. Let's check in — the hidden stress triggers your journaling reveals might surprise you.`
              : 'Let\u2019s check in with how you\u2019re really doing.'}
          </p>
        </div>
      </section>

      {entries.length === 0 && (
        <Card className="surface-hover animate-fade-in border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardHeader>
            <CardTitle className="text-base">See MindMirror in action</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Load a sample week of entries to watch the Pattern Engine uncover a hidden trigger.
            </p>
            <Button
              onClick={() => seed.mutate()}
              disabled={seed.isPending}
              variant="secondary"
              aria-label="Load 7-day demo journal"
            >
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Load 7-day demo
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsPanel />
        <BurnoutRadar entries={entries} />
      </div>

      <Card className="surface-hover">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-medium">Need to talk it through?</h2>
            <p className="text-sm text-muted-foreground">
              Your companion knows your exam and history, and is here any time.
            </p>
          </div>
          <Link
            href="/chat"
            aria-label="Open companion chat"
            className={buttonVariants({ variant: 'outline' })}
          >
            Open companion chat
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
