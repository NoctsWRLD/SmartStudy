import { useEffect, useState } from 'react';

export default function ExamModal({ isOpen, onClose, onSave, subjects, exam }) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setTitle(exam?.title || '');
    setSubjectId(exam?.subjectId || subjects[0]?.id || '');
    setDate(exam?.date || '');
  }, [isOpen, exam, subjects]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !subjectId || !date) return;
    onSave({ title: title.trim(), subjectId, date });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={exam ? 'Uredi preverjanje' : 'Novo preverjanje'}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form onSubmit={handleSubmit} className="card relative w-full max-w-md p-6">
        <h2 className="section-title">{exam ? 'Uredi preverjanje' : 'Novo preverjanje'}</h2>
        <p className="body-quiet mt-1 text-sm">Zapiši test, spraševanje ali izpit — odštevanje te bo držalo v ritmu.</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-rp-subtle" htmlFor="exam-title">Kaj te čaka?</label>
            <input id="exam-title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="npr. Pisno ocenjevanje — MAT" maxLength={120} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-rp-subtle" htmlFor="exam-subject">Predmet</label>
              <select id="exam-subject" className="field" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
                <option value="">Izberi…</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-rp-subtle" htmlFor="exam-date">Datum</label>
              <input id="exam-date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Prekliči</button>
          <button type="submit" className="btn-primary">{exam ? 'Shrani' : 'Dodaj preverjanje'}</button>
        </div>
      </form>
    </div>
  );
}
