/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';

export default function TaskModal({ isOpen, onClose, onSave, subjects, task }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setSubjectId(task.subjectId || '');
      setDueDate(task.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setSubjectId('');
      setDueDate('');
    }
  }, [task, isOpen]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), subjectId, dueDate });
    onClose();
  }

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-3 rounded-xl outline-none text-sm transition-all bg-rp-overlay/90 border border-rp-hl-med/70 text-rp-text placeholder:text-rp-muted";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card p-6 w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-rp-text">
            {task ? 'Uredi nalogo' : 'Nova naloga'}
          </h2>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-all text-rp-muted hover:text-rp-text hover:bg-rp-hl-med/50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-rp-muted">Naslov naloge *</label>
            <input
              id="task-title"
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="npr. Domača naloga iz matematike"
              className={inputClass}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-rp-muted">Opis (neobvezno)</label>
            <textarea
              id="task-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Dodaj podrobnosti..."
              rows={2}
              className={inputClass + ' resize-none'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-rp-muted">Predmet</label>
            <select
              id="task-subject"
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className={inputClass}>
              <option value="">— Brez predmeta —</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-rp-muted">Rok oddaje</label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all text-rp-subtle border border-rp-hl-med/50 hover:bg-rp-hl-med/35"
            >
              Prekliči
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-rp-base transition-all hover:opacity-90 bg-gradient-to-br from-rp-iris to-rp-foam"
            >
              {task ? 'Shrani' : 'Dodaj nalogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
