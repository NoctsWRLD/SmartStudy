import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#6e6a86' }}>{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: `${color}1a` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { subjects } = useSubjects();
  const { tasks, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const upcoming = pending
    .filter(t => t.dueDate && t.dueDate >= todayStr)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  function getSubject(task) {
    return subjects.find(s => s.id === task.subjectId) || null;
  }

  function handleSave(data) {
    if (editTask) {
      updateTask(editTask.id, data);
    } else {
      addTask(data);
    }
    setEditTask(null);
  }

  function handleEdit(task) {
    setEditTask(task);
    setModalOpen(true);
  }

  function handleDelete(task) {
    if (window.confirm(`Izbriši nalogo "${task.title}"?`)) {
      deleteTask(task.id);
    }
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobro jutro' : hour < 18 ? 'Dober dan' : 'Dober večer';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold" style={{ color: '#e0def4' }}>
          {greeting}, <span className="gradient-text">{currentUser?.displayName || 'Učenec'}</span>! 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6e6a86' }}>
          {new Date().toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats — using Rosé Pine accent colors */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard label="Vse naloge" value={tasks.length} color="#c4a7e7"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard label="Nedokončane" value={pending.length} color="#f6c177"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Danes" value={todayTasks.length} color="#ebbcba"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard label="Opravljene" value={done.length} color="#9ccfd8"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming tasks */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: '#e0def4' }}>Prihajajoče naloge</h2>
            <button
              id="dashboard-add-task"
              onClick={() => { setEditTask(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #c4a7e7, #9ccfd8)' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nova naloga
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-sm" style={{ color: '#6e6a86' }}>Ni priharajočih nalog!</p>
              <p className="text-xs mt-1" style={{ color: '#524f67' }}>Dodaj novo nalogo, da začneš.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  subject={getSubject(task)}
                  onToggle={toggleTask}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
              {pending.length > 5 && (
                <Link to="/tasks" className="block text-center text-xs py-2 transition-all"
                  style={{ color: '#c4a7e7' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e0def4'}
                  onMouseLeave={e => e.currentTarget.style.color = '#c4a7e7'}
                >
                  Prikaži vse ({pending.length}) →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Subjects quick view */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: '#e0def4' }}>Moji predmeti</h2>
            <Link to="/subjects" className="text-xs transition-all" style={{ color: '#c4a7e7' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e0def4'}
              onMouseLeave={e => e.currentTarget.style.color = '#c4a7e7'}
            >Uredi →</Link>
          </div>
          {subjects.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm" style={{ color: '#6e6a86' }}>Ni predmetov</p>
              <Link to="/subjects" className="text-xs mt-1 block transition-all" style={{ color: '#c4a7e7' }}>Dodaj predmet →</Link>
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {subjects.map(subj => {
                const subjTasks = pending.filter(t => t.subjectId === subj.id);
                return (
                  <div key={subj.id} className="glass-card px-4 py-3 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: `hsl(${(subj.colorIndex ?? 0) * 36}, 55%, 65%)` }} />
                        <span className="text-sm font-medium" style={{ color: '#e0def4' }}>{subj.name}</span>
                      </div>
                      {subjTasks.length > 0 && (
                        <span className="text-xs" style={{ color: '#6e6a86' }}>{subjTasks.length} nalog</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSave={handleSave}
        subjects={subjects}
        task={editTask}
      />
    </div>
  );
}
