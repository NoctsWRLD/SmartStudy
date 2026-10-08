import { useState, useMemo } from 'react';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import TaskModal from '../components/TaskModal';
import Badge from '../components/Badge';
import SUBJECT_COLORS from '../utils/colors';
import {
  addDaysToDateKey,
  formatSlovenianDate,
  getDateKeyDayOfWeek,
  getDayOfMonth,
  getSlovenianDateKey,
  getYearFromDateKey,
} from '../utils/dates';

const DAYS_SL = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];
const DAYS_FULL = [
  'Ponedeljek',
  'Torek',
  'Sreda',
  'Četrtek',
  'Petek',
  'Sobota',
  'Nedelja',
];
function getWeekStart(dateKey) {
  const day = getDateKeyDayOfWeek(dateKey);
  return addDaysToDateKey(dateKey, day === 0 ? -6 : 1 - day);
}

export default function SchedulePage() {
  const { subjects } = useSubjects();
  const { tasks, addTask, updateTask, toggleTask } = useTasks();
  const [weekOffset, setWeekOffset] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [preselectedDate, setPreselectedDate] = useState('');

  const weekStart = useMemo(
    () => addDaysToDateKey(getWeekStart(getSlovenianDateKey()), weekOffset * 7),
    [weekOffset],
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDaysToDateKey(weekStart, i));
  }, [weekStart]);

  const todayStr = getSlovenianDateKey();

  function getSubject(task) {
    return subjects.find((s) => s.id === task.subjectId) || null;
  }

  function getTasksForDay(dateStr) {
    return tasks.filter((t) => t.dueDate === dateStr && !t.completed);
  }

  function handleDayClick(dateStr) {
    setPreselectedDate(dateStr);
    setEditTask(null);
    setModalOpen(true);
  }

  function handleSave(data) {
    const finalData =
      preselectedDate && !data.dueDate
        ? { ...data, dueDate: preselectedDate }
        : data;
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

  const weekLabel = `${formatSlovenianDate(weekDays[0], { day: 'numeric', month: 'short' })} – ${formatSlovenianDate(weekDays[6], { day: 'numeric', month: 'short' })} ${getYearFromDateKey(weekDays[6])}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-rp-text">
            Urnik
          </h1>
          <p className="text-sm mt-0.5 text-rp-muted">
            {weekLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80 border border-rp-hl-med/50 text-rp-subtle hover:bg-rp-hl-med/35 hover:text-rp-text"
          >
            Ta teden
          </button>
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-xl transition-all text-rp-subtle hover:text-rp-text hover:bg-rp-hl-med/35"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 rounded-xl transition-all text-rp-subtle hover:text-rp-text hover:bg-rp-hl-med/35"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button
            id="schedule-add-task"
            onClick={() => {
              setEditTask(null);
              setPreselectedDate(todayStr);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 bg-gradient-to-br from-rp-iris to-rp-foam text-rp-base"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nova naloga
          </button>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-2 animate-fade-in-up">
        {weekDays.map((day, i) => {
          const dateStr = day;
          const dayTasks = getTasksForDay(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div key={dateStr} className="flex flex-col">
              {/* Day header */}
              <div
                className={`text-center mb-2 pb-2 border-b ${isToday ? 'border-rp-iris/40' : 'border-rp-hl-med/30'}`}
              >
                <p
                  className={`text-xs font-medium ${isToday ? 'text-rp-iris' : 'text-rp-muted'}`}
                >
                  {DAYS_SL[i]}
                </p>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto mt-1 text-sm font-bold transition-all ${
                    isToday ? 'bg-gradient-to-br from-rp-iris to-rp-foam text-rp-base' : 'text-rp-subtle'
                  }`}
                >
                  {getDayOfMonth(day)}
                </div>
              </div>

              {/* Tasks column */}
              <div
                className="flex-1 min-h-[7rem] rounded-xl p-1.5 space-y-1.5 cursor-pointer hover:bg-rp-hl-med/20 transition-all"
                onClick={() => handleDayClick(dateStr)}
                title={`Dodaj nalogo – ${DAYS_FULL[i]}`}
              >
                {dayTasks.map((task) => {
                  const subj = getSubject(task);
                  const color = subj
                    ? SUBJECT_COLORS[subj.colorIndex ?? 0]
                    : null;
                  return (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(task);
                      }}
                      className={`px-2.5 py-2 rounded-lg text-xs leading-tight cursor-pointer hover:opacity-90 transition-all shadow-sm ${task.completed ? 'opacity-40 line-through' : ''} ${
                        color ? `${color.bg} border ${color.border} ${color.text}` : 'bg-rp-iris/15 border border-rp-iris/30 text-rp-iris'
                      }`}
                    >
                      <p className="font-medium truncate">{task.title}</p>
                      {subj && (
                        <p className="opacity-70 truncate mt-0.5">
                          {subj.name}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: day list */}
      <div className="block lg:hidden space-y-4 mt-4">
        <h2 className="text-base font-semibold text-rp-text">
          Ta teden po dnevih
        </h2>
        {weekDays.map((day, i) => {
          const dateStr = day;
          const dayTasks = getTasksForDay(dateStr);
          const isToday = dateStr === todayStr;
          if (dayTasks.length === 0 && !isToday) return null;

          return (
            <div key={dateStr}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${isToday ? 'text-rp-iris' : 'text-rp-subtle'}`}>
              {DAYS_FULL[i]}, {formatSlovenianDate(day, { day: 'numeric', month: 'long' })}
                </span>
                {isToday && (
                  <span className="text-xs px-2 py-0.5 rounded-full text-rp-iris bg-rp-iris/20 border border-rp-iris/30">
                    Danes
                  </span>
                )}
              </div>
              {dayTasks.length === 0 ? (
                <p className="text-xs pl-2 text-rp-hl-high">Ni nalog</p>
              ) : (
                <div className="space-y-2">
                  {dayTasks.map((task) => {
                    const subj = getSubject(task);
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 glass-card px-4 py-3 cursor-pointer"
                        onClick={() => handleEdit(task)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task);
                          }}
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            task.completed ? 'bg-gradient-to-br from-rp-iris to-rp-foam border-transparent' : 'border-rp-hl-high'
                          }`}
                        >
                          {task.completed && (
                            <svg
                              className="w-3 h-3 text-rp-base"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.completed ? 'line-through text-rp-muted' : 'text-rp-text'}`}>
                            {task.title}
                          </p>
                          {subj && (
                            <div className="mt-1">
                              <Badge colorIndex={subj.colorIndex}>
                                {subj.name}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTask(null);
          setPreselectedDate('');
        }}
        onSave={handleSave}
        subjects={subjects}
        task={
          editTask
            ? { ...editTask }
            : preselectedDate
              ? { dueDate: preselectedDate }
              : null
        }
      />
    </div>
  );
}
