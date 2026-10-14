import { useState, useMemo } from 'react';
import Badge from './Badge';
import { getSlovenianDateKey } from '../utils/dates';

export default function SubjectTaskModal({ isOpen, onClose, subject, tasks, onToggleTask, onDeleteTask, onAddTask }) {
  const [filter, setFilter] = useState('all');
  const subjectId = subject?.id;

  const subjectTasks = useMemo(() => {
    if (!subjectId) return [];
    return tasks.filter(t => t.subjectId === subjectId);
  }, [tasks, subjectId]);

  const filteredTasks = useMemo(() => {
    let list = [...subjectTasks];
    if (filter === 'pending') list = list.filter(t => !t.completed);
    if (filter === 'completed') list = list.filter(t => t.completed);
    
    list.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    return list;
  }, [subjectTasks, filter]);

  const doneCount = subjectTasks.filter(t => t.completed).length;

  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm overlay-fade" onClick={onClose} />
      
      <div className="relative glass-card p-6 w-full max-w-lg max-h-[85vh] flex flex-col modal-pop">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-rp-text">{subject.name} - Naloge</h2>
            <p className="text-sm mt-0.5 text-rp-muted">
               {subjectTasks.length} nalog skupaj · {doneCount} opravljenih
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {onAddTask && <button type="button" onClick={onAddTask} className="rounded-lg bg-rp-iris px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90">＋ Naloga</button>}
            <button type="button" onClick={onClose} aria-label="Zapri predmet" className="rounded-xl p-2 text-rp-muted transition hover:bg-rp-hl-med/50 hover:text-rp-text focus:outline-none">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto pb-1 hide-scrollbar">
          {[
            { id: 'all', label: 'Vse' },
            { id: 'pending', label: 'Nedokončane' },
            { id: 'completed', label: 'Opravljene' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap outline-none ${
                filter === f.id
                  ? 'bg-rp-iris text-white shadow-[0_2px_10px_rgba(196,167,231,0.25)] border border-transparent'
                  : 'bg-rp-overlay/70 text-rp-subtle border border-rp-hl-med/40 hover:bg-rp-hl-med/30'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 custom-scrollbar">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-rp-muted">
                 {filter === 'completed' ? 'Ni opravljenih nalog.' : filter === 'pending' ? 'Ni nedokončanih nalog.' : 'Ni nalog za ta predmet.'}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className={`flex items-start gap-3 glass-card px-4 py-3 transition-all ${task.completed ? 'opacity-70' : ''}`}>
                 <button
                    onClick={() => onToggleTask(task)}
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all focus:outline-none ${
                      task.completed 
                        ? 'bg-rp-iris text-white border border-transparent'
                        : 'border-rp-hl-high hover:border-rp-iris'
                    }`}>
                    {task.completed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                 </button>
                 <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? 'text-rp-muted line-through' : 'text-rp-text'}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                       <p className={`text-xs mt-1 ${
                         task.completed ? 'text-rp-muted' :
                         task.dueDate < getSlovenianDateKey() ? 'text-rp-love' : 'text-rp-iris'
                       }`}>
                         Rok: {task.dueDate.split('-').reverse().join('.')}
                       </p>
                    )}
                 </div>
                 <button
                    onClick={() => {
                        if (window.confirm(`Izbriši nalogo "${task.title}"?`)) onDeleteTask(task.id);
                    }}
                    className="p-1.5 rounded-lg transition-all sm:opacity-100 focus:outline-none text-rp-muted hover:text-rp-love hover:bg-rp-love/10"
                    title="Izbriši nalogo">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                 </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
