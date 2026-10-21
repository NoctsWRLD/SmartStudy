/**
 * An empty screen is an invitation to act, not an apology.
 * The description always says what will appear here and how to make it appear.
 */
export default function EmptyState({ icon, title, description, action, compact = false }) {
  return (
    <div
      className={`card flex flex-col items-center text-center ${compact ? 'px-5 py-8' : 'px-6 py-14'}`}
    >
      {icon && (
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl border border-rp-line bg-rp-overlay text-rp-accent"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <h2 className="mt-4 text-title text-rp-text">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-body text-rp-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
