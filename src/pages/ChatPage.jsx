import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  useMessages, useFriends, sendMessage, deleteMessage,
  getDmChatId,
} from '../hooks/useChat';
import { useSubjects } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, initial, size = 8 }) {
  const px = size * 4; // e.g. size=8 → 32px
  if (src) return <img src={src} alt={initial} className="rounded-full object-cover flex-shrink-0"
    style={{ width: px, height: px }} />;
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: px, height: px, background: 'linear-gradient(135deg, var(--color-iris), var(--color-rose))', fontSize: px <= 32 ? '0.75rem' : '1rem' }}>
      {initial}
    </div>
  );
}

// ─── File bubble ──────────────────────────────────────────────────────────────
function FileBubble({ fileURL, fileName, fileType, fileSize, isOwn }) {
  const isImage = fileType?.startsWith('image/');
  const kb = fileSize ? Math.round(fileSize / 1024) : null;

  if (isImage) return (
    <a href={fileURL} target="_blank" rel="noreferrer">
      <img src={fileURL} alt={fileName} className="max-w-[220px] rounded-xl mt-1" />
    </a>
  );

  return (
    <a href={fileURL} target="_blank" rel="noreferrer"
      className="flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all hover:opacity-80 shadow-md"
      style={isOwn
        ? { background: 'linear-gradient(135deg, var(--color-iris), var(--color-love))', color: '#fff' }
        : { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid rgba(144, 140, 170, 0.2)' }}>
      <svg className="w-5 h-5 flex-shrink-0 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      <div>
        <p className="text-xs font-medium leading-tight truncate max-w-[140px]">{fileName}</p>
        {kb && <p className="text-xs opacity-60">{kb} KB</p>}
      </div>
    </a>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, isOwn, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const time = msg.timestamp?.toDate
    ? msg.timestamp.toDate().toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Avatar initial={msg.senderInitial || '?'} size={8} />
      <div className={`max-w-[85%] md:max-w-[70%] min-w-0 flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-[11px] md:text-xs font-semibold" style={{ color: 'var(--color-subtle)' }}>{isOwn ? 'Ti' : msg.senderName}</span>
          <span className="text-[11px] md:text-xs flex-shrink-0" style={{ color: 'var(--color-muted)' }}>{time}</span>
        </div>

        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''} max-w-full`}>
          <div className="min-w-0 max-w-full">
            {msg.text && (
              <div className="px-3 py-2 md:px-4 md:py-2.5 rounded-2xl text-[13px] md:text-sm leading-relaxed break-words shadow-sm"
                style={isOwn
                  ? { background: 'linear-gradient(135deg, var(--color-iris), var(--color-rose))', color: '#191724' }
                  : { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid rgba(144, 140, 170, 0.2)' }}>
                {msg.text}
              </div>
            )}
            {msg.fileURL && (
              <FileBubble fileURL={msg.fileURL} fileName={msg.fileName}
                fileType={msg.fileType} fileSize={msg.fileSize} isOwn={isOwn} />
            )}
          </div>
          {isOwn && hovered && (
            <button onClick={() => onDelete(msg.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
              title="Izbriši">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Message list ─────────────────────────────────────────────────────────────
function MessageList({ chatId, currentUser }) {
  const { messages, loading } = useMessages(chatId);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-iris)', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!messages.length) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: 'var(--color-subtle)' }}>
      <div className="text-5xl opacity-80">💬</div>
      <p className="text-sm font-medium">Začni pogovor!</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-4 overflow-x-hidden">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg}
          isOwn={msg.senderId === currentUser.uid}
          onDelete={(id) => deleteMessage(chatId, id)} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

// ─── Message input ────────────────────────────────────────────────────────────
function MessageInput({ chatId, currentUser }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(chatId, currentUser, text);
      setText('');
    } catch (e) {
      console.error('Send error:', e);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="px-2 md:px-4 pb-4 pt-2 flex-shrink-0">
      <div className="flex items-end gap-2 rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-lg"
        style={{ background: 'var(--color-overlay)', border: '1px solid rgba(144, 140, 170, 0.3)' }}>
        <textarea ref={inputRef} value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey} placeholder="Napiši sporočilo…"
          rows={1} disabled={sending}
          className="flex-1 bg-transparent text-base md:text-sm resize-none outline-none leading-relaxed"
          style={{ color: 'var(--color-text)', maxHeight: '120px' }} />
        <button onClick={handleSend} disabled={!text.trim() || sending}
          className="p-2.5 rounded-xl transition-all flex-shrink-0 disabled:opacity-30 shadow-md"
          style={{ background: 'linear-gradient(135deg, var(--color-iris), var(--color-rose))', color: '#191724' }} title="Pošlji">
          {sending
            ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>}
        </button>
      </div>
    </div>
  );
}

// ─── Room list item ───────────────────────────────────────────────────────────
function RoomItem({ label, icon, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
        active ? '' : 'hover:bg-white/5 opacity-80 hover:opacity-100'
      }`}
      style={active ? { 
        background: 'rgba(196, 167, 231, 0.15)', 
        color: 'var(--color-text)',
        border: '1px solid rgba(196, 167, 231, 0.3)' 
      } : { color: 'var(--color-subtle)' }}>
      <span className="flex-shrink-0 opacity-80" style={{ color: active ? 'var(--color-iris)' : 'inherit' }}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

// ─── Sidebar (room list) ──────────────────────────────────────────────────────
function SidePanel({ activeChatId, subjects, friends, currentUser, userProfile, onSelect }) {
  const navigate = useNavigate();
  const school = userProfile?.school?.trim();
  const schoolChatId = school ? `school_${school.toLowerCase().replace(/\s+/g, '_')}` : null;

  return (
    <div className="flex flex-col h-full overflow-y-auto py-3 space-y-4">
      {/* Channels */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">Kanali</p>
        <RoomItem label="Splošni" active={activeChatId === 'general'} onClick={() => onSelect('general', 'Splošni')}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>} />
        {subjects.map((subj) => (
          <RoomItem key={subj.id} label={subj.name}
            active={activeChatId === `subject_${subj.id}`}
            onClick={() => onSelect(`subject_${subj.id}`, subj.name)}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>} />
        ))}
      </div>

      {/* School channel */}
      {schoolChatId && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">Moja šola</p>
          <RoomItem
            label={school}
            active={activeChatId === schoolChatId}
            onClick={() => onSelect(schoolChatId, school)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>
      )}

      {/* Direct messages – friends only */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--color-muted)' }}>
          Direktna sporočila
        </p>
        {friends.length === 0
          ? <p className="text-xs px-3" style={{ color: 'var(--color-muted)' }}>Dodaj prijatelje v Prijateljih.</p>
          : friends.map((f) => {
              const dmId = getDmChatId(currentUser.uid, f.uid);
              return (
                <RoomItem key={f.uid} label={f.displayName || 'Neznan'}
                  active={activeChatId === dmId}
                  onClick={() => onSelect(dmId, f.displayName || 'Neznan')}
                  icon={
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, var(--color-foam), var(--color-pine))', color: '#191724' }}>
                      {(f.displayName?.[0] || '?').toUpperCase()}
                    </div>
                  } />
              );
            })}
      </div>

      {/* Add friends button */}
      <div className="px-3 mt-auto pt-4 border-t" style={{ borderColor: 'rgba(144, 140, 170, 0.1)' }}>
        <button
          onClick={() => navigate('/friends')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          style={{ background: 'rgba(196, 167, 231, 0.1)', color: 'var(--color-iris)', border: '1px solid rgba(196, 167, 231, 0.3)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Prijatelji
        </button>
      </div>
    </div>
  );
}

// ─── Chat icons helpers ───────────────────────────────────────────────────────
const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// ─── Main ChatPage ────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { currentUser, userProfile } = useAuth();
  const { subjects } = useSubjects();
  const { friends } = useFriends();
  const [searchParams] = useSearchParams();

  const [activeChatId, setActiveChatId] = useState('general');
  const [activeName, setActiveName] = useState('Splošni');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Support ?dm=uid query param (from Profile page)
  useEffect(() => {
    const dmUid = searchParams.get('dm');
    if (dmUid && currentUser) {
      const friend = friends.find((f) => f.uid === dmUid);
      if (friend) {
        const id = getDmChatId(currentUser.uid, dmUid);
        setActiveChatId(id);
        setActiveName(friend.displayName || 'Neznan');
      }
    }
  }, [searchParams, friends, currentUser]);

  function selectRoom(id, name) {
    setActiveChatId(id);
    setActiveName(name);
    setMobileOpen(false);
  }

  const isChatType = activeChatId === 'general'
    ? 'Skupni kanal'
    : activeChatId.startsWith('subject_')
    ? 'Kanal predmeta'
    : activeChatId.startsWith('school_')
    ? 'Šolski kanal'
    : 'Zasebni pogovor';

  return (
    <div className="h-full flex flex-col">
      {/* Main container */}
      <div className="flex-1 flex overflow-hidden rounded-2xl shadow-xl"
        style={{ minHeight: 0, border: '1px solid rgba(144, 140, 170, 0.2)', background: 'var(--color-surface)' }}>

        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--color-overlay)', borderRight: '1px solid rgba(144, 140, 170, 0.1)' }}>
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Chat Področja</p>
          </div>
          <SidePanel activeChatId={activeChatId} subjects={subjects} friends={friends}
            currentUser={currentUser} userProfile={userProfile} onSelect={selectRoom} />
        </aside>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 z-50 flex flex-col overflow-hidden shadow-2xl"
              style={{ background: 'var(--color-base)', borderRight: '1px solid rgba(144, 140, 170, 0.2)' }}>
              <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Chat Področja</p>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SidePanel activeChatId={activeChatId} subjects={subjects} friends={friends}
                currentUser={currentUser} userProfile={userProfile} onSelect={selectRoom} />
            </aside>
          </div>
        )}

        {/* ── Main chat area ── */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--color-surface)' }}>
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-3.5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(144, 140, 170, 0.1)', background: 'var(--color-overlay)' }}>
            {/* Hamburger – mobile only, inside header (properly aligned) */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/5 transition-all flex-shrink-0"
              style={{ color: 'var(--color-text)' }}
              onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </button>

            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, rgba(196, 167, 231, 0.15), rgba(235, 188, 186, 0.1))', border: '1px solid rgba(196, 167, 231, 0.3)' }}>
              <svg className="w-5 h-5" style={{ color: 'var(--color-iris)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{activeName}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--color-subtle)' }}>{isChatType}</p>
            </div>
          </div>

          <MessageList chatId={activeChatId} currentUser={currentUser} />
          <MessageInput chatId={activeChatId} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
