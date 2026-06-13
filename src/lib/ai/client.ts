import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { getServerEnv } from '@/lib/env';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  const { ANTHROPIC_API_KEY } = getServerEnv();
  client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  return client;
}

export interface GenerateTextInput {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

/** One-shot text generation (used for the structured insight analysis). */
export async function generateText({
  system,
  user,
  maxTokens = 1024,
  temperature = 0.4,
}: GenerateTextInput): Promise<string> {
  const { ANTHROPIC_MODEL } = getServerEnv();
  const response = await getClient().messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: 'user', content: user }],
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

export interface StreamChatInput {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Stream a companion chat completion as plain text chunks. Yields incremental
 * text deltas for low perceived latency.
 */
export async function* streamChat({
  system,
  messages,
  maxTokens = 700,
  temperature = 0.7,
}: StreamChatInput): AsyncGenerator<string> {
  const { ANTHROPIC_MODEL } = getServerEnv();
  const stream = await getClient().messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages,
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}
