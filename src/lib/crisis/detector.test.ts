import { describe, expect, it } from 'vitest';
import { detectCrisis, distressRank, maxDistress } from './detector';

describe('detectCrisis', () => {
  it('returns none for an empty entry', () => {
    expect(detectCrisis('')).toEqual({ level: 'none', isAcute: false, matched: [] });
  });

  it('returns none for whitespace-only input', () => {
    expect(detectCrisis('    \n  ').level).toBe('none');
  });

  it('flags acute distress for explicit self-harm language', () => {
    const result = detectCrisis('Honestly I want to die, there is no reason to live anymore.');
    expect(result.isAcute).toBe(true);
    expect(result.level).toBe('acute');
  });

  it('flags acute distress for suicidal phrasing variants', () => {
    expect(detectCrisis('I keep thinking about killing myself').isAcute).toBe(true);
    expect(detectCrisis('I feel suicidal lately').isAcute).toBe(true);
    expect(detectCrisis('I want to end my life').isAcute).toBe(true);
  });

  it('treats acute language inside a very long entry as acute', () => {
    const filler = 'I studied physics and chemistry today. '.repeat(400);
    const result = detectCrisis(`${filler} I just want to die.`);
    expect(result.isAcute).toBe(true);
  });

  it('classifies multiple strong signals as moderate', () => {
    const result = detectCrisis('I feel completely hopeless and overwhelmed by everything.');
    expect(result.level).toBe('moderate');
    expect(result.isAcute).toBe(false);
  });

  it('classifies a single mild signal as mild', () => {
    expect(detectCrisis('I am a bit stressed about the syllabus').level).toBe('mild');
  });

  it('classifies neutral text as none', () => {
    expect(detectCrisis('Productive day, finished my revision and went for a walk.').level).toBe(
      'none',
    );
  });

  it('is case-insensitive', () => {
    expect(detectCrisis('I WANT TO DIE').isAcute).toBe(true);
  });
});

describe('distress ranking helpers', () => {
  it('ranks levels in order', () => {
    expect(distressRank('none')).toBeLessThan(distressRank('mild'));
    expect(distressRank('moderate')).toBeLessThan(distressRank('acute'));
  });

  it('returns the more severe level', () => {
    expect(maxDistress('mild', 'acute')).toBe('acute');
    expect(maxDistress('moderate', 'none')).toBe('moderate');
    expect(maxDistress('none', 'none')).toBe('none');
  });
});
