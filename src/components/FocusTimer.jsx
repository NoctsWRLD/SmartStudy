import { useEffect, useRef, useState } from 'react';
import { useFocusSessions } from '../hooks/useStudy';
import { getSlovenianDateKey } from '../utils/dates';

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
  const { logSession } = useFocusSessions();
  const loggedRef = useRef(false);

  useEffect(() => {
    if (finished && !isBreak && !loggedRef.current) {
      loggedRef.current = true;
      logSession({ minutes: FOCUS_MINUTES, mode: 'focus', day: getSlovenianDateKey() });
    }
  }, [finished, isBreak, logSession]);

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
  const circumference = 2 * Math.PI * 42;

  const message = finished
    ? isBreak ? 'Odmor je končan.' : 'Seja je zabeležena. Vzemi si odmor.'
    : running ? 'Ena stvar naenkrat.' : 'Začni, ko si pripravljen.';

  function switchMode() {
    setRunning(false);
    setFinished(false);
    const next = !isBreak;
    setIsBreak(next);
    setSecondsLeft((next ? BREAK_MINUTES : FOCUS_MINUTES) * 60);
    loggedRef.current = false;
  }

  return (
    <section className="card p-5" aria-label="Časovnik za osredotočeno učenje">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-title text-rp-text">{isBreak ? 'Odmor' : 'Fokus'}</h2>
        <button type="button" onClick={switchMode} className="link-signal">
          {isBreak ? 'Na fokus' : 'Na odmor'}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center" role="timer" aria-label={`Preostalo ${formatTime(secondsLeft)}`}>
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--rp-fill)" strokeWidth="7" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--rp-accent)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-700"
            />
          </svg>
          <span className="mono text-xl font-bold text-rp-text">{formatTime(secondsLeft)}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-small leading-5 text-rp-muted" aria-live="polite">{message}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFinished(false);
                if (secondsLeft === 0) setSecondsLeft(total);
                loggedRef.current = false;
                setRunning((value) => (secondsLeft === 0 ? true : !value));
              }}
              className="btn-primary !px-3.5 !py-2 !text-small"
            >
              {running ? 'Pavza' : 'Začni'}
            </button>
            <button
              type="button"
              onClick={() => { setRunning(false); setFinished(false); setSecondsLeft(total); loggedRef.current = false; }}
              className="btn-ghost !px-3 !py-2 !text-small"
              aria-label="Ponastavi časovnik"
            >
              Ponastavi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
