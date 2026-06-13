/** Shared helpers for route handlers. */

/** Best-effort client identifier for rate limiting (proxy-aware). */
export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'anonymous';
}

/** JSON error response with a consistent shape. */
export function jsonError(message: string, status: number, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });
}
