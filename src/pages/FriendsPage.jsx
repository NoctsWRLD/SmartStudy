import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  useAllUsers,
  useFriends,
  useFriendRequests,
  useSentRequests,
  deleteFriendRequest,
  respondToRequest,
} from '../hooks/useChat';
import AddFriendModal from '../components/AddFriendModal';
import { ChatIcon, PlusIcon, SearchIcon, TrashIcon, UsersIcon } from '../components/icons';
import { countedNoun } from '../utils/slovenian';

function MiniAvatar({ name, tone = 'accent', size = 36 }) {
  const tones = {
    accent: 'bg-rp-accent/12 text-rp-accent',
    warn: 'bg-rp-warn/12 text-rp-warn',
    rose: 'bg-rp-danger/12 text-rp-danger',
  };
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold ${tones[tone] || tones.accent}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-hidden="true"
    >
      {(name?.[0] || '?').toUpperCase()}
    </span>
  );
}

function Section({ title, badge, children, action }) {
  return (
    <section className="sheet">
      <div className="flex items-center gap-2 border-b border-rp-line px-5 py-3.5">
        <h2 className="text-title text-rp-text">{title}</h2>
        {badge != null && <span className="chip">{badge}</span>}
        <span className="flex-1" />
        {action}
      </div>
      {children}
    </section>
  );
}

