import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../hooks/useFirestore';
import { useExams } from '../hooks/useStudy';
import ExamModal from '../components/ExamModal';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { EditIcon, TrashIcon } from '../components/icons';
import { countdown } from '../utils/countdown';
import { formatSlovenianDate, getSlovenianDateKey } from '../utils/dates';

export default function ExamsPage() {
  const navigate = useNavigate();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { exams, loading, error, addExam, updateExam, deleteExam } = useExams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('');

  const today = getSlovenianDateKey();
  const filtered = useMemo(
    () => exams.filter((exam) => !subjectFilter || exam.subjectId === subjectFilter),
    [exams, subjectFilter],
  );
  const upcoming = filtered.filter((exam) => exam.date >= today);
  const past = filtered.filter((exam) => exam.date < today).reverse();

  function subjectName(id) {
    return subjects.find((subject) => subject.id === id)?.name || 'Predmet';
  }

  function openNew() {
    if (subjectsLoading) return;
    if (!subjects.length) {
      navigate('/subjects?create=1&from=task');
      return;
    }
    setEditExam(null);
    setModalOpen(true);
  }

  function ExamRow({ exam }) {
    const info = countdown(exam.date, today);
    return (
      <div className="ledger-row flex items-center gap-4 px-4 py-4">
        <div className="flex w-14 shrink-0 flex-col items-center" aria-hidden="true">
          <span className="mono text-xl font-bold leading-none text-rp-text">
            {exam.date.slice(8, 10)}
          </span>
          <span className="mono mt-1 text-small text-rp-muted">{exam.date.slice(5, 7)}.</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body font-semibold text-rp-text">{exam.title}</h3>
          <p className="mt-0.5 truncate text-small text-rp-muted">
            {subjectName(exam.subjectId)} · {formatSlovenianDate(exam.date, { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <span
          className={`mono shrink-0 rounded-md px-3 py-1 text-small font-semibold ${
            info.urgent ? 'bg-rp-danger/10 text-rp-danger' : 'bg-rp-overlay text-rp-subtle'
          }`}
        >
          {info.label}
        </span>
        <div className="flex shrink-0 items-center">
          <button
            onClick={() => { setEditExam(exam); setModalOpen(true); }}
            aria-label={`Uredi preverjanje ${exam.title}`}
            className="rounded-md p-2 text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => { if (window.confirm(`Izbrišem preverjanje »${exam.title}«?`)) deleteExam(exam.id); }}
            aria-label={`Izbriši preverjanje ${exam.title}`}
            className="rounded-md p-2 text-rp-muted transition-colors hover:bg-rp-danger/10 hover:text-rp-danger"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rise margin-rule">
        <h1 className="text-page text-rp-text">Preverjanja</h1>
        <p className="mt-2 max-w-xl text-body text-rp-muted">
          Vsi testi, spraševanja in izpiti na enem mestu — z odštevanjem, da se pravočasno
          začneš učiti.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={openNew} className="btn-primary">Novo preverjanje</button>
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="field !w-auto"
            aria-label="Filtriraj po predmetu"
          >
            <option value="">Vsi predmeti</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
      </section>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className="card p-4"><Skeleton lines={4} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Ni zapisanih preverjanj"
          description="Dodaj prvo — že samo zapis datuma zmanjša stres pred testom."
          action={<button type="button" onClick={openNew} className="btn-primary">Dodaj preverjanje</button>}
        />
      ) : (
        <>
          <section aria-label="Prihajajoča preverjanja">
            <h2 className="text-title mb-3 text-rp-text">Prihaja ({upcoming.length})</h2>
            {upcoming.length ? (
              <div className="sheet ledger">
                {upcoming.map((exam) => <ExamRow key={exam.id} exam={exam} />)}
              </div>
            ) : (
              <p className="text-body text-rp-muted">Trenutno nič prihajajočega. Uživaj mir.</p>
            )}
          </section>
          {past.length > 0 && (
            <section aria-label="Pretekla preverjanja" className="opacity-70">
              <h2 className="text-title mb-3 text-rp-text">Preteklo ({past.length})</h2>
              <div className="sheet ledger">
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
