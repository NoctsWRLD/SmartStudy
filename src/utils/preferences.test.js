import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  diffPreferences,
  normalizePreferences,
  normalizeTime,
} from './preferences';

describe('normalizeTime', () => {
  it('accepts a time and pads it', () => {
    expect(normalizeTime('8:05')).toBe('08:05');
    expect(normalizeTime('19:30')).toBe('19:30');
  });

  it('rejects anything that is not a time', () => {
    expect(normalizeTime('25:00')).toBeNull();
    expect(normalizeTime('8:60')).toBeNull();
    expect(normalizeTime('polovica')).toBeNull();
    expect(normalizeTime(undefined)).toBeNull();
  });
});

describe('normalizePreferences', () => {
  it('fills in the defaults when nothing is stored', () => {
    expect(normalizePreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
    expect(normalizePreferences({})).toEqual(DEFAULT_PREFERENCES);
  });

  it('keeps valid values', () => {
    const result = normalizePreferences({
      focusMinutes: 45,
      startTime: '07:15',
      deadlineWarningDays: 7,
      weekStart: 'sun',
    });
    expect(result).toEqual({
      focusMinutes: 45,
      startTime: '07:15',
      deadlineWarningDays: 7,
      weekStart: 'sun',
    });
  });

  it('pulls out-of-range values back into range', () => {
    const result = normalizePreferences({ focusMinutes: 900, deadlineWarningDays: 0 });
    expect(result.focusMinutes).toBe(180);
    expect(result.deadlineWarningDays).toBe(1);
  });

  it('replaces a broken time with the default', () => {
    expect(normalizePreferences({ startTime: 'polovica' }).startTime).toBe(DEFAULT_PREFERENCES.startTime);
  });

  it('only accepts the two known week starts', () => {
    expect(normalizePreferences({ weekStart: 'nonsense' }).weekStart).toBe('mon');
    expect(normalizePreferences({ weekStart: 'sun' }).weekStart).toBe('sun');
  });
});

describe('diffPreferences', () => {
  it('lists only what changed', () => {
    const before = { ...DEFAULT_PREFERENCES };
    const after = { ...DEFAULT_PREFERENCES, focusMinutes: 45 };
    expect(diffPreferences(before, after)).toEqual(['focusMinutes']);
  });

  it('returns nothing when nothing changed', () => {
    expect(diffPreferences(DEFAULT_PREFERENCES, DEFAULT_PREFERENCES)).toEqual([]);
  });
});
