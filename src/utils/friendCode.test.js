import { describe, expect, it } from 'vitest';
import {
  CODE_ALPHABET,
  CODE_LENGTH,
  codeHint,
  generateCode,
  isValidCode,
  normalizeCode,
  requestPairId,
} from './friendCode';

describe('normalizeCode', () => {
  it('upper-cases and strips separators', () => {
    expect(normalizeCode('k7m2qx')).toBe('K7M2QX');
    expect(normalizeCode('k7-m2 qx')).toBe('K7M2QX');
  });

  it('drops characters that are not in the alphabet', () => {
    expect(normalizeCode('K7!M2@QX')).toBe('K7M2QX');
    // I, L, O, 0 and 1 are not in the alphabet at all.
    expect(normalizeCode('ILOV1')).toBe('V');
  });

  it('is safe with non-string input', () => {
    expect(normalizeCode(undefined)).toBe('');
    expect(normalizeCode(42)).toBe('');
  });
});

describe('isValidCode', () => {
  it('accepts a code of the right length', () => {
    expect(isValidCode('K7M2QX')).toBe(true);
    expect(isValidCode('k7m2qx')).toBe(true);
  });

  it('rejects a code of the wrong length', () => {
    expect(isValidCode('K7M2')).toBe(false);
    expect(isValidCode('K7M2QXY')).toBe(false);
    expect(isValidCode('')).toBe(false);
  });
});

describe('generateCode', () => {
  it('produces a valid code', () => {
    const code = generateCode();
    expect(code).toHaveLength(CODE_LENGTH);
    expect(isValidCode(code)).toBe(true);
  });

  it('only uses the unambiguous alphabet', () => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const code = generateCode();
      for (const character of code) {
        expect(CODE_ALPHABET).toContain(character);
      }
    }
  });

  it('is deterministic when the randomness is injected', () => {
    expect(generateCode(() => 0)).toBe(CODE_ALPHABET[0].repeat(CODE_LENGTH));
    expect(generateCode(() => 0.999)).toBe(CODE_ALPHABET[CODE_ALPHABET.length - 1].repeat(CODE_LENGTH));
  });
});

describe('requestPairId', () => {
  it('is the same from both sides of the pair', () => {
    expect(requestPairId('aaa', 'bbb')).toBe(requestPairId('bbb', 'aaa'));
  });

  it('is different for different pairs', () => {
    expect(requestPairId('aaa', 'bbb')).not.toBe(requestPairId('aaa', 'ccc'));
  });
});

describe('codeHint', () => {
  it('hides the middle of the code', () => {
    expect(codeHint('K7M2QX')).toBe('K7••••QX');
  });

  it('returns nothing for a code that is not a code', () => {
    expect(codeHint('K7')).toBe('');
    expect(codeHint(undefined)).toBe('');
  });
});
