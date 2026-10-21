import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AuthShell({ title, subtitle, error, children, footer }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-rp-text p-10 text-[var(--rp-canvas)] md:flex">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--rp-canvas)] font-display text-lg font-bold text-rp-text" aria-hidden="true">S</span>
        <div>
          <p className="font-display text-4xl font-bold leading-[1.05] tracking-tight">Mirna glava.<br />Narejene naloge.</p>
          <p className="mt-4 max-w-sm text-[15px] leading-6 opacity-70">Predmeti, naloge, preverjanja in kartice na enem mestu — za osnovnošolce, dijake in študente.</p>
        </div>
        <p className="text-sm opacity-60">25 minut fokusa naenkrat.</p>
      </div>
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="rise w-full max-w-md">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rp-text font-display text-xl font-bold text-[var(--rp-canvas)] md:hidden" aria-hidden="true">S</span>
          <h1 className="page-title mt-4 md:mt-0">{title}</h1>
          <p className="body-quiet mt-2">{subtitle}</p>
          {error && <div className="mt-5 rounded-2xl border border-rp-danger/30 bg-rp-danger/[.07] p-3 text-sm text-rp-danger" role="alert">{error}</div>}
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-sm text-rp-muted">{footer}</p>
        </div>
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
  useEffect(() => { if (currentUser) navigate('/dashboard', { replace: true }); }, [currentUser, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch { setError('Napačen e-poštni naslov ali geslo. Poskusi znova.'); }
    setLoading(false);
  }

  return (
    <AuthShell title="Prijava" subtitle="Tvoje naloge te že čakajo." error={error}
      footer={<>Še nimaš računa? <Link to="/register" className="font-semibold text-rp-accent hover:underline">Ustvari ga</Link></>}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <AuthField label="E-pošta" id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tia@sola.si" autoComplete="email" />
        <AuthField label="Geslo" id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        <AuthSubmit loading={loading} idle="Prijavi me" busy="Prijavljam…" />
      </form>
    </AuthShell>
  );
}
