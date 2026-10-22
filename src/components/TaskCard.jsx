import { daysBetweenDateKeys, formatSlovenianDate, getSlovenianDateKey } from '../utils/dates';
import { getSubjectColor } from '../utils/colors';
import { EditIcon, TrashIcon } from './icons';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const today = getSlovenianDateKey();
  const diff = daysBetweenDateKeys(dateStr, today);
  let label = formatSlovenianDate(dateStr, { day: 'numeric', month: 'short' });
  let tone = 'text-rp-muted';
  if (diff < 0) { label = `Zamujeno ${label}`; tone = 'text-rp-danger'; }
  else if (diff === 0) { label = 'Danes'; tone = 'text-rp-accent'; }
  else if (diff === 1) { label = 'Jutri'; tone = 'text-rp-subtle'; }
  return { label, tone };
}

/**
 * One row in the ledger. Rows are separated by hairlines instead of boxes,
 * and the deadline sits in a fixed column so a list of tasks reads the same
 * way a list of deadlines does.
 */
export default function TaskCard({ task, subject, onToggle, onEdit, onDelete, selectionMode, selected, onSelect }) {
  const dateInfo = formatDate(task.dueDate);
  const color = subject ? getSubjectColor(subject.colorIndex) : null;

  return (
    <div
      className={`ledger-row flex items-center gap-3 px-3 py-3 ${
        task.completed && !selectionMode ? 'opacity-55' : ''
      } ${selectionMode ? 'cursor-pointer' : ''}`}
      data-selected={selectionMode && selected ? 'true' : 'false'}
      onClick={selectionMode ? () => onSelect(task) : undefined}
    >
      {selectionMode ? (
        <button
          onClick={(event) => { event.stopPropagation(); onSelect(task); }}
          role="checkbox"
          aria-checked={!!selected}
          aria-label={`Izberi nalogo ${task.title}`}
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-[1.5px] transition-colors active:scale-90 ${
            selected ? 'border-rp-accent bg-rp-accent text-rp-accent-ink' : 'border-rp-line-strong hover:border-rp-accent'
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
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors active:scale-90 ${
            task.completed
              ? 'border-rp-accent bg-rp-accent text-rp-accent-ink'
              : 'border-rp-line-strong hover:border-rp-accent'
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
        <h3 className={`truncate text-body font-semibold leading-snug ${task.completed ? 'text-rp-muted line-through' : 'text-rp-text'}`}>
          {task.title}
        </h3>
        {subject && (
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-small text-rp-muted">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: color.colorVar }}
              aria-hidden="true"
            />
            <span className="truncate">{subject.name}</span>
          </p>
        )}
      </div>

      {dateInfo && (
        <span className={`mono hidden shrink-0 text-small sm:block ${dateInfo.tone}`}>
          {dateInfo.label}
        </span>
      )}

      {!selectionMode && (
        <div className="flex shrink-0 items-center">
          <button
            onClick={() => onEdit(task)}
            aria-label={`Uredi nalogo ${task.title}`}
            className="rounded-md p-2 text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label={`Izbriši nalogo ${task.title}`}
            className="rounded-md p-2 text-rp-muted transition-colors hover:bg-rp-danger/10 hover:text-rp-danger"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
