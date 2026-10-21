import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseConfigured } from '../firebase';
import FirebaseSetupNotice from '../components/FirebaseSetupNotice';
import { AuthField, AuthShell, AuthSubmit } from '../components/AuthShell';
import { useSeo } from '../hooks/useSeo';

export default function LoginPage() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useSeo({ title: 'Prijava', description: 'Prijavi se v svoj SmartStudy račun.', path: '/login' });

  useEffect(() => {
    if (currentUser) navigate('/dashboard', { replace: true });
  }, [currentUser, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Napačen e-poštni naslov ali geslo. Poskusi znova.');
    }
    setLoading(false);
  }

  if (!isFirebaseConfigured) return <FirebaseSetupNotice />;

  return (
    <AuthShell
      title="Prijava"
      subtitle="Tvoje naloge te že čakajo."
      error={error}
      footer={<>Še nimaš računa? <Link to="/register" className="font-semibold text-rp-accent hover:underline">Ustvari ga</Link></>}
    >
      <form onSubmit={handleSubmit} className="grid gap-3.5">
        <AuthField
          label="E-pošta"
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tia@sola.si"
          autoComplete="email"
        />
        <AuthField
          label="Geslo"
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <AuthSubmit loading={loading} idle="Prijavi se" busy="Prijavljam…" />
      </form>
    </AuthShell>
  );
}
