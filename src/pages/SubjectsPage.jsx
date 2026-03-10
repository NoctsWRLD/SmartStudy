import { useState } from 'react';
import SUBJECT_COLORS from '../utils/colors';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import SubjectModal from '../components/SubjectModal';
import SubjectTaskModal from '../components/SubjectTaskModal';

export default function SubjectsPage() {
  const { subjects, loading, addSubject, updateSubject, deleteSubject } = useSubjects();
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
    const count = tasks.filter(t => t.subjectId === subj.id).length;
    const msg = count > 0
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
          <h1 className="text-2xl font-bold text-white">Predmeti</h1>
          <p className="text-slate-400 text-sm mt-0.5">{subjects.length} predmetov</p>
        </div>
        <button
          id="add-subject-btn"
          onClick={() => { setEditSubject(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nov predmet
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in-up">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-white mb-2">Ni predmetov</h3>
          <p className="text-slate-400 text-sm mb-6">Dodaj predmete, da lažje organiziraš naloge.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            Dodaj prvi predmet
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 stagger-children">
          {subjects.map(subj => {
            const color = SUBJECT_COLORS[subj.colorIndex ?? 0];
            const taskCount = tasks.filter(t => t.subjectId === subj.id).length;
            const doneCount = tasks.filter(t => t.subjectId === subj.id && t.completed).length;
            const pct = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

            return (
              <div key={subj.id}
                onClick={() => handleSubjectClick(subj)}
                className="glass-card p-5 animate-fade-in-up group hover:border-slate-600/70 transition-all cursor-pointer"
                style={{ borderLeft: `3px solid ${color.text}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                      style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
                      {subj.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{subj.name}</h3>
                      <p className="text-xs text-slate-400">{taskCount} nalog · {doneCount} opravljenih</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(subj); }}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(subj); }}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {taskCount > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Napredek</span>
                      <span style={{ color: color.text }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(51,65,85,0.5)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: color.text }} />
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
        onClose={() => { setModalOpen(false); setEditSubject(null); }}
        onSave={handleSave}
        subject={editSubject}
      />

      <SubjectTaskModal
        isOpen={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setSelectedSubject(null); }}
        subject={selectedSubject}
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}
