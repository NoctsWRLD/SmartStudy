import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SUBJECT_COLORS from '../utils/colors';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import SubjectModal from '../components/SubjectModal';
import SubjectTaskModal from '../components/SubjectTaskModal';

function SubjectCard({ subject, tasks, onOpen, onEdit, onDelete }) {
  const color = SUBJECT_COLORS[subject.colorIndex] || SUBJECT_COLORS[0];
  const done = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - done;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-rp-hl-med/50 bg-rp-surface/65 p-5 shadow-[0_12px_35px_rgba(0,0,0,.12)] transition-all duration-300 hover:-translate-y-1 hover:border-rp-hl-high/70 hover:shadow-[0_20px_45px_rgba(0,0,0,.2)]">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${color.colorCode}, transparent)` }} />
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-iris">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-lg font-bold ${color.bg} ${color.text} ${color.border}`}>
            {subject.name?.trim()[0]?.toUpperCase() || '•'}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-rp-text">{subject.name}</span>
            <span className="mt-1 block text-xs text-rp-muted">{tasks.length} {tasks.length === 1 ? 'naloga' : 'nalog'} · {pending} {pending === 1 ? 'odprta' : 'odprtih'}</span>
          </span>
        </button>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onEdit} aria-label={`Uredi predmet ${subject.name}`} title="Uredi predmet" className="rounded-lg p-2 text-rp-muted transition hover:bg-rp-iris/10 hover:text-rp-iris focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-iris">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828z" /></svg>
          </button>
          <button type="button" onClick={onDelete} aria-label={`Izbriši predmet ${subject.name}`} title="Izbriši predmet" className="rounded-lg p-2 text-rp-muted transition hover:bg-rp-love/10 hover:text-rp-love focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-love">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      <button type="button" onClick={onOpen} className="mt-6 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-iris">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-rp-subtle">Napredek pri predmetu</span>
          <span className={`font-semibold ${color.text}`}>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-rp-hl-med/55">
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color.colorCode}, #9ccfd8)` }} />
        </div>
        <span className="mt-3 flex items-center justify-between text-xs text-rp-muted">
          <span>{done} {done === 1 ? 'opravljena naloga' : 'opravljenih nalog'}</span>
          <span className="text-rp-subtle transition group-hover:text-rp-iris">Odpri naloge <span aria-hidden="true">→</span></span>
        </span>
      </button>
    </article>
  );
}

