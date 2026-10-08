import Badge from './Badge';
import SUBJECT_COLORS from '../utils/colors';
import { daysBetweenDateKeys, formatSlovenianDate, getSlovenianDateKey } from '../utils/dates';

function formatDate(dateStr) {
  if (!dateStr) return null;
  const today = getSlovenianDateKey();
  const diff = daysBetweenDateKeys(dateStr, today);

  let label = formatSlovenianDate(dateStr, { day: 'numeric', month: 'short' });
  let urgency = 'normal';
  if (diff < 0) { label = `Zamudilo (${label})`; urgency = 'overdue'; }
  else if (diff === 0) { label = 'Danes'; urgency = 'today'; }
  else if (diff === 1) { label = 'Jutri'; urgency = 'soon'; }
  else if (diff <= 3) { urgency = 'soon'; }

  return { label, urgency };
}

export default function TaskCard({ task, subject, onToggle, onEdit, onDelete }) {
  const dateInfo = formatDate(task.dueDate);
  const color = subject ? (SUBJECT_COLORS[subject.colorIndex] ?? SUBJECT_COLORS[0]) : null;

  // Deadline urgency colors
  const urgencyColors = {
    overdue: 'text-rp-love',
    today:   'text-rp-gold',
    soon:    'text-rp-rose',
    normal:  'text-rp-muted',
  };

  return (
    <div
      className={`relative p-4 rounded-xl transition-all group animate-fade-in-up bg-rp-surface/70 border ${
        task.completed ? 'opacity-60 border-rp-hl-med/25' : 'border-rp-hl-med/55'
      }`}>
      {/* Left color bar */}
      {color && (
        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${task.completed ? 'opacity-30' : 'opacity-70'}`}
          style={{ backgroundColor: color.colorCode }} />
      )}

      <div className="flex items-start gap-3 pl-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
            task.completed ? 'bg-gradient-to-br from-rp-iris to-rp-foam border-transparent' : 'bg-transparent'
          }`}
          style={!task.completed ? { borderColor: color?.colorCode || 'var(--color-rp-hl-high)' } : {}}>
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-sm font-medium leading-snug ${task.completed ? 'line-through text-rp-muted' : 'text-rp-text'}`}>
              {task.title}
            </h3>
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg transition-all text-rp-muted hover:text-rp-iris hover:bg-rp-iris/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(task)}
                className="p-1.5 rounded-lg transition-all text-rp-muted hover:text-rp-love hover:bg-rp-love/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs mt-1 line-clamp-2 text-rp-muted">{task.description}</p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {subject && (
              <Badge colorIndex={subject.colorIndex}>{subject.name}</Badge>
            )}
            {dateInfo && (
              <span className={`text-xs flex items-center gap-1 ${urgencyColors[dateInfo.urgency]}`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
