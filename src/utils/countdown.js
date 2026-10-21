import { daysBetweenDateKeys, formatSlovenianDate } from './dates';

/**
 * How far away a date is, in words a student would use.
 * `urgent` marks the week before the date — the window where a subject
 * normally starts to matter.
 */
export function countdown(dateStr, today) {
  const diff = daysBetweenDateKeys(dateStr, today);
  if (diff < 0) {
    return {
      days: diff,
      urgent: true,
      past: true,
      label: `Zamujeno ${formatSlovenianDate(dateStr, { day: 'numeric', month: 'short' })}`,
    };
  }
  if (diff === 0) return { days: 0, urgent: true, past: false, label: 'Danes' };
  if (diff === 1) return { days: 1, urgent: true, past: false, label: 'Jutri' };
  return {
    days: diff,
    urgent: diff <= 7,
    past: false,
    label: `Čez ${diff} dni`,
  };
}

/** "dan" for one, "dni" for everything else. */
export function daysLabel(diff) {
  if (diff <= 0) return 'danes';
  if (diff === 1) return 'dan';
  return 'dni';
}
