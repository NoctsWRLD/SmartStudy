import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Editable field ───────────────────────────────────────────────────────────
function EditField({ label, value, onChange, placeholder, maxLength }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-rp-muted">
        {label}
      </label>
      <input
        type="text"
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-rp-overlay/90 border border-rp-hl-med/50 text-rp-text focus:border-rp-iris/50 transition-colors"
      />
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || '',
  );
  const [school, setSchool] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile?.school !== undefined) {
      setSchool(userProfile.school);
    }
  }, [userProfile?.school]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim() || undefined,
        school: school.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up pb-8">
      <h1 className="text-2xl font-bold text-rp-text">Moj profil</h1>

      {/* ─── Profile card ─── */}
      <div className="glass-card p-6 space-y-6">
        {/* Static avatar with initials */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-rp-base bg-gradient-to-br from-rp-iris to-rp-foam">
            {(currentUser?.displayName?.[0] || '?').toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <EditField
            label="Vzdevek"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Tvoje ime..."
            maxLength={60}
          />
          <EditField
            label="Šola"
            value={school}
            onChange={setSchool}
            placeholder="Ime šole..."
            maxLength={120}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 bg-gradient-to-br from-rp-iris to-rp-foam text-rp-base"
        >
          {saving ? 'Shranjujem…' : saved ? '✓ Shranjeno!' : 'Shrani spremembe'}
        </button>
      </div>

      {/* ─── Quick link to friends ─── */}
      <button
        onClick={() => navigate('/friends')}
        className="w-full glass-card p-4 flex items-center justify-between hover:bg-slate-700/30 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-rp-iris/20 to-rp-foam/15 border border-rp-iris/30">
            <svg
              className="w-[1.125rem] h-[1.125rem] text-rp-iris"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-rp-text">Prijatelji</p>
            <p className="text-xs text-rp-muted">
              Upravljaj prijatelje, pošlji zahteve
            </p>
          </div>
        </div>
        <svg
          className="text-rp-muted w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
