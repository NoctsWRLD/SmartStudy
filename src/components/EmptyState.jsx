/**
 * An empty screen is an invitation to act, not an apology.
 *
 * The state is drawn as a sheet of ruled paper rather than a card: the
 * message sits in the margin, the action below it, and the whole thing stays
 * flat — the same language as the rest of the application.
 */
export default function EmptyState({ icon, title, description, action, compact = false }) {
  return (
    <div
      className={`sheet flex flex-col items-center px-6 text-center ${
        compact ? 'py-8' : 'py-12'
      }`}
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        {icon && (
          <span
            className="grid h-11 w-11 place-items-center rounded-md border border-rp-line bg-rp-overlay text-rp-accent"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <h2 className="mt-4 text-subtitle font-semibold text-rp-text">{title}</h2>
        {description && (
          <p className="mt-1.5 max-w-md text-body text-rp-muted">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
