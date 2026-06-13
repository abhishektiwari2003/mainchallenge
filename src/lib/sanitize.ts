/**
 * Output-sanitization helpers. MindMirror renders all AI output as React text
 * nodes (which escape HTML by default) and never uses dangerouslySetInnerHTML.
 * These helpers add defense-in-depth by removing control characters and any
 * stray markup before display or persistence.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Remove control characters and normalize whitespace runs. */
export function sanitizeText(input: string): string {
  return input.replace(CONTROL_CHARS, '').replace(/\r\n/g, '\n').trimEnd();
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape HTML special characters (used when text may land in non-React sinks). */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}
