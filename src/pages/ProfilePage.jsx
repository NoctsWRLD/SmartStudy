import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Editable field ───────────────────────────────────────────────────────────
function EditField({ label, value, onChange, placeholder, maxLength }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-rp-subtle">
        {label}
      </label>
      <input
        type="text"
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field"
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
    <div className="mx-auto max-w-2xl space-y-7 pb-8">
      <div>
        <h1 className="page-title">Moj profil</h1>
        <p className="body-quiet mt-2">Tako te vidijo sošolci v klepetu in med prijatelji.</p>
      </div>

      {/* ─── Profile card ─── */}
      <div className="card space-y-6 p-6">
        {/* Static avatar with initials */}
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rp-iris text-3xl font-bold text-white">
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
          className="btn-primary w-full !py-3 disabled:opacity-50"
        >
          {saving ? 'Shranjujem…' : saved ? 'Shranjene!' : 'Shrani spremembe'}
        </button>
      </div>

      {/* ─── Quick link to friends ─── */}
      <button
        onClick={() => navigate('/friends')}
        className="card card-hover flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rp-iris/10 text-rp-iris">
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
