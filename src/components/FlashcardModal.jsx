/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';

export default function FlashcardModal({ isOpen, onClose, onSave, subjects, card, defaultSubjectId }) {
  const [subjectId, setSubjectId] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSubjectId(card?.subjectId || defaultSubjectId || subjects[0]?.id || '');
    setFront(card?.front || '');
    setBack(card?.back || '');
  }, [isOpen, card, defaultSubjectId, subjects]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!subjectId || !front.trim() || !back.trim()) return;
    onSave({ subjectId, front: front.trim(), back: back.trim() });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={card ? 'Uredi kartico' : 'Nova kartica'}>
      <div className="absolute inset-0 bg-black/30 overlay-fade" onClick={onClose} />
      <form onSubmit={handleSubmit} className="card modal-pop relative w-full max-w-md p-6">
        <h2 className="section-title">{card ? 'Uredi kartico' : 'Nova kartica'}</h2>
        <p className="body-quiet mt-1 text-sm">Spredaj vprašanje ali pojem, zadaj odgovor.</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-rp-subtle" htmlFor="card-subject">Predmet</label>
            <select id="card-subject" className="field" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
              <option value="">Izberi…</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-rp-subtle" htmlFor="card-front">Sprednja stran</label>
            <textarea id="card-front" className="field min-h-20" value={front} onChange={(e) => setFront(e.target.value)} placeholder="npr. Kaj je fotosinteza?" maxLength={500} required />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-rp-subtle" htmlFor="card-back">Zadnja stran</label>
            <textarea id="card-back" className="field min-h-20" value={back} onChange={(e) => setBack(e.target.value)} placeholder="Odgovor s svojimi besedami…" maxLength={1000} required />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Prekliči</button>
          <button type="submit" className="btn-primary">{card ? 'Shrani' : 'Dodaj kartico'}</button>
        </div>
      </form>
    </div>
  );
}
