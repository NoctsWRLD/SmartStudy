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

function Stat({ label, value, hint }) {
  return (
    <article className="card card-hover rise p-4 sm:p-5">
      <p className="text-[13px] font-medium text-rp-muted">{label}</p>
      <p className="font-display mt-1 text-4xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-rp-muted">{hint}</p>
    </article>
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
  const pending = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const dueToday = pending.filter((t) => t.dueDate === today).length;
  const upcoming = useMemo(() => [...pending].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  }).slice(0, 4), [pending]);
  const completion = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  const hour = getHourInSlovenia(now);
  const greeting = hour < 12 ? 'Dobro jutro' : hour < 18 ? 'Dober dan' : 'Dober večer';
  const dateLabel = formatSlovenianDate(today, { weekday: 'long', day: 'numeric', month: 'long' });
  const displayName = currentUser?.displayName?.trim().split(/\s+/)[0] || 'hej';

  function getSubject(task) {
    return subjects.find((s) => s.id === task.subjectId) || null;
  }
  function saveTask(data) {
    if (editTask) updateTask(editTask.id, data);
    else addTask(data);
    setEditTask(null);
  }
  function openTaskModal() {
    if (subjectsLoading) return;
    if (!subjects.length) { navigate('/subjects?create=1&from=task'); return; }
    setEditTask(null);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6 pb-8 md:space-y-8">
      {/* Hero — notebook minimal */}
      <section className="card rise relative overflow-hidden p-6 sm:p-8" aria-labelledby="dash-title">
        <svg className="doodle pointer-events-none absolute -right-4 top-4 h-24 w-24 text-rp-iris/15" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <path d="M10 70 C 30 20, 60 90, 90 30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M78 18l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="currentColor" />
        </svg>
        <p className="text-[13px] font-medium capitalize text-rp-muted">{dateLabel}</p>
        <h1 id="dash-title" className="font-display mt-2 max-w-xl text-3xl font-bold leading-[1.05] tracking-tight sm:text-[2.6rem]">
          {greeting}, <span className="marker">{displayName}</span>.
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-6 text-rp-muted">
          Izberi eno stvar in ji nameni 25 mirnih minut. Ostalo počaka.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={openTaskModal} disabled={subjectsLoading} className="btn-primary disabled:opacity-60">
            + Nova naloga
          </button>
          <Link to="/schedule" className="btn-ghost">Poglej urnik</Link>
        </div>
      </section>

      {/* Stats — plain numbers, no icon tiles */}
      <section className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Pregled napredka">
        <Stat label="Odprto" value={pending.length} hint="nalog čaka nate" />
        <Stat label="Danes" value={dueToday} hint={dueToday === 1 ? 'rok se izteče danes' : 'rokov danes'} />
        <Stat label="Narejeno" value={completed.length} hint="že kljukano" />
        <Stat label={`${completion}%`} value={`${completion}%`} hint={`${subjects.length} predmetov`} />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,.9fr)]">
        <section className="rise min-w-0" aria-labelledby="upcoming-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="upcoming-heading" className="font-display text-xl font-bold tracking-tight">Danes na vrsti</h2>
            <Link to="/tasks" className="rounded-lg px-2 py-1 text-[13px] font-semibold text-rp-iris hover:underline">Vse naloge →</Link>
          </div>
          {tasksLoading ? (
            <div className="card grid min-h-48 place-items-center" role="status">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" />
              <span className="sr-only">Naloge se nalagajo</span>
            </div>
          ) : upcoming.length ? (
            <div className="stagger space-y-2.5">
              {upcoming.map((task) => (
                <div key={task.id} className="rise">
                  <TaskCard task={task} subject={getSubject(task)} onToggle={toggleTask} onEdit={(t) => { setEditTask(t); setModalOpen(true); }} onDelete={(t) => { if (window.confirm(`Izbrišem nalogo »${t.title}«?`)) deleteTask(t.id); }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="card rise flex flex-col items-center px-6 py-10 text-center">
              <p className="font-hand text-3xl">vse narejeno! *</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-rp-muted">Ni odprtih nalog. Dodaj novo ali si vzemi odmor.</p>
              <button type="button" onClick={openTaskModal} className="btn-ghost mt-4">Dodaj nalogo</button>
            </div>
          )}
        </section>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <FocusTimer />
          <StudyTipCard />
        </aside>
      </div>

      <section aria-labelledby="subjects-heading" className="rise">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="subjects-heading" className="font-display text-xl font-bold tracking-tight">Tvoji predmeti</h2>
          <Link to="/subjects" className="rounded-lg px-2 py-1 text-[13px] font-semibold text-rp-iris hover:underline">Uredi →</Link>
        </div>
        {subjectsLoading ? (
          <div className="card grid min-h-24 place-items-center" role="status">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="font-display text-base font-bold">Dodaj prvi predmet</h3><p className="mt-1 text-[13px] text-rp-muted">Predmeti ti pomagajo razvrstiti naloge.</p></div>
            <Link to="/subjects" className="btn-ghost">Odpri predmete</Link>
          </div>
        ) : (
          <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.slice(0, 3).map((subject) => {
              const color = SUBJECT_COLORS[subject.colorIndex] || SUBJECT_COLORS[0];
              const sTasks = tasks.filter((t) => t.subjectId === subject.id);
              const done = sTasks.filter((t) => t.completed).length;
              const progress = sTasks.length ? Math.round((done / sTasks.length) * 100) : 0;
              return (
                <Link key={subject.id} to="/subjects" className="card card-hover rise block p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-base font-bold text-white" style={{ backgroundColor: color.colorCode }} aria-hidden="true">
                        {subject.name?.[0]?.toUpperCase() || '•'}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display truncate text-[15px] font-bold">{subject.name}</h3>
                        <p className="text-xs text-rp-muted">{sTasks.length} nalog · {progress}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-rp-overlay" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-grow h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color.colorCode }} />
                  </div>
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
