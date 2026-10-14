import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthShell({ title, hand, subtitle, error, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <svg className="doodle pointer-events-none absolute left-[8%] top-[12%] hidden h-20 w-20 text-rp-iris/25 sm:block" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <path d="M15 75 C 35 25, 60 85, 85 35" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <svg className="doodle doodle-delay pointer-events-none absolute bottom-[10%] right-[8%] hidden h-16 w-16 text-rp-iris/20 sm:block" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
        <path d="M50 10l7 22 22 7-22 7-7 22-7-22-22-7 22-7z" />
      </svg>
      <div className="card rise w-full max-w-md p-7 sm:p-9">
        <div className="mb-7">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rp-iris font-display text-xl font-bold text-white" aria-hidden="true">S</span>
          <p className="font-hand mt-4 text-2xl leading-none text-rp-iris">{hand}</p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-rp-muted">{subtitle}</p>
        </div>
        {error && <div className="mb-4 rounded-2xl border border-rp-love/25 bg-rp-love/[.07] p-3 text-sm text-rp-love" role="alert">{error}</div>}
        {children}
        <p className="mt-6 text-center text-sm text-rp-muted">{footer}</p>
      </div>
    </div>
  );
}

export function AuthField({ label, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-rp-subtle">{label}</label>
      <input {...props} className="field" />
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

export default function LoginPage() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (currentUser) navigate('/', { replace: true }); }, [currentUser, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch { setError('Napačen e-poštni naslov ali geslo. Poskusi znova.'); }
    setLoading(false);
  }

  return (
    <AuthShell hand="hej, dobrodošel nazaj *" title="Prijava" subtitle="Tvoje naloge te že čakajo." error={error}
      footer={<>Še nimaš računa? <Link to="/register" className="font-semibold text-rp-iris hover:underline">Ustvari ga</Link></>}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <AuthField label="E-pošta" id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tia@sola.si" autoComplete="email" />
        <AuthField label="Geslo" id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        <AuthSubmit loading={loading} idle="Prijavi me →" busy="Prijavljam…" />
      </form>
    </AuthShell>
  );
}

export { AuthShell };
