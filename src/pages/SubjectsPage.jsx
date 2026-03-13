import { useState } from 'react';
import SUBJECT_COLORS from '../utils/colors';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import SubjectModal from '../components/SubjectModal';
import SubjectTaskModal from '../components/SubjectTaskModal';

export default function SubjectsPage() {
  const { subjects, loading, addSubject, updateSubject, deleteSubject } =
    useSubjects();
  const { tasks, toggleTask, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  function handleSubjectClick(subj) {
    setSelectedSubject(subj);
    setTaskModalOpen(true);
  }

  function handleSave(data) {
    if (editSubject) {
      updateSubject(editSubject.id, data);
    } else {
      addSubject(data);
    }
    setEditSubject(null);
  }

  function handleEdit(subj) {
    setEditSubject(subj);
    setModalOpen(true);
  }

  function handleDelete(subj) {
    const count = tasks.filter((t) => t.subjectId === subj.id).length;
    const msg =
      count > 0
        ? `Predmet "${subj.name}" ima ${count} nalog. Res ga želite izbrisati?`
        : `Izbriši predmet "${subj.name}"?`;
    if (window.confirm(msg)) {
      deleteSubject(subj.id);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-rp-text">Predmeti</h1>
          <p className="text-sm mt-0.5 text-rp-muted">
            {subjects.length} predmetov
          </p>
        </div>
        <button
          id="add-subject-btn"
          onClick={() => {
            setEditSubject(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 bg-gradient-to-br from-rp-iris to-rp-foam shadow-[0_4px_20px_rgba(196,167,231,0.3)] text-rp-base"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nov predmet
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 animate-spin border-rp-iris border-t-transparent" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in-up shadow-sm">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-rp-text mb-2">
            Ni predmetov
          </h3>
          <p className="text-rp-subtle text-sm mb-6">
            Dodaj predmete, da lažje organiziraš naloge.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 bg-gradient-to-br from-rp-iris to-rp-foam text-rp-base"
          >
            Dodaj prvi predmet
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 stagger-children">
          {subjects.map((subj) => {
            const color = SUBJECT_COLORS[subj.colorIndex ?? 0];
            const taskCount = tasks.filter(
              (t) => t.subjectId === subj.id,
            ).length;
            const doneCount = tasks.filter(
              (t) => t.subjectId === subj.id && t.completed,
            ).length;
            const pct =
              taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

            return (
              <div
                key={subj.id}
                onClick={() => handleSubjectClick(subj)}
                className="glass-card p-5 animate-fade-in-up group hover:border-rp-hl-med transition-all cursor-pointer border-l-[3px]"
                style={{ borderLeftColor: color.colorCode }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold ${color.bg} ${color.text} border ${color.border}`}
                    >
                      {subj.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-rp-text">{subj.name}</h3>
                      <p className="text-xs text-rp-muted">
                        {taskCount} nalog · {doneCount} opravljenih
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(subj);
                      }}
                      className="p-2 rounded-lg transition-all text-rp-muted hover:text-rp-iris hover:bg-rp-iris/10"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(subj);
                      }}
                      className="p-2 rounded-lg transition-all text-rp-muted hover:text-rp-love hover:bg-rp-love/10"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {taskCount > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-rp-muted">
                      <span>Napredek</span>
                      <span className={color.text}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-rp-hl-med/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color.colorCode }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SubjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditSubject(null);
        }}
        onSave={handleSave}
        subject={editSubject}
      />

      <SubjectTaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setSelectedSubject(null);
        }}
        subject={selectedSubject}
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}
