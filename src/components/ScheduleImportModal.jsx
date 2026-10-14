import { useRef, useState } from 'react';
import { addDaysToDateKey } from '../utils/dates';
import { DAY_NAMES, listWeekMondays, mondayOfThisWeek, parseTimetableText, semesterRange, weekLabel } from '../utils/timetable';

const PERIODS = [
  { id: 'week', label: 'Ta teden' },
  { id: 'sem1', label: '1. semester' },
  { id: 'sem2', label: '2. semester' },
  { id: 'custom', label: 'Po meri' },
];

function nalogeWord(n) {
  if (n % 100 === 1) return 'nalogo';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return n % 10 === 2 ? 'nalogi' : 'naloge';
  return 'nalog';
}

export default function ScheduleImportModal({ isOpen, onClose, subjects, onImport }) {
  const [imageUrl, setImageUrl] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [period, setPeriod] = useState('week');
  const [customStart, setCustomStart] = useState(() => mondayOfThisWeek());
  const [customEnd, setCustomEnd] = useState(() => addDaysToDateKey(mondayOfThisWeek(), 21));
  const [weekChecks, setWeekChecks] = useState({});
  const fileRef = useRef(null);
  const monday = mondayOfThisWeek();

  if (!isOpen) return null;

  const weeks = (() => {
    if (period === 'week') return [monday];
    if (period === 'sem1' || period === 'sem2') {
      const r = semesterRange(period === 'sem1' ? 1 : 2);
      if (r.past) return [];
      return listWeekMondays(r.startMonday, r.endMonday);
    }
    if (!customStart || !customEnd || customStart > customEnd) return [];
    const startMonday = mondayOfThisWeek(customStart);
    const endMonday = mondayOfThisWeek(customEnd);
    if (startMonday > endMonday) return [];
    return listWeekMondays(startMonday, endMonday);
  })();

  const selectedWeeks = weeks.filter((w) => weekChecks[w] !== false);
  const allChecked = weeks.length > 0 && selectedWeeks.length === weeks.length;

  function toggleAllWeeks() {
    if (allChecked) {
      const off = {};
      for (const w of weeks) off[w] = false;
      setWeekChecks(off);
    } else {
      setWeekChecks({});
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setOcrError('');
  }

  async function runOcr() {
    if (!imageUrl) return;
    setOcrLoading(true);
    setOcrError('');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('slv');
      const { data } = await worker.recognize(imageUrl);
      await worker.terminate();
      const text = (data?.text || '').trim();
      if (!text) {
        setOcrError('Na sliki nisem našel berljivega besedila. Poskusi ostrejšo sliko ali besedilo prilepi ročno.');
      } else {
        setOcrText(text);
        setDrafts(parseTimetableText(text, subjects).map((d, i) => ({ ...d, key: `${Date.now()}-${i}` })));
      }
    } catch {
      setOcrError('Branja ni bilo mogoče zagnati (potrebna je povezava). Besedilo lahko prilepiš ročno.');
    }
    setOcrLoading(false);
  }

  function parseManual() {
    setDrafts(parseTimetableText(ocrText, subjects).map((d, i) => ({ ...d, key: `${Date.now()}-${i}` })));
  }

  function updateDraft(key, patch) {
    setDrafts((list) => list.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function removeDraft(key) {
    setDrafts((list) => list.filter((d) => d.key !== key));
  }

  function addRow() {
    setDrafts((list) => [...list, { key: `${Date.now()}-${list.length}`, title: '', weekday: 0, subjectId: subjects[0]?.id || '' }]);
  }

  const valid = drafts.filter((d) => d.title.trim());
  const total = valid.length * selectedWeeks.length;

  async function handleSave() {
    if (valid.length === 0 || selectedWeeks.length === 0) return;
    if (total > 200 && !window.confirm(`To bo ustvarilo ${total} nalog (vsak teden posebej). Nadaljujem?`)) return;
    setSaving(true);
    try {
      const rows = [];
      for (const weekMonday of selectedWeeks) {
        for (const d of valid) {
          rows.push({
            title: d.title.trim(),
            description: '',
            subjectId: d.subjectId || '',
            dueDate: addDaysToDateKey(weekMonday, d.weekday),
          });
        }
      }
      await onImport(rows);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Uvozi urnik iz slike">
      <div className="overlay-fade absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="card modal-pop relative flex max-h-[90vh] w-full max-w-2xl flex-col p-6">
        <h2 className="section-title">Urnik iz slike</h2>
        <p className="body-quiet mt-1 text-sm">Fotografiraj urnik, preberem dneve in predlagam naloge — za ta teden ali za cel semester. Pred shranjevanjem vse pregledaš.</p>

        <div className="mt-4 grid gap-4 overflow-y-auto pr-1 sm:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="field" aria-label="Izberi sliko urnika" />
            {imageUrl && <img src={imageUrl} alt="Predogled urnika" className="mt-3 max-h-56 w-full rounded-xl border border-rp-hl-med object-contain" />}
            <button type="button" onClick={runOcr} disabled={!imageUrl || ocrLoading} className="btn-ghost mt-3 w-full disabled:opacity-50">
              {ocrLoading ? 'Berem sliko…' : 'Preberi besedilo s slike'}
            </button>
            {ocrError && <p className="mt-2 text-[13px] leading-5 text-rp-love" role="alert">{ocrError}</p>}
            <label className="mb-1.5 mt-4 block text-[13px] font-semibold text-rp-subtle" htmlFor="import-text">Besedilo (lahko urediš ali prilepiš)</label>
            <textarea id="import-text" className="field min-h-28" value={ocrText} onChange={(e) => setOcrText(e.target.value)} placeholder="Ponedeljek&#10;8:00 Matematika&#10;9:00 Slovenščina&#10;Torek&#10;…" />
            <button type="button" onClick={parseManual} disabled={!ocrText.trim()} className="btn-ghost mt-2 w-full disabled:opacity-50">Razčleni v vrstice</button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold">Predlog nalog ({valid.length})</h3>
              <button type="button" onClick={addRow} className="btn-ghost !px-3 !py-1.5 !text-xs">+ Dodaj vrstico</button>
            </div>
            {drafts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-rp-hl-med p-4 text-[13px] leading-5 text-rp-muted">Ni vrstic. Preberi sliko, prilepi besedilo ali dodaj vrstico ročno.</p>
            ) : (
              <div className="space-y-2">
                {drafts.map((d) => (
                  <div key={d.key} className="rounded-xl border border-rp-hl-med p-2.5">
                    <div className="flex items-center gap-2">
                      <input value={d.title} onChange={(e) => updateDraft(d.key, { title: e.target.value })} placeholder="Naziv naloge" maxLength={120} className="field !py-2 !text-[13px]" aria-label="Naziv naloge" />
                      <button type="button" onClick={() => removeDraft(d.key)} aria-label="Odstrani vrstico" className="rounded-lg p-1.5 text-rp-muted transition-colors hover:bg-rp-love/10 hover:text-rp-love">✕</button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <select value={d.weekday} onChange={(e) => updateDraft(d.key, { weekday: Number(e.target.value) })} className="field !py-2 !text-[13px]" aria-label="Dan v tednu">
                        {DAY_NAMES.map((name, i) => <option key={name} value={i}>{name}</option>)}
                      </select>
                      <select value={d.subjectId} onChange={(e) => updateDraft(d.key, { subjectId: e.target.value })} className="field !py-2 !text-[13px]" aria-label="Predmet">
                        <option value="">Brez predmeta</option>
                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-rp-hl-med pt-4">
          <h3 className="text-sm font-bold">Za katere tedne?</h3>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="radiogroup" aria-label="Obdobje">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={period === p.id}
                onClick={() => setPeriod(p.id)}
                className={`rounded-xl border px-3 py-2 text-[13px] font-semibold transition-all active:scale-95 ${
                  period === p.id ? 'border-rp-iris bg-rp-iris/[.08] text-rp-text' : 'border-rp-hl-med text-rp-muted hover:border-rp-hl-high hover:text-rp-text'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block text-xs font-semibold text-rp-muted">Od<input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="field mt-1 !py-2 !text-[13px]" /></label>
              <label className="block text-xs font-semibold text-rp-muted">Do<input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="field mt-1 !py-2 !text-[13px]" /></label>
            </div>
          )}

          {period !== 'week' && (
            <div className="mt-2 rounded-xl border border-rp-hl-med">
              <label className="flex cursor-pointer items-center gap-2.5 border-b border-rp-hl-med px-3 py-2 text-[13px] font-bold">
                <input type="checkbox" checked={allChecked} onChange={toggleAllWeeks} className="h-4 w-4 accent-[var(--rp-iris)]" />
                Vsi tedni ({selectedWeeks.length}/{weeks.length})
              </label>
              {weeks.length === 0 ? (
                <p className="px-3 py-3 text-[13px] text-rp-muted">
                  {period === 'custom' ? 'Izberi veljaven razpon datumov.' : 'To obdobje je že mimo — izberi drugo.'}
                </p>
              ) : (
                <div className="max-h-32 overflow-y-auto p-1.5">
                  {weeks.map((w) => (
                    <label key={w} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-rp-overlay">
                      <input
                        type="checkbox"
                        checked={weekChecks[w] !== false}
                        onChange={() => setWeekChecks((prev) => ({ ...prev, [w]: prev[w] === false ? true : false }))}
                        className="h-4 w-4 accent-[var(--rp-iris)]"
                      />
                      <span className="font-medium">{weekLabel(w)}</span>
                      <span className="text-xs text-rp-muted">{valid.length} {nalogeWord(valid.length)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-rp-hl-med pt-4">
          <p className="text-[13px] text-rp-muted">
            {total > 0 ? `Skupaj ${total} ${nalogeWord(total)} v ${selectedWeeks.length} ${selectedWeeks.length === 1 ? 'tednu' : selectedWeeks.length === 2 ? 'tednih' : 'tednih'}` : 'Izberi vrstice in tedne.'}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Prekliči</button>
            <button type="button" onClick={handleSave} disabled={total === 0 || saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Shranjujem…' : `Ustvari ${total} ${nalogeWord(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
