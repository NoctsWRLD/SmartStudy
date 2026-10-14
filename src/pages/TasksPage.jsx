import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Skeleton from '../components/Skeleton';
import { addDaysToDateKey, getSlovenianDateKey } from '../utils/dates';

const FILTERS = [
  { key: 'all', label: 'Vse' },
  { key: 'pending', label: 'Odprte' },
  { key: 'completed', label: 'Opravljene' },
];

function SummaryCard({ label, value, caption }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-[13px] text-rp-muted">{label}</p>
      <p className="font-display mt-1 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-rp-muted">{caption}</p>
    </div>
  );
}

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { tasks, loading, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const initialSubjectId = searchParams.get('subject') || '';
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === '1' && Boolean(initialSubjectId));
  const [editTask, setEditTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [search, setSearch] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);

  function getSubject(task) {
    return subjects.find((subject) => subject.id === task.subjectId) || null;
  }

  function openNewTask() {
    if (subjectsLoading) return;
    if (!subjects.length) {
      navigate('/subjects?create=1&from=task');
      return;
    }
    setEditTask(null);
    setModalOpen(true);
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('sl');
    const list = tasks.filter((task) => {
      if (statusFilter === 'pending' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;
      if (subjectFilter && task.subjectId !== subjectFilter) return false;
      const subject = subjects.find((item) => item.id === task.subjectId);
      return !term || `${task.title} ${task.description || ''} ${subject?.name || ''}`.toLocaleLowerCase('sl').includes(term);
    });
    list.sort((a, b) => {
      if (sortBy === 'createdAt') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
    return list;
  }, [tasks, subjects, statusFilter, subjectFilter, sortBy, search]);

  function handleSave(data) {
    if (editTask) updateTask(editTask.id, data);
    else addTask(data);
    setEditTask(null);
    if (searchParams.get('new') === '1') navigate('/tasks', { replace: true });
  }

  function handleEdit(task) {
    setEditTask(task);
    setModalOpen(true);
  }

  function handleDelete(task) {
    if (window.confirm(`Izbrišem nalogo »${task.title}«?`)) deleteTask(task.id);
  }

  function toggleSelecting() {
    setSelecting((v) => !v);
    setSelected([]);
  }

  function toggleSelect(task) {
    setSelected((prev) => (prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id]));
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((t) => t.id)));
  }

  async function bulkComplete() {
    for (const id of selected) {
      await updateTask(id, { completed: true });
    }
    setSelected([]);
    setSelecting(false);
  }

  async function bulkDelete() {
    if (!window.confirm(`Izbrišem ${selected.length} ${selected.length === 1 ? 'nalogo' : selected.length === 2 ? 'nalogi' : 'nalog'}?`)) return;
    for (const id of selected) {
      await deleteTask(id);
    }
    setSelected([]);
    setSelecting(false);
  }

  function closeTaskModal() {
    setModalOpen(false);
    setEditTask(null);
    if (searchParams.get('new') === '1') navigate('/tasks', { replace: true });
  }

  const pending = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed);
  const today = getSlovenianDateKey();
  const threeDaysFromNow = addDaysToDateKey(today, 3);
  const overdue = pending.filter((task) => task.dueDate && task.dueDate < today).length;
  const dueSoon = pending.filter((task) => task.dueDate && task.dueDate >= today && task.dueDate <= threeDaysFromNow).length;
  const completion = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-8">
      <section className="rise">
        <h1 className="page-title">Tvoje naloge</h1>
        <p className="body-quiet mt-2">Poišči nalogo, preveri najbližje roke in označi opravljeno. Vsaka zaključena naloga je korak naprej.</p>
        <div className="mt-4">
          <button id="add-task-btn" type="button" onClick={openNewTask} disabled={subjectsLoading} className="btn-primary disabled:opacity-60">Nova naloga</button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4" aria-label="Pregled nalog">
        <SummaryCard label="Odprte naloge" value={pending.length} caption="čakajo na tvoj korak" tone="text-rp-iris" icon="◷" />
        <SummaryCard label="Rok v 3 dneh" value={dueSoon} caption="pripravi si čas zanje" tone="text-rp-gold" icon="⌁" />
        <SummaryCard label="Zamujene" value={overdue} caption="začni z najstarejšim rokom" tone="text-rp-love" icon="!" />
        <SummaryCard label="Opravljeno" value={`${completion}%`} caption={`${completed.length} zaključenih nalog`} tone="text-rp-pine" icon="✓" />
      </section>

      {!subjectsLoading && subjects.length === 0 && (
        <section role="alert" className="flex flex-col gap-4 rounded-2xl border border-rp-gold/20 bg-rp-gold/[.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rp-gold/10 text-rp-gold" aria-hidden="true">!</span><div><h2 className="text-sm font-semibold text-rp-text">Najprej ustvari predmet</h2><p className="mt-1 text-xs leading-5 text-rp-subtle">Tako bo vsaka nova naloga lepo razvrščena po predmetu. Po ustvarjanju te vrnem sem in odprem obrazec za nalogo.</p></div></div>
          <button type="button" onClick={() => navigate('/subjects?create=1&from=task')} className="shrink-0 rounded-xl border border-rp-gold/30 px-4 py-2.5 text-xs font-semibold text-rp-gold transition hover:bg-rp-gold/10">Ustvari predmet <span aria-hidden="true">→</span></button>
        </section>
      )}

      <section className="space-y-4" aria-label="Seznam nalog">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-rp-hl-med/50 bg-rp-overlay/65 p-1">
            {FILTERS.map((filter) => <button key={filter.key} type="button" onClick={() => setStatusFilter(filter.key)} aria-pressed={statusFilter === filter.key} className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition ${statusFilter === filter.key ? 'bg-rp-iris text-rp-base shadow-sm' : 'text-rp-subtle hover:bg-rp-hl-med/25 hover:text-rp-text'}`}>{filter.label}</button>)}
          </div>
          <button type="button" onClick={toggleSelecting} aria-pressed={selecting} className={`shrink-0 self-start rounded-xl border px-4 py-2 text-xs font-semibold transition lg:self-auto ${selecting ? 'border-rp-iris bg-rp-iris/[.08] text-rp-text' : 'border-rp-hl-med/60 text-rp-subtle hover:border-rp-hl-high hover:text-rp-text'}`}>
            {selecting ? 'Prekliči izbor' : 'Izberi'}
          </button>
          <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_auto_auto]">
            <label className="relative block"><span className="sr-only">Poišči nalogo</span><svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="7" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="m16 16 4 4" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Poišči nalogo…" className="w-full rounded-xl border border-rp-hl-med/60 bg-rp-surface/70 py-2.5 pl-9 pr-3 text-xs text-rp-text outline-none placeholder:text-rp-muted focus:border-rp-iris/60" /></label>
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} aria-label="Filtriraj po predmetu" className="rounded-xl border border-rp-hl-med/60 bg-rp-surface/70 px-3 py-2.5 text-xs text-rp-subtle outline-none focus:border-rp-iris/60"><option value="">Vsi predmeti</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Razvrsti naloge" className="rounded-xl border border-rp-hl-med/60 bg-rp-surface/70 px-3 py-2.5 text-xs text-rp-subtle outline-none focus:border-rp-iris/60"><option value="dueDate">Po roku</option><option value="createdAt">Najnovejše</option></select>
          </div>
        </div>

        {selecting && (
          <div className="card rise flex flex-wrap items-center gap-2 p-3" role="toolbar" aria-label="Množična dejanja">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold transition-colors hover:bg-rp-overlay">
              <input
                type="checkbox"
                checked={filtered.length > 0 && selected.length === filtered.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 accent-[var(--rp-iris)]"
              />
              Izberi vse ({filtered.length})
            </label>
            <span className="text-[13px] text-rp-muted">Izbranih {selected.length}</span>
            <span className="flex-1" />
            <button type="button" onClick={bulkComplete} disabled={selected.length === 0} className="btn-ghost !py-2 !text-xs disabled:opacity-50">Označi kot opravljene</button>
            <button type="button" onClick={bulkDelete} disabled={selected.length === 0} className="rounded-[14px] border border-rp-love/30 px-4 py-2 text-xs font-semibold text-rp-love transition hover:bg-rp-love/10 disabled:opacity-50">Izbriši izbrane</button>
          </div>
        )}

        {loading || subjectsLoading ? (
          <Skeleton lines={5} />
        ) : filtered.length === 0 ? (
          <div className="card flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rp-foam/10 text-2xl text-rp-foam" aria-hidden="true">✓</span>
            <h2 className="mt-4 text-lg font-semibold text-rp-text">{search ? 'Ni zadetkov' : statusFilter === 'completed' ? 'Še ni opravljenih nalog' : 'Vse je urejeno'}</h2>
            <p className="mt-1 max-w-sm text-sm leading-6 text-rp-muted">{search ? `Poskusi drug izraz za »${search}«.` : pending.length ? 'Vse naloge so opravljene. Vzemi si zaslužen odmor!' : 'Dodaj novo nalogo in jo razdeli na majhen, izvedljiv korak.'}</p>
            {!search && pending.length === 0 && subjects.length > 0 && <button type="button" onClick={openNewTask} className="btn-primary mt-4 !py-2.5 !text-xs">Dodaj nalogo</button>}
          </div>
        ) : (
          <div className="space-y-3 stagger-children">{filtered.map((task) => <TaskCard key={task.id} task={task} subject={getSubject(task)} onToggle={toggleTask} onEdit={handleEdit} onDelete={handleDelete} selectionMode={selecting} selected={selected.includes(task.id)} onSelect={toggleSelect} />)}</div>
        )}
      </section>

      <TaskModal isOpen={modalOpen} onClose={closeTaskModal} onSave={handleSave} subjects={subjects} task={editTask} defaultSubjectId={initialSubjectId} />
    </div>
  );
}
