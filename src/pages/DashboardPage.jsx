import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import ErrorState from '../components/ErrorState';
import { useFlashcards } from '../hooks/useStudy';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Skeleton from '../components/Skeleton';
import FocusTimer from '../components/FocusTimer';
import StudyTipCard from '../components/StudyTipCard';
import ExamCountdown from '../components/ExamCountdown';
import WeekFocus from '../components/WeekFocus';
import StudyRail from '../components/StudyRail';
import StatTile from '../components/StatTile';
import EmptyState from '../components/EmptyState';
import { getSubjectColor } from '../utils/colors';
import { buildWeekRail } from '../utils/rail';
import { formatSlovenianDate, getHourInSlovenia, getSlovenianDateKey } from '../utils/dates';
import { countedNoun } from '../utils/slovenian';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const { subjects, loading: subjectsLoading, error: subjectsError } = useSubjects();
  const { tasks, loading: tasksLoading, error: tasksError, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const { cards } = useFlashcards();
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
  const overdue = pending.filter((task) => task.dueDate && task.dueDate < today).length;
  const upcoming = useMemo(
    () =>
      [...pending]
        .sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        })
        .slice(0, 4),
    [pending],
  );
  const completion = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
  const dueCards = useMemo(() => cards.filter((card) => !card.known).length, [cards]);
  const rail = useMemo(() => buildWeekRail(tasks, today), [tasks, today]);

  const hour = getHourInSlovenia(now);
  const greeting = hour < 12 ? 'Dobro jutro' : hour < 18 ? 'Dober dan' : 'Dober večer';
  const dateLabel = formatSlovenianDate(today, { weekday: 'long', day: 'numeric', month: 'long' });
  const displayName = currentUser?.displayName?.trim().split(/\s+/)[0] || 'učenec';

  function openTaskModal() {
    if (subjectsLoading) return;
    if (!subjects.length) {
      navigate('/subjects?create=1&from=task');
      return;
    }
    setEditTask(null);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <section className="rise margin-rule" aria-labelledby="dash-title">
        <p className="text-small text-rp-muted lg:hidden">{dateLabel}</p>
        <h1 id="dash-title" className="mt-2 max-w-2xl text-page text-rp-text">
          {greeting}, {displayName}.
        </h1>
        <p className="mt-2.5 max-w-xl text-body text-rp-muted">
          {pending.length === 0
            ? 'Nič odprtega. Dodaj naslednjo stvar ali ponovi kartice.'
            : `${countedNoun(pending.length, 'odprta naloga', 'odprti nalogi', 'odprte naloge', 'odprtih nalog')} — začni z eno in nameni ji 25 minut fokusa.`}
        </p>

        <StudyRail
          className="mt-6 max-w-2xl"
          segments={rail}
          label="Učni pas tedna"
          caption="Učni pas tedna"
        />

        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={openTaskModal} disabled={subjectsLoading} className="btn-primary disabled:opacity-60">
            Nova naloga
          </button>
          <Link to="/flashcards" className="btn-ghost">
            Ponovi kartice{dueCards > 0 ? ` (${dueCards})` : ''}
          </Link>
          <Link to="/exams" className="btn-ghost">Preverjanja</Link>
        </div>
      </section>

      {(tasksError || subjectsError) && (
        <ErrorState message={tasksError || subjectsError} />
      )}

      <section
        className="rise grid grid-cols-2 divide-x divide-y divide-rp-line border-y border-rp-line py-5 sm:grid-cols-4 sm:divide-y-0"
        aria-label="Pregled napredka"
      >
        <StatTile className="px-4 first:pl-0 sm:first:pl-0" value={pending.length} label="odprtih nalog" />
        <StatTile className="px-4" value={dueToday} label="zapade danes" tone="text-rp-accent" />
        <StatTile className="px-4 sm:pl-4" value={overdue} label="zamujenih" tone={overdue > 0 ? 'text-rp-danger' : 'text-rp-text'} />
        <StatTile className="px-4" value={`${completion}%`} label="narejeno" tone="text-rp-success" />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(17rem,.85fr)]">
        <section className="min-w-0" aria-labelledby="upcoming-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="upcoming-heading" className="text-title text-rp-text">Naslednje naloge</h2>
            <Link to="/tasks" className="link-signal">Vse naloge</Link>
          </div>
          {tasksLoading ? (
            <div className="card p-4"><Skeleton lines={4} /></div>
          ) : upcoming.length ? (
            <div className="ledger">
              {upcoming.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  subject={subjects.find((subject) => subject.id === task.subjectId) || null}
                  onToggle={toggleTask}
                  onEdit={(value) => { setEditTask(value); setModalOpen(true); }}
                  onDelete={(value) => {
                    if (window.confirm(`Izbrišem nalogo »${value.title}«?`)) deleteTask(value.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="Prazno. In to je v redu."
              description="Dodaj prvo nalogo za ta teden ali ponovi kartice."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={openTaskModal} className="btn-primary !py-2.5 !text-small">Dodaj nalogo</button>
                  <Link to="/flashcards" className="btn-ghost !py-2.5 !text-small">Kartice</Link>
                </div>
              }
            />
          )}
        </section>

        <aside className="grid gap-4">
          <ExamCountdown subjects={subjects} />
          <FocusTimer />
          <WeekFocus />
          <StudyTipCard />
        </aside>
      </div>

      <section aria-labelledby="subjects-heading">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="subjects-heading" className="text-title text-rp-text">Predmeti</h2>
          <Link to="/subjects" className="link-signal">Uredi</Link>
        </div>
        {subjectsLoading ? (
          <div className="card p-4"><Skeleton lines={2} /></div>
        ) : subjects.length === 0 ? (
          <EmptyState
            compact
            title="Dodaj prvi predmet"
            description="Dodaj prvi predmet, da razvrstiš naloge, preverjanja in kartice."
            action={<Link to="/subjects" className="btn-primary !py-2.5 !text-small">Odpri predmete</Link>}
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {subjects.slice(0, 6).map((subject) => {
              const color = getSubjectColor(subject.colorIndex);
              const subjectTasks = tasks.filter((task) => task.subjectId === subject.id);
              const done = subjectTasks.filter((task) => task.completed).length;
              const progress = subjectTasks.length ? Math.round((done / subjectTasks.length) * 100) : 0;
              const subjectCards = cards.filter((card) => card.subjectId === subject.id);
              return (
                <Link
                  key={subject.id}
                  to="/subjects"
                  className="card-hover w-52 shrink-0 rounded-t-md border border-b-0 border-rp-line bg-rp-raised p-4 transition-colors hover:border-rp-line-strong"
                  style={{ borderTop: `3px solid ${color.colorVar}` }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-xs text-small font-bold ${color.bg} ${color.text} ${color.border} border`}
                      aria-hidden="true"
                    >
                      {subject.name?.[0]?.toUpperCase() || '•'}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-body font-semibold text-rp-text">{subject.name}</span>
                      <span className="block truncate text-small text-rp-muted">
                        {countedNoun(subjectTasks.length, 'naloga', 'nalogi', 'naloge', 'nalog')}
                      </span>
                    </span>
                  </div>
                  <div
                    className="mt-3 h-1 overflow-hidden rounded-full bg-rp-fill"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Napredek pri predmetu ${subject.name}`}
                  >
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color.colorVar }} />
                  </div>
                  <p className="mt-2 text-small text-rp-muted">
                    {countedNoun(subjectCards.length, 'kartica', 'kartici', 'kartice', 'kartic')}
                  </p>
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
