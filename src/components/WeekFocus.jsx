import { useMemo } from 'react';
import { useFocusSessions } from '../hooks/useStudy';
import { addDaysToDateKey, getSlovenianDateKey } from '../utils/dates';

export default function WeekFocus() {
  const { sessions } = useFocusSessions();
  const today = getSlovenianDateKey();

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const key = addDaysToDateKey(today, i - 6);
      const minutes = sessions
        .filter((s) => s.day === key && s.mode === 'focus')
        .reduce((sum, s) => sum + (s.minutes || 0), 0);
      return { key, minutes, isToday: key === today };
    });
  }, [sessions, today]);

  const total = days.reduce((sum, d) => sum + d.minutes, 0);
  const max = Math.max(25, ...days.map((d) => d.minutes));
  const streak = useMemo(() => {
    let n = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].minutes > 0) n++;
      else if (days[i].isToday) continue;
      else break;
    }
    return n;
  }, [days]);

  return (
    <section className="card rise p-5" aria-label="Fokus ta teden">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="section-title">Fokus ta teden</h2>
        <p className="text-xs font-semibold text-rp-muted">{total} min</p>
      </div>
      <div className="mt-4 flex items-end gap-1.5" role="img" aria-label={`${total} minut fokusa v zadnjih 7 dneh`}>
        {days.map((d) => (
          <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-16 w-full items-end rounded-lg bg-rp-overlay">
              <div
                className={`w-full rounded-lg ${d.isToday ? 'bg-rp-accent' : 'bg-rp-accent/45'}`}
                style={{ height: `${Math.max(6, (d.minutes / max) * 100)}%` }}
                title={`${d.minutes} min`}
              />
            </div>
            <span className={`text-[10px] font-bold ${d.isToday ? 'text-rp-accent' : 'text-rp-muted'}`}>
              {['P', 'T', 'S', 'Č', 'P', 'S', 'N'][(new Date(`${d.key}T12:00:00Z`).getUTCDay() + 6) % 7]}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-rp-muted">
        {streak >= 2 ? `${streak}-dnevni niz. Kar tako naprej.` : total === 0 ? 'Zaženi timer in vsaka seja se zabeleži tukaj.' : 'Vsaka zabeležena seja gradi tvoj niz.'}
      </p>
    </section>
  );
}
