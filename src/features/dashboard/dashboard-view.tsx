'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { MoodOrb } from '@/components/mood-orb';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightsPanel } from '@/features/insights/insights-panel';
import { useEntries, useProfile, useSeedDemo } from '@/lib/hooks/queries';

// Lazy-load the charting feature so Recharts stays off the initial bundle.
const BurnoutRadar = dynamic(
  () => import('@/features/burnout/burnout-radar').then((m) => m.BurnoutRadar),
  {
    ssr: false,
    loading: () => (
      <Card aria-busy="true">
        <CardContent className="flex h-80 items-center justify-center text-sm text-muted-foreground">
          Loading your trends…
        </CardContent>
      </Card>
    ),
  },
);

export function DashboardView() {
  const { data: profile } = useProfile();
  const { data: entries = [] } = useEntries();
  const seed = useSeedDemo();
  const latestMood = entries[0]?.moodScore ?? 3;

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
              ? `You're preparing for ${profile.examType}. Let's check in — what your journal reveals might surprise you.`
              : 'Let\u2019s check in with how you\u2019re really doing.'}
          </p>
        </div>
      </section>

      {entries.length === 0 && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">See MindMirror in action</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Load a sample week of entries to watch the Pattern Engine uncover a hidden trigger.
            </p>
            <Button onClick={() => seed.mutate()} disabled={seed.isPending} variant="secondary">
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

      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-medium">Need to talk it through?</h2>
            <p className="text-sm text-muted-foreground">
              Your companion knows your exam and history, and is here any time.
            </p>
          </div>
          <Link href="/chat" className={buttonVariants({ variant: 'outline' })}>
            Open companion chat
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
