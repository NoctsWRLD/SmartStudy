import { daysBetweenDateKeys, formatSlovenianDate, getSlovenianDateKey } from '../utils/dates';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const today = getSlovenianDateKey();
  const diff = daysBetweenDateKeys(dateStr, today);
  let label = formatSlovenianDate(dateStr, { day: 'numeric', month: 'short' });
  let tone = 'text-rp-muted';
  if (diff < 0) { label = `Zamujeno ${label}`; tone = 'text-rp-love'; }
  else if (diff === 0) { label = 'Danes'; tone = 'text-rp-iris'; }
  else if (diff === 1) { label = 'Jutri'; tone = 'text-rp-subtle'; }
  return { label, tone };
}

export default function TaskCard({ task, subject, onToggle, onEdit, onDelete, selectionMode, selected, onSelect }) {
  const dateInfo = formatDate(task.dueDate);

  return (
    <div
      className={`row-item rise flex items-center gap-3 px-3.5 py-3 ${task.completed && !selectionMode ? 'opacity-55' : ''} ${selectionMode && selected ? 'border-rp-iris' : ''} ${selectionMode ? 'cursor-pointer' : ''}`}
      onClick={selectionMode ? () => onSelect(task) : undefined}
    >
      {selectionMode ? (
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(task); }}
          role="checkbox"
          aria-checked={!!selected}
          aria-label={`Izberi nalogo ${task.title}`}
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-[1.5px] transition-all active:scale-90 ${
            selected ? 'border-rp-iris bg-rp-iris text-white' : 'border-rp-hl-high hover:border-rp-iris'
          }`}
        >
          {selected && (
            <svg className="tick-pop h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ) : (
        <button
          onClick={() => onToggle(task)}
          aria-label={task.completed ? 'Označi kot neopravljeno' : 'Označi kot opravljeno'}
          aria-pressed={task.completed}
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] transition-all active:scale-90 ${
            task.completed ? 'border-rp-iris bg-rp-iris text-white' : 'border-rp-hl-high hover:border-rp-iris'
          }`}
        >
          {task.completed && (
            <svg className="tick-pop h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}

      <div className="min-w-0 flex-1">
        <h3 className={`truncate text-[14.5px] font-semibold leading-snug ${task.completed ? 'text-rp-muted line-through' : 'text-rp-text'}`}>
          {task.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-rp-muted">
          {[subject?.name, dateInfo && <span key="d" className={dateInfo.tone}>{dateInfo.label}</span>].filter(Boolean).reduce((acc, part, i) => (i === 0 ? [part] : [...acc, ' · ', part]), [])}
        </p>
      </div>

      {!selectionMode && (
        <div className="flex shrink-0 items-center">
          <button onClick={() => onEdit(task)} aria-label="Uredi nalogo" className="rounded-lg p-2 text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => onDelete(task)} aria-label="Izbriši nalogo" className="rounded-lg p-2 text-rp-muted transition-colors hover:bg-rp-love/10 hover:text-rp-love">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
