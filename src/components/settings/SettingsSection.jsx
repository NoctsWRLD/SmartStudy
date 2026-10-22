/**
 * One section of the settings catalogue: a title, a sentence about what it is
 * for, and the controls. The rule keeps every topic on its own sheet, so the
 * page reads as a table of contents rather than a wall of switches.
 */
export default function SettingsSection({ id, title, description, children, action }) {
  return (
    <section className="sheet" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rp-line px-5 py-4">
        <div>
          <h2 id={`${id}-heading`} className="text-title text-rp-text">{title}</h2>
          {description && <p className="mt-1 max-w-xl text-small leading-5 text-rp-muted">{description}</p>}
        </div>
        {action}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}
