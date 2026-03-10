import { useState, useEffect, useRef } from 'react';
import { useMessages, useChatUsers, sendMessage, deleteMessage, getDmChatId } from '../hooks/useChat';
import { useSubjects } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ initial, size = 8, gradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)' }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ background: gradient, fontSize: size <= 8 ? '0.75rem' : '1rem' }}
    >
      {initial}
    </div>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, isOwn, onDelete }) {
  const [hovered, setHovered] = useState(false);

  const time = msg.timestamp?.toDate
    ? msg.timestamp.toDate().toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      className={`flex gap-2.5 group ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar initial={msg.senderInitial || '?'} size={8} />

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-slate-400 font-medium">{isOwn ? 'Ti' : msg.senderName}</span>
          <span className="text-xs text-slate-600">{time}</span>
        </div>

        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <div
            className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words"
            style={
              isOwn
                ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }
                : { background: 'rgba(30,41,59,0.9)', color: '#e2e8f0', border: '1px solid rgba(51,65,85,0.5)' }
            }
          >
            {msg.text}
          </div>

          {/* Delete button – only own messages, on hover */}
          {isOwn && hovered && (
            <button
              onClick={() => onDelete(msg.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
              title="Izbriši sporočilo"
            >
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

// ─── Message list + auto-scroll ───────────────────────────────────────────────
function MessageList({ chatId, currentUser }) {
  const { messages, loading } = useMessages(chatId);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleDelete(msgId) {
    await deleteMessage(chatId, msgId);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="text-5xl">💬</div>
        <p className="text-sm">Začni pogovor!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isOwn={msg.senderId === currentUser.uid}
          onDelete={handleDelete}
        />
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="px-4 pb-4 pt-2">
      <div
        className="flex items-end gap-2 rounded-2xl px-4 py-3"
        style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)' }}
      >
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Napiši sporočilo… (Enter za pošiljanje)"
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none leading-relaxed"
          style={{ maxHeight: '120px' }}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="p-2 rounded-xl transition-all flex-shrink-0 disabled:opacity-30"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          title="Pošlji"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Channel / DM item in the left panel ─────────────────────────────────────
function RoomItem({ label, icon, active, onClick, unread = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
        active
          ? 'text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
      }`}
      style={
        active
          ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)' }
          : {}
      }
    >
      <span className="flex-shrink-0 opacity-70">{icon}</span>
      <span className="truncate">{label}</span>
      {unread && (
        <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
      )}
    </button>
  );
}

// ─── Main ChatPage ────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { currentUser } = useAuth();
  const { subjects } = useSubjects();
  const { users } = useChatUsers();

  // activeChatId: 'general' | 'subject_{id}' | 'dm_{uid1}_{uid2}'
  const [activeChatId, setActiveChatId] = useState('general');
  const [activeName, setActiveName] = useState('Splošni');
  const [mobilePanel, setMobilePanel] = useState(false);

  function selectRoom(id, name) {
    setActiveChatId(id);
    setActiveName(name);
    setMobilePanel(false);
  }

  // ─── Sidebar panel ──────────────────────────────────────────────────────
  function SidePanel() {
    return (
      <div className="flex flex-col h-full overflow-y-auto py-3 space-y-4">
        {/* Channels section */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">
            Kanali
          </p>
          <RoomItem
            label="Splošni"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            }
            active={activeChatId === 'general'}
            onClick={() => selectRoom('general', 'Splošni')}
          />

          {subjects.map((subj) => (
            <RoomItem
              key={subj.id}
              label={subj.name}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              }
              active={activeChatId === `subject_${subj.id}`}
              onClick={() => selectRoom(`subject_${subj.id}`, subj.name)}
            />
          ))}
        </div>

        {/* DMs section */}
        {users.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">
              Direktna sporočila
            </p>
            {users.map((user) => {
              const dmId = getDmChatId(currentUser.uid, user.uid);
              return (
                <RoomItem
                  key={user.uid}
                  label={user.displayName || user.email}
                  icon={
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                    >
                      {(user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()}
                    </div>
                  }
                  active={activeChatId === dmId}
                  onClick={() => selectRoom(dmId, user.displayName || user.email)}
                />
              );
            })}
          </div>
        )}

        {users.length === 0 && (
          <div className="px-3">
            <p className="text-xs text-slate-600">Ni drugih registriranih uporabnikov za DM.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page title (visible on mobile) */}
      <div className="flex items-center gap-3 mb-4 md:mb-0 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white md:hidden">Chat</h1>
      </div>

      {/* Main layout */}
      <div
        className="flex-1 flex overflow-hidden rounded-2xl animate-fade-in-up"
        style={{ minHeight: 0, border: '1px solid rgba(51,65,85,0.5)', background: 'rgba(15,23,42,0.6)' }}
      >
        {/* ─── Left panel: channels & DMs (desktop always visible, mobile drawer) ─── */}
        {/* Mobile toggle button */}
        <button
          className="md:hidden absolute top-4 left-4 z-10 p-2 rounded-xl text-slate-400 hover:text-white"
          style={{ background: 'rgba(30,41,59,0.9)' }}
          onClick={() => setMobilePanel((p) => !p)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile drawer overlay */}
        {mobilePanel && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobilePanel(false)}
            />
            <aside
              className="absolute left-0 top-0 bottom-0 w-64 z-50 overflow-hidden"
              style={{ background: 'rgba(15,23,42,0.98)', borderRight: '1px solid rgba(51,65,85,0.5)' }}
            >
              <SidePanel />
            </aside>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col w-56 flex-shrink-0 overflow-hidden"
          style={{ borderRight: '1px solid rgba(51,65,85,0.4)' }}
        >
          <div className="px-3 pt-4 pb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chat</p>
          </div>
          <SidePanel />
        </aside>

        {/* ─── Right panel: active chat ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(51,65,85,0.4)' }}
          >
            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
              onClick={() => setMobilePanel(true)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">{activeName}</p>
              <p className="text-xs text-slate-500">
                {activeChatId === 'general'
                  ? 'Skupni kanal'
                  : activeChatId.startsWith('subject_')
                  ? 'Kanal predmeta'
                  : 'Zasebni pogovor'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <MessageList chatId={activeChatId} currentUser={currentUser} />

          {/* Input */}
          <MessageInput chatId={activeChatId} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
