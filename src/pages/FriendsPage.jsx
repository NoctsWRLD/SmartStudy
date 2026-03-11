import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  useAllUsers, useFriends, useFriendRequests, useSentRequests,
  sendFriendRequest, respondToRequest,
} from '../hooks/useChat';

// ─── Tiny avatar ──────────────────────────────────────────────────────────────
function MiniAvatar({ name, gradient = 'linear-gradient(135deg, var(--color-iris), var(--color-love))', size = 36 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: gradient, color: '#191724', fontSize: size * 0.35 }}
    >
      {(name?.[0] || '?').toUpperCase()}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, badge, children }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{title}</h2>
        {badge != null && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(196, 167, 231, 0.15)', color: 'var(--color-iris)' }}
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
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, rgba(196, 167, 231, 0.15), rgba(235, 188, 186, 0.1))', border: '1px solid rgba(196, 167, 231, 0.3)' }}
        >
          <svg className="w-6 h-6" style={{ color: 'var(--color-iris)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Prijatelji</h1>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-subtle)' }}>{friends.length} prijateljev</p>
        </div>
      </div>

      {/* ─── Incoming requests ─── */}
      {requests.length > 0 && (
        <Section title="Zahteve za prijateljstvo" badge={requests.length}>
          {requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between gap-3 py-1.5">
              <div className="flex items-center gap-3">
                <MiniAvatar name={req.fromName} gradient="linear-gradient(135deg, var(--color-foam), var(--color-pine))" />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{req.fromName}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(req.id, 'accepted')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  style={{ background: 'linear-gradient(135deg, var(--color-pine), var(--color-foam))', color: '#191724' }}
                >
                  Sprejmi
                </button>
                <button
                  onClick={() => handleRespond(req.id, 'rejected')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/5 shadow-sm"
                  style={{ border: '1px solid rgba(235, 111, 146, 0.3)', color: 'var(--color-love)' }}
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
          <div className="flex flex-col items-center gap-4 py-8" style={{ color: 'var(--color-subtle)' }}>
            <div className="text-5xl opacity-80">👥</div>
            <p className="text-sm font-medium">Nimaš še prijateljev. Poišči jih spodaj!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((f) => (
              <div key={f.uid} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-[color:rgba(144,140,170,0.1)]">
                <div className="flex items-center gap-4">
                  <MiniAvatar name={f.displayName} />
                  <span className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{f.displayName}</span>
                </div>
                <button
                  onClick={() => navigate(`/chat?dm=${f.uid}`)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:opacity-80"
                  style={{ background: 'rgba(196, 167, 231, 0.1)', border: '1px solid rgba(196, 167, 231, 0.3)', color: 'var(--color-iris)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
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
          className="w-full px-5 py-3 rounded-2xl text-sm font-medium outline-none shadow-inner"
          style={{ background: 'var(--color-overlay)', color: 'var(--color-text)', border: '1px solid rgba(144, 140, 170, 0.3)' }}
        />

        {search.trim().length >= 2 && filteredUsers.length === 0 && (
          <p className="text-sm text-slate-500">Ni rezultatov.</p>
        )}

        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div key={u.uid} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-[color:rgba(144,140,170,0.1)]">
              <div className="flex items-center gap-4">
                <MiniAvatar name={u.displayName || u.email} gradient="linear-gradient(135deg, var(--color-love), var(--color-gold))" />
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{u.displayName || 'Neznan'}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-muted)' }}>{u.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(u)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--color-iris), var(--color-rose))', color: '#191724' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Dodaj
              </button>
            </div>
          ))}
        </div>

        {/* Pending sent */}
        {sent.length > 0 && (
          <div className="pt-4 space-y-3 border-t mt-4" style={{ borderColor: 'rgba(144, 140, 170, 0.1)' }}>
            <p className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-muted)' }}>Čaka na odziv</p>
            {sent.map((req) => (
              <div key={req.id} className="flex items-center gap-3 py-1 px-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: 'var(--color-gold)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-subtle)' }}>{req.toName}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
