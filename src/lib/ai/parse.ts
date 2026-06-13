import { z } from 'zod';
import type { Insight } from '@/lib/types';
import { DISTRESS_LEVELS } from '@/lib/types';

/** Zod schema validating the model's structured insight output. */
export const insightSchema = z.object({
  triggers: z.array(z.string().min(1)).max(8),
  patterns: z.array(z.string().min(1)).max(8),
  burnoutScore: z.number().min(0).max(100),
  suggestedAction: z.string().min(1).max(600),
  distressLevel: z.enum(DISTRESS_LEVELS),
});

export type InsightParseResult = { ok: true; insight: Insight } | { ok: false; error: string };

/**
 * Extract the first balanced top-level JSON object from a string. Tolerates
 * surrounding prose or markdown fences the model may add despite instructions.
 */
export function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < raw.length; i += 1) {
    const ch = raw[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return raw.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Parse and validate a raw model response into a typed `Insight`. Never throws;
 * returns a discriminated result so callers handle failure explicitly.
 */
export function parseInsightResponse(raw: string): InsightParseResult {
  const json = extractJsonObject(raw);
  if (!json) return { ok: false, error: 'No JSON object found in model response.' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Model response was not valid JSON.' };
  }

  const result = insightSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: 'Model JSON did not match the expected schema.' };
  }

  return {
    ok: true,
    insight: { ...result.data, burnoutScore: Math.round(result.data.burnoutScore) },
  };
}