export default function SubjectsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromTask = searchParams.get('from') === 'task';
  const { subjects, loading, addSubject, updateSubject, deleteSubject } = useSubjects();
  const { tasks, toggleTask, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(searchParams.get('create') === '1');
  const [editSubject, setEditSubject] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [search, setSearch] = useState('');
  const completedTasks = tasks.filter((task) => task.completed).length;
  const visibleSubjects = useMemo(() => subjects.filter((subject) => subject.name.toLowerCase().includes(search.trim().toLowerCase())), [subjects, search]);

  function handleSubjectClick(subject) {
    setSelectedSubject(subject);
    setTaskModalOpen(true);
  }

  async function handleSave(data) {
    if (editSubject) {
      updateSubject(editSubject.id, data);
    } else {
      const createdId = await addSubject(data);
      if (fromTask && createdId) navigate(`/tasks?new=1&subject=${encodeURIComponent(createdId)}`);
    }
    setEditSubject(null);
  }

  function handleEdit(subject) {
    setEditSubject(subject);
    setModalOpen(true);
  }

  function handleDelete(subject) {
    const count = tasks.filter((task) => task.subjectId === subject.id).length;
    const message = count > 0
      ? `Predmet »${subject.name}« ima ${count} nalog. Res ga želiš izbrisati?`
      : `Izbrišem predmet »${subject.name}«?`;
    if (window.confirm(message)) deleteSubject(subject.id);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8 sm:space-y-8">
      <section className="app-hero relative overflow-hidden rounded-[1.6rem] px-5 py-6 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-rp-iris/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-rp-foam">Tvoj učni prostor</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-rp-text sm:text-4xl">Predmeti</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-rp-subtle">Vsak predmet ima svoj prostor za naloge in napredek. Tako hitro vidiš, kaj je že za tabo in kaj te še čaka.</p>
          </div>
          <button type="button" onClick={() => { setEditSubject(null); setModalOpen(true); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rp-iris px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rp-iris/15 transition hover:-translate-y-0.5 hover:bg-[#5847bd]"><span aria-hidden="true">＋</span> Nov predmet</button>
        </div>
        <div className="relative mt-6 grid max-w-xl grid-cols-2 gap-3">
          <div className="rounded-xl border border-rp-hl-med/70 bg-rp-surface/75 px-4 py-3 shadow-sm"><p className="text-2xl font-semibold text-rp-text">{subjects.length}</p><p className="mt-1 text-xs text-rp-muted">{subjects.length === 1 ? 'predmet' : 'predmetov'}</p></div>
          <div className="rounded-xl border border-rp-hl-med/70 bg-rp-surface/75 px-4 py-3 shadow-sm"><p className="text-2xl font-semibold text-rp-pine">{completedTasks}</p><p className="mt-1 text-xs text-rp-muted">opravljenih nalog</p></div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Kako delujejo predmeti">
        {[
          ['01', 'Ustvari predmet', 'Dodaj predmete, ki jih imaš v šoli.'],
          ['02', 'Poveži naloge', 'Vsaka naloga pripada enemu predmetu.'],
          ['03', 'Spremljaj napredek', 'Obkljukaj opravljeno in vidi, kako napreduješ.'],
        ].map(([step, title, description]) => (
          <article key={step} className="flex gap-3 rounded-2xl border border-rp-hl-med/45 bg-rp-surface/40 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rp-iris/10 text-xs font-bold text-rp-iris">{step}</span>
            <div><h2 className="text-sm font-semibold text-rp-text">{title}</h2><p className="mt-1 text-xs leading-5 text-rp-muted">{description}</p></div>
          </article>
        ))}
      </section>

      {fromTask && <div role="status" className="flex gap-3 rounded-2xl border border-rp-gold/20 bg-rp-gold/[.06] p-4 text-sm leading-6 text-rp-gold"><span aria-hidden="true">✦</span><p><strong>Najprej ustvari predmet.</strong> Nalogo bova nato samodejno povezala z njim.</p></div>}

      {!loading && subjects.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold text-rp-text">Tvoj seznam</h2><p className="mt-1 text-xs text-rp-muted">Odpri predmet za pregled njegovih nalog.</p></div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Išči predmet</span>
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="7" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="m16 16 4 4" /></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Poišči predmet…" className="w-full rounded-xl border border-rp-hl-med/60 bg-rp-surface/70 py-3 pl-10 pr-4 text-sm text-rp-text outline-none placeholder:text-rp-muted focus:border-rp-iris/60" />
          </label>
        </div>
      )}

      {loading ? (
        <div className="glass-card grid min-h-48 place-items-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" role="status" aria-label="Nalagam predmete" /></div>
      ) : subjects.length === 0 ? (
        <section className="glass-card flex flex-col items-center px-6 py-12 text-center sm:py-16">
          <span className="grid h-16 w-16 place-items-center rounded-3xl border border-rp-iris/20 bg-rp-iris/10 text-3xl text-rp-iris" aria-hidden="true">▤</span>
          <h2 className="mt-5 text-xl font-semibold text-rp-text">Začni s prvim predmetom</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-rp-muted">Ustvari na primer Matematiko ali Slovenščino. Nato ti bomo naloge samodejno povezali s predmetom.</p>
          <button type="button" onClick={() => setModalOpen(true)} className="mt-6 rounded-xl bg-gradient-to-r from-rp-iris to-rp-foam px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">Ustvari prvi predmet <span aria-hidden="true">→</span></button>
        </section>
      ) : visibleSubjects.length === 0 ? (
        <div className="glass-card px-6 py-12 text-center"><p className="text-sm text-rp-muted">Noben predmet se ne ujema z »{search}«.</p></div>
      ) : (
        <div className="grid gap-4 stagger-children sm:grid-cols-2 xl:grid-cols-3">
          {visibleSubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} tasks={tasks.filter((task) => task.subjectId === subject.id)} onOpen={() => handleSubjectClick(subject)} onEdit={() => handleEdit(subject)} onDelete={() => handleDelete(subject)} />
          ))}
        </div>
      )}

      <SubjectModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditSubject(null); }} onSave={handleSave} subject={editSubject} />
      <SubjectTaskModal isOpen={taskModalOpen} onClose={() => { setTaskModalOpen(false); setSelectedSubject(null); }} onAddTask={() => { setTaskModalOpen(false); navigate(`/tasks?new=1&subject=${encodeURIComponent(selectedSubject?.id || '')}`); }} subject={selectedSubject} tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} />
    </div>
  );
}
