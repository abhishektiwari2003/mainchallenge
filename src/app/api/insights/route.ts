import { generateText } from '@/lib/ai/client';
import { buildInsightPrompt } from '@/lib/ai/prompts/insight';
import { parseInsightResponse } from '@/lib/ai/parse';
import { detectCrisis, maxDistress } from '@/lib/crisis/detector';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/sanitize';
import { insightRequestSchema } from '@/lib/validation/schemas';
import { clientKey, isSameOrigin, jsonError } from '@/lib/http';
import type { DistressLevel, JournalEntry } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/insights
 *
 * Runs the Mirror Insights analysis over the user's entries and returns a
 * validated, sanitized structured insight. The Anthropic key never leaves the
 * server. A server-side crisis check overrides the model's distress estimate
 * upward so the safety layer can never be argued down.
 *
 * SECURITY: Zod-validated (400) -> rate-limited (429) -> same-origin authorized
 * (403) before any privileged AI work. Journal text is treated as data, not
 * instructions (prompt-injection guardrail in buildInsightPrompt).
 */
export async function POST(req: Request): Promise<Response> {
  // SECURITY (1/3): validate the request body with Zod; reject malformed input.
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  const parsed = insightRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError('Invalid request.', 400);
  }

  // SECURITY (2/3): rate-limit the AI endpoint to prevent abuse/DoS.
  const limit = rateLimit(`insights:${clientKey(req)}`, { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError('Rate limit exceeded. Please slow down.', 429, {
      'retry-after': String(Math.ceil(limit.retryAfterMs / 1000)),
    });
  }

  // SECURITY (3/3): authorize the request (same-origin) before doing work.
  if (!isSameOrigin(req)) {
    return jsonError('Forbidden.', 403);
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
