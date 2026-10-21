import { useState } from 'react';
import Modal from './Modal';

function ExamForm({ onClose, onSave, subjects, exam }) {
  const [title, setTitle] = useState(exam?.title || '');
  const [subjectId, setSubjectId] = useState(exam?.subjectId || subjects[0]?.id || '');
  const [date, setDate] = useState(exam?.date || '');

  function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim() || !subjectId || !date) return;
    onSave({ title: title.trim(), subjectId, date });
    onClose();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={exam ? 'Uredi preverjanje' : 'Novo preverjanje'}
      description="Zapiši test, spraševanje ali izpit — odštevanje te bo držalo v ritmu."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">Prekliči</button>
          <button type="submit" form="exam-form" className="btn-primary">
            {exam ? 'Shrani spremembe' : 'Dodaj preverjanje'}
          </button>
        </>
      }
    >
      <form id="exam-form" onSubmit={handleSubmit} className="grid gap-3.5">
        <div>
          <label className="field-label" htmlFor="exam-title">Kaj te čaka?</label>
          <input
            id="exam-title"
            className="field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="npr. Pisno ocenjevanje — MAT"
            maxLength={120}
            required
          />
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="exam-subject">Predmet</label>
            <select
              id="exam-subject"
              className="field"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              required
            >
              <option value="">Izberi…</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="exam-date">Datum</label>
            <input
              id="exam-date"
              type="date"
              className="field"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function ExamModal({ isOpen, onClose, onSave, subjects, exam }) {
  if (!isOpen) return null;
  return (
    <ExamForm
      key={exam?.id || 'new'}
      onClose={onClose}
      onSave={onSave}
      subjects={subjects}
      exam={exam}
    />
  );
}
