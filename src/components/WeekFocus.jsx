import { useMemo } from 'react';
import { useFocusSessions } from '../hooks/useStudy';
import { addDaysToDateKey, getSlovenianDateKey } from '../utils/dates';

const DAY_LETTERS = ['P', 'T', 'S', 'Č', 'P', 'S', 'N'];

export default function WeekFocus() {
  const { sessions } = useFocusSessions();
  const today = getSlovenianDateKey();

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const key = addDaysToDateKey(today, index - 6);
      const minutes = sessions
        .filter((session) => session.day === key && session.mode === 'focus')
        .reduce((sum, session) => sum + (session.minutes || 0), 0);
      return { key, minutes, isToday: key === today };
    });
  }, [sessions, today]);

  const total = days.reduce((sum, day) => sum + day.minutes, 0);
  const max = Math.max(25, ...days.map((day) => day.minutes));
  const streak = useMemo(() => {
    let count = 0;
    for (let index = days.length - 1; index >= 0; index -= 1) {
      if (days[index].minutes > 0) count += 1;
      else if (days[index].isToday) continue;
      else break;
    }
    return count;
  }, [days]);

  const segments = days.map((day) => ({
    key: day.key,
    value: day.minutes / max,
    tone: day.minutes === 0 ? 'empty' : day.isToday ? 'warn' : 'accent',
    label: DAY_LETTERS[(new Date(`${day.key}T12:00:00Z`).getUTCDay() + 6) % 7],
    today: day.isToday,
    hint: `${day.minutes} minut fokusa`,
  }));

  return (
    <section className="card p-5" aria-label="Fokus ta teden">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-title text-rp-text">Fokus ta teden</h2>
        <p className="tnum text-small font-semibold text-rp-muted">{total} min</p>
      </div>

      <ul className="rail mt-4" aria-label={`${total} minut fokusa v zadnjih 7 dneh`}>
        {segments.map((segment) => (
          <li key={segment.key} className="rail-seg" data-tone={segment.tone}>
            <span aria-hidden="true" style={{ width: `${Math.round(segment.value * 100)}%` }} />
            <span className="sr-only">{segment.hint}</span>
          </li>
        ))}
      </ul>
      <ul className="mt-2 flex gap-[3px]" aria-hidden="true">
        {segments.map((segment) => (
          <li
            key={segment.key}
            className={`flex-1 text-center text-[11px] leading-4 ${
              segment.today ? 'font-semibold text-rp-accent' : 'text-rp-muted'
            }`}
          >
            {segment.label}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-small text-rp-muted">
        {streak >= 2
          ? `${streak}-dnevni niz. Kar tako naprej.`
          : total === 0
            ? 'Zaženi timer in vsaka Seja se zabeleži tukaj.'
            : 'Vsaka zabeležena seja gradi tvoj niz.'}
      </p>
    </section>
  );
}
