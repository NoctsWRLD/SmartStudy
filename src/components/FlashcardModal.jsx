import { useState } from 'react';
import Modal from './Modal';

function CardForm({ onClose, onSave, subjects, card, defaultSubjectId }) {
  const [subjectId, setSubjectId] = useState(card?.subjectId || defaultSubjectId || subjects[0]?.id || '');
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');

  function handleSubmit(event) {
    event.preventDefault();
    if (!subjectId || !front.trim() || !back.trim()) return;
    onSave({ subjectId, front: front.trim(), back: back.trim() });
    onClose();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={card ? 'Uredi kartico' : 'Nova kartica'}
      description="Spredaj vprašanje ali pojem, zadaj odgovor."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn">Prekliči</button>
          <button type="submit" form="card-form" className="btn btn-primary">
            {card ? 'Shrani spremembe' : 'Dodaj kartico'}
          </button>
        </>
      }
    >
      <form id="card-form" onSubmit={handleSubmit} className="grid gap-3.5">
        <div>
          <label className="field-label" htmlFor="card-subject">Predmet</label>
          <select
            id="card-subject"
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
          <label className="field-label" htmlFor="card-front">Sprednja stran</label>
          <textarea
            id="card-front"
            className="field min-h-20 resize-none"
            value={front}
            onChange={(event) => setFront(event.target.value)}
            placeholder="npr. Kaj je fotosinteza?"
            maxLength={500}
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="card-back">Zadnja stran</label>
          <textarea
            id="card-back"
            className="field min-h-20 resize-none"
            value={back}
            onChange={(event) => setBack(event.target.value)}
            placeholder="Odgovor s svojimi besedami…"
            maxLength={1000}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

export default function FlashcardModal({ isOpen, onClose, onSave, subjects, card, defaultSubjectId }) {
  if (!isOpen) return null;
  return (
    <CardForm
      key={`${card?.id || 'new'}-${defaultSubjectId}`}
      onClose={onClose}
      onSave={onSave}
      subjects={subjects}
      card={card}
      defaultSubjectId={defaultSubjectId}
    />
  );
}
