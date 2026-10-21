/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import SUBJECT_COLORS from '../utils/colors';

export default function SubjectModal({ isOpen, onClose, onSave, subject }) {
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    if (subject) {
      setName(subject.name || '');
      setColorIndex(subject.colorIndex ?? 0);
    } else {
      setName('');
      setColorIndex(0);
    }
  }, [subject, isOpen]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), colorIndex });
    onClose();
  }

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-3 rounded-xl outline-none text-sm transition-all bg-rp-overlay/90 border border-rp-line/70 text-rp-text placeholder:text-rp-muted";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm overlay-fade" onClick={onClose} />
      <div className="relative card p-6 w-full max-w-sm modal-pop">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-rp-text">
            {subject ? 'Uredi predmet' : 'Nov predmet'}
          </h2>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-all text-rp-muted hover:text-rp-text hover:bg-rp-line/50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1 text-rp-muted">Ime predmeta *</label>
            <input
              id="subject-name"
              type="text"
              required
              maxLength={80}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="npr. Matematika"
              autoFocus
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 text-rp-muted">Barva</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setColorIndex(idx)}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                  style={{
                    backgroundColor: color.colorVar,
                    boxShadow: colorIndex === idx ? `0 0 0 3px rgba(224,222,244,0.15), 0 0 0 2px ${color.colorVar}` : 'none',
                    transform: colorIndex === idx ? 'scale(1.2)' : 'scale(1)',
                  }}>
                  {colorIndex === idx && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {name && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${SUBJECT_COLORS[colorIndex].bg} border ${SUBJECT_COLORS[colorIndex].border}`}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[colorIndex].colorVar }} />
              <span className={`text-sm font-medium ${SUBJECT_COLORS[colorIndex].text}`}>{name}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all text-rp-subtle border border-rp-line/50 hover:bg-rp-line/35"
            >
              Prekliči
            </button>
            <button type="submit"
              className="btn-primary flex-1 !py-2.5 !text-sm"
            >
              {subject ? 'Shrani' : 'Dodaj predmet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
