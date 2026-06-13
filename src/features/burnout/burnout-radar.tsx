'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { bandForScore, buildMoodTrend, computeBurnoutScore } from '@/lib/burnout/score';
import { formatShortDate } from '@/lib/utils';
import type { JournalEntry } from '@/lib/types';

const BAND_LABEL: Record<ReturnType<typeof bandForScore>, string> = {
  low: 'Low risk',
  guarded: 'Guarded',
  elevated: 'Elevated',
  high: 'High risk',
};

const BAND_VARIANT: Record<
  ReturnType<typeof bandForScore>,
  'success' | 'secondary' | 'warning' | 'destructive'
> = {
  low: 'success',
  guarded: 'secondary',
  elevated: 'warning',
  high: 'destructive',
};

/**
 * Burnout Radar: a trend dashboard that flags burnout risk early by overlaying
 * mood and detected distress over time. Lazy-loaded so Recharts stays off the
 * initial bundle.
 */
export function BurnoutRadar({ entries }: { entries: JournalEntry[] }) {
  const burnout = computeBurnoutScore(entries);
  const trend = buildMoodTrend(entries).map((p) => ({
    ...p,
    label: formatShortDate(p.date),
  }));

  const chartSummary =
    trend.length > 0
      ? `Mood ranged across ${trend.length} entries; latest mood ${trend[trend.length - 1]!.mood} of 5.`
      : 'No entries to chart yet.';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Burnout Radar</CardTitle>
            <CardDescription>Early-warning trend across mood and distress.</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold tabular-nums">{burnout.score}</div>
            <Badge variant={BAND_VARIANT[burnout.band]}>{BAND_LABEL[burnout.band]}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <figure
          role="img"
          aria-label={`Burnout radar chart. ${chartSummary} Burnout score ${burnout.score} of 100 (${BAND_LABEL[burnout.band]}).`}
        >
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mood"
                  name="Mood"
                  stroke="hsl(var(--primary))"
                  fill="url(#moodFill)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="distress"
                  name="Distress"
                  stroke="hsl(var(--destructive))"
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <figcaption className="sr-only">
            <table>
              <caption>Mood and distress by date</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Mood (1-5)</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((p) => (
                  <tr key={p.date}>
                    <td>{p.label}</td>
                    <td>{p.mood}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figcaption>
        </figure>

        <div>
          <h3 className="text-sm font-medium">Contributing signals</h3>
          <ul className="mt-1 flex flex-wrap gap-2">
            {burnout.factors.map((factor) => (
              <li key={factor}>
                <Badge variant="outline">{factor}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
