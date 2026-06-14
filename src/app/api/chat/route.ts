import { streamChat } from '@/lib/ai/client';
import { buildChatSystemPrompt } from '@/lib/ai/prompts/chat';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/sanitize';
import { chatRequestSchema } from '@/lib/validation/schemas';
import { clientKey, isSameOrigin, jsonError } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chat
 *
 * Streams an empathetic, exam-aware companion reply as plain-text chunks. The
 * companion's system prompt embeds the crisis-safety rule; the client also runs
 * an instant local detector for the helpline banner.
 *
 * SECURITY: Zod-validated (400) -> rate-limited (429) -> same-origin authorized
 * (403) before streaming any AI output. User content is sanitized before use.
 */
export async function POST(req: Request): Promise<Response> {
  // SECURITY (1/3): validate the request body with Zod; reject malformed input.
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError('Invalid request.', 400);
  }

  // SECURITY (2/3): rate-limit the AI endpoint to prevent abuse/DoS.
  const limit = rateLimit(`chat:${clientKey(req)}`, { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError('Rate limit exceeded. Please slow down.', 429, {
      'retry-after': String(Math.ceil(limit.retryAfterMs / 1000)),
    });
  }

  // SECURITY (3/3): authorize the request (same-origin) before doing work.
  if (!isSameOrigin(req)) {
    return jsonError('Forbidden.', 403);
  }

  const { message, examType, displayName, tonePref, history, latestInsight } = parsed.data;

  const system = buildChatSystemPrompt({
    examType,
    displayName,
    tonePref,
    latestInsight,
  });

  const messages = [
    ...history.map((m) => ({ role: m.role, content: sanitizeText(m.content) })),
    { role: 'user' as const, content: sanitizeText(message) },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamChat({ system, messages })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            "\n\nI'm having trouble responding right now. If this is urgent, please call Tele-MANAS at 14416.",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
