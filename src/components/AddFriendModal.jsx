import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { useAllUsers, sendFriendRequest } from '../hooks/useChat';
import { lookupUserByCode } from '../services/friendService';
import { isValidCode, normalizeCode } from '../utils/friendCode';
import { PlusIcon, SearchIcon } from './icons';

/**
 * Adding a friend.
 *
 * Two ways in, because a classroom full of students often shares one name:
 * the code a classmate sends you, and the name you know them by. The code is
 * the exact answer; the name search shows a hint of each person's code so the
 * right one can be picked.
 */
export default function AddFriendModal({ isOpen, onClose, onSent, initialUser = null, excludeUids = [] }) {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState('code');
  const [code, setCode] = useState('');
  const [lookup, setLookup] = useState({ state: 'idle' });
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  const { users } = useAllUsers(name);

  const visibleUsers = useMemo(
    () => users.filter((user) => !excludeUids.includes(user.uid)),
    [users, excludeUids],
  );

  useEffect(() => {
    if (!isOpen) return;
    setTab(initialUser ? 'name' : 'code');
    setCode('');
    setLookup({ state: 'idle' });
    setName('');
    setSelected(initialUser || null);
    setMessage(null);
  }, [isOpen, initialUser]);

  const normalizedCode = useMemo(() => normalizeCode(code), [code]);

  async function handleLookup() {
    setMessage(null);
    if (!isValidCode(normalizedCode)) {
      setLookup({ state: 'idle' });
      setMessage('Koda mora imeti 6 znakov.');
      return;
    }
    setLookup({ state: 'loading' });
    try {
      const result = await lookupUserByCode(normalizedCode);
      if (result.status === 'found') {
        if (result.user.uid === currentUser?.uid) {
          setLookup({ state: 'idle' });
          setMessage('Ta koda je tvoja. Išči prijateljevo kodo.');
          return;
        }
        setLookup({ state: 'found', user: result.user });
        return;
      }
      setLookup({ state: 'idle' });
      setMessage(
        result.status === 'invalid'
          ? 'Koda mora imeti 6 znakov.'
          : result.status === 'gone'
            ? 'Ta oseba računa ni več.'
            : 'Nobene osebe s to kodo ni. Preveri, ali je koda pravilna.',
      );
    } catch (error) {
      console.error('Iskanje po kodi ni uspelo:', error);
      setLookup({ state: 'idle' });
      setMessage('Kode ni bilo mogoče preveriti. Poskusi znova.');
    }
  }

  async function handleSend(user) {
    if (!user) return;
    setSending(true);
    setMessage(null);
    try {
      const result = await sendFriendRequest(currentUser, user.uid, user.displayName || 'Učenec');
      if (result.ok) {
        setMessage(`Zahteva je poslana: ${user.displayName || 'Učenec'}.`);
        onSent?.();
        window.setTimeout(onClose, 900);
        return;
      }
      setMessage(
        result.reason === 'self'
          ? 'To si ti.'
          : result.reason === 'exists'
            ? 'Zahteva je že poslana ali pa sta že prijatelja.'
            : 'Zahteve ni bilo mogoče poslati. Poskusi znova.',
      );
    } catch (error) {
      console.error('Pošiljanje zahteve ni uspelo:', error);
      setMessage('Zahteve ni bilo mogoče poslati. Poskusi znova.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dodaj prijatelja"
      description="Poišči sošolca po kodi, ki jo dobiš od njega, ali pa po imenu."
      size="lg"
    >
      <div className="flex gap-1 rounded-md bg-rp-overlay p-1" role="tablist" aria-label="Način iskanja">
        {[
          { key: 'code', label: 'Po kodah' },
          { key: 'name', label: 'Po imenu' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => { setTab(item.key); setMessage(null); }}
            className={`flex-1 rounded-xs px-3 py-2 text-small font-semibold transition-colors ${
              tab === item.key ? 'bg-rp-raised text-rp-text' : 'text-rp-muted hover:text-rp-text'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'code' ? (
        <div className="mt-4">
          <label className="field-label" htmlFor="friend-code">Prijateljeva koda</label>
          <div className="flex gap-2">
            <input
              id="friend-code"
              value={code}
              onChange={(event) => setCode(normalizeCode(event.target.value).slice(0, 6))}
              placeholder="K7M2QX"
              autoComplete="off"
              spellCheck="false"
              inputMode="text"
              className="field mono !text-lg !tracking-[0.2em] uppercase"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={lookup.state === 'loading' || normalizedCode.length < 6}
              className="btn-ghost shrink-0 !px-4"
            >
              {lookup.state === 'loading' ? 'Iščem…' : 'Poišči'}
            </button>
          </div>
          <p className="mt-2 text-small text-rp-muted">
            Koda ima 6 znakov. Dobiš jo sošolca v klepetu ali pa v njegovih nastavitvah.
          </p>

          {lookup.state === 'found' && lookup.user && (
            <div className="ledger mt-4 flex items-center gap-3 px-3 py-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rp-accent/12 font-bold text-rp-accent"
                aria-hidden="true"
              >
                {(lookup.user.displayName?.[0] || '?').toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-semibold text-rp-text">
                  {lookup.user.displayName || 'Učenec'}
                </span>
                <span className="mono block text-small text-rp-muted">{normalizedCode}</span>
              </span>
              <button
                type="button"
                onClick={() => handleSend(lookup.user)}
                disabled={sending}
                className="btn-primary shrink-0 !px-3.5 !py-2 !text-small"
              >
                {sending ? 'Pošiljam…' : 'Pošlji zahtevo'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <label className="relative block">
            <span className="sr-only">Išči po imenu</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-muted" />
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Išči po imenu… (vsaj 2 znaka)"
              className="field !pl-9"
            />
          </label>

          <div className="ledger mt-3">
            {visibleUsers.length === 0 && name.trim().length >= 2 && (
              <p className="px-3 py-3 text-small text-rp-muted">Ni zadetkov.</p>
            )}
            {visibleUsers.map((user) => {
              const isSelected = selected?.uid === user.uid;
              return (
                <div
                  key={user.uid}
                  className="ledger-row flex items-center gap-3 px-3 py-2.5"
                  data-selected={isSelected}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(user)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rp-accent/12 text-small font-bold text-rp-accent"
                      aria-hidden="true"
                    >
                      {(user.displayName?.[0] || '?').toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body font-medium text-rp-text">
                      {user.displayName || 'Učenec'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(user)}
                    disabled={sending}
                    aria-label={`Izberi ${user.displayName || 'učenca'}`}
                    aria-pressed={isSelected}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-colors disabled:opacity-50 ${
                      isSelected
                        ? 'border-rp-accent bg-rp-accent text-rp-accent-ink'
                        : 'border-rp-line text-rp-subtle hover:border-rp-accent hover:text-rp-accent'
                    }`}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="ledger mt-4 flex items-center gap-3 px-3 py-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rp-accent/12 font-bold text-rp-accent"
                aria-hidden="true"
              >
                {(selected.displayName?.[0] || '?').toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-semibold text-rp-text">
                  {selected.displayName || 'Učenec'}
                </span>
                <span className="block text-small text-rp-muted">
                  Pošlji zahtevo za prijateljstvo.
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleSend(selected)}
                disabled={sending}
                className="btn-primary shrink-0 !px-3.5 !py-2 !text-small"
              >
                {sending ? 'Pošiljam…' : 'Pošlji zahtevo'}
              </button>
            </div>
          )}
        </div>
      )}

      {message && (
        <p className="mt-4 text-small text-rp-subtle" role="status" aria-live="polite">
          {message}
        </p>
      )}
    </Modal>
  );
}
