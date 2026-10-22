import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import { useExams, useFlashcards, useFocusSessions } from '../hooks/useStudy';
import { useFriends, useFriendCode, getDmChatId } from '../hooks/useChat';
import SettingsSection from '../components/settings/SettingsSection';
import DeleteAccountModal from '../components/settings/DeleteAccountModal';
import { THEMES } from '../utils/themes';
import { getSlovenianDateKey } from '../utils/dates';
import {
  DEFAULT_PREFERENCES,
  FOCUS_OPTIONS,
  WARNING_OPTIONS,
  WEEK_STARTS,
  normalizePreferences,
} from '../utils/preferences';
import { authErrorMessage } from '../utils/authErrors';
import { CheckIcon, CopyIcon, MoonIcon, SunIcon } from '../components/icons';
import { countedNoun } from '../utils/slovenian';

function Toggle({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rp-line py-4 last:border-0 last:pb-0">
      <div>
        <h3 className="text-body font-semibold text-rp-text">{title}</h3>
        <p className="mt-1 max-w-lg text-small leading-5 text-rp-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={title}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-rp-accent' : 'bg-rp-line-strong'
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-rp-raised transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function Note({ tone = 'muted', children }) {
  const tones = {
    muted: 'text-rp-muted',
    good: 'text-rp-success',
    bad: 'text-rp-danger',
  };
  return (
    <p className={`mt-3 text-small leading-5 ${tones[tone]}`} role="status" aria-live="polite">
      {children}
    </p>
  );
}

export default function SettingsPage() {
  const {
    currentUser,
    userProfile,
    updateUserProfile,
    updatePreferences,
    changeEmail,
    changePassword,
    deleteAccount,
  } = useAuth();
  const { theme, setTheme, highContrast, setHighContrast, reduceMotion, setReduceMotion } = useSettings();
  const { subjects } = useSubjects();
  const { tasks } = useTasks();
  const { exams } = useExams();
  const { cards } = useFlashcards();
  const { sessions } = useFocusSessions();
  const { friends } = useFriends();
  const { code: friendCode, regenerate } = useFriendCode(currentUser, userProfile?.friendCode, userProfile);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [school, setSchool] = useState(userProfile?.school || '');
  const [profileNote, setProfileNote] = useState(null);

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailNote, setEmailNote] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNote, setPasswordNote] = useState(null);

  const [codeNote, setCodeNote] = useState(null);
  const [copied, setCopied] = useState(false);

  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [preferenceNote, setPreferenceNote] = useState(null);

  const [dataNote, setDataNote] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteNote, setDeleteNote] = useState(null);

  useEffect(() => {
    if (userProfile?.school !== undefined) setSchool(userProfile.school);
  }, [userProfile?.school]);

  useEffect(() => {
    setPreferences(normalizePreferences(userProfile?.preferences));
  }, [userProfile?.preferences]);

  useEffect(() => {
    if (currentUser?.displayName) setDisplayName(currentUser.displayName);
  }, [currentUser?.displayName]);

  async function handleProfileSave() {
    setProfileNote(null);
    try {
      await updateUserProfile({ displayName: displayName.trim(), school: school.trim() });
      setProfileNote('Spremembe so shranjene.');
    } catch (error) {
      console.error('Shranjevanje profila ni uspelo:', error);
      setProfileNote('Profila ni bilo mogoče shraniti. Poskusi znova.');
    }
  }

  async function handleEmailChange(event) {
    event.preventDefault();
    setEmailNote(null);
    try {
      await changeEmail(newEmail, emailPassword);
      setEmailNote('Na novo e-pošto je poslana potrditev. Odpri jo, da spremembo potrdiš.');
      setNewEmail('');
      setEmailPassword('');
    } catch (error) {
      setEmailNote(authErrorMessage(error));
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    setPasswordNote(null);
    try {
      await changePassword(newPassword, passwordCurrent);
      setPasswordNote('Geslo je spremenjeno.');
      setNewPassword('');
      setPasswordCurrent('');
    } catch (error) {
      setPasswordNote(authErrorMessage(error));
    }
  }

  async function handleCopyCode() {
    if (!friendCode) return;
    try {
      await navigator.clipboard.writeText(friendCode);
      setCopied(true);
      setCodeNote('Koda je kopirana.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Kopiranje kode ni uspelo:', error);
      setCodeNote(`Kodo zapiši ročno: ${friendCode}`);
    }
  }

  async function handleRegenerateCode() {
    setCodeNote(null);
    try {
      await regenerate();
      setCodeNote('Nova koda je ustvarjena. Stara ne deluje več.');
    } catch (error) {
      console.error('Nova koda ni bila ustvarjena:', error);
      setCodeNote('Nove kode ni bilo mogoče ustvariti. Poskusi znova.');
    }
  }

  async function handlePreferencesSave() {
    setPreferenceNote(null);
    try {
      await updatePreferences(preferences);
      setPreferenceNote('Nastavitve so shranjene.');
    } catch (error) {
      console.error('Shranjevanje nastavitev ni uspelo:', error);
      setPreferenceNote('Nastavitev ni bilo mogoče shraniti. Poskusi znova.');
    }
  }

  function handleExport() {
    import('../services/accountService').then(({ collectAccountData: collect }) => {
      const data = collect({
        account: {
          displayName: currentUser?.displayName || '',
          email: currentUser?.email || userProfile?.email || '',
          school: userProfile?.school || '',
        },
        subjects,
        tasks,
        exams,
        cards,
        sessions,
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scribe-podatki-${getSlovenianDateKey()}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDataNote('Datoteka je prenesena.');
    });
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImporting(true);
    setDataNote(null);
    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setDataNote('Datoteke ni mogoče prebrati. Izberi JSON datoteko, ki jo je izvozil Scribe.');
        return;
      }

      const { validateImport, importAccountData } = await import('../services/accountService');
      const check = validateImport(data);
      if (!check.ok) {
        setDataNote(check.error);
        return;
      }

      const result = await importAccountData(currentUser.uid, data);
      setDataNote(
        `Uvoženo: ${result.subjects} predmetov, ${result.tasks} nalog, ${result.exams} preverjanj in ${result.flashcards} kartic.`,
      );
    } catch (error) {
      console.error('Uvoz podatkov ni uspel:', error);
      setDataNote('Podatkov ni bilo mogoče uvoziti. Poskusi znova.');
    } finally {
      setImporting(false);
    }
  }

  async function handleDeleteAccount(password) {
    const chatIds = ['general', ...friends.map((friend) => getDmChatId(currentUser.uid, friend.uid))];
    await deleteAccount(password, chatIds);
    navigate('/login', { replace: true });
  }

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const focusMinutes = sessions.reduce((sum, session) => sum + (session.minutes || 0), 0);

  return (
    <div className="max-w-3xl space-y-5">
      <section className="rise margin-rule">
        <h1 className="text-page text-rp-text">Nastavitve</h1>
        <p className="mt-2 max-w-xl text-body text-rp-muted">
          Vse o svojem računu, videzu in načinu učenja je na enem mestu.
        </p>
      </section>

      <SettingsSection
        id="profil"
        title="Profil"
        description="Tako te vidijo sošolci v klepetu in med prijatelji."
      >
        <div className="flex items-center gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-rp-accent text-xl font-bold text-rp-accent-ink"
            aria-hidden="true"
          >
            {(displayName?.[0] || '?').toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <label className="field-label" htmlFor="settings-name">Vzdevek</label>
            <input
              id="settings-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={60}
              className="field"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor="settings-school">Šola</label>
          <input
            id="settings-school"
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            maxLength={120}
            placeholder="Ime šole…"
            className="field"
          />
        </div>

        <button type="button" onClick={handleProfileSave} className="btn btn-primary mt-5">
          Shrani profil
        </button>
        {profileNote && <Note tone="good">{profileNote}</Note>}
      </SettingsSection>

      <SettingsSection
        id="racun"
        title="Račun"
        description="E-poštni naslov in geslo. Za spremembo potrdi geslo."
      >
        <dl className="grid gap-3 text-body">
          <div className="flex justify-between gap-4 border-b border-rp-line pb-3">
            <dt className="text-rp-muted">E-pošta</dt>
            <dd className="truncate font-medium text-rp-text">{currentUser?.email || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-rp-muted">Članstvo</dt>
            <dd className="font-medium text-rp-text">Od {userProfile?.createdAt?.toDate
              ? new Date(userProfile.createdAt.toDate()).toLocaleDateString('sl-SI')
              : '—'}</dd>
          </div>
        </dl>

        <form onSubmit={handleEmailChange} className="mt-6 border-t border-rp-line pt-5">
          <h3 className="text-body font-semibold text-rp-text">Spremeni e-pošto</h3>
          <p className="mt-1 text-small text-rp-muted">
            Na nov naslov boš dobil potrditveno povezavo. Veljavnost je potrebna za prijavo.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="settings-email">Nova e-pošta</label>
              <input
                id="settings-email"
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                autoComplete="email"
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="settings-email-password">Trenutno geslo</label>
              <input
                id="settings-email-password"
                type="password"
                value={emailPassword}
                onChange={(event) => setEmailPassword(event.target.value)}
                autoComplete="current-password"
                className="field"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!newEmail || !emailPassword}
            className="btn mt-3 disabled:opacity-50"
          >
            Spremeni e-pošto
          </button>
          {emailNote && <Note tone={emailNote.includes('poslana') ? 'good' : 'bad'}>{emailNote}</Note>}
        </form>

        <form onSubmit={handlePasswordChange} className="mt-6 border-t border-rp-line pt-5">
          <h3 className="text-body font-semibold text-rp-text">Spremeni geslo</h3>
          <p className="mt-1 text-small text-rp-muted">Uporabi vsaj 6 znakov.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="settings-new-password">Novo geslo</label>
              <input
                id="settings-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="settings-current-password">Trenutno geslo</label>
              <input
                id="settings-current-password"
                type="password"
                value={passwordCurrent}
                onChange={(event) => setPasswordCurrent(event.target.value)}
                autoComplete="current-password"
                className="field"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!newPassword || !passwordCurrent}
            className="btn mt-3 disabled:opacity-50"
          >
            Spremeni geslo
          </button>
          {passwordNote && <Note tone={passwordNote.includes('spremenjeno') ? 'good' : 'bad'}>{passwordNote}</Note>}
        </form>
      </SettingsSection>

      <SettingsSection
        id="koda"
        title="Prijateljska koda"
        description="Koda tebe poišče med sošolci. Deli jo s tistimi, ki jih želiš dodati."
      >
        <div className="flex flex-wrap items-center gap-3">
          {friendCode ? (
            <span className="mono rounded-md border border-rp-line bg-rp-sunken px-4 py-2 text-xl tracking-[0.2em] text-rp-text">
              {friendCode}
            </span>
          ) : (
            <span className="skel h-11 w-40" aria-hidden="true" />
          )}
          <button type="button" onClick={handleCopyCode} disabled={!friendCode} className="btn">
            {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
            {copied ? 'Kopirano' : 'Kopiraj kodo'}
          </button>
          <button type="button" onClick={handleRegenerateCode} disabled={!friendCode} className="btn btn-link">
            Ustvari novo kodo
          </button>
        </div>
        <p className="mt-3 text-small leading-5 text-rp-muted">
          Nova koda takoj unovi staro. Če kodo deliš javno, jo zamenjaj.
        </p>
        {codeNote && <Note tone={codeNote.includes('ne deluje') ? 'good' : 'muted'}>{codeNote}</Note>}
      </SettingsSection>

      <SettingsSection
        id="videz"
        title="Videz"
        description="Dva videza in dve možnosti za lažje branje."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-rp-accent"
              aria-hidden="true"
            >
              {theme === 'noc'
                ? <MoonIcon className="h-6 w-6 text-rp-accent-ink" />
                : <SunIcon className="h-6 w-6 text-rp-accent-ink" />}
            </span>
            <div className="min-w-0">
              <p className="text-subtitle text-rp-text">
                {THEMES.find((item) => item.id === theme)?.name || 'Noč'}
              </p>
              <p className="mt-0.5 text-small text-rp-muted">
                {THEMES.find((item) => item.id === theme)?.description}
              </p>
            </div>
          </div>
          <div className="flex gap-1 rounded-md bg-rp-overlay p-1" role="group" aria-label="Izbira videza">
            {THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                aria-pressed={theme === item.id}
                className={`rounded-xs px-4 py-2 text-small font-semibold transition-colors ${
                  theme === item.id ? 'bg-rp-raised text-rp-text' : 'text-rp-muted hover:text-rp-text'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2">
          <Toggle
            title="Močnejši kontrast"
            description="Izrazitejše obrobe in besedilo za boljšo berljivost."
            checked={highContrast}
            onChange={setHighContrast}
          />
          <Toggle
            title="Zmanjšaj animacije"
            description="Izklopi premike in prehode v aplikaciji."
            checked={reduceMotion}
            onChange={setReduceMotion}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        id="ucne-nastavitve"
        title="Učne nastavitve"
        description="Kako Scribe razporeja tvoj dan in opozarja na roke."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="pref-focus">Dolžina seje fokusa</label>
            <select
              id="pref-focus"
              value={preferences.focusMinutes}
              onChange={(event) => setPreferences((previous) => ({
                ...previous,
                focusMinutes: Number(event.target.value),
              }))}
              className="field"
            >
              {FOCUS_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>{minutes} minut</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="pref-start">Kdaj se dan začne</label>
            <input
              id="pref-start"
              type="time"
              value={preferences.startTime}
              onChange={(event) => setPreferences((previous) => ({
                ...previous,
                startTime: event.target.value,
              }))}
              className="field mono"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="pref-warning">Opozori na rok</label>
            <select
              id="pref-warning"
              value={preferences.deadlineWarningDays}
              onChange={(event) => setPreferences((previous) => ({
                ...previous,
                deadlineWarningDays: Number(event.target.value),
              }))}
              className="field"
            >
              {WARNING_OPTIONS.map((days) => (
                <option key={days} value={days}>{days} dni prej</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="pref-week">Teden se začne z</label>
            <select
              id="pref-week"
              value={preferences.weekStart}
              onChange={(event) => setPreferences((previous) => ({
                ...previous,
                weekStart: event.target.value,
              }))}
              className="field"
            >
              {WEEK_STARTS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="button" onClick={handlePreferencesSave} className="btn btn-primary mt-5">
          Shrani nastavitve
        </button>
        {preferenceNote && <Note tone="good">{preferenceNote}</Note>}
      </SettingsSection>

      <SettingsSection
        id="podatki"
        title="Tvoji podatki"
        description="Izvozi vse, kar imaš v Scribe, ali pa uvozi nazaj iz rezervne kopije."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-rp-line bg-rp-sunken p-4">
            <p className="tnum text-2xl font-bold text-rp-text">{subjects.length}</p>
            <p className="mt-1 text-small text-rp-muted">predmetov</p>
          </div>
          <div className="rounded-md border border-rp-line bg-rp-sunken p-4">
            <p className="tnum text-2xl font-bold text-rp-text">{tasks.length}</p>
            <p className="mt-1 text-small text-rp-muted">nalog</p>
          </div>
          <div className="rounded-md border border-rp-line bg-rp-sunken p-4">
            <p className="tnum text-2xl font-bold text-rp-warn">{pending}</p>
            <p className="mt-1 text-small text-rp-muted">odprtih</p>
          </div>
          <div className="rounded-md border border-rp-line bg-rp-sunken p-4">
            <p className="tnum text-2xl font-bold text-rp-success">{completionRate}%</p>
            <p className="mt-1 text-small text-rp-muted">opravljeno</p>
          </div>
        </div>

        <p className="mt-3 text-small text-rp-muted">
          Skupaj imaš {countedNoun(focusMinutes, 'minuto fokusa', 'minuti fokusa', 'minute fokusa', 'minut fokusa')}.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-rp-line pt-5">
          <button type="button" onClick={handleExport} className="btn">
            Izvozi podatke
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="btn disabled:opacity-50"
          >
            {importing ? 'Uvozim…' : 'Uvozi podatke'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="sr-only"
            aria-label="Izberi JSON datoteko za uvoz"
          />
        </div>
        {dataNote && <Note tone={dataNote.includes('ni bilo mogoče') ? 'bad' : 'good'}>{dataNote}</Note>}
      </SettingsSection>

      <SettingsSection
        id="nevarno-obmocje"
        title="Nevarno območje"
        description="Brisanje računa odstrani vse podatke, ki jih imaš v Scribe."
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-md text-small leading-5 text-rp-muted">
            Predmeti, naloge, preverjanja, kartice, zapisani fokusi in klepeti se izbrišejo.
            Tega ni mogoče razveljaviti.
          </p>
          <button
            type="button"
            onClick={() => { setDeleteNote(null); setDeleteOpen(true); }}
            className="rounded-md border border-rp-danger/40 px-4 py-2.5 text-small font-semibold text-rp-danger transition-colors hover:bg-rp-danger/10"
          >
            Izbriši račun
          </button>
        </div>
        {deleteNote && <Note tone="bad">{deleteNote}</Note>}
      </SettingsSection>

      <p className="px-1 text-small leading-5 text-rp-muted">
        Videz in dostopnost se shranita v tem brskalniku. Profil, predmeti, naloge in
        nastavitve se shranijo v tvoj račun.
      </p>

      <DeleteAccountModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        displayName={currentUser?.displayName || ''}
      />
    </div>
  );
}
