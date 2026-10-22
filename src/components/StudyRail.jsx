/**
 * The study rail — the app's structural device.
 *
 * A rail is a run of time (a week, a day, a countdown) whose segments are
 * filled by how much of that time is claimed. The fill is a flat accent colour,
 * so it carries meaning instead of decorating.
 */
export default function StudyRail({ segments, label, caption, className = '' }) {
  if (!segments?.length) return null;

  return (
    <div className={className}>
      {caption && <p className="mb-2 text-label text-rp-muted">{caption}</p>}
      <ul className="rail" aria-label={label}>
        {segments.map((segment) => (
          <li
            key={segment.key}
            className="rail-seg"
            data-tone={segment.tone || 'accent'}
            title={segment.hint}
          >
            <span
              aria-hidden="true"
              style={{ width: `${Math.round((segment.value ?? 0) * 100)}%` }}
            />
            <span className="sr-only">{segment.hint}</span>
          </li>
        ))}
      </ul>
      <ul className="mt-2 flex gap-[3px]" aria-hidden="true">
        {segments.map((segment) => (
          <li
            key={segment.key}
            className={`flex-1 truncate text-center text-[11px] leading-4 ${
              segment.today
                ? 'font-semibold text-rp-accent'
                : segment.value > 0
                  ? 'text-rp-subtle'
                  : 'text-rp-muted'
            }`}
          >
            {segment.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
