import { addDaysToDateKey, getDateKeyDayOfWeek } from './dates';
import { countedNoun } from './slovenian';

const DAY_SHORT = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];
const DAY_FULL = ['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja'];

/** Monday of the week containing the given date. */
export function getWeekStart(dateKey) {
  const day = getDateKeyDayOfWeek(dateKey);
  return addDaysToDateKey(dateKey, day === 0 ? -6 : 1 - day);
}

/**
 * Turn a week of tasks into rail segments.
 *
 * A segment's fill is that day's share of the heaviest day in the week, so
 * the rail shows both *whether* there is work and *how much* relative to the
 * rest of the week. Completed tasks do not count — the rail shows what is
 * still open.
 */
export function buildWeekRail(tasks, today, options = {}) {
  const weekStart = options.start || getWeekStart(today);
  const days = Array.from({ length: 7 }, (_, index) => addDaysToDateKey(weekStart, index));
  const counts = days.map((day) =>
    tasks.filter((task) => !task.completed && task.dueDate === day).length,
  );
  const heaviest = Math.max(1, ...counts);

  return days.map((key, index) => {
    const count = counts[index];
    const isToday = key === today;
    return {
      key,
      label: DAY_SHORT[index],
      fullLabel: DAY_FULL[index],
      count,
      value: count / heaviest,
      today: isToday,
      tone: count === 0 ? 'empty' : isToday ? 'warn' : 'accent',
      hint: `${DAY_FULL[index]} — ${
        count === 0 ? 'brez nalog' : countedNoun(count, 'naloga', 'nalogi', 'naloge', 'nalog')
      }`,
    };
  });
}

/** Days from today until a date, never negative. */
export function daysUntil(dateKey, today) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = Date.UTC(ty, tm - 1, td);
  return Math.max(0, Math.round((target - now) / 86400000));
}
