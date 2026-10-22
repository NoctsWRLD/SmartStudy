import { Link } from 'react-router-dom';
import Logo from './Logo';
import { SparkIcon } from './icons';

/**
 * The split sign-in screen. The left panel carries a ruled study rail — the
 * same device the app is built on — on a flat ink ground.
 */
export function AuthShell({ title, subtitle, error, children, footer }) {
  return (
    <div className="relative grid min-h-dvh overflow-hidden lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between border-r border-rp-line bg-rp-panel p-10 lg:flex">
        <span className="flex items-center gap-3">
          <Logo size={40} />
          <span className="font-display text-lg font-bold tracking-tight text-rp-text">Scribe</span>
        </span>

        <div className="max-w-sm">
          <p className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-rp-text">
            Mirna glava.
            <br />
            Narejene naloge.
          </p>
          <p className="mt-4 text-body leading-6 text-rp-subtle">
            Predmeti, naloge, preverjanja, urnik in kartice na enem mestu — za osnovnošolce,
            dijake in študente.
          </p>

          <div className="mt-8" aria-hidden="true">
            <ul className="rail">
              {['accent', 'accent', 'empty', 'warn', 'accent', 'empty', 'muted'].map((tone, index) => (
                <li key={index} className="rail-seg" data-tone={tone}>
                  <span style={{ width: `${[90, 55, 0, 100, 40, 0, 25][index]}%` }} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-small text-rp-muted">25 minut fokusa naenkrat.</p>
      </div>

      <div className="relative flex items-center justify-center p-4 sm:p-8">
        <div className="rise w-full max-w-md">
          <span className="flex items-center gap-2.5 lg:hidden">
            <Logo size={36} />
            <span className="font-display text-[17px] font-bold tracking-tight text-rp-text">Scribe</span>
          </span>

          <h1 className="mt-6 text-page text-rp-text lg:mt-0">{title}</h1>
          <p className="mt-2 text-body text-rp-muted">{subtitle}</p>

          {error && (
            <div
              className="mt-5 rounded-md border border-rp-danger/30 bg-rp-danger/[.07] p-3 text-body text-rp-danger"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="mt-6">{children}</div>
          <p className="mt-6 text-body text-rp-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export function AuthField({ label, id, ...props }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input id={id} {...props} className="field" />
    </div>
  );
}

export function AuthSubmit({ loading, idle, busy }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 disabled:opacity-60">
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {busy}
        </span>
      ) : idle}
    </button>
  );
}

export default AuthShell;
