'use client';

import { Lightbulb, Loader2, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CrisisBanner } from '@/features/crisis/crisis-banner';
import { useEntries, useGenerateInsight, useInsights } from '@/lib/hooks/queries';

/**
 * Mirror Insights: a Generative AI analysis of open-ended journaling and mood
 * logs that surfaces the hidden stress triggers and emotional patterns that
 * standard trackers miss. Leads with the "hidden trigger" reveal.
 */
export function InsightsPanel() {
  const { data: insights = [] } = useInsights();
  const { data: entries = [] } = useEntries();
  const generate = useGenerateInsight();
  const latest = insights[0] ?? null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="h-5 w-5 text-primary" />
              Mirror Insights
            </CardTitle>
            <CardDescription>
              Hidden stress triggers and emotional patterns that standard trackers miss.
            </CardDescription>
          </div>
          <Button
            onClick={() => generate.mutate()}
            disabled={generate.isPending || entries.length === 0}
            aria-label={latest ? 'Re-analyze journal for hidden patterns' : 'Analyze my journal'}
          >
            {generate.isPending ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles aria-hidden="true" className="h-4 w-4" />
            )}
            {latest ? 'Re-analyze journal' : 'Analyze my journal'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div aria-live="polite">
          {generate.isError && (
            <p role="alert" className="text-sm text-destructive">
              {(generate.error as Error).message}
            </p>
          )}
          {generate.isPending && (
            <p className="text-sm text-muted-foreground">Reading between the lines…</p>
          )}
        </div>

        {!latest && !generate.isPending && (
          <p className="text-sm text-muted-foreground">
            {entries.length === 0
              ? 'Add a few journal entries, then run an analysis to reveal your hidden patterns.'
              : 'Run an analysis to reveal hidden stress triggers across your entries.'}
          </p>
        )}

        {latest && (
          <>
            {latest.distressLevel === 'acute' && <CrisisBanner />}

            <section aria-label="Hidden stress triggers" className="animate-fade-in">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb aria-hidden="true" className="h-4 w-4 text-warning" />
                Hidden triggers
              </h3>
              <ul className="mt-2 space-y-2">
                {latest.triggers.map((trigger) => (
                  <li
                    key={trigger}
                    className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm transition-colors hover:bg-warning/10"
                  >
                    {trigger}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Emotional patterns">
              <h3 className="text-sm font-semibold">Patterns over time</h3>
              <ul className="mt-2 space-y-2">
                {latest.patterns.map((pattern) => (
                  <li key={pattern} className="text-sm text-muted-foreground">
                    • {pattern}
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-label="Suggested coping action"
              className="animate-fade-in rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-4"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Target aria-hidden="true" className="h-4 w-4 text-primary" />
                Try this next
              </h3>
              <p className="mt-1 text-sm text-foreground">{latest.suggestedAction}</p>
              <div className="mt-2">
                <Badge variant="outline">Burnout estimate: {latest.burnoutScore}/100</Badge>
              </div>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
