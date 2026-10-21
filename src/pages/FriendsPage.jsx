import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  useAllUsers,
  useFriends,
  useFriendRequests,
  useSentRequests,
  sendFriendRequest,
  respondToRequest,
} from '../hooks/useChat';
import { ChatIcon, PlusIcon, SearchIcon, UsersIcon } from '../components/icons';
import { countedNoun } from '../utils/slovenian';

function MiniAvatar({ name, tone = 'accent', size = 36 }) {
  const tones = {
    accent: 'bg-rp-accent text-rp-accent-ink',
    warn: 'bg-rp-warn text-rp-canvas',
    rose: 'bg-rp-subject-2 text-rp-canvas',
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

function Section({ title, badge, children }) {
  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-title text-rp-text">{title}</h2>
        {badge != null && <span className="chip chip-accent">{badge}</span>}
      </div>
      {children}
    </section>
  );
}

export default function FriendsPage() {
  const { currentUser } = useAuth();
  const { friends } = useFriends();
  const { requests } = useFriendRequests();
  const { sent } = useSentRequests();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const { users } = useAllUsers(search);

  const friendUids = new Set(friends.map((friend) => friend.uid));
  const sentUids = new Set(sent.map((request) => request.toUid));
  const requestFromUids = new Set(requests.map((request) => request.fromUid));

  const filteredUsers =
    search.trim().length >= 2
      ? users.filter((user) => {
          const matchName = user.displayName?.toLowerCase().includes(search.toLowerCase());
          return !friendUids.has(user.uid) && !sentUids.has(user.uid) && !requestFromUids.has(user.uid) && matchName;
        })
      : [];

  async function handleSendRequest(user) {
    await sendFriendRequest(currentUser, user.uid, user.displayName || 'Učenec');
    setSearch('');
  }

  async function handleRespond(requestId, status) {
    await respondToRequest(requestId, status);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
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
          </p>
        </div>
      </section>

      {requests.length > 0 && (
        <Section title="Zahteve za prijateljstvo" badge={requests.length}>
          <div className="grid gap-1.5">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between gap-3 py-1.5">
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
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span
              className="grid h-12 w-12 place-items-center rounded-lg border border-rp-line bg-rp-overlay text-rp-muted"
              aria-hidden="true"
            >
              <UsersIcon className="h-6 w-6" />
            </span>
            <p className="text-body text-rp-muted">Nimaš še prijateljev. Poišči jih spodaj.</p>
          </div>
        ) : (
          <div className="grid gap-1">
            {friends.map((friend) => (
              <div
                key={friend.uid}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors hover:bg-rp-overlay"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MiniAvatar name={friend.displayName} />
                  <span className="truncate text-body font-medium text-rp-text">{friend.displayName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/chat?dm=${friend.uid}`)}
                  className="flex shrink-0 items-center gap-1.5 rounded-md border border-rp-accent/30 px-3 py-1.5 text-small font-semibold text-rp-accent transition-colors hover:bg-rp-accent/10"
                >
                  <ChatIcon className="h-4 w-4" />
                  Pogovor
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Dodaj prijatelja">
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

        {search.trim().length >= 2 && filteredUsers.length === 0 && (
          <p className="mt-3 text-small text-rp-muted">Ni rezultatov.</p>
        )}

        <div className="mt-3 grid gap-1.5">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="flex items-center justify-between gap-3 py-1.5">
              <div className="flex min-w-0 items-center gap-3">
                <MiniAvatar name={user.displayName} tone="warn" />
                <p className="truncate text-body font-medium text-rp-text">{user.displayName || 'Učenec'}</p>
              </div>
              <button
                type="button"
                onClick={() => handleSendRequest(user)}
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-rp-accent px-3 py-1.5 text-small font-semibold text-rp-accent-ink transition-opacity hover:opacity-90"
              >
                <PlusIcon className="h-4 w-4" />
                Dodaj
              </button>
            </div>
          ))}
        </div>

        {sent.length > 0 && (
          <div className="mt-4 grid gap-2 border-t border-rp-line pt-4">
            <p className="text-label text-rp-muted">Čaka na odziv</p>
            {sent.map((request) => (
              <div key={request.id} className="flex items-center gap-3 py-1">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-rp-warn" aria-hidden="true" />
                <span className="text-body text-rp-subtle">{request.toName}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
