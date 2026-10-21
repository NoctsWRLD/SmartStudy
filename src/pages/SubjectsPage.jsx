import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SUBJECT_COLORS from '../utils/colors';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import SubjectModal from '../components/SubjectModal';
import SubjectTaskModal from '../components/SubjectTaskModal';
import Skeleton from '../components/Skeleton';
import { SparkIcon } from '../components/icons';

function SubjectCard({ subject, tasks, onOpen, onEdit, onDelete }) {
  const color = SUBJECT_COLORS[subject.colorIndex] || SUBJECT_COLORS[0];
  const done = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - done;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <article className="card card-hover group relative overflow-hidden p-5" style={{ borderTop: `3px solid ${color.colorVar}` }}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-accent">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-lg font-bold ${color.bg} ${color.text} ${color.border}`}>
            {subject.name?.trim()[0]?.toUpperCase() || '•'}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-rp-text">{subject.name}</span>
            <span className="mt-1 block text-xs text-rp-muted">{tasks.length} {tasks.length === 1 ? 'naloga' : 'nalog'} · {pending} {pending === 1 ? 'odprta' : 'odprtih'}</span>
          </span>
        </button>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onEdit} aria-label={`Uredi predmet ${subject.name}`} title="Uredi predmet" className="rounded-lg p-2 text-rp-muted transition hover:bg-rp-accent/10 hover:text-rp-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-accent">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828z" /></svg>
          </button>
          <button type="button" onClick={onDelete} aria-label={`Izbriši predmet ${subject.name}`} title="Izbriši predmet" className="rounded-lg p-2 text-rp-muted transition hover:bg-rp-danger/10 hover:text-rp-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-danger">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      <button type="button" onClick={onOpen} className="mt-6 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-accent">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-rp-subtle">Napredek pri predmetu</span>
          <span className={`font-semibold ${color.text}`}>{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rp-overlay">
          <div className="bar-grow h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color.colorVar }} />
        </div>
        <span className="mt-3 flex items-center justify-between text-xs text-rp-muted">
          <span>{done} {done === 1 ? 'opravljena naloga' : 'opravljenih nalog'}</span>
          <span className="text-rp-subtle transition group-hover:text-rp-accent">Odpri naloge</span>
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
    <div className="mx-auto max-w-6xl space-y-7 pb-8">
      <section className="rise">
        <h1 className="page-title">Predmeti</h1>
        <p className="body-quiet mt-2">Vsak predmet ima svoj prostor za naloge in napredek. Tako hitro vidiš, kaj je že za tabo in kaj te še čaka.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => { setEditSubject(null); setModalOpen(true); }} className="btn-primary">Nov predmet</button>
          <p className="text-sm text-rp-muted">{subjects.length} {subjects.length === 1 ? 'predmet' : subjects.length === 2 ? 'predmeta' : subjects.length >= 3 && subjects.length <= 4 ? 'predmeti' : 'predmetov'} · {completedTasks} opravljenih nalog</p>
        </div>
      </section>

      <section className="grid gap-2.5 sm:grid-cols-3" aria-label="Kako delujejo predmeti">
        {[
          ['1', 'Ustvari predmet', 'Dodaj predmete, ki jih imaš v šoli.'],
          ['2', 'Poveži naloge', 'Vsaka naloga pripada enemu predmetu.'],
          ['3', 'Spremljaj napredek', 'Obkljukaj opravljeno in vidi, kako napreduješ.'],
        ].map(([step, title, description]) => (
          <article key={step} className="card flex gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rp-accent/10 text-xs font-bold text-rp-accent" aria-hidden="true">{step}</span>
            <div><h2 className="text-sm font-semibold text-rp-text">{title}</h2><p className="mt-1 text-xs leading-5 text-rp-muted">{description}</p></div>
          </article>
        ))}
      </section>

      {fromTask && <div role="status" className="flex gap-3 rounded-2xl border border-rp-warn/20 bg-rp-warn/[.06] p-4 text-sm leading-6 text-rp-warn"><SparkIcon className="mt-1 h-4 w-4 shrink-0" /><p><strong>Najprej ustvari predmet.</strong> Nalogo bova nato samodejno povezala z njim.</p></div>}

      {!loading && subjects.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold text-rp-text">Tvoj seznam</h2><p className="mt-1 text-xs text-rp-muted">Odpri predmet za pregled njegovih nalog.</p></div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Išči predmet</span>
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="7" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="m16 16 4 4" /></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Poišči predmet…" className="w-full rounded-xl border border-rp-line/60 bg-rp-raised/70 py-3 pl-10 pr-4 text-sm text-rp-text outline-none placeholder:text-rp-muted focus:border-rp-accent/60" />
          </label>
        </div>
      )}

      {loading ? (
        <Skeleton lines={4} />
      ) : subjects.length === 0 ? (
        <section className="card flex flex-col items-center px-6 py-12 text-center sm:py-16">
          <span className="grid h-16 w-16 place-items-center rounded-3xl border border-rp-accent/20 bg-rp-accent/10 text-3xl text-rp-accent" aria-hidden="true">▤</span>
          <h2 className="mt-5 text-xl font-semibold text-rp-text">Začni s prvim predmetom</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-rp-muted">Ustvari na primer Matematiko ali Slovenščino. Nato ti bomo naloge samodejno povezali s predmetom.</p>
          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary mt-6">Ustvari prvi predmet</button>
        </section>
      ) : visibleSubjects.length === 0 ? (
        <div className="card px-6 py-12 text-center"><p className="text-sm text-rp-muted">Noben predmet se ne ujema z »{search}«.</p></div>
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
