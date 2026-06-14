/** Shared helpers for route handlers. */

/**
 * Best-effort client identifier for rate limiting (proxy-aware).
 *
 * @param req The incoming request.
 * @returns A stable key derived from forwarding headers, or 'anonymous'.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'anonymous';
}

/**
 * SECURITY: authorize a sensitive request by enforcing same-origin.
 *
 * The AI routes perform a privileged operation (calling the server-held
 * Anthropic key), so we verify the browser request originates from this app
 * before doing any work. This is a CSRF/cross-site mitigation: a same-origin
 * `Origin` (or `Referer`) host must match the server host. Requests with a
 * mismatched origin are rejected.
 *
 * @param req The incoming request.
 * @returns `true` when the request is same-origin (authorized).
 */
export function isSameOrigin(req: Request): boolean {
  const host = req.headers.get('host');
  if (!host) return false;
  const source = req.headers.get('origin') ?? req.headers.get('referer');
  // No Origin/Referer (e.g. server-to-server, tests) — treat as same-origin.
  if (!source) return true;
  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}

/**
 * JSON error response with a consistent `{ error }` shape.
 *
 * @param message Human-readable error message.
 * @param status HTTP status code.
 * @param extraHeaders Optional additional response headers.
 */
export function jsonError(message: string, status: number, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });
}
