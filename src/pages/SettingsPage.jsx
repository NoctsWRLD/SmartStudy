import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import { useExams, useFlashcards, useFocusSessions } from '../hooks/useStudy';
import { THEMES } from '../utils/themes';
import { getSlovenianDateKey } from '../utils/dates';
import { CheckIcon, MoonIcon, SunIcon } from '../components/icons';
import { countedNoun } from '../utils/slovenian';

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rp-line py-4 last:border-0 last:pb-0">
      <div>
        <h3 className="text-body font-semibold text-rp-text">{title}</h3>
        <p className="mt-1 text-small leading-5 text-rp-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={title}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-rp-accent' : 'bg-rp-line-strong'
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-rp-raised transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function Metric({ label, value, tone = 'text-rp-text' }) {
  return (
    <div className="rounded-md border border-rp-line bg-rp-sunken p-4">
      <p className={`tnum text-2xl font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-small text-rp-muted">{label}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser, userProfile } = useAuth();
  const { theme, setTheme, highContrast, setHighContrast, reduceMotion, setReduceMotion } = useSettings();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { exams } = useExams();
  const { cards } = useFlashcards();
  const { sessions } = useFocusSessions();
  const [exported, setExported] = useState(false);

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const focusMinutes = sessions.reduce((sum, session) => sum + (session.minutes || 0), 0);

  function exportStudyData() {
    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        displayName: currentUser?.displayName || '',
        email: currentUser?.email || userProfile?.email || '',
        school: userProfile?.school || '',
      },
      summary: {
        subjectCount: subjects.length,
        taskCount: tasks.length,
        completedTaskCount: completed,
        examCount: exams.length,
        cardCount: cards.length,
        focusMinutes,
      },
      subjects: subjects.map(({ id, name, colorIndex }) => ({ id, name, colorIndex })),
      tasks: tasks.map(({ id, title, description, subjectId, dueDate, completed: isCompleted }) => ({
        id,
        title,
        description,
        subjectId,
        dueDate,
        completed: isCompleted,
      })),
      exams: exams.map(({ id, title, subjectId, date }) => ({ id, title, subjectId, date })),
      flashcards: cards.map(({ id, subjectId, front, back, known }) => ({ id, subjectId, front, back, known })),
      focusSessions: sessions.map(({ id, minutes, mode, day }) => ({ id, minutes, mode, day })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scribe-podatki-${getSlovenianDateKey()}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rise">
        <h1 className="text-page text-rp-text">Nastavitve</h1>
        <p className="mt-2 max-w-xl text-body text-rp-muted">
          Izberi videz, ki ti ustreza, prilagodi dostopnost in si oglej pregled svojih
          učnih podatkov.
        </p>
      </section>

      <section className="space-y-3" aria-labelledby="theme-heading">
        <div>
          <h2 id="theme-heading" className="text-title text-rp-text">Videz aplikacije</h2>
          <p className="mt-1 text-small text-rp-muted">Dva videza — izbira se shrani v tvoj račun.</p>
        </div>
        <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-lg"
              style={{ background: 'var(--rp-accent)' }}
              aria-hidden="true"
            >
              {theme === 'noc'
                ? <MoonIcon className="h-6 w-6 text-rp-canvas" />
                : <SunIcon className="h-6 w-6 text-rp-canvas" />}
            </span>
            <div className="min-w-0">
              <p className="text-subtitle text-rp-text">
                {THEMES.find((item) => item.id === theme)?.name || 'Noč'}
              </p>
              <p className="mt-0.5 text-small text-rp-muted">
                {THEMES.find((item) => item.id === theme)?.description}
              </p>
            </div>
          </div>
          <div className="flex gap-1 rounded-md bg-rp-overlay p-1" role="group" aria-label="Izbira videza">
            {THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                aria-pressed={theme === item.id}
                className={`rounded-xs px-4 py-2 text-small font-semibold transition-colors ${
                  theme === item.id ? 'bg-rp-raised text-rp-text' : 'text-rp-muted hover:text-rp-text'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="accessibility-heading">
          <h2 id="accessibility-heading" className="text-title text-rp-text">Dostopnost</h2>
          <p className="mt-1 text-small text-rp-muted">Nastavitve za lažje branje in manj vizualnih motenj.</p>
          <div className="mt-2">
            <SettingToggle
              title="Močnejši kontrast"
              description="Izrazitejše obrobe in besedilo za boljšo berljivost."
              checked={highContrast}
              onChange={setHighContrast}
            />
            <SettingToggle
              title="Zmanjšaj animacije"
              description="Izklopi premike in prehode v aplikaciji."
              checked={reduceMotion}
              onChange={setReduceMotion}
            />
          </div>
        </section>

        <section className="card p-5" aria-labelledby="account-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="account-heading" className="text-title text-rp-text">Tvoj račun</h2>
            <Link to="/profile" className="link-signal">Uredi profil</Link>
          </div>
          <dl className="mt-4 grid gap-3 text-body">
            <div className="flex justify-between gap-4 border-b border-rp-line pb-3">
              <dt className="text-rp-muted">Ime</dt>
              <dd className="truncate font-medium text-rp-text">{currentUser?.displayName || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-rp-line pb-3">
              <dt className="text-rp-muted">E-pošta</dt>
              <dd className="truncate font-medium text-rp-text">{currentUser?.email || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-rp-muted">Šola</dt>
              <dd className="truncate font-medium text-rp-text">{userProfile?.school || 'Ni dodana'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="card p-5" aria-labelledby="study-data-heading">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 id="study-data-heading" className="text-title text-rp-text">Učni podatki</h2>
            <p className="mt-1 text-small text-rp-muted">Pregled tvojih predmetov in nalog.</p>
          </div>
          <p className="text-small text-rp-muted">
            Uspešnost nalog: <strong className="text-rp-text">{completionRate}%</strong>
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Predmeti" value={subjects.length} tone="text-rp-accent" />
          <Metric label="Vse naloge" value={tasks.length} />
          <Metric label="Odprte naloge" value={pending} tone="text-rp-warn" />
          <Metric label="Opravljene" value={completed} tone="text-rp-success" />
        </div>

        <div className="mt-5 flex flex-col justify-between gap-4 border-t border-rp-line pt-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-body font-semibold text-rp-text">Prenesi svoje podatke</h3>
            <p className="mt-1 max-w-xl text-small leading-5 text-rp-muted">
              Shrani profil, predmete, naloge in kartice v datoteko JSON. Datoteka se ustvari
              v tvoji napravi.
            </p>
          </div>
          <button
            type="button"
            onClick={exportStudyData}
            disabled={subjectsLoading || tasksLoading}
            className="shrink-0 rounded-md border border-rp-accent/30 px-4 py-2.5 text-small font-semibold text-rp-accent transition-colors hover:bg-rp-accent/10 disabled:cursor-wait disabled:opacity-50"
          >
            {exported ? (
              <span className="flex items-center gap-1.5">
                <CheckIcon className="h-3.5 w-3.5" />
                Datoteka prenesena
              </span>
            ) : subjectsLoading || tasksLoading ? (
              'Nalagam podatke…'
            ) : (
              'Izvozi podatke'
            )}
          </button>
        </div>

        <p className="mt-5 text-small text-rp-muted">
          Skupaj imaš {countedNoun(focusMinutes, 'minuto fokusa', 'minuti fokusa', 'minute fokusa', 'minut fokusa')}.
        </p>
      </section>

      <p className="px-1 text-small leading-5 text-rp-muted">
        Tema se shrani v tvoj Firebase profil. Nastavitve dostopnosti se shranijo lokalno v
        tem brskalniku.
      </p>
    </div>
  );
}
