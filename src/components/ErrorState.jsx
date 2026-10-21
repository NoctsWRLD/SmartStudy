/**
 * A failed read must not look like an empty account. The message says what
 * happened and what to do next; the button is the next step.
 */
export default function ErrorState({ message, onRetry, compact = false }) {
  return (
    <div
      role="alert"
      className={`card flex flex-col items-center border-rp-danger/30 bg-rp-danger/[.05] px-6 text-center ${
        compact ? 'py-8' : 'py-12'
      }`}
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        <span
          className="grid h-11 w-11 place-items-center rounded-2xl border border-rp-danger/30 bg-rp-danger/10 text-rp-danger"
          aria-hidden="true"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </span>
        <h2 className="mt-4 text-title text-rp-text">Naloga se ni uspela</h2>
        <p className="mt-2 text-body text-rp-muted">
          {message || 'Podatkov ni bilo mogoče prebrati.'}
        </p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-ghost mt-5">
            Poskusi znova
          </button>
        )}
      </div>
    </div>
  );
}
