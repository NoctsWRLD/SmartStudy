import { useState } from 'react';
import Modal from './Modal';
import SUBJECT_COLORS from '../utils/colors';

function SubjectForm({ onClose, onSave, subject }) {
  const [name, setName] = useState(subject?.name || '');
  const [colorIndex, setColorIndex] = useState(subject?.colorIndex ?? 0);
  const selected = SUBJECT_COLORS[colorIndex] || SUBJECT_COLORS[0];

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), colorIndex });
    onClose();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={subject ? 'Uredi predmet' : 'Nov predmet'}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn">Prekliči</button>
          <button type="submit" form="subject-form" className="btn btn-primary">
            {subject ? 'Shrani spremembe' : 'Dodaj predmet'}
          </button>
        </>
      }
    >
      <form id="subject-form" onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label className="field-label" htmlFor="subject-name">Ime predmeta</label>
          <input
            id="subject-name"
            type="text"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="npr. Matematika"
            className="field"
          />
        </div>

        <div>
          <span className="field-label" id="subject-color-label">Barva</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="subject-color-label">
            {SUBJECT_COLORS.map((color, index) => {
              const active = colorIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={color.label}
                  title={color.label}
                  onClick={() => setColorIndex(index)}
                  className={`grid h-8 w-8 place-items-center rounded-full border transition-transform ${
                    active ? 'scale-110 border-rp-text' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.colorVar }}
                >
                  {active && (
                    <svg className="h-3.5 w-3.5 text-rp-canvas" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {name && (
          <div className={`flex items-center gap-2 rounded-md border px-3 py-2 ${selected.bg} ${selected.border}`}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selected.colorVar }} aria-hidden="true" />
            <span className={`text-body font-medium ${selected.text}`}>{name}</span>
          </div>
        )}
      </form>
    </Modal>
  );
}

export default function SubjectModal({ isOpen, onClose, onSave, subject }) {
  if (!isOpen) return null;
  return (
    <SubjectForm
      key={subject?.id || 'new'}
      onClose={onClose}
      onSave={onSave}
      subject={subject}
    />
  );
}