export default function FriendsPage() {
  const { userProfile } = useAuth();
  const { friends } = useFriends();
  const { requests } = useFriendRequests();
  const { sent } = useSentRequests();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [status, setStatus] = useState(null);

  const { users } = useAllUsers(search);

  const friendUids = useMemo(() => friends.map((friend) => friend.uid), [friends]);
  const sentUids = useMemo(() => sent.map((request) => request.toUid), [sent]);
  const requestFromUids = useMemo(() => requests.map((request) => request.fromUid), [requests]);

  const excluded = useMemo(
    () => [...friendUids, ...sentUids, ...requestFromUids],
    [friendUids, sentUids, requestFromUids],
  );

  const results = useMemo(
    () => users.filter((user) => !excluded.includes(user.uid)),
    [users, excluded],
  );

  function openAdd(user = null) {
    setModalUser(user);
    setModalOpen(true);
  }

  async function handleRespond(requestId, nextStatus) {
    setStatus(null);
    try {
      await respondToRequest(requestId, nextStatus);
      setStatus(nextStatus === 'accepted' ? 'Zahteva je sprejeta.' : 'Zahteva je zavrnjena.');
    } catch (error) {
      console.error('Odgovor na zahtevo ni uspel:', error);
      setStatus('Odgovor ni uspel. Poskusi znova.');
    }
  }

  async function handleWithdraw(requestId) {
    setStatus(null);
    try {
      await deleteFriendRequest(requestId);
      setStatus('Zahteva je preklicana.');
    } catch (error) {
      console.error('Preklic zahteve ni uspel:', error);
      setStatus('Zahteve ni bilo mogoče preklicati. Poskusi znova.');
    }
  }

  async function handleRemove(friend) {
    setStatus(null);
    try {
      await deleteFriendRequest(friend.requestId);
      setStatus(`${friend.displayName} je odstranjen iz prijateljev.`);
    } catch (error) {
      console.error('Odstranjevanje prijatelja ni uspelo:', error);
      setStatus('Prijatelja ni bilo mogoče odstraniti. Poskusi znova.');
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rise flex items-center gap-4">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-rp-accent/25 bg-rp-accent/10 text-rp-accent"
          aria-hidden="true"
        >
          <UsersIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-page text-rp-text">Prijatelji</h1>
          <p className="mt-0.5 text-small text-rp-muted">
            {countedNoun(friends.length, 'prijatelj', 'prijatelja', 'prijatelji', 'prijateljev')}
            {userProfile?.friendCode && (
              <> · tvoja koda <span className="mono text-rp-text">{userProfile.friendCode}</span></>
            )}
          </p>
        </div>
      </section>

      {status && (
        <p className="text-small text-rp-subtle" role="status" aria-live="polite">
          {status}
        </p>
      )}

      {requests.length > 0 && (
        <Section title="Zahteve za prijateljstvo" badge={requests.length}>
          <div>
            {requests.map((request) => (
              <div key={request.id} className="ledger-row flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <MiniAvatar name={request.fromName} tone="rose" />
                  <span className="truncate text-body font-medium text-rp-text">{request.fromName}</span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRespond(request.id, 'accepted')}
                    className="rounded-md bg-rp-success px-3 py-1.5 text-small font-semibold text-rp-canvas transition-opacity hover:opacity-90"
                  >
                    Sprejmi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespond(request.id, 'rejected')}
                    className="rounded-md border border-rp-danger/30 px-3 py-1.5 text-small font-semibold text-rp-danger transition-colors hover:bg-rp-danger/10"
                  >
                    Zavrni
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Moji prijatelji" badge={friends.length}>
        {friends.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span
              className="grid h-12 w-12 place-items-center rounded-lg border border-rp-line bg-rp-overlay text-rp-muted"
              aria-hidden="true"
            >
              <UsersIcon className="h-6 w-6" />
            </span>
            <p className="text-body text-rp-muted">
              Nimaš še prijateljev. Poišči sošolca po kodi ali po imenu.
            </p>
            <button type="button" onClick={() => openAdd()} className="btn-primary !py-2.5 !text-small">
              Dodaj prijatelja
            </button>
          </div>
        ) : (
          <div>
            {friends.map((friend) => (
              <div key={friend.uid} className="ledger-row flex items-center gap-3 px-5 py-3">
                <MiniAvatar name={friend.displayName} />
                <span className="min-w-0 flex-1 truncate text-body font-medium text-rp-text">
                  {friend.displayName}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/chat?dm=${friend.uid}`)}
                  className="flex shrink-0 items-center gap-1.5 rounded-md border border-rp-line px-3 py-1.5 text-small font-semibold text-rp-subtle transition-colors hover:border-rp-accent hover:text-rp-accent"
                >
                  <ChatIcon className="h-4 w-4" />
                  Pogovor
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(friend)}
                  aria-label={`Odstrani ${friend.displayName} iz prijateljev`}
                  title="Odstrani prijatelja"
                  className="shrink-0 rounded-md p-2 text-rp-muted transition-colors hover:bg-rp-danger/10 hover:text-rp-danger"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Najdi sošolca">
        <div className="px-5 py-4">
          <label className="relative block">
            <span className="sr-only">Išči po imenu</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rp-muted" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Išči po imenu… (vsaj 2 znaka)"
              className="field !pl-9"
            />
          </label>

          <p className="mt-2 text-small text-rp-muted">
            Našel več učencev z istim imenom? Vpiši njihovo kodo in Scribe poišče pravega.
          </p>

          <div className="ledger mt-3">
            {search.trim().length >= 2 && results.length === 0 && (
              <p className="px-3 py-3 text-small text-rp-muted">Ni zadetkov.</p>
            )}
            {results.map((user) => (
              <div key={user.uid} className="ledger-row flex items-center gap-3 px-3 py-2.5">
                <MiniAvatar name={user.displayName} tone="warn" size={32} />
                <span className="min-w-0 flex-1 truncate text-body font-medium text-rp-text">
                  {user.displayName || 'Učenec'}
                </span>
                <button
                  type="button"
                  onClick={() => openAdd(user)}
                  aria-label={`Dodaj ${user.displayName || 'učenca'} med prijatelje`}
                  title="Dodaj prijatelja"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-rp-line text-rp-subtle transition-colors hover:border-rp-accent hover:bg-rp-accent hover:text-rp-accent-ink"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openAdd()}
            className="btn-primary mt-4 w-full !py-2.5 !text-small"
          >
            <PlusIcon className="h-4 w-4" />
            Dodaj s kodo
          </button>
        </div>

        {sent.length > 0 && (
          <div className="border-t border-rp-line px-5 py-4">
            <p className="text-label text-rp-muted">Čaka na odziv</p>
            <div className="mt-2">
              {sent.map((request) => (
                <div key={request.id} className="flex items-center gap-3 py-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-rp-warn" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-body text-rp-subtle">{request.toName}</span>
                  <button
                    type="button"
                    onClick={() => handleWithdraw(request.id)}
                    className="shrink-0 rounded-md px-2.5 py-1 text-small font-semibold text-rp-muted transition-colors hover:bg-rp-danger/10 hover:text-rp-danger"
                  >
                    Preklici
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <AddFriendModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setModalUser(null); }}
        initialUser={modalUser}
        excludeUids={excluded}
        onSent={() => setSearch('')}
      />
    </div>
  );
}
