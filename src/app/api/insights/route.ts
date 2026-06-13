import { generateText } from '@/lib/ai/client';
import { buildInsightPrompt } from '@/lib/ai/prompts/insight';
import { parseInsightResponse } from '@/lib/ai/parse';
import { detectCrisis, maxDistress } from '@/lib/crisis/detector';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/sanitize';
import { insightRequestSchema } from '@/lib/validation/schemas';
import { clientKey, jsonError } from '@/lib/http';
import type { DistressLevel, JournalEntry } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/insights
 * Runs the Mirror Insights analysis over the user's entries and returns a
 * validated, sanitized structured insight. The Anthropic key never leaves the
 * server. A server-side crisis check overrides the model's distress estimate
 * upward so the safety layer can never be argued down.
 */
export async function POST(req: Request): Promise<Response> {
  const limit = rateLimit(`insights:${clientKey(req)}`, { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError('Rate limit exceeded. Please slow down.', 429, {
      'retry-after': String(Math.ceil(limit.retryAfterMs / 1000)),
    });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  const parsed = insightRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError('Invalid request.', 422);
  }

  const { examType, entries } = parsed.data;

  const normalizedEntries: JournalEntry[] = entries.map((e, i) => ({
    id: String(i),
    userId: 'self',
    body: e.body,
    moodScore: e.moodScore as JournalEntry['moodScore'],
    createdAt: e.createdAt,
  }));

  const { system, user } = buildInsightPrompt({ examType, entries: normalizedEntries });

  let raw: string;
  try {
    raw = await generateText({ system, user, maxTokens: 1024, temperature: 0.4 });
  } catch {
    return jsonError('The analysis service is temporarily unavailable.', 502);
  }

  const result = parseInsightResponse(raw);
  if (!result.ok) {
    return jsonError('Could not interpret the analysis. Please try again.', 502);
  }

  // Authoritative server-side crisis floor.
  const serverDistress = entries.reduce<DistressLevel>(
    (acc, e) => maxDistress(acc, detectCrisis(e.body).level),
    'none',
  );

  const insight = {
    ...result.insight,
    triggers: result.insight.triggers.map(sanitizeText),
    patterns: result.insight.patterns.map(sanitizeText),
    suggestedAction: sanitizeText(result.insight.suggestedAction),
    distressLevel: maxDistress(result.insight.distressLevel, serverDistress),
  };

  return new Response(JSON.stringify({ insight }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
