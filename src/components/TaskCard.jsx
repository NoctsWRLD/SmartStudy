import { daysBetweenDateKeys, formatSlovenianDate, getSlovenianDateKey } from '../utils/dates';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const today = getSlovenianDateKey();
  const diff = daysBetweenDateKeys(dateStr, today);
  let label = formatSlovenianDate(dateStr, { day: 'numeric', month: 'short' });
  let urgency = 'normal';
  if (diff < 0) { label = `Zamudilo · ${label}`; urgency = 'overdue'; }
  else if (diff === 0) { label = 'Danes'; urgency = 'today'; }
  else if (diff === 1) { label = 'Jutri'; urgency = 'soon'; }
  else if (diff <= 3) { urgency = 'soon'; }
  return { label, urgency };
}

const urgencyClass = {
  overdue: 'bg-rp-love/10 text-rp-love',
  today: 'bg-[#fff3bf] text-[#6b5300]',
  soon: 'bg-rp-iris/10 text-rp-iris',
  normal: 'bg-rp-overlay text-rp-muted',
};

export default function TaskCard({ task, subject, onToggle, onEdit, onDelete }) {
  const dateInfo = formatDate(task.dueDate);

  return (
    <div className={`card card-hover rise flex items-start gap-3 p-4 ${task.completed ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onToggle(task)}
        aria-label={task.completed ? 'Označi kot neopravljeno' : 'Označi kot opravljeno'}
        aria-pressed={task.completed}
        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 hover:scale-110 active:scale-90 ${
          task.completed ? 'border-rp-iris bg-rp-iris text-white' : 'border-rp-hl-high bg-transparent hover:border-rp-iris'
        }`}
      >
        {task.completed && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-[15px] font-semibold leading-snug ${task.completed ? 'text-rp-muted line-through' : 'text-rp-text'}`}>
            {task.title}
          </h3>
          <div className="flex shrink-0 items-center gap-0.5">
            <button onClick={() => onEdit(task)} aria-label="Uredi nalogo" className="rounded-lg p-1.5 text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => onDelete(task)} aria-label="Izbriši nalogo" className="rounded-lg p-1.5 text-rp-muted transition-colors hover:bg-rp-love/10 hover:text-rp-love">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        {task.description && <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-rp-muted">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {subject && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rp-overlay px-2.5 py-1 text-xs font-medium text-rp-subtle">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `var(--rp-iris)` }} aria-hidden="true" />
              {subject.name}
            </span>
          )}
          {dateInfo && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${urgencyClass[dateInfo.urgency]}`}>
              {dateInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
