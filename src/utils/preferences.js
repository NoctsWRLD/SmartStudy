/**
 * Study preferences — the small choices that make the app fit the way one
 * actually studies. They are stored in the user's own Firestore document and
 * are always valid, whatever was written before.
 */
export const DEFAULT_PREFERENCES = {
  /** Length of one focus session, in minutes. */
  focusMinutes: 25,
  /** When the day should start, as "HH:MM". */
  startTime: '08:00',
  /** How many days before a deadline the task list starts to warn. */
  deadlineWarningDays: 3,
  /** Which day the week starts on. */
  weekStart: 'mon',
};

export const FOCUS_OPTIONS = [15, 25, 45, 60];
export const WARNING_OPTIONS = [1, 3, 7, 14];
export const WEEK_STARTS = [
  { id: 'mon', label: 'Ponedeljek' },
  { id: 'sun', label: 'Nedelja' },
];

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

/** A time as "HH:MM", or null when the value is not a time. */
export function normalizeTime(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Fill in anything that is missing or out of range. */
export function normalizePreferences(value) {
  const source = value && typeof value === 'object' ? value : {};
  const startTime = normalizeTime(source.startTime);
  return {
    focusMinutes: clamp(source.focusMinutes, 5, 180, DEFAULT_PREFERENCES.focusMinutes),
    startTime: startTime || DEFAULT_PREFERENCES.startTime,
    deadlineWarningDays: clamp(
      source.deadlineWarningDays,
      1,
      30,
      DEFAULT_PREFERENCES.deadlineWarningDays,
    ),
    weekStart: source.weekStart === 'sun' ? 'sun' : DEFAULT_PREFERENCES.weekStart,
  };
}

/** Compare two preference sets and list what changed. */
export function diffPreferences(before, after) {
  const changes = [];
  if (before.focusMinutes !== after.focusMinutes) changes.push('focusMinutes');
  if (before.startTime !== after.startTime) changes.push('startTime');
  if (before.deadlineWarningDays !== after.deadlineWarningDays) changes.push('deadlineWarningDays');
  if (before.weekStart !== after.weekStart) changes.push('weekStart');
  return changes;
}
