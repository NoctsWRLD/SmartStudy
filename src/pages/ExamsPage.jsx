import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../hooks/useFirestore';
import { useExams } from '../hooks/useStudy';
import ExamModal from '../components/ExamModal';
import { daysBetweenDateKeys, formatSlovenianDate, getSlovenianDateKey } from '../utils/dates';

function countdown(dateStr, today) {
  const diff = daysBetweenDateKeys(dateStr, today);
  if (diff < 0) return { label: `Zamujeno ${formatSlovenianDate(dateStr, { day: 'numeric', month: 'short' })}`, urgent: true };
  if (diff === 0) return { label: 'Danes', urgent: true };
  if (diff === 1) return { label: 'Jutri', urgent: true };
  return { label: `Čez ${diff} dni`, urgent: diff <= 7 };
}

export default function ExamsPage() {
  const navigate = useNavigate();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { exams, loading, addExam, updateExam, deleteExam } = useExams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('');

  const today = getSlovenianDateKey();
  const filtered = useMemo(
    () => exams.filter((e) => !subjectFilter || e.subjectId === subjectFilter),
    [exams, subjectFilter],
  );
  const upcoming = filtered.filter((e) => e.date >= today);
  const past = filtered.filter((e) => e.date < today).reverse();

  function subjectName(id) {
    return subjects.find((s) => s.id === id)?.name || 'Predmet';
  }

  function openNew() {
    if (subjectsLoading) return;
    if (!subjects.length) { navigate('/subjects?create=1&from=task'); return; }
    setEditExam(null);
    setModalOpen(true);
  }

  function ExamRow({ exam }) {
    const cd = countdown(exam.date, today);
    return (
      <div className="row-item rise flex items-center gap-4 px-4 py-3.5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rp-iris/[.1] text-center" aria-hidden="true">
          <div>
            <p className="font-display text-lg font-extrabold leading-none tabular-nums">{exam.date.slice(8, 10)}</p>
            <p className="text-[10px] font-semibold text-rp-muted">{exam.date.slice(5, 7)}.</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold">{exam.title}</h3>
          <p className="mt-0.5 truncate text-xs text-rp-muted">
            {subjectName(exam.subjectId)} · {formatSlovenianDate(exam.date, { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${cd.urgent ? 'bg-rp-love/10 text-rp-love' : 'bg-rp-overlay text-rp-subtle'}`}>
          {cd.label}
        </span>
        <div className="flex shrink-0 items-center">
          <button onClick={() => { setEditExam(exam); setModalOpen(true); }} aria-label="Uredi preverjanje" className="rounded-lg p-2 text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => { if (window.confirm(`Izbrišem preverjanje »${exam.title}«?`)) deleteExam(exam.id); }} aria-label="Izbriši preverjanje" className="rounded-lg p-2 text-rp-muted transition-colors hover:bg-rp-love/10 hover:text-rp-love">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="rise">
        <h1 className="page-title">Preverjanja</h1>
        <p className="body-quiet mt-2">Vsi testi, spraševanja in izpiti na enem mestu — z odštevanjem, da se pravočasno začneš učiti.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={openNew} className="btn-primary">Novo preverjanje</button>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="field !w-auto" aria-label="Filtriraj po predmetu">
            <option value="">Vsi predmeti</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="card grid min-h-40 place-items-center" role="status">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card rise p-6">
          <h2 className="section-title">Ni zapisanih preverjanj.</h2>
          <p className="body-quiet mt-2 text-sm">Dodaj prvo — že samo zapis datuma zmanjša stres pred testom.</p>
          <button type="button" onClick={openNew} className="btn-ghost mt-4">Dodaj preverjanje</button>
        </div>
      ) : (
        <>
          <section aria-label="Prihajajoča preverjanja">
            <h2 className="section-title mb-3">Prihaja ({upcoming.length})</h2>
            <div className="stagger">
              {upcoming.map((exam) => <ExamRow key={exam.id} exam={exam} />)}
            </div>
            {upcoming.length === 0 && <p className="body-quiet text-sm">Trenutno nič prihajajočega. Uživaj mir.</p>}
          </section>
          {past.length > 0 && (
            <section aria-label="Pretekla preverjanja" className="opacity-75">
              <h2 className="section-title mb-3">Preteklo ({past.length})</h2>
              <div className="stagger">
                {past.map((exam) => <ExamRow key={exam.id} exam={exam} />)}
              </div>
            </section>
          )}
        </>
      )}

      <ExamModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditExam(null); }}
        onSave={(data) => { if (editExam) updateExam(editExam.id, data); else addExam(data); setEditExam(null); }}
        subjects={subjects}
        exam={editExam}
      />
    </div>
  );
}
