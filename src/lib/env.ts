import 'server-only';
import { z } from 'zod';

/**
 * Server-only environment validation. Importing this module from a client
 * component will fail the build, guaranteeing secrets never reach the browser.
 */
const serverEnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  ANTHROPIC_MODEL: z.string().min(1).default('claude-sonnet-4-6'),
});

let cached: z.infer<typeof serverEnvSchema> | null = null;

/** Lazily parse and cache server env. Throws a clear error if misconfigured. */
export function getServerEnv(): z.infer<typeof serverEnvSchema> {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse({
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
  });
  if (!parsed.success) {
    throw new Error(`Invalid server environment: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}
