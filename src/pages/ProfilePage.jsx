import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, UsersIcon } from '../components/icons';

function EditField({ id, label, value, onChange, placeholder, maxLength }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [school, setSchool] = useState(userProfile?.school || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile?.school !== undefined) setSchool(userProfile.school);
  }, [userProfile?.school]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile({
        displayName: displayName.trim() || undefined,
        school: school.trim(),
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rise">
        <h1 className="text-page text-rp-text">Moj profil</h1>
        <p className="mt-2 text-body text-rp-muted">
          Tako te vidijo sošolci v klepetu in med prijatelji.
        </p>
      </section>

      <section className="card p-6">
        <div className="flex justify-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-rp-accent text-3xl font-bold text-rp-accent-ink">
            {(currentUser?.displayName?.[0] || '?').toUpperCase()}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <EditField
            id="profile-name"
            label="Vzdevek"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Tvoje ime…"
            maxLength={60}
          />
          <EditField
            id="profile-school"
            label="Šola"
            value={school}
            onChange={setSchool}
            placeholder="Ime šole…"
            maxLength={120}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary mt-6 w-full !py-3 disabled:opacity-50"
        >
          {saving ? 'Shranjujem…' : saved ? 'Spremembe so shranjene' : 'Shrani spremembe'}
        </button>
      </section>

      <button
        type="button"
        onClick={() => navigate('/friends')}
        className="card card-hover flex w-full items-center justify-between p-4 text-left"
      >
        <span className="flex items-center gap-3.5">
          <span
            className="grid h-9 w-9 place-items-center rounded-md border border-rp-accent/25 bg-rp-accent/10 text-rp-accent"
            aria-hidden="true"
          >
            <UsersIcon className="h-[18px] w-[18px]" />
          </span>
          <span>
            <span className="block text-body font-semibold text-rp-text">Prijatelji</span>
            <span className="mt-0.5 block text-small text-rp-muted">
              Upravljaj prijatelje in pošiljaj zahteve
            </span>
          </span>
        </span>
        <ChevronRightIcon className="h-5 w-5 text-rp-muted" />
      </button>
    </div>
  );
}
