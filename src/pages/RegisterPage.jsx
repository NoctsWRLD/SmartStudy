import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell, AuthField, AuthSubmit } from './LoginPage';

export default function RegisterPage() {
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (currentUser) navigate('/', { replace: true }); }, [currentUser, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) return setError('Gesli se ne ujemata.');
    if (password.length < 6) return setError('Geslo naj ima vsaj 6 znakov.');
    setError(''); setLoading(true);
    try { await register(email, password, name); navigate('/'); }
    catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Ta e-pošta je že v uporabi.');
      else setError('Registracija ni uspela. Preveri podatke in poskusi znova.');
    }
    setLoading(false);
  }

  return (
    <AuthShell title="Ustvari račun" subtitle="Brezplačno, v manj kot minuti." error={error}
      footer={<>Že imaš račun? <Link to="/login" className="font-semibold text-rp-iris hover:underline">Prijavi se</Link></>}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <AuthField label="Ime" id="register-name" type="text" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tia Novak" autoComplete="name" />
        <AuthField label="E-pošta" id="register-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tia@sola.si" autoComplete="email" />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <AuthField label="Geslo" id="register-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          <AuthField label="Ponovi geslo" id="register-confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
        </div>
        <AuthSubmit loading={loading} idle="Ustvari račun" busy="Ustvarjam…" />
      </form>
    </AuthShell>
  );
}
