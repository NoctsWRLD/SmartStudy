import { useState, useMemo } from 'react';
import Badge from './Badge';

export default function SubjectTaskModal({ isOpen, onClose, subject, tasks, onToggleTask, onDeleteTask }) {
  if (!isOpen || !subject) return null;

  const [filter, setFilter] = useState('all');

  const subjectTasks = useMemo(() => {
    return tasks.filter(t => t.subjectId === subject.id);
  }, [tasks, subject]);

  const filteredTasks = useMemo(() => {
    let list = [...subjectTasks];
    if (filter === 'pending') list = list.filter(t => !t.completed);
    if (filter === 'completed') list = list.filter(t => t.completed);
    
    // Sort logic
    list.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    return list;
  }, [subjectTasks, filter]);

  const doneCount = subjectTasks.filter(t => t.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass-card p-6 w-full max-w-lg max-h-[85vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{subject.name} - Naloge</h2>
            <p className="text-slate-400 text-sm mt-0.5">
               {subjectTasks.length} nalog skupaj · {doneCount} opravljenih
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500/50"
              style={filter === f.id
                ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 2px 10px rgba(99,102,241,0.2)' }
                : { background: 'rgba(15,23,42,0.6)', color: '#94a3b8', border: '1px solid rgba(51,65,85,0.4)' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 custom-scrollbar">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">
                 {filter === 'completed' ? 'Ni opravljenih nalog.' : filter === 'pending' ? 'Ni nedokončanih nalog.' : 'Ni nalog za ta predmet.'}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className={`flex items-start gap-3 glass-card px-4 py-3 transition-all ${task.completed ? 'opacity-70' : ''}`}>
                 <button
                    onClick={() => onToggleTask(task)}
                    className="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-1 focus:ring-offset-[#0f172a]"
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
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                       <p className={`text-xs mt-1 ${
                          task.completed ? 'text-slate-500' : 
                          new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0)) ? 'text-red-400 font-medium' : 'text-indigo-400'
                       }`}>
                          Rok: {task.dueDate.split('-').reverse().join('.')}
                       </p>
                    )}
                 </div>
                 <button
                    onClick={() => {
                        if (window.confirm(`Izbriši nalogo "${task.title}"?`)) onDeleteTask(task.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/50"
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
