import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import { useExams, useFlashcards, useFocusSessions } from '../hooks/useStudy';
import { getSlovenianDateKey } from '../utils/dates';

const THEMES = [
  { id: 'cloud', name: 'Oblak', description: 'Čista svetla tema z vijoličnimi poudarki.', swatches: ['#f5f7fb', '#6d5bd0', '#247b90'] },
  { id: 'lavender', name: 'Sivka', description: 'Mehki lila odtenki za mirno učno okolje.', swatches: ['#f7f5ff', '#7655c8', '#438393'] },
  { id: 'mint', name: 'Meta', description: 'Sveža zelena tema z nežnimi modrimi poudarki.', swatches: ['#f2f8f5', '#5277b4', '#278066'] },
  { id: 'sunset', name: 'Topel pesek', description: 'Topli kremni toni za prijeten občutek.', swatches: ['#fff8f1', '#b45b7a', '#348392'] },
  { id: 'midnight', name: 'Polnoč', description: 'Temna modra tema z vijoličnimi poudarki.', swatches: ['#101827', '#baa8ff', '#77c8d6'] },
  { id: 'graphite', name: 'Grafit', description: 'Nevtralna temna tema z umirjenimi sivimi toni.', swatches: ['#131820', '#a6b5ca', '#83c0c2'] },
  { id: 'forest', name: 'Gozd', description: 'Globoki zeleni odtenki za mirno večerno učenje.', swatches: ['#101c19', '#a6bd8e', '#78c6bc'] },
  { id: 'plum', name: 'Sliva', description: 'Temna slivova tema z nežnimi lila poudarki.', swatches: ['#1a1422', '#c89bea', '#8fc8dc'] },
  { id: 'ocean', name: 'Ocean', description: 'Globoka modra tema s svetlimi morskimi poudarki.', swatches: ['#0e1c2b', '#7ca8ff', '#65c8da'] },
  { id: 'ember', name: 'Žerjavica', description: 'Topli temni toni z bakrenimi poudarki.', swatches: ['#201713', '#ed9b72', '#dfb46c'] },
];

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rp-hl-med/70 py-4 last:border-0 last:pb-0">
      <div><h3 className="text-sm font-semibold text-rp-text">{title}</h3><p className="mt-1 text-xs leading-5 text-rp-muted">{description}</p></div>
      <button type="button" role="switch" aria-label={title} aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-rp-iris' : 'bg-rp-hl-high'}`}>
        <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function Metric({ label, value, tone = 'text-rp-text' }) {
  return <div className="rounded-xl border border-rp-hl-med/70 bg-rp-base/70 p-4"><p className={`text-2xl font-semibold ${tone}`}>{value}</p><p className="mt-1 text-xs text-rp-muted">{label}</p></div>;
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

  function exportStudyData() {
    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        displayName: currentUser?.displayName || '',
        email: currentUser?.email || userProfile?.email || '',
        school: userProfile?.school || '',
      },
      summary: { subjectCount: subjects.length, taskCount: tasks.length, completedTaskCount: completed, examCount: exams.length, cardCount: cards.length },
      subjects: subjects.map(({ id, name, colorIndex }) => ({ id, name, colorIndex })),
      tasks: tasks.map(({ id, title, description, subjectId, dueDate, completed: isCompleted }) => ({ id, title, description, subjectId, dueDate, completed: isCompleted })),
      exams: exams.map(({ id, title, subjectId, date }) => ({ id, title, subjectId, date })),
      flashcards: cards.map(({ id, subjectId, front, back, known }) => ({ id, subjectId, front, back, known })),
      focusSessions: sessions.map(({ id, minutes, mode, day }) => ({ id, minutes, mode, day })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartstudy-podatki-${getSlovenianDateKey()}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-8">
      <section className="rise">
        <h1 className="page-title">Nastavitve</h1>
        <p className="body-quiet mt-2">Izberi videz, ki ti ustreza, prilagodi dostopnost in si oglej pregled svojih učnih podatkov.</p>
      </section>

      <section className="space-y-4" aria-labelledby="theme-heading">
        <div><h2 id="theme-heading" className="text-lg font-semibold text-rp-text">Videz aplikacije</h2><p className="mt-1 text-sm text-rp-muted">Izbrana tema se shrani v tvoj račun in se uporabi tudi ob naslednji prijavi.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {THEMES.map((option) => (
            <button key={option.id} type="button" aria-pressed={theme === option.id} onClick={() => setTheme(option.id)} className={`glass-card group p-4 text-left transition-all hover:-translate-y-0.5 ${theme === option.id ? 'border-rp-iris/50 ring-2 ring-rp-iris/20' : 'hover:border-rp-hl-high'}`}>
              <div className="flex items-center justify-between gap-3"><span className="font-semibold text-rp-text">{option.name}</span><span className={`grid h-5 w-5 place-items-center rounded-full border ${theme === option.id ? 'border-rp-iris bg-rp-iris text-white' : 'border-rp-hl-high text-transparent'}`} aria-hidden="true">✓</span></div>
              <div className="mt-3 flex h-16 overflow-hidden rounded-xl border border-rp-hl-med/70">
                <span className="flex-1" style={{ backgroundColor: option.swatches[0] }} />
                <span className="w-1/4" style={{ backgroundColor: option.swatches[1] }} />
                <span className="w-1/4" style={{ backgroundColor: option.swatches[2] }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-rp-muted">{option.description}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,.8fr)]">
        <section className="glass-card p-5 sm:p-6" aria-labelledby="accessibility-heading">
          <h2 id="accessibility-heading" className="text-lg font-semibold text-rp-text">Dostopnost</h2>
          <p className="mt-1 text-sm text-rp-muted">Nastavitve za lažje branje in manj vizualnih motenj.</p>
          <div className="mt-2">
            <SettingToggle title="Močnejši kontrast" description="Izrazitejše obrobe in besedilo za boljšo berljivost." checked={highContrast} onChange={setHighContrast} />
            <SettingToggle title="Zmanjšaj animacije" description="Izklopi premike in prehode v aplikaciji." checked={reduceMotion} onChange={setReduceMotion} />
          </div>
        </section>

        <section className="glass-card p-5 sm:p-6" aria-labelledby="account-heading">
          <div className="flex items-center justify-between gap-3"><div><h2 id="account-heading" className="text-lg font-semibold text-rp-text">Tvoj račun</h2><p className="mt-1 text-sm text-rp-muted">Osnovni podatki profila.</p></div><Link to="/profile" className="rounded-lg px-3 py-2 text-xs font-semibold text-rp-iris transition hover:bg-rp-iris/10">Uredi profil →</Link></div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-rp-hl-med/70 pb-3"><dt className="text-rp-muted">Ime</dt><dd className="truncate font-medium text-rp-text">{currentUser?.displayName || '—'}</dd></div>
            <div className="flex justify-between gap-4 border-b border-rp-hl-med/70 pb-3"><dt className="text-rp-muted">E-pošta</dt><dd className="truncate font-medium text-rp-text">{currentUser?.email || '—'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-rp-muted">Šola</dt><dd className="truncate font-medium text-rp-text">{userProfile?.school || 'Ni dodana'}</dd></div>
          </dl>
        </section>
      </div>

      <section className="glass-card p-5 sm:p-6" aria-labelledby="study-data-heading">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 id="study-data-heading" className="text-lg font-semibold text-rp-text">Učni podatki</h2><p className="mt-1 text-sm text-rp-muted">Pregled tvojih predmetov in nalog.</p></div><p className="text-xs text-rp-muted">Uspešnost nalog: <strong className="text-rp-text">{completionRate}%</strong></p></div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Predmeti" value={subjects.length} tone="text-rp-iris" /><Metric label="Vse naloge" value={tasks.length} /><Metric label="Odprte naloge" value={pending} tone="text-rp-gold" /><Metric label="Opravljene" value={completed} tone="text-rp-pine" /></div>
        <div className="mt-5 flex flex-col justify-between gap-4 border-t border-rp-hl-med/70 pt-5 sm:flex-row sm:items-center"><div><h3 className="text-sm font-semibold text-rp-text">Prenesi svoje podatke</h3><p className="mt-1 max-w-xl text-xs leading-5 text-rp-muted">Shrani profil, predmete in naloge v datoteko JSON. Datoteka se ustvari v tvoji napravi.</p></div><button type="button" onClick={exportStudyData} disabled={subjectsLoading || tasksLoading} className="shrink-0 rounded-xl border border-rp-iris/25 bg-rp-iris/[.07] px-4 py-2.5 text-xs font-semibold text-rp-iris transition hover:bg-rp-iris/15 disabled:cursor-wait disabled:opacity-50">{exported ? '✓ Datoteka prenesena' : subjectsLoading || tasksLoading ? 'Nalagam podatke…' : 'Izvozi podatke'}</button></div>
      </section>

      <p className="px-1 text-xs leading-5 text-rp-muted">Tema se shrani v tvoj Firebase profil. Nastavitve dostopnosti se shranijo lokalno v tem brskalniku.</p>
    </div>
  );
}
