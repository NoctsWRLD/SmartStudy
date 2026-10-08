import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      return setError('Gesli se ne ujemata.');
    }
    if (password.length < 6) {
      return setError('Geslo mora imeti vsaj 6 znakov.');
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      console.error('FIREBASE NAPAKA:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Ta e-poštni naslov je že v uporabi.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(
          'Prijava z e-pošto in geslom ni omogočena v Firebase konzoli.',
        );
      } else {
        setError('Registracija ni uspela. Preveri podatke in nastavitve storitve, nato poskusi znova.');
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-rp-base via-rp-surface to-rp-base">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none bg-rp-iris" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none bg-rp-foam" />

      <div className="glass-card p-8 w-full max-w-md animate-fade-in-up shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-glow bg-gradient-to-br from-rp-iris to-rp-foam">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text">SmartStudy</h1>
          <p className="mt-1 text-sm text-rp-subtle">Ustvarite nov račun</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm border text-rp-love bg-rp-love/10 border-rp-love/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-rp-subtle">
              Ime in priimek
            </label>
            <input
              id="register-name"
              type="text"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Janez Novak"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all bg-rp-overlay/90 border border-rp-hl-med/70 text-rp-text placeholder:text-rp-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-rp-subtle">
              E-poštni naslov
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.com"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all bg-rp-overlay/90 border border-rp-hl-med/70 text-rp-text placeholder:text-rp-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-rp-subtle">
              Geslo
            </label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all bg-rp-overlay/90 border border-rp-hl-med/70 text-rp-text placeholder:text-rp-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-rp-subtle">
              Potrdi geslo
            </label>
            <input
              id="register-confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all bg-rp-overlay/90 border border-rp-hl-med/70 text-rp-text placeholder:text-rp-muted"
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-rp-iris to-rp-foam shadow-[0_4px_20px_rgba(196,167,231,0.35)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Registriram...
              </span>
            ) : (
              'Registracija'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-rp-subtle">
          Že imate račun?{' '}
          <Link to="/login" className="text-rp-iris font-medium hover:opacity-80">
            Prijava
          </Link>
        </p>
      </div>
    </div>
  );
}
