import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSubjectColor } from '../utils/colors';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import SubjectModal from '../components/SubjectModal';
import SubjectTaskModal from '../components/SubjectTaskModal';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { SearchIcon, SparkIcon } from '../components/icons';
import { countedNoun } from '../utils/slovenian';

const STEPS = [
  ['Ustvari predmet', 'Dodaj predmete, ki jih imaš v šoli.'],
  ['Poveži naloge', 'Vsaka naloga pripada enemu predmetu.'],
  ['Spremljaj napredek', 'Obkljukaj opravljeno in vidi, kako napreduješ.'],
];

function SubjectRow({ subject, tasks, onOpen, onEdit, onDelete }) {
  const color = getSubjectColor(subject.colorIndex);
  const done = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - done;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <article className="ledger-row relative flex items-center gap-4 py-3.5 pl-5 pr-3">
      {/* The tab: a coloured divider, the way a subject gets its own folder. */}
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: color.colorVar }}
        aria-hidden="true"
      />

      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-md border text-sm font-bold ${color.bg} ${color.text} ${color.border}`}
          aria-hidden="true"
        >
          {subject.name?.trim()[0]?.toUpperCase() || '•'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-subtitle text-rp-text">{subject.name}</span>
          <span className="mt-0.5 block text-small text-rp-muted">
            {countedNoun(tasks.length, 'naloga', 'nalogi', 'naloge', 'nalog')} ·{' '}
            {countedNoun(pending, 'odprta', 'odprti', 'odprte', 'odprtih')}
          </span>
        </span>
      </button>

      <div className="hidden w-40 shrink-0 sm:block">
        <div className="flex items-baseline justify-between text-small">
          <span className="text-rp-muted">Napredek</span>
          <span className={`mono font-semibold ${color.text}`}>{progress}%</span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rp-fill"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Napredek pri predmetu ${subject.name}`}
        >
          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color.colorVar }} />
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={onOpen}
          className="btn btn-sm !border-transparent !bg-transparent text-rp-accent hover:!bg-rp-accent/10"
        >
          Naloge
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Uredi predmet ${subject.name}`}
          title="Uredi predmet"
          className="btn btn-icon hover:!text-rp-accent"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Izbriši predmet ${subject.name}`}
          title="Izbriši predmet"
          className="btn btn-icon hover:!text-rp-danger"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 00-1-1h-4a2 2 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </article>
  );
}

export default function SubjectsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromTask = searchParams.get('from') === 'task';
  const { subjects, loading, error, addSubject, updateSubject, deleteSubject } = useSubjects();
  const { tasks, toggleTask, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(searchParams.get('create') === '1');
  const [editSubject, setEditSubject] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [search, setSearch] = useState('');
  const completedTasks = tasks.filter((task) => task.completed).length;
  const visibleSubjects = useMemo(
    () => subjects.filter((subject) => subject.name.toLowerCase().includes(search.trim().toLowerCase())),
    [subjects, search],
  );

  async function handleSave(data) {
    if (editSubject) {
      updateSubject(editSubject.id, data);
    } else {
      const createdId = await addSubject(data);
      if (fromTask && createdId) {
        navigate(`/tasks?new=1&subject=${encodeURIComponent(createdId)}`);
      }
    }
    setEditSubject(null);
  }

  function handleDelete(subject) {
    const count = tasks.filter((task) => task.subjectId === subject.id).length;
    const message = count > 0
      ? `Predmet »${subject.name}« ima ${countedNoun(count, 'nalogo', 'nalogi', 'naloge', 'nalog')}. Res ga želiš izbrisati?`
      : `Izbrišem predmet »${subject.name}«?`;
    if (window.confirm(message)) deleteSubject(subject.id);
  }

  return (
    <div className="space-y-6">
      <section className="rise margin-rule">
        <h1 className="text-page text-rp-text">Predmeti</h1>
        <p className="mt-2 max-w-xl text-body text-rp-muted">
          Vsak predmet ima svoj prostor za naloge in napredek. Tako hitro vidiš, kaj je
          že za tabo in kaj te še čaka.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => { setEditSubject(null); setModalOpen(true); }}
            className="btn btn-primary"
          >
            Nov predmet
          </button>
          <p className="text-small text-rp-muted">
            {countedNoun(subjects.length, 'predmet', 'predmeta', 'predmeti', 'predmetov')} ·{' '}
            {countedNoun(completedTasks, 'opravljena naloga', 'opravljeni nalogi', 'opravljene naloge', 'opravljenih nalog')}
          </p>
        </div>
      </section>

      <section className="sheet px-5 py-4" aria-label="Kako delujejo predmeti">
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map(([title, description], index) => (
            <li key={title} className="flex gap-3">
              <span className="mono shrink-0 text-small font-bold text-rp-accent" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>
                <span className="block text-body font-semibold text-rp-text">{title}</span>
                <span className="mt-1 block text-small leading-5 text-rp-muted">{description}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {fromTask && (
        <div
          role="status"
          className="flex gap-3 rounded-lg border border-rp-warn/25 bg-rp-warn/[.07] p-4 text-body leading-6 text-rp-warn"
        >
          <SparkIcon className="mt-1 h-4 w-4 shrink-0" />
          <p><strong>Najprej ustvari predmet.</strong> Nalogo bova nato samodejno povezala z njim.</p>
        </div>
      )}

      {!loading && subjects.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title text-rp-text">Vsi tvoji predmeti</h2>
            <p className="mt-1 text-small text-rp-muted">Odpri predmet za pregled njegovih nalog.</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Išči predmet</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Poišči predmet…"
              className="field !pl-10"
            />
          </label>
        </div>
      )}

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <Skeleton lines={4} />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={<SparkIcon className="h-6 w-6" />}
          title="Začni s prvim predmetom"
          description="Ustvari na primer Matematiko ali Slovenščino. Nato ti naloge samodejno povežemo s predmetom."
          action={
            <button type="button" onClick={() => setModalOpen(true)} className="btn btn-primary">
              Ustvari prvi predmet
            </button>
          }
        />
      ) : visibleSubjects.length === 0 ? (
        <EmptyState
          compact
          title="Ni zadetkov"
          description={`Noben predmet se ne ujema z »${search}«.`}
        />
      ) : (
        <div className="sheet">
          <div className="ledger">
            {visibleSubjects.map((subject) => (
              <SubjectRow
                key={subject.id}
                subject={subject}
                tasks={tasks.filter((task) => task.subjectId === subject.id)}
                onOpen={() => { setSelectedSubject(subject); setTaskModalOpen(true); }}
                onEdit={() => { setEditSubject(subject); setModalOpen(true); }}
                onDelete={() => handleDelete(subject)}
              />
            ))}
          </div>
        </div>
      )}

      <SubjectModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditSubject(null); }}
        onSave={handleSave}
        subject={editSubject}
      />
      <SubjectTaskModal
        isOpen={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setSelectedSubject(null); }}
        onAddTask={() => {
          setTaskModalOpen(false);
          navigate(`/tasks?new=1&subject=${encodeURIComponent(selectedSubject?.id || '')}`);
        }}
        subject={selectedSubject}
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}
