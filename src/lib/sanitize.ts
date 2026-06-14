/**
 * Output-sanitization helper. MindMirror renders all AI output as React text
 * nodes (which escape HTML by default) and never uses dangerouslySetInnerHTML.
 * This adds defense-in-depth by removing control characters before the AI text
 * is displayed or persisted.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Strip control characters and normalize line endings/trailing whitespace from
 * untrusted model output before it is rendered or stored.
 *
 * @param input Raw text (typically streamed/returned from the AI provider).
 * @returns Sanitized, display-safe text.
 */
export function sanitizeText(input: string): string {
  return input.replace(CONTROL_CHARS, '').replace(/\r\n/g, '\n').trimEnd();
}
