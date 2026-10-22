import { useState } from 'react';
import Modal from './Modal';

function TaskForm({ onClose, onSave, subjects, task, defaultSubjectId }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [subjectId, setSubjectId] = useState(task?.subjectId || defaultSubjectId || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');

  function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim() || !subjectId) return;
    onSave({ title: title.trim(), description: description.trim(), subjectId, dueDate });
    onClose();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={task ? 'Uredi nalogo' : 'Nova naloga'}
      description="Naloga dobi predmet in rok. Brez roka ostane v nalogah, dokler ga ne dodaš."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn">Prekliči</button>
          <button type="submit" form="task-form" className="btn btn-primary">
            {task ? 'Shrani spremembe' : 'Dodaj nalogo'}
          </button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="grid gap-3.5">
        <div>
          <label className="field-label" htmlFor="task-title">Naslov naloge</label>
          <input
            id="task-title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="npr. Domača naloga iz matematike"
            className="field"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="task-description">Opis</label>
          <textarea
            id="task-description"
            maxLength={1200}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Dodaj podrobnosti…"
            rows={2}
            className="field resize-none"
          />
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="task-subject">Predmet</label>
            <select
              id="task-subject"
              required
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className="field"
            >
              <option value="" disabled>Izberi predmet</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="task-due">Rok oddaje</label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="field"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function TaskModal({ isOpen, onClose, onSave, subjects, task, defaultSubjectId = '' }) {
  if (!isOpen) return null;
  return (
    <TaskForm
      key={`${task?.id || 'new'}-${defaultSubjectId}`}
      onClose={onClose}
      onSave={onSave}
      subjects={subjects}
      task={task}
      defaultSubjectId={defaultSubjectId}
    />
  );
}
