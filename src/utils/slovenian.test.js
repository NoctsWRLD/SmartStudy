import { describe, expect, it } from 'vitest';
import { countedNoun, plural } from './slovenian';

describe('plural', () => {
  it('picks the right Slovenian form for each count', () => {
    expect(plural(1, 'naloga', 'nalogi', 'naloge', 'nalog')).toBe('naloga');
    expect(plural(2, 'naloga', 'nalogi', 'naloge', 'nalog')).toBe('nalogi');
    expect(plural(3, 'naloga', 'nalogi', 'naloge', 'nalog')).toBe('naloge');
    expect(plural(4, 'naloga', 'nalogi', 'naloge', 'nalog')).toBe('naloge');
    expect(plural(5, 'naloga', 'nalogi', 'naloge', 'nalog')).toBe('nalog');
    expect(plural(0, 'naloga', 'nalogi', 'naloge', 'nalog')).toBe('nalog');
  });
});

describe('countedNoun', () => {
  it('keeps the number and the noun together', () => {
    expect(countedNoun(1, 'naloga', 'nalogi', 'naloge', 'nalog')).toBe('1 naloga');
    expect(countedNoun(2, 'naloga', 'nalogi', 'naloge', 'nalog')).toBe('2 nalogi');
    expect(countedNoun(5, 'naloga', 'nalogi', 'naloge', 'nalog')).toBe('5 nalog');
  });
});
