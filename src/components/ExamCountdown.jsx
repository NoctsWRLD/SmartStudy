import { Link } from 'react-router-dom';
import { useExams } from '../hooks/useStudy';
import { daysBetweenDateKeys, formatSlovenianDate, getSlovenianDateKey } from '../utils/dates';

export default function ExamCountdown({ subjects }) {
  const { exams, loading } = useExams();
  const today = getSlovenianDateKey();
  const next = exams.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];

  if (loading) {
    return (
      <section className="card rise grid min-h-28 place-items-center p-5" aria-label="Naslednje preverjanje">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-rp-accent border-t-transparent" />
      </section>
    );
  }

  if (!next) {
    return (
      <section className="card rise p-5" aria-label="Naslednje preverjanje">
        <h2 className="section-title">Ni napovedanih preverjanj</h2>
        <p className="body-quiet mt-1.5 text-sm">Ko izveš datum testa, ga zapiši — tukaj bo odštevanje.</p>
        <Link to="/exams" className="link-signal mt-3 inline-block">Odpri preverjanja</Link>
      </section>
    );
  }

  const diff = daysBetweenDateKeys(next.date, today);
  const subjectName = subjects.find((s) => s.id === next.subjectId)?.name || '';
  const label = diff === 0 ? 'danes' : diff === 1 ? 'jutri' : `čez ${diff} dni`;

  return (
    <section className="card rise overflow-hidden" aria-label="Naslednje preverjanje">
      <div className="bg-rp-text px-5 pb-4 pt-5 text-[var(--rp-canvas)]">
        <p className="text-xs font-semibold opacity-80">Naslednje preverjanje {label}</p>
        <p className="font-display mt-1 text-5xl font-extrabold tracking-tight tabular-nums">{diff === 0 ? '!' : diff}</p>
        <p className="mt-1 text-sm font-semibold">{diff <= 1 ? '' : diff === 1 ? 'dan do testa' : 'dni do testa'}</p>
      </div>
      <div className="p-5">
        <h2 className="truncate text-[15px] font-bold">{next.title}</h2>
        <p className="mt-0.5 text-[13px] text-rp-muted">
          {subjectName}{subjectName ? ' · ' : ''}{formatSlovenianDate(next.date, { day: 'numeric', month: 'long' })}
        </p>
        <Link to="/exams" className="link-signal mt-2 inline-block">Vsa preverjanja</Link>
      </div>
    </section>
  );
}
