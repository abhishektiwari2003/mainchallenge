import { describe, expect, it } from 'vitest';
import { extractJsonObject, parseInsightResponse } from './parse';

const validInsight = {
  triggers: ['Stress the night before mock tests'],
  patterns: ['Mood dips in the evening, recovers by morning'],
  burnoutScore: 62,
  suggestedAction: 'Try a 10-minute wind-down ritual the night before each mock.',
  distressLevel: 'moderate',
};

describe('extractJsonObject', () => {
  it('extracts a bare object', () => {
    expect(extractJsonObject('{"a":1}')).toBe('{"a":1}');
  });

  it('extracts an object wrapped in prose and fences', () => {
    const raw = 'Here you go:\n```json\n{"a": {"b": 2}}\n```\nThanks!';
    expect(extractJsonObject(raw)).toBe('{"a": {"b": 2}}');
  });

  it('ignores braces inside strings', () => {
    expect(extractJsonObject('{"text":"a } b"}')).toBe('{"text":"a } b"}');
  });

  it('returns null when no object is present', () => {
    expect(extractJsonObject('no json here')).toBeNull();
  });
});

describe('parseInsightResponse', () => {
  it('parses a valid minified response', () => {
    const result = parseInsightResponse(JSON.stringify(validInsight));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.insight.burnoutScore).toBe(62);
      expect(result.insight.distressLevel).toBe('moderate');
    }
  });

  it('tolerates surrounding prose', () => {
    const result = parseInsightResponse(`Sure!\n${JSON.stringify(validInsight)}\nHope that helps`);
    expect(result.ok).toBe(true);
  });

  it('rounds a fractional burnout score', () => {
    const result = parseInsightResponse(JSON.stringify({ ...validInsight, burnoutScore: 61.7 }));
    expect(result.ok && result.insight.burnoutScore).toBe(62);
  });

  it('fails on malformed JSON', () => {
    const result = parseInsightResponse('{ not valid');
    expect(result.ok).toBe(false);
  });

  it('fails on schema violations', () => {
    const bad = { ...validInsight, distressLevel: 'panic' };
    expect(parseInsightResponse(JSON.stringify(bad)).ok).toBe(false);
  });

  it('fails when no JSON is present', () => {
    expect(parseInsightResponse('I cannot help with that.').ok).toBe(false);
  });
});
