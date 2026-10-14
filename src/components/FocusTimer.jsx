import { useEffect, useState } from 'react';

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function FocusTimer() {
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const timeout = window.setTimeout(() => {
      if (secondsLeft <= 1) { setSecondsLeft(0); setRunning(false); setFinished(true); }
      else setSecondsLeft(secondsLeft - 1);
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [running, secondsLeft]);

  const total = (isBreak ? BREAK_MINUTES : FOCUS_MINUTES) * 60;
  const progress = (total - secondsLeft) / total;
  const circ = 2 * Math.PI * 43;

  return (
    <section className="card rise p-5" aria-label="Časovnik za osredotočeno učenje">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="section-title">{isBreak ? 'Odmor' : 'Fokus'}</h2>
        <button
          type="button"
          onClick={() => { setRunning(false); setFinished(false); const n = !isBreak; setIsBreak(n); setSecondsLeft((n ? BREAK_MINUTES : FOCUS_MINUTES) * 60); }}
          className="link-signal"
        >
          {isBreak ? 'Na fokus' : 'Na odmor'}
        </button>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center" role="timer" aria-label={formatTime(secondsLeft)}>
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="43" fill="none" stroke="var(--rp-overlay)" strokeWidth="8" />
            <circle cx="50" cy="50" r="43" fill="none" stroke="var(--rp-iris)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} className="transition-[stroke-dashoffset] duration-700" />
          </svg>
          <span className="font-display text-xl font-bold tabular-nums">{formatTime(secondsLeft)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-5 text-rp-muted" aria-live="polite">
            {finished ? 'Končano. Vzemi si odmor.' : running ? 'Ena stvar naenkrat.' : 'Začni, ko si pripravljen.'}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => { setFinished(false); if (secondsLeft === 0) setSecondsLeft(total); setRunning((v) => (secondsLeft === 0 ? true : !v)); }}
              className="btn-primary !px-4 !py-2 !text-[13px]"
            >
              {running ? 'Pavza' : 'Začni'}
            </button>
            <button type="button" onClick={() => { setRunning(false); setFinished(false); setSecondsLeft(total); }} className="btn-ghost !px-3 !py-2 !text-xs" aria-label="Ponastavi časovnik">
              Ponastavi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
