import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  useAllUsers, useFriends, useFriendRequests, useSentRequests,
  sendFriendRequest, respondToRequest,
} from '../hooks/useChat';

// ─── Tiny avatar ──────────────────────────────────────────────────────────────
function MiniAvatar({ name, gradient = 'linear-gradient(135deg,#c4a7e7,#9ccfd8)', size = 36 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
      style={{ width: size, height: size, background: gradient, fontSize: size * 0.35, color: '#191724' }}
    >
      {(name?.[0] || '?').toUpperCase()}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, badge, children }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold" style={{ color: '#e0def4' }}>{title}</h2>
        {badge != null && (
          <span
            className="px-1.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(196,167,231,0.2)', color: '#c4a7e7' }}
          >
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
  const { users } = useAllUsers();
  const { friends } = useFriends();
  const { requests } = useFriendRequests();
  const { sent } = useSentRequests();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  const friendUids = new Set(friends.map((f) => f.uid));
  const sentUids = new Set(sent.map((s) => s.toUid));
  const requestFromUids = new Set(requests.map((r) => r.fromUid));

  const filteredUsers = search.trim().length >= 2
    ? users.filter((u) =>
        !friendUids.has(u.uid) &&
        !sentUids.has(u.uid) &&
        !requestFromUids.has(u.uid) &&
        (
          u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
        )
      )
    : [];

  async function handleSendRequest(u) {
    await sendFriendRequest(currentUser, u.uid, u.displayName || u.email);
    setSearch('');
  }

  async function handleRespond(reqId, status) {
    await respondToRequest(reqId, status);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up pb-8">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(196,167,231,0.15)', border: '1px solid rgba(196,167,231,0.25)' }}
        >
          <svg className="w-5 h-5" style={{ color: '#c4a7e7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e0def4' }}>Prijatelji</h1>
          <p className="text-xs" style={{ color: '#524f67' }}>{friends.length} prijateljev</p>
        </div>
      </div>

      {/* ─── Incoming requests ─── */}
      {requests.length > 0 && (
        <Section title="Zahteve za prijateljstvo" badge={requests.length}>
          {requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between gap-3 py-1.5">
              <div className="flex items-center gap-3">
                <MiniAvatar name={req.fromName} gradient="linear-gradient(135deg,#9ccfd8,#31748f)" />
                <span className="text-sm" style={{ color: '#e0def4' }}>{req.fromName}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(req.id, 'accepted')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#9ccfd8,#31748f)' }}
                >
                  Sprejmi
                </button>
                <button
                  onClick={() => handleRespond(req.id, 'rejected')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ color: '#eb6f92', border: '1px solid rgba(235,111,146,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(235,111,146,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
          <div className="flex flex-col items-center gap-3 py-6" style={{ color: '#6e6a86' }}>
            <div className="text-4xl">👥</div>
            <p className="text-sm">Nimaš še prijateljev. Poišči jih spodaj!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.uid} className="flex items-center justify-between gap-3 py-1.5">
                <div className="flex items-center gap-3">
                  <MiniAvatar name={f.displayName} />
                  <span className="text-sm" style={{ color: '#e0def4' }}>{f.displayName}</span>
                </div>
                <button
                  onClick={() => navigate(`/chat?dm=${f.uid}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ color: '#c4a7e7', border: '1px solid rgba(196,167,231,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,167,231,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
          placeholder="Išči po imenu ali emailu… (vsaj 2 znaka)"
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(38,35,58,0.85)',
            border: '1px solid rgba(64,61,82,0.5)',
            color: '#e0def4',
          }}
        />

        {search.trim().length >= 2 && filteredUsers.length === 0 && (
          <p className="text-sm" style={{ color: '#6e6a86' }}>Ni rezultatov.</p>
        )}

        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <div key={u.uid} className="flex items-center justify-between gap-3 py-1.5">
              <div className="flex items-center gap-3">
                <MiniAvatar name={u.displayName || u.email} gradient="linear-gradient(135deg,#ebbcba,#eb6f92)" />
                <div>
                  <p className="text-sm" style={{ color: '#e0def4' }}>{u.displayName || 'Neznan'}</p>
                  <p className="text-xs" style={{ color: '#6e6a86' }}>{u.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(u)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#c4a7e7,#9ccfd8)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Dodaj
              </button>
            </div>
          ))}
        </div>

        {/* Pending sent */}
        {sent.length > 0 && (
          <div className="pt-2 space-y-2 border-t" style={{ borderColor: 'rgba(64,61,82,0.5)' }}>
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#6e6a86' }}>Čaka na odziv</p>
            {sent.map((req) => (
              <div key={req.id} className="flex items-center gap-3 py-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: '#f6c177' }} />
                <span className="text-sm" style={{ color: '#908caa' }}>{req.toName}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
