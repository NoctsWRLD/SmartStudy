import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import FocusTimer from '../components/FocusTimer';
import StudyTipCard from '../components/StudyTipCard';
import SUBJECT_COLORS from '../utils/colors';
import { formatSlovenianDate, getHourInSlovenia, getSlovenianDateKey } from '../utils/dates';

function StatCard({ label, value, caption, tone, icon }) {
  return (
    <article className="glass-card group p-4 transition-transform duration-200 hover:-translate-y-1 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-rp-muted">{label}</p>
          <p className={`mt-2 text-3xl font-semibold tracking-tight ${tone}`}>{value}</p>
          <p className="mt-1 text-[11px] text-rp-muted">{caption}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl bg-rp-overlay/75 ${tone}`} aria-hidden="true">{icon}</span>
      </div>
    </article>
  );
}

function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-rp-text">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-rp-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyTasks({ onAdd }) {
  return (
    <div className="glass-card flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rp-pine/10 text-2xl text-rp-pine" aria-hidden="true">✓</span>
      <h3 className="mt-4 text-base font-semibold text-rp-text">Dober občutek, kajne?</h3>
      <p className="mt-1 max-w-xs text-sm leading-6 text-rp-muted">Trenutno nimaš odprtih nalog. Dodaj novo ali si vzemi trenutek za odmor.</p>
      <button type="button" onClick={onAdd} className="mt-4 rounded-xl border border-rp-hl-high/70 px-4 py-2 text-xs font-semibold text-rp-subtle transition-colors hover:border-rp-iris/50 hover:text-rp-text">Dodaj nalogo</button>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { tasks, loading: tasksLoading, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const today = getSlovenianDateKey(now);
  const pending = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const completed = useMemo(() => tasks.filter((task) => task.completed), [tasks]);
  const dueToday = pending.filter((task) => task.dueDate === today).length;
  const upcoming = useMemo(() => [...pending]
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 4), [pending]);
  const completion = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  const slovenianHour = getHourInSlovenia(now);
  const greeting = slovenianHour < 12 ? 'Dobro jutro' : slovenianHour < 18 ? 'Dober dan' : 'Dober večer';
  const dateLabel = formatSlovenianDate(today, { weekday: 'long', day: 'numeric', month: 'long' });
  const timeLabel = new Intl.DateTimeFormat('sl-SI', { timeZone: 'Europe/Ljubljana', hour: '2-digit', minute: '2-digit' }).format(now);
  const displayName = currentUser?.displayName?.trim().split(/\s+/)[0] || 'učenec';

  function getSubject(task) {
    return subjects.find((subject) => subject.id === task.subjectId) || null;
  }

  function saveTask(data) {
    if (editTask) updateTask(editTask.id, data);
    else addTask(data);
    setEditTask(null);
  }

  function edit(task) {
    setEditTask(task);
    setModalOpen(true);
  }

  function removeTask(task) {
    if (window.confirm(`Izbrišem nalogo »${task.title}«?`)) deleteTask(task.id);
  }

  const openTaskModal = () => {
    if (subjectsLoading) return;
    if (!subjects.length) {
      navigate('/subjects?create=1&from=task');
      return;
    }
    setEditTask(null);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8 sm:space-y-8">
      <section className="app-hero animate-fade-in-up relative overflow-hidden rounded-[1.6rem] px-5 py-6 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-8 -top-24 h-64 w-64 rounded-full bg-rp-iris/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-7rem] right-[28%] h-52 w-52 rounded-full bg-rp-foam/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium capitalize tracking-wide text-rp-subtle">{dateLabel} <span className="mx-1 text-rp-hl-high">·</span>{timeLabel}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-rp-text sm:text-3xl">{greeting}, <span className="gradient-text">{displayName}</span>.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-rp-subtle">Majhen korak naprej je še vedno napredek. Izberi eno stvar in ji nameni nekaj mirnih minut.</p>
          </div>
          <button type="button" onClick={openTaskModal} disabled={subjectsLoading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rp-iris px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(109,91,208,.2)] transition-all hover:-translate-y-0.5 hover:bg-[#5847bd] focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60">
            <span aria-hidden="true">＋</span> Nova naloga
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4" aria-label="Pregled napredka">
        <StatCard label="Odprte naloge" value={pending.length} caption="čakajo na tvoj naslednji korak" tone="text-rp-iris" icon="◷" />
        <StatCard label="Rok danes" value={dueToday} caption={dueToday === 1 ? 'ena naloga za danes' : 'nalog za danes'} tone="text-rp-gold" icon="◷" />
        <StatCard label="Opravljeno" value={completed.length} caption="nalog si že zaključil_a" tone="text-rp-pine" icon="✓" />
        <StatCard label="Napredek" value={`${completion}%`} caption={`${subjects.length} ${subjects.length === 1 ? 'predmet' : 'predmetov'} v tvojem seznamu`} tone="text-rp-foam" icon="↗" />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,.85fr)] xl:gap-6">
        <section className="min-w-0 animate-fade-in-up" aria-labelledby="upcoming-heading">
          <SectionHeading
            title="Naslednji koraki"
            subtitle="Najprej najbližji roki, nato še ostale naloge"
            action={<Link to="/tasks" className="rounded-lg px-2 py-1 text-xs font-medium text-rp-iris transition-colors hover:bg-rp-iris/10">Vse naloge <span aria-hidden="true">→</span></Link>}
          />
          {tasksLoading ? (
            <div className="glass-card grid min-h-48 place-items-center" role="status"><span className="h-8 w-8 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" /><span className="sr-only">Naloge se nalagajo</span></div>
          ) : upcoming.length ? (
            <div className="space-y-3 stagger-children">
              {upcoming.map((task) => <TaskCard key={task.id} task={task} subject={getSubject(task)} onToggle={toggleTask} onEdit={edit} onDelete={removeTask} />)}
              {pending.length > upcoming.length && <Link to="/tasks" className="block rounded-xl py-2 text-center text-xs font-medium text-rp-subtle transition-colors hover:text-rp-iris">Prikaži še preostale naloge</Link>}
            </div>
          ) : <EmptyTasks onAdd={openTaskModal} />}
        </section>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <FocusTimer />
          <StudyTipCard />
        </aside>
      </div>

      <section aria-labelledby="subjects-heading" className="animate-fade-in-up">
        <SectionHeading title="Tvoji predmeti" subtitle="Hiter pregled aktivnih področij" action={<Link to="/subjects" className="rounded-lg px-2 py-1 text-xs font-medium text-rp-iris transition-colors hover:bg-rp-iris/10">Uredi predmete <span aria-hidden="true">→</span></Link>} />
        {subjectsLoading ? (
          <div className="glass-card grid min-h-24 place-items-center" role="status"><span className="h-7 w-7 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" /><span className="sr-only">Predmeti se nalagajo</span></div>
        ) : subjects.length === 0 ? (
          <div className="glass-card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="text-sm font-semibold text-rp-text">Dodaj prvi predmet</h3><p className="mt-1 text-xs text-rp-muted">Predmeti ti pomagajo razvrstiti naloge in spremljati napredek.</p></div>
            <Link to="/subjects" className="rounded-lg border border-rp-hl-high px-3 py-2 text-xs font-medium text-rp-subtle transition-colors hover:border-rp-iris/40 hover:text-rp-text">Odpri predmete</Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.slice(0, 3).map((subject) => {
              const color = SUBJECT_COLORS[subject.colorIndex] || SUBJECT_COLORS[0];
              const subjectTasks = tasks.filter((task) => task.subjectId === subject.id);
              const done = subjectTasks.filter((task) => task.completed).length;
              const progress = subjectTasks.length ? Math.round((done / subjectTasks.length) * 100) : 0;
              return (
                <Link key={subject.id} to="/subjects" className="glass-card group p-4 transition-all hover:-translate-y-0.5 hover:border-rp-iris/25">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-sm font-semibold ${color.bg} ${color.text} ${color.border}`}>{subject.name?.[0]?.toUpperCase() || '•'}</span>
                      <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-rp-text">{subject.name}</h3><p className="mt-0.5 text-xs text-rp-muted">{subjectTasks.length} {subjectTasks.length === 1 ? 'naloga' : 'nalog'}</p></div>
                    </div>
                    <span className="text-xs font-medium text-rp-subtle">{progress}%</span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-rp-hl-med/70"><div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${progress}%`, backgroundColor: color.colorCode }} /></div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <TaskModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTask(null); }} onSave={saveTask} subjects={subjects} task={editTask} />
    </div>
  );
}
