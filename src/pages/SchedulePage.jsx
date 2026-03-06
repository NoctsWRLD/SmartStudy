import { useState, useMemo } from 'react';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import TaskModal from '../components/TaskModal';
import Badge from '../components/Badge';
import SUBJECT_COLORS from '../utils/colors';

const DAYS_SL = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];
const DAYS_FULL = ['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja'];
const MONTHS_SL = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'];

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday-based
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

export default function SchedulePage() {
  const { subjects } = useSubjects();
  const { tasks, addTask, updateTask, toggleTask } = useTasks();
  const [weekOffset, setWeekOffset] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [preselectedDate, setPreselectedDate] = useState('');

  const weekStart = useMemo(() => {
    const base = getWeekStart(new Date());
    base.setDate(base.getDate() + weekOffset * 7);
    return base;
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const todayStr = toDateStr(new Date());

  function getSubject(task) {
    return subjects.find(s => s.id === task.subjectId) || null;
  }

  function getTasksForDay(dateStr) {
    return tasks.filter(t => t.dueDate === dateStr);
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

  const weekLabel = `${weekDays[0].getDate()}. ${MONTHS_SL[weekDays[0].getMonth()]} – ${weekDays[6].getDate()}. ${MONTHS_SL[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Urnik</h1>
          <p className="text-slate-400 text-sm mt-0.5">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-700/50 transition-all"
            style={{ border: '1px solid rgba(51,65,85,0.5)' }}>
            Ta teden
          </button>
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            id="schedule-add-task"
            onClick={() => { setEditTask(null); setPreselectedDate(todayStr); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nova naloga
          </button>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-2 animate-fade-in-up">
        {weekDays.map((day, i) => {
          const dateStr = toDateStr(day);
          const dayTasks = getTasksForDay(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div key={dateStr} className="flex flex-col">
              {/* Day header */}
              <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'border-indigo-500/50' : 'border-slate-700/30'}`}>
                <p className={`text-xs font-medium ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {DAYS_SL[i]}
                </p>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto mt-1 text-sm font-bold transition-all ${
                  isToday ? 'text-white' : 'text-slate-300'
                }`}
                  style={isToday ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}>
                  {day.getDate()}
                </div>
              </div>

              {/* Tasks column */}
              <div
                className="flex-1 min-h-28 rounded-xl p-1.5 space-y-1.5 cursor-pointer hover:bg-slate-700/20 transition-all"
                onClick={() => handleDayClick(dateStr)}
                title={`Dodaj nalogo – ${DAYS_FULL[i]}`}>
                {dayTasks.map(task => {
                  const subj = getSubject(task);
                  const color = subj ? SUBJECT_COLORS[subj.colorIndex ?? 0] : null;
                  return (
                    <div
                      key={task.id}
                      onClick={e => { e.stopPropagation(); handleEdit(task); }}
                      className={`px-2 py-1.5 rounded-lg text-xs leading-tight cursor-pointer hover:opacity-90 transition-all ${task.completed ? 'opacity-50 line-through' : ''}`}
                      style={color
                        ? { background: color.bg, border: `1px solid ${color.border}`, color: color.text }
                        : { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
                      <p className="font-medium truncate">{task.title}</p>
                      {subj && <p className="opacity-70 truncate mt-0.5">{subj.name}</p>}
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
        <h2 className="text-base font-semibold text-white">Ta teden po dnevih</h2>
        {weekDays.map((day, i) => {
          const dateStr = toDateStr(day);
          const dayTasks = getTasksForDay(dateStr);
          const isToday = dateStr === todayStr;
          if (dayTasks.length === 0 && !isToday) return null;

          return (
            <div key={dateStr}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                  {DAYS_FULL[i]}, {day.getDate()}. {MONTHS_SL[day.getMonth()]}
                </span>
                {isToday && <span className="text-xs px-2 py-0.5 rounded-full text-indigo-300"
                  style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>Danes</span>}
              </div>
              {dayTasks.length === 0 ? (
                <p className="text-slate-500 text-xs pl-2">Ni nalog</p>
              ) : (
                <div className="space-y-2">
                  {dayTasks.map(task => {
                    const subj = getSubject(task);
                    return (
                      <div key={task.id}
                        className="flex items-start gap-3 glass-card px-4 py-3 cursor-pointer"
                        onClick={() => handleEdit(task)}>
                        <button
                          onClick={e => { e.stopPropagation(); toggleTask(task); }}
                          className="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                          style={task.completed
                            ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderColor: 'transparent' }
                            : { borderColor: '#475569' }}>
                          {task.completed && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                            {task.title}
                          </p>
                          {subj && <Badge colorIndex={subj.colorIndex}>{subj.name}</Badge>}
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
        onClose={() => { setModalOpen(false); setEditTask(null); setPreselectedDate(''); }}
        onSave={handleSave}
        subjects={subjects}
        task={editTask ? { ...editTask } : (preselectedDate ? { dueDate: preselectedDate } : null)}
      />
    </div>
  );
}
