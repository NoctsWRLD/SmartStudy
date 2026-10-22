import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Skeleton from '../components/Skeleton';
import StatTile from '../components/StatTile';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { CheckIcon, SearchIcon, SparkIcon } from '../components/icons';
import { addDaysToDateKey, getSlovenianDateKey } from '../utils/dates';
import { filterTasks, summarizeTasks } from '../utils/tasks';
import { countedNoun } from '../utils/slovenian';

const FILTERS = [
  { key: 'pending', label: 'Odprte' },
  { key: 'completed', label: 'Opravljene' },
  { key: 'all', label: 'Vse' },
];

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { tasks, loading, error, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const initialSubjectId = searchParams.get('subject') || '';
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [search, setSearch] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);

  // The side rail links here with ?new=1. The form can only open once the
  // subjects are known, because a task always belongs to one.
  const wantsNewTask = searchParams.get('new') === '1';
  const subjectsReady = !subjectsLoading;
  const formOpen = modalOpen || (wantsNewTask && subjectsReady && subjects.length > 0);

  useEffect(() => {
    if (!wantsNewTask || !subjectsReady) return;
    if (!subjects.length) navigate('/subjects?create=1&from=task', { replace: true });
  }, [wantsNewTask, subjectsReady, subjects.length, navigate]);

  const today = getSlovenianDateKey();
  const threeDaysFromNow = addDaysToDateKey(today, 3);

  const filtered = useMemo(
    () => filterTasks(tasks, subjects, { status: statusFilter, subjectId: subjectFilter, search, sort: sortBy }),
    [tasks, subjects, statusFilter, subjectFilter, search, sortBy],
  );
  const summary = useMemo(
    () => summarizeTasks(tasks, today, threeDaysFromNow),
    [tasks, today, threeDaysFromNow],
  );

  function openNewTask() {
    if (subjectsLoading) return;
    if (!subjects.length) {
      navigate('/subjects?create=1&from=task');
      return;
    }
    setEditTask(null);
    setModalOpen(true);
  }

  function handleSave(data) {
    if (editTask) updateTask(editTask.id, data);
    else addTask(data);
    setEditTask(null);
    if (wantsNewTask) navigate('/tasks', { replace: true });
  }

  function toggleSelect(task) {
    setSelected((previous) =>
      previous.includes(task.id) ? previous.filter((id) => id !== task.id) : [...previous, task.id],
    );
  }

  function toggleSelectAll() {
    setSelected((previous) =>
      previous.length === filtered.length ? [] : filtered.map((task) => task.id),
    );
  }

  async function bulkComplete() {
    for (const id of selected) {
      await updateTask(id, { completed: true });
    }
    setSelected([]);
    setSelecting(false);
  }

  async function bulkDelete() {
    const label = countedNoun(selected.length, 'nalogo', 'nalogi', 'naloge', 'nalog');
    if (!window.confirm(`Izbrišem ${label}?`)) return;
    for (const id of selected) {
      await deleteTask(id);
    }
    setSelected([]);
    setSelecting(false);
  }

  function closeTaskModal() {
    setModalOpen(false);
    setEditTask(null);
    if (wantsNewTask) navigate('/tasks', { replace: true });
  }

  return (
    <div className="space-y-6">
      <section className="rise margin-rule">
        <h1 className="text-page text-rp-text">Tvoje naloge</h1>
        <p className="mt-2 max-w-xl text-body text-rp-muted">
          Poišči nalogo, preveri najbližje roke in označi opravljeno. Vsaka zaključena
          naloga je korak naprej.
        </p>
        <div className="mt-4">
          <button id="add-task-btn" type="button" onClick={openNewTask} disabled={subjectsLoading} className="btn btn-primary disabled:opacity-60">
            Nova naloga
          </button>
        </div>
      </section>

      <section className="rise grid grid-cols-2 gap-4 border-y border-rp-line py-5 sm:grid-cols-4" aria-label="Pregled nalog">
        <StatTile value={summary.pending} label="odprtih nalog" />
        <StatTile value={summary.dueSoon} label="rok v 3 dneh" tone="text-rp-warn" />
        <StatTile value={summary.overdue} label="zamujenih" tone={summary.overdue > 0 ? 'text-rp-danger' : 'text-rp-text'} />
        <StatTile value={`${summary.completion}%`} label="opravljeno" tone="text-rp-success" />
      </section>

      {!subjectsLoading && subjects.length === 0 && (
        <section
          role="alert"
          className="flex flex-col gap-4 rounded-lg border border-rp-warn/25 bg-rp-warn/[.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-rp-warn/10 text-rp-warn" aria-hidden="true">
              <SparkIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-body font-semibold text-rp-text">Najprej ustvari predmet</h2>
              <p className="mt-1 text-small leading-5 text-rp-muted">
                Tako bo vsaka nova naloga lepo razvrščena po predmetu. Po ustvarjanju te
                vrnem sem in odprem obrazec za nalogo.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/subjects?create=1&from=task')}
            className="shrink-0 rounded-md border border-rp-warn/30 px-4 py-2.5 text-small font-semibold text-rp-warn transition-colors hover:bg-rp-warn/10"
          >
            Ustvari predmet
          </button>
        </section>
      )}

      <section className="space-y-4" aria-label="Seznam nalog">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-md border border-rp-line bg-rp-raised p-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatusFilter(filter.key)}
                  aria-pressed={statusFilter === filter.key}
                  className={`rounded-xs px-3.5 py-1.5 text-small font-semibold transition-colors ${
                    statusFilter === filter.key
                      ? 'bg-rp-accent text-rp-accent-ink'
                      : 'text-rp-subtle hover:bg-rp-overlay hover:text-rp-text'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => { setSelecting((value) => !value); setSelected([]); }}
              aria-pressed={selecting}
              className={`rounded-md border px-4 py-2 text-small font-semibold transition-colors ${
                selecting
                  ? 'border-rp-accent bg-rp-accent/[.08] text-rp-text'
                  : 'border-rp-line text-rp-subtle hover:border-rp-line-strong hover:text-rp-text'
              }`}
            >
              {selecting ? 'Prekliči izbor' : 'Izberi'}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_auto_auto] lg:ml-auto">
            <label className="relative block">
              <span className="sr-only">Poišči nalogo</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Poišči nalogo…"
                className="field !py-2.5 !pl-9 !text-small"
              />
            </label>
            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              aria-label="Filtriraj po predmetu"
              className="field !w-auto !py-2.5 !text-small"
            >
              <option value="">Vsi predmeti</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Razvrsti naloge"
              className="field !w-auto !py-2.5 !text-small"
            >
              <option value="dueDate">Po roku</option>
              <option value="createdAt">Najnovejše</option>
            </select>
          </div>
        </div>

        {selecting && (
          <div className="card flex flex-wrap items-center gap-2 p-3" role="toolbar" aria-label="Množična dejanja">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xs px-2 py-1.5 text-small font-semibold transition-colors hover:bg-rp-overlay">
              <input
                type="checkbox"
                checked={filtered.length > 0 && selected.length === filtered.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 accent-[var(--rp-accent)]"
              />
              Izberi vse ({filtered.length})
            </label>
            <span className="text-small text-rp-muted">Izbranih {selected.length}</span>
            <span className="flex-1" />
            <button type="button" onClick={bulkComplete} disabled={selected.length === 0} className="btn !py-2 !text-small disabled:opacity-50">
              Označi kot opravljene
            </button>
            <button
              type="button"
              onClick={bulkDelete}
              disabled={selected.length === 0}
              className="btn btn-danger"
            >
              Izbriši izbrane
            </button>
          </div>
        )}

        {error ? (
          <ErrorState message={error} />
        ) : loading || subjectsLoading ? (
          <Skeleton lines={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CheckIcon className="h-6 w-6" />}
            title={search ? 'Ni zadetkov' : statusFilter === 'completed' ? 'Še ni opravljenih nalog' : 'Vse je urejeno'}
            description={
              search
                ? `Poskusi drug izraz za »${search}«.`
                : summary.pending
                  ? 'Vse naloge so opravljene. Vzemi si zaslužen odmor.'
                  : 'Dodaj novo nalogo in jo razdeli na majhen, izvedljiv korak.'
            }
            action={
              !search && summary.pending === 0 && subjects.length > 0 ? (
                <button type="button" onClick={openNewTask} className="btn btn-primary !py-2.5 !text-small">Dodaj nalogo</button>
              ) : null
            }
          />
        ) : (
          <div className="sheet ledger">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                subject={subjects.find((subject) => subject.id === task.subjectId) || null}
                onToggle={toggleTask}
                onEdit={(value) => { setEditTask(value); setModalOpen(true); }}
                onDelete={(value) => {
                  if (window.confirm(`Izbrišem nalogo »${value.title}«?`)) deleteTask(value.id);
                }}
                selectionMode={selecting}
                selected={selected.includes(task.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </section>

      <TaskModal
        isOpen={formOpen}
        onClose={closeTaskModal}
        onSave={handleSave}
        subjects={subjects}
        task={editTask}
        defaultSubjectId={initialSubjectId || subjects[0]?.id || ''}
      />
    </div>
  );
}
