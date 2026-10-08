import { useEffect, useState } from 'react';

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export default function FocusTimer() {
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const timeout = window.setTimeout(() => {
      if (secondsLeft <= 1) {
        setSecondsLeft(0);
        setRunning(false);
        setFinished(true);
      } else {
        setSecondsLeft(secondsLeft - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [running, secondsLeft]);

  function resetTimer() {
    setRunning(false);
    setFinished(false);
    setSecondsLeft((isBreak ? BREAK_MINUTES : FOCUS_MINUTES) * 60);
  }

  function switchMode() {
    setRunning(false);
    setFinished(false);
    const nextIsBreak = !isBreak;
    setIsBreak(nextIsBreak);
    setSecondsLeft((nextIsBreak ? BREAK_MINUTES : FOCUS_MINUTES) * 60);
  }

  const totalSeconds = (isBreak ? BREAK_MINUTES : FOCUS_MINUTES) * 60;
  const progress = (totalSeconds - secondsLeft) / totalSeconds;
  const circumference = 2 * Math.PI * 43;

  return (
    <section className="glass-card relative overflow-hidden p-5 sm:p-6" aria-label="Časovnik za osredotočeno učenje">
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-rp-iris/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-rp-iris">Čas za fokus</p>
          <h2 className="mt-1 text-lg font-semibold text-rp-text">{isBreak ? 'Kratek odmor' : 'Pomodoro'}</h2>
          <p className="mt-1 max-w-[13rem] text-xs leading-5 text-rp-muted">
            {isBreak ? 'Odpočij si, nato pa nadaljuj z novo energijo.' : 'Ena naloga, 25 minut. Začni z majhnim korakom.'}
          </p>
        </div>
        <button type="button" onClick={switchMode} className="rounded-lg border border-rp-hl-med px-2.5 py-1.5 text-xs text-rp-subtle transition-colors hover:border-rp-iris/50 hover:text-rp-text">
          {isBreak ? 'Na fokus' : 'Odmor'}
        </button>
      </div>

      <div className="relative mt-5 flex items-center gap-4">
        <div className="relative grid h-[5.5rem] w-[5.5rem] shrink-0 place-items-center" role="timer" aria-label={`${Math.ceil(secondsLeft / 60)} minut in ${secondsLeft % 60} sekund`}>
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="43" fill="none" stroke="#e4e9f1" strokeWidth="7" />
            <circle cx="50" cy="50" r="43" fill="none" stroke={isBreak ? '#247b90' : '#6d5bd0'} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} className="transition-[stroke-dashoffset] duration-700" />
          </svg>
          <span className="font-mono text-xl font-semibold tabular-nums text-rp-text">{formatTime(secondsLeft)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-rp-subtle" aria-live="polite">
            {finished ? (isBreak ? 'Odmor je končan. Čas je za novo rundo!' : 'Odlično opravljeno. Vzemi si kratek odmor!') : running ? 'Zdaj je čas samo zate.' : 'Ko si pripravljen_a, začni.'}
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => {
              setFinished(false);
              if (secondsLeft === 0) setSecondsLeft(totalSeconds);
              setRunning((value) => secondsLeft === 0 ? true : !value);
            }} className="rounded-lg bg-rp-iris px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-[#5847bd]">
              {running ? 'Premor' : secondsLeft === 0 ? 'Začni znova' : 'Začni fokus'}
            </button>
            <button type="button" onClick={resetTimer} className="rounded-lg border border-rp-hl-med px-3 py-2 text-xs font-medium text-rp-subtle transition-colors hover:text-rp-text" aria-label="Ponastavi časovnik">
              Ponastavi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
