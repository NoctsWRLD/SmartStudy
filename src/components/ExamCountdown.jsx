import { Link } from 'react-router-dom';
import { useExams } from '../hooks/useStudy';
import { daysBetweenDateKeys, formatSlovenianDate, getSlovenianDateKey } from '../utils/dates';

const WINDOW = 7;

export default function ExamCountdown({ subjects }) {
  const { exams, loading } = useExams();
  const today = getSlovenianDateKey();
  const next = exams
    .filter((exam) => exam.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  if (loading) {
    return (
      <section className="card grid min-h-28 place-items-center p-5" aria-label="Naslednje preverjanje">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-rp-accent border-t-transparent" />
      </section>
    );
  }

  if (!next) {
    return (
      <section className="card p-5" aria-label="Naslednje preverjanje">
        <h2 className="text-title text-rp-text">Ni napovedanih preverjanj</h2>
        <p className="mt-1.5 text-small text-rp-muted">
          Ko izveš datum testa, ga zapiši — tukaj bo odštevanje.
        </p>
        <Link to="/exams" className="link-signal mt-3 inline-block">Odpri preverjanja</Link>
      </section>
    );
  }

  const diff = daysBetweenDateKeys(next.date, today);
  const subjectName = subjects.find((subject) => subject.id === next.subjectId)?.name || '';
  const filled = Math.min(diff, WINDOW);
  const segments = Array.from({ length: WINDOW }, (_, index) => ({
    key: index,
    value: index < filled ? 1 : 0,
    tone: diff === 0 ? 'warn' : 'accent',
  }));

  return (
    <section className="card overflow-hidden" aria-label="Naslednje preverjanje">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-label text-rp-muted">Naslednje preverjanje</p>
            <p className="tnum mt-1 text-4xl font-bold leading-none text-rp-text">
              {diff === 0 ? 'danes' : diff}
              {diff > 0 && <span className="ml-1.5 text-base font-medium text-rp-muted">
                {diff === 1 ? 'dan' : 'dni'}
              </span>}
            </p>
          </div>
          {diff > WINDOW && (
            <span className="chip shrink-0">čez {diff} dni</span>
          )}
        </div>

        <ul className="rail mt-4" aria-label={`${filled} dni do preverjanja`}>
          {segments.map((segment) => (
            <li key={segment.key} className="rail-seg" data-tone={segment.tone}>
              <span aria-hidden="true" style={{ width: `${segment.value * 100}%` }} />
            </li>
          ))}
        </ul>

        <h3 className="mt-4 truncate text-body font-semibold text-rp-text">{next.title}</h3>
        <p className="mt-0.5 text-small text-rp-muted">
          {subjectName ? `${subjectName} · ` : ''}
          {formatSlovenianDate(next.date, { day: 'numeric', month: 'long' })}
        </p>
      </div>
      <div className="border-t border-rp-line px-5 py-3">
        <Link to="/exams" className="link-signal inline-block">Vsa preverjanja</Link>
      </div>
    </section>
  );
}
