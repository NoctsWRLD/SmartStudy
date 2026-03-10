import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  useAllUsers, useFriends, useFriendRequests, useSentRequests,
  sendFriendRequest, respondToRequest,
} from '../hooks/useChat';
import { getDmChatId } from '../hooks/useChat';
import { useNavigate } from 'react-router-dom';

// ─── Editable field ───────────────────────────────────────────────────────────
function EditField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
        style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)' }}
      />
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { currentUser, updateUserProfile } = useAuth();
  const { users } = useAllUsers();
  const { friends } = useFriends();
  const { requests } = useFriendRequests();
  const { sent } = useSentRequests();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [school, setSchool] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  // Filter users for search (exclude already friends and pending)
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

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfile({ displayName: displayName.trim() || undefined, school: school.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendRequest(u) {
    await sendFriendRequest(currentUser, u.uid, u.displayName || u.email);
    setSearch('');
  }

  async function handleRespond(reqId, status) {
    await respondToRequest(reqId, status);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up pb-8">
      <h1 className="text-2xl font-bold text-white">Moj profil</h1>

      {/* ─── Profile card ─── */}
      <div className="glass-card p-6 space-y-6">
        {/* Static avatar with initials */}
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {(currentUser?.displayName?.[0] || '?').toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <EditField
            label="Vzdevek"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Tvoje ime..."
          />
          <EditField
            label="Šola"
            value={school}
            onChange={setSchool}
            placeholder="Ime šole..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {saving ? 'Shranjujem…' : saved ? '✓ Shranjeno!' : 'Shrani spremembe'}
        </button>
      </div>

      {/* ─── Incoming requests ─── */}
      {requests.length > 0 && (
        <div className="glass-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            Zahteve za prijateljstvo
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(99,102,241,0.3)', color: '#818cf8' }}>
              {requests.length}
            </span>
          </h2>
          {requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between gap-3 py-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                  {(req.fromName?.[0] || '?').toUpperCase()}
                </div>
                <span className="text-sm text-white">{req.fromName}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(req.id, 'accepted')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                  Sprejmi
                </button>
                <button
                  onClick={() => handleRespond(req.id, 'rejected')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-400/10 transition-all"
                  style={{ border: '1px solid rgba(248,113,113,0.3)' }}>
                  Zavrni
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Friends list ─── */}
      <div className="glass-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">
          Prijatelji ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <p className="text-sm text-slate-500">Nimaš še prijateljev. Poišči jih spodaj!</p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.uid} className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {(f.displayName?.[0] || '?').toUpperCase()}
                  </div>
                  <span className="text-sm text-white">{f.displayName}</span>
                </div>
                <button
                  onClick={() => navigate(`/chat?dm=${f.uid}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-400/10 transition-all"
                  style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
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
      </div>

      {/* ─── Add friends (search) ─── */}
      <div className="glass-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">Dodaj prijatelja</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Išči po imenu ali emailu… (vsaj 2 znaka)"
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
          style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)' }}
        />

        {search.trim().length >= 2 && filteredUsers.length === 0 && (
          <p className="text-sm text-slate-500">Ni rezultatov.</p>
        )}

        {filteredUsers.map((u) => (
          <div key={u.uid} className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #f472b6, #a855f7)' }}>
                {(u.displayName?.[0] || u.email?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-white">{u.displayName || 'Neznan'}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleSendRequest(u)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Dodaj
            </button>
          </div>
        ))}

        {/* Pending sent */}
        {sent.length > 0 && (
          <div className="pt-2 space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Čaka na odziv</p>
            {sent.map((req) => (
              <div key={req.id} className="flex items-center gap-3 py-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">{req.toName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
