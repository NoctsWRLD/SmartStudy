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

// ─── Tiny avatar ──────────────────────────────────────────────────────────────
function MiniAvatar({
  name,
  bgClass = 'bg-rp-accent',
  size = 36,
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-bold flex-shrink-0 ${bgClass}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {(name?.[0] || '?').toUpperCase()}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, badge, children }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-rp-text">{title}</h2>
        {badge != null && (
          <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-rp-accent/20 text-rp-accent">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Main FriendsPage ─────────────────────────────────────────────────────────
export default function FriendsPage() {
  const { currentUser } = useAuth();
  const { friends } = useFriends();
  const { requests } = useFriendRequests();
  const { sent } = useSentRequests();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const { users } = useAllUsers(search);

  const friendUids = new Set(friends.map((f) => f.uid));
  const sentUids = new Set(sent.map((s) => s.toUid));
  const requestFromUids = new Set(requests.map((r) => r.fromUid));

  const filteredUsers =
    search.trim().length >= 2
      ? users.filter(
          (u) => {
            const isFriend = friendUids.has(u.uid);
            const isSent = sentUids.has(u.uid);
            const isReq = requestFromUids.has(u.uid);
            const matchName = u.displayName?.toLowerCase().includes(search.toLowerCase());

            return !isFriend && !isSent && !isReq && matchName;
          }
        )
      : [];

  async function handleSendRequest(u) {
    await sendFriendRequest(currentUser, u.uid, u.displayName || 'Učenec');
    setSearch('');
  }

  async function handleRespond(reqId, status) {
    await respondToRequest(reqId, status);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up pb-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-rp-accent/10 border border-rp-accent/20">
          <svg
            className="w-5 h-5 text-rp-accent"
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
        <div>
          <h1 className="text-2xl font-bold text-rp-text">Prijatelji</h1>
          <p className="text-xs text-rp-muted">{friends.length} prijateljev</p>
        </div>
      </div>

      {/* ─── Incoming requests ─── */}
      {requests.length > 0 && (
        <Section title="Zahteve za prijateljstvo" badge={requests.length}>
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-3 py-1.5"
            >
              <div className="flex items-center gap-3">
                <MiniAvatar
                  name={req.fromName}
                  bgClass="bg-rp-subject-2 text-white"
                />
                <span className="text-sm font-medium text-rp-text">{req.fromName}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(req.id, 'accepted')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 bg-rp-success text-white"
                >
                  Sprejmi
                </button>
                <button
                  onClick={() => handleRespond(req.id, 'rejected')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-rp-danger/30 text-rp-danger hover:bg-rp-danger/10"
                >
                  Zavrni
                </button>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ─── Friends list ─── */}
      <Section title="Moji prijatelji" badge={friends.length}>
        {friends.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-rp-muted">
            <div className="text-4xl">👥</div>
            <p className="text-sm">Nimaš še prijateljev. Poišči jih spodaj!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((f) => (
              <div
                key={f.uid}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl hover:bg-rp-overlay/70 transition-colors border border-transparent hover:border-rp-line"
              >
                <div className="flex items-center gap-4">
                  <MiniAvatar name={f.displayName} />
                  <span className="text-sm font-medium text-rp-text">{f.displayName}</span>
                </div>
                <button
                  onClick={() => navigate(`/chat?dm=${f.uid}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-rp-accent/30 text-rp-accent hover:bg-rp-accent/15"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Pogovor
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ─── Search & Add ─── */}
      <Section title="Dodaj prijatelja">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Išči po imenu … (vsaj 2 znaka)"
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-rp-overlay/85 border border-rp-line/50 text-rp-text transition-colors focus:border-rp-accent/50"
        />

        {search.trim().length >= 2 && filteredUsers.length === 0 && (
          <p className="text-sm text-rp-muted">
            Ni rezultatov.
          </p>
        )}

        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div
              key={u.uid}
              className="flex items-center justify-between gap-3 py-1.5"
            >
              <div className="flex items-center gap-3">
                <MiniAvatar
                  name={u.displayName}
                  bgClass="bg-rp-warn text-white"
                />
                <div>
                  <p className="text-sm font-medium text-rp-text">
                    {u.displayName || 'Učenec'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(u)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 bg-rp-accent text-white"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Dodaj
              </button>
            </div>
          ))}
        </div>

        {/* Pending sent */}
        {sent.length > 0 && (
          <div className="space-y-2 border-t border-rp-line pt-3">
            <p className="text-xs font-semibold text-rp-muted">
              Čaka na odziv
            </p>
            {sent.map((req) => (
              <div key={req.id} className="flex items-center gap-3 py-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse bg-rp-warn" />
                <span className="text-sm text-rp-subtle">{req.toName}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
