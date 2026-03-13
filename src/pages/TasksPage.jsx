import { useState, useMemo } from 'react';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const FILTERS = [
  { key: 'all', label: 'Vse' },
  { key: 'pending', label: 'Nedokončane' },
  { key: 'completed', label: 'Opravljene' },
];

export default function TasksPage() {
  const { subjects } = useSubjects();
  const { tasks, loading, addTask, updateTask, toggleTask, deleteTask } =
    useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');

  function getSubject(task) {
    return subjects.find((s) => s.id === task.subjectId) || null;
  }

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (statusFilter === 'pending') list = list.filter((t) => !t.completed);
    if (statusFilter === 'completed') list = list.filter((t) => t.completed);
    if (subjectFilter) list = list.filter((t) => t.subjectId === subjectFilter);
    if (sortBy === 'dueDate') {
      list.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else {
      list.sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
      );
    }
    return list;
  }, [tasks, statusFilter, subjectFilter, sortBy]);

  function handleSave(data) {
    if (editTask) updateTask(editTask.id, data);
    else addTask(data);
    setEditTask(null);
  }

  function handleEdit(task) {
    setEditTask(task);
    setModalOpen(true);
  }

  function handleDelete(task) {
    if (window.confirm(`Izbriši nalogo "${task.title}"?`)) deleteTask(task.id);
  }

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.filter((t) => t.completed).length;

  const selectStyle = {
    background: 'rgba(38,35,58,0.85)',
    border: '1px solid rgba(64,61,82,0.5)',
    color: '#908caa',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Naloge</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {pendingCount} nedokončanih · {doneCount} opravljenih
          </p>
        </div>
        <button
          id="add-task-btn"
          onClick={() => {
            setEditTask(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          }}
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
          Nova naloga
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 animate-fade-in-up">
        {/* Status tabs */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(51,65,85,0.5)',
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={
                statusFilter === f.key
                  ? {
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                    }
                  : { color: '#94a3b8' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Subject filter */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs text-slate-300 outline-none transition-all"
          style={{
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(51,65,85,0.5)',
          }}
        >
          <option value="">Vsi predmeti</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs text-slate-300 outline-none transition-all"
          style={{
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(51,65,85,0.5)',
          }}
        >
          <option value="dueDate">Razvrsti po roku</option>
          <option value="createdAt">Razvrsti po datumu dodajanja</option>
        </select>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#c4a7e7', borderTopColor: 'transparent' }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in-up shadow-sm">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {statusFilter === 'completed' ? 'Ni opravljenih nalog' : 'Ni nalog'}
          </h3>
          <p className="text-slate-400 text-sm">
            {statusFilter === 'pending'
              ? 'Vse naloge so opravljene! 🎉'
              : 'Dodaj novo nalogo, da začneš.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              subject={getSubject(task)}
              onToggle={toggleTask}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTask(null);
        }}
        onSave={handleSave}
        subjects={subjects}
        task={editTask}
      />
    </div>
  );
}
