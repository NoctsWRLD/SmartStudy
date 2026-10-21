import { useMemo, useState } from 'react';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import TaskModal from '../components/TaskModal';
import ScheduleImportModal from '../components/ScheduleImportModal';
import EmptyState from '../components/EmptyState';
import { getSubjectColor } from '../utils/colors';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, PlusIcon } from '../components/icons';
import { getWeekStart } from '../utils/rail';
import {
  addDaysToDateKey,
  formatSlovenianDate,
  getDayOfMonth,
  getSlovenianDateKey,
  getYearFromDateKey,
} from '../utils/dates';

const DAYS_SHORT = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];
const DAYS_FULL = [
  'Ponedeljek',
  'Torek',
  'Sreda',
  'Četrtek',
  'Petek',
  'Sobota',
  'Nedelja',
];

export default function SchedulePage() {
  const { subjects } = useSubjects();
  const { tasks, addTask, addTasks, updateTask, toggleTask } = useTasks();
  const [weekOffset, setWeekOffset] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [preselectedDate, setPreselectedDate] = useState('');

  const weekStart = useMemo(
    () => addDaysToDateKey(getWeekStart(getSlovenianDateKey()), weekOffset * 7),
    [weekOffset],
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDaysToDateKey(weekStart, index)),
    [weekStart],
  );
  const todayStr = getSlovenianDateKey();

  function getSubject(task) {
    return subjects.find((subject) => subject.id === task.subjectId) || null;
  }

  function getTasksForDay(dateStr) {
    return tasks.filter((task) => task.dueDate === dateStr && !task.completed);
  }

  function handleDayClick(dateStr) {
    setPreselectedDate(dateStr);
    setEditTask(null);
    setModalOpen(true);
  }

  function handleSave(data) {
    const finalData = preselectedDate && !data.dueDate ? { ...data, dueDate: preselectedDate } : data;
    if (editTask) updateTask(editTask.id, finalData);
    else addTask(finalData);
    setEditTask(null);
    setPreselectedDate('');
  }

  function handleEdit(task) {
    setEditTask(task);
    setPreselectedDate('');
    setModalOpen(true);
  }

  async function handleImport(rows) {
    await addTasks(rows);
  }

  const weekLabel = `${formatSlovenianDate(weekDays[0], { day: 'numeric', month: 'short' })} – ${formatSlovenianDate(weekDays[6], { day: 'numeric', month: 'short' })} ${getYearFromDateKey(weekDays[6])}`;
  const weekTotal = weekDays.reduce((sum, day) => sum + getTasksForDay(day).length, 0);

  return (
    <div className="space-y-6">
      <section className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-page text-rp-text">Urnik</h1>
          <p className="mt-1 text-small text-rp-muted">{weekLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setWeekOffset(0)} className="btn-ghost !py-2 !text-small">
            Ta teden
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((value) => value - 1)}
            aria-label="Prejšnji teden"
            className="grid h-9 w-9 place-items-center rounded-md text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((value) => value + 1)}
            aria-label="Naslednji teden"
            className="grid h-9 w-9 place-items-center rounded-md text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setImportOpen(true)} className="btn-ghost !py-2 !text-small">
            <ImageIcon className="h-4 w-4" />
            Urnik iz slike
          </button>
          <button
            id="schedule-add-task"
            type="button"
            onClick={() => { setEditTask(null); setPreselectedDate(todayStr); setModalOpen(true); }}
            className="btn-primary !py-2 !text-small"
          >
            <PlusIcon className="h-4 w-4" />
            Nova naloga
          </button>
        </div>
      </section>

      <section className="rise" aria-label="Teden">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isToday = day === todayStr;

            return (
              <div key={day} className="flex min-w-0 flex-col">
                <div className={`mb-2 border-b pb-2 text-center ${isToday ? 'border-rp-accent/45' : 'border-rp-line'}`}>
                  <p className={`text-[11px] font-semibold ${isToday ? 'text-rp-accent' : 'text-rp-muted'}`}>
                    {DAYS_SHORT[index]}
                  </p>
                  <div
                    className={`mx-auto mt-1 grid h-7 w-7 place-items-center rounded-full text-small font-bold transition-colors ${
                      isToday ? 'bg-rp-accent text-rp-accent-ink' : 'text-rp-subtle'
                    }`}
                  >
                    {getDayOfMonth(day)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDayClick(day)}
                  title={`Dodaj nalogo – ${DAYS_FULL[index]}`}
                  aria-label={`Dodaj nalogo – ${DAYS_FULL[index]}, ${formatSlovenianDate(day, { day: 'numeric', month: 'long' })}`}
                  className="flex min-h-28 flex-1 flex-col gap-1.5 rounded-md p-1.5 text-left transition-colors hover:bg-rp-overlay"
                >
                  {dayTasks.map((task) => {
                    const subject = getSubject(task);
                    const color = subject ? getSubjectColor(subject.colorIndex) : null;
                    return (
                      <span
                        key={task.id}
                        onClick={(event) => { event.stopPropagation(); handleEdit(task); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleEdit(task);
                          }
                        }}
                        className={`block cursor-pointer rounded-xs border px-2 py-1.5 text-left text-[11px] leading-tight transition-opacity hover:opacity-80 ${
                          color ? `${color.bg} ${color.border} ${color.text}` : 'bg-rp-accent/12 border-rp-accent/30 text-rp-accent'
                        }`}
                      >
                        <span className="block truncate font-semibold">{task.title}</span>
                        {subject && <span className="mt-0.5 block truncate opacity-75">{subject.name}</span>}
                      </span>
                    );
                  })}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-small text-rp-muted">
          {weekTotal === 0
            ? 'Ta teden je prazen. Klikni dan, da dodaš prvo nalogo.'
            : `V tem tednu je ${weekTotal} odprtih nalog.`}
        </p>
      </section>

      <section className="lg:hidden" aria-label="Ta teden po dnevih">
        <h2 className="text-title text-rp-text">Ta teden po dnevih</h2>
        <div className="mt-3 grid gap-4">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isToday = day === todayStr;
            if (dayTasks.length === 0 && !isToday) return null;

            return (
              <div key={day}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`text-body font-semibold ${isToday ? 'text-rp-accent' : 'text-rp-subtle'}`}>
                    {DAYS_FULL[index]}, {formatSlovenianDate(day, { day: 'numeric', month: 'long' })}
                  </span>
                  {isToday && <span className="chip chip-accent">Danes</span>}
                </div>
                {dayTasks.length === 0 ? (
                  <p className="pl-2 text-small text-rp-muted">Ni nalog</p>
                ) : (
                  <div className="grid gap-2">
                    {dayTasks.map((task) => {
                      const subject = getSubject(task);
                      return (
                        <div key={task.id} className="row-item flex items-start gap-3 px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleTask(task)}
                            aria-label={task.completed ? 'Označi kot neopravljeno' : 'Označi kot opravljeno'}
                            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                              task.completed ? 'border-rp-accent bg-rp-accent text-rp-accent-ink' : 'border-rp-line-strong'
                            }`}
                          >
                            {task.completed && (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(task)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className={`text-body font-medium ${task.completed ? 'text-rp-muted line-through' : 'text-rp-text'}`}>
                              {task.title}
                            </p>
                            {subject && (
                              <p className="mt-1 flex items-center gap-1.5 text-small text-rp-muted">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: getSubjectColor(subject.colorIndex).colorVar }}
                                  aria-hidden="true"
                                />
                                {subject.name}
                              </p>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {weekTotal === 0 && (
            <EmptyState
              compact
              title="Ta teden je prazen"
              description="Klikni dan v mreži ali dodaj nalogo z gumbom zgoraj."
            />
          )}
        </div>
      </section>

      <ScheduleImportModal
        key={importOpen ? 'open' : 'closed'}
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        subjects={subjects}
        onImport={handleImport}
      />

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); setPreselectedDate(''); }}
        onSave={handleSave}
        subjects={subjects}
        task={editTask ? { ...editTask } : preselectedDate ? { dueDate: preselectedDate } : null}
      />
    </div>
  );
}
