import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthField, AuthShell, AuthSubmit } from '../components/AuthShell';
import { useSeo } from '../hooks/useSeo';

export default function RegisterPage() {
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useSeo({ title: 'Ustvari račun', description: 'Ustvari Scribe račun in dodaj prvega predmeta.', path: '/register' });

  useEffect(() => {
    if (currentUser) navigate('/dashboard', { replace: true });
  }, [currentUser, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirm) {
      setError('Gesli se ne ujemata.');
      return;
    }
    if (password.length < 6) {
      setError('Geslo naj ima vsaj 6 znakov.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (registerError) {
      if (registerError.code === 'auth/email-already-in-use') {
        setError('Ta e-pošta je že v uporabi.');
      } else {
        setError('Registracija ni uspela. Preveri podatke in poskusi znova.');
      }
    }
    setLoading(false);
  }

  return (
    <AuthShell
      title="Ustvari račun"
      subtitle="Račun ustvariš v enem koraku."
      error={error}
      footer={<>Že imaš račun? <Link to="/login" className="font-semibold text-rp-accent hover:underline">Prijavi se</Link></>}
    >
      <form onSubmit={handleSubmit} className="grid gap-3.5">
        <AuthField
          label="Ime"
          id="register-name"
          type="text"
          required
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tia Novak"
          autoComplete="name"
        />
        <AuthField
          label="E-pošta"
          id="register-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tia@sola.si"
          autoComplete="email"
        />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AuthField
            label="Geslo"
            id="register-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <AuthField
            label="Ponovi geslo"
            id="register-confirm"
            type="password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        <AuthSubmit loading={loading} idle="Ustvari račun" busy="Ustvarjam…" />
      </form>
    </AuthShell>
  );
}
