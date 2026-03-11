import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Editable field ───────────────────────────────────────────────────────────
function EditField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-subtle)' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 rounded-2xl text-sm font-medium outline-none shadow-inner transition-all"
        style={{ background: 'var(--color-overlay)', color: 'var(--color-text)', border: '1px solid rgba(144, 140, 170, 0.3)' }}
      />
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [school, setSchool] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Pre-populate school from Firestore when profile loads
  useEffect(() => {
    if (userProfile?.school !== undefined) {
      setSchool(userProfile.school);
    }
  }, [userProfile?.school]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfile({ displayName: displayName.trim() || undefined, school: school.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up pb-8">
      <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Moj profil</h1>

      {/* ─── Profile card ─── */}
      <div className="glass-card p-8 space-y-8 shadow-md">
        {/* Static avatar with initials */}
        <div className="flex justify-center">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--color-iris), var(--color-rose))', color: '#191724' }}
          >
            {(currentUser?.displayName?.[0] || '?').toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <EditField
            label="Vzdevek"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Tvoje ime..."
          />
          <EditField
            label="Šola"
            value={school}
            onChange={setSchool}
            placeholder="Ime šole..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl text-base font-bold transition-all hover:opacity-90 shadow-md disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, var(--color-iris), var(--color-rose))', color: '#191724' }}
        >
          {saving ? 'Shranjujem…' : saved ? '✓ Shranjeno!' : 'Shrani spremembe'}
        </button>
      </div>

      {/* ─── Quick link to friends ─── */}
      <button
        onClick={() => navigate('/friends')}
        className="w-full glass-card p-5 flex items-center justify-between hover:bg-white/5 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, rgba(196, 167, 231, 0.15), rgba(235, 188, 186, 0.1))', border: '1px solid rgba(196, 167, 231, 0.3)' }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-iris)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Prijatelji</p>
            <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-subtle)' }}>Upravljaj prijatelje, pošlji zahteve</p>
          </div>
        </div>
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
