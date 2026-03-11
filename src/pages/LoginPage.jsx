import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Napačen e-poštni naslov ali geslo.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--color-base)' }}>
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-iris), transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-rose), transparent)' }} />

      <div className="glass-card p-8 w-full max-w-md animate-fade-in-up shadow-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-glow shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--color-iris), var(--color-rose))', color: '#191724' }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text">SmartStudy</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-subtle)' }}>Prijava v vaš račun</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(235, 111, 146, 0.1)', color: 'var(--color-love)', border: '1px solid rgba(235, 111, 146, 0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--color-subtle)' }}>E-poštni naslov</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vas@email.com"
              className="w-full px-5 py-3 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-[color:var(--color-iris)]/50 shadow-inner"
              style={{ background: 'var(--color-overlay)', color: 'var(--color-text)', border: '1px solid rgba(144, 140, 170, 0.3)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: 'var(--color-subtle)' }}>Geslo</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-3 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-[color:var(--color-iris)]/50 shadow-inner"
              style={{ background: 'var(--color-overlay)', color: 'var(--color-text)', border: '1px solid rgba(144, 140, 170, 0.3)' }}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl font-bold transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"
            style={{ background: 'linear-gradient(135deg, var(--color-iris), var(--color-rose))', color: '#191724', boxShadow: '0 4px 20px rgba(196, 167, 231, 0.2)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Prijavljam...
              </span>
            ) : 'Prijava'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 font-medium" style={{ color: 'var(--color-subtle)' }}>
          Nimate računa?{' '}
          <Link to="/register" className="font-bold hover:opacity-80 transition-opacity" style={{ color: 'var(--color-iris)' }}>
            Registracija
          </Link>
        </p>
      </div>
    </div>
  );
}
