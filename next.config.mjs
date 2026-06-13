/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

// Allow the configured Supabase project (and local emulator) for client data calls.
const supabaseConnect = [process.env.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321']
  .filter(Boolean)
  .join(' ');

/**
 * Content Security Policy. Anthropic is only ever called server-side, so the
 * browser never needs to reach the AI provider. `unsafe-eval`/`unsafe-inline`
 * are only permitted in development for the Next.js dev runtime.
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${supabaseConnect}`.trim(),
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
