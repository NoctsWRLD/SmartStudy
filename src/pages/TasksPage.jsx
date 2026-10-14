import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
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
    <div className="mx-auto max-w-7xl space-y-6 pb-8 sm:space-y-8">
      <section className="app-hero relative overflow-hidden rounded-[1.6rem] px-5 py-6 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-rp-iris/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-rp-foam">Majhni koraki, velik napredek</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-rp-text sm:text-4xl">Tvoje naloge</h1><p className="mt-2 max-w-xl text-sm leading-6 text-rp-subtle">Poišči nalogo, preveri najbližje roke in označi opravljeno. Vsaka zaključena naloga je korak naprej.</p></div>
          <button id="add-task-btn" type="button" onClick={openNewTask} disabled={subjectsLoading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rp-iris px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rp-iris/15 transition hover:-translate-y-0.5 hover:bg-[#5847bd] disabled:cursor-wait disabled:opacity-60"><span aria-hidden="true">＋</span> Nova naloga</button>
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
          <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_auto_auto]">
            <label className="relative block"><span className="sr-only">Poišči nalogo</span><svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="7" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="m16 16 4 4" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Poišči nalogo…" className="w-full rounded-xl border border-rp-hl-med/60 bg-rp-surface/70 py-2.5 pl-9 pr-3 text-xs text-rp-text outline-none placeholder:text-rp-muted focus:border-rp-iris/60" /></label>
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} aria-label="Filtriraj po predmetu" className="rounded-xl border border-rp-hl-med/60 bg-rp-surface/70 px-3 py-2.5 text-xs text-rp-subtle outline-none focus:border-rp-iris/60"><option value="">Vsi predmeti</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Razvrsti naloge" className="rounded-xl border border-rp-hl-med/60 bg-rp-surface/70 px-3 py-2.5 text-xs text-rp-subtle outline-none focus:border-rp-iris/60"><option value="dueDate">Po roku</option><option value="createdAt">Najnovejše</option></select>
          </div>
        </div>

        {loading || subjectsLoading ? (
          <div className="glass-card grid min-h-48 place-items-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" role="status" aria-label="Nalagam naloge" /></div>
        ) : filtered.length === 0 ? (
          <div className="glass-card flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rp-foam/10 text-2xl text-rp-foam" aria-hidden="true">✓</span>
            <h2 className="mt-4 text-lg font-semibold text-rp-text">{search ? 'Ni zadetkov' : statusFilter === 'completed' ? 'Še ni opravljenih nalog' : 'Vse je urejeno'}</h2>
            <p className="mt-1 max-w-sm text-sm leading-6 text-rp-muted">{search ? `Poskusi drug izraz za »${search}«.` : pending.length ? 'Vse naloge so opravljene. Vzemi si zaslužen odmor!' : 'Dodaj novo nalogo in jo razdeli na majhen, izvedljiv korak.'}</p>
            {!search && pending.length === 0 && subjects.length > 0 && <button type="button" onClick={openNewTask} className="mt-4 rounded-xl bg-rp-iris px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5847bd]">Dodaj nalogo</button>}
          </div>
        ) : (
          <div className="space-y-3 stagger-children">{filtered.map((task) => <TaskCard key={task.id} task={task} subject={getSubject(task)} onToggle={toggleTask} onEdit={handleEdit} onDelete={handleDelete} />)}</div>
        )}
      </section>

      <TaskModal isOpen={modalOpen} onClose={closeTaskModal} onSave={handleSave} subjects={subjects} task={editTask} defaultSubjectId={initialSubjectId} />
    </div>
  );
}
