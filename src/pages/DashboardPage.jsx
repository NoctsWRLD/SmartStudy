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

  function openTaskModal() {
    if (subjectsLoading) return;
    if (!subjects.length) { navigate('/subjects?create=1&from=task'); return; }
    setEditTask(null);
    setModalOpen(true);
  }

  return (
    <div className="space-y-9">
      <section className="rise" aria-labelledby="dash-title">
        <p className="text-sm text-rp-muted">{dateLabel}</p>
        <h1 id="dash-title" className="page-title mt-2 max-w-2xl">
          {greeting}, {displayName}. Kaj je danes najpomembneje?
        </h1>
        <p className="body-quiet mt-3">
          {pending.length === 0
            ? 'Nič odprtega. Dodaj naslednjo stvar ali si vzemi pavzo.'
            : `${pending.length} ${pending.length === 1 ? 'odprta naloga' : 'odprtih nalog'} — začni z eno in nameni ji 25 minut.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={openTaskModal} disabled={subjectsLoading} className="btn-primary disabled:opacity-60">
            Nova naloga
          </button>
          <Link to="/schedule" className="btn-ghost">Urnik za ta teden</Link>
        </div>
      </section>

      <section className="rise grid grid-cols-3 gap-2 border-y border-rp-hl-med py-5" aria-label="Pregled napredka">
        {[
          { v: String(pending.length), l: 'odprtih' },
          { v: String(dueToday), l: 'zapade danes' },
          { v: `${completion}%`, l: 'narejeno' },
        ].map((s) => (
          <div key={s.l}>
            <p className="font-display text-3xl font-bold tracking-tight tabular-nums">{s.v}</p>
            <p className="mt-0.5 text-[13px] text-rp-muted">{s.l}</p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(17rem,.8fr)]">
        <section className="rise min-w-0" aria-labelledby="upcoming-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="upcoming-heading" className="section-title">Naslednje naloge</h2>
            <Link to="/tasks" className="link-signal">Vse naloge</Link>
          </div>
          {tasksLoading ? (
            <div className="card grid min-h-40 place-items-center" role="status">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" />
              <span className="sr-only">Naloge se nalagajo</span>
            </div>
          ) : upcoming.length ? (
            <div className="stagger">
              {upcoming.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  subject={subjects.find((s) => s.id === task.subjectId) || null}
                  onToggle={toggleTask}
                  onEdit={(t) => { setEditTask(t); setModalOpen(true); }}
                  onDelete={(t) => { if (window.confirm(`Izbrišem nalogo »${t.title}«?`)) deleteTask(t.id); }}
                />
              ))}
            </div>
          ) : (
            <div className="card p-6">
              <h3 className="section-title">Prazno. In to je v redu.</h3>
              <p className="body-quiet mt-2">Dodaj prvo nalogo za ta teden.</p>
              <button type="button" onClick={openTaskModal} className="btn-ghost mt-4">Dodaj nalogo</button>
            </div>
          )}
        </section>

        <aside className="grid gap-4">
          <FocusTimer />
          <StudyTipCard />
        </aside>
      </div>

      <section aria-labelledby="subjects-heading" className="rise">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="subjects-heading" className="section-title">Predmeti</h2>
          <Link to="/subjects" className="link-signal">Uredi</Link>
        </div>
        {subjectsLoading ? (
          <div className="card grid min-h-24 place-items-center" role="status">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="body-quiet">Dodaj prvi predmet, da razvrstiš naloge.</p>
            <Link to="/subjects" className="btn-ghost">Odpri predmete</Link>
          </div>
        ) : (
          <div className="stagger grid gap-2.5 sm:grid-cols-2">
            {subjects.slice(0, 4).map((subject) => {
              const color = SUBJECT_COLORS[subject.colorIndex] || SUBJECT_COLORS[0];
              const sTasks = tasks.filter((t) => t.subjectId === subject.id);
              const done = sTasks.filter((t) => t.completed).length;
              const progress = sTasks.length ? Math.round((done / sTasks.length) * 100) : 0;
              return (
                <Link key={subject.id} to="/subjects" className="card card-hover block p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: color.colorCode }} aria-hidden="true">
                      {subject.name?.[0]?.toUpperCase() || '•'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[14.5px] font-semibold">{subject.name}</h3>
                      <p className="text-xs text-rp-muted">{sTasks.length} nalog · {progress}%</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rp-overlay" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="bar-grow h-full rounded-full bg-rp-iris" style={{ width: `${progress}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSave={(data) => { if (editTask) updateTask(editTask.id, data); else addTask(data); setEditTask(null); }}
        subjects={subjects}
        task={editTask}
      />
    </div>
  );
}
