import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMessages, useFriends, sendMessage, deleteMessage, getDmChatId } from '../hooks/useChat';
import { useSubjects } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { ChatIcon, MenuIcon, PlusIcon, TrashIcon, XIcon } from '../components/icons';

function Avatar({ src, initial, size = 8 }) {
  const pixels = size * 4;
  if (src) {
    return (
      <img
        src={src}
        alt={initial}
        className="shrink-0 rounded-full object-cover"
        style={{ width: pixels, height: pixels }}
      />
    );
  }
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-rp-accent font-bold text-rp-accent-ink"
      style={{ width: pixels, height: pixels, fontSize: pixels <= 32 ? '0.75rem' : '0.9rem' }}
    >
      {initial}
    </div>
  );
}

function FileBubble({ fileURL, fileName, fileType, fileSize, isOwn }) {
  const isImage = fileType?.startsWith('image/');
  const kilobytes = fileSize ? Math.round(fileSize / 1024) : null;

  if (isImage) {
    return (
      <a href={fileURL} target="_blank" rel="noreferrer" className="mt-1 block">
        <img src={fileURL} alt={fileName} className="max-w-[220px] rounded-md" />
      </a>
    );
  }

  return (
    <a
      href={fileURL}
      target="_blank"
      rel="noreferrer"
      className={`mt-1 flex items-center gap-2.5 rounded-md border px-3.5 py-2.5 transition-opacity hover:opacity-80 ${
        isOwn
          ? 'border-transparent bg-rp-accent text-rp-accent-ink'
          : 'border-rp-line bg-rp-raised text-rp-text'
      }`}
    >
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
        />
      </svg>
      <div className="min-w-0">
        <p className="truncate text-small font-medium">{fileName}</p>
        {kilobytes && <p className="text-[11px] opacity-70">{kilobytes} KB</p>}
      </div>
    </a>
  );
}

function MessageBubble({ msg, isOwn, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const time = msg.timestamp?.toDate
    ? msg.timestamp
        .toDate()
        .toLocaleTimeString('sl-SI', { timeZone: 'Europe/Ljubljana', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar initial={msg.senderInitial || '?'} size={8} />
      <div className={`flex min-w-0 max-w-[85%] flex-col gap-0.5 md:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-small font-medium text-rp-muted">{isOwn ? 'Ti' : msg.senderName}</span>
          <span className="mono text-[11px] text-rp-muted">{time}</span>
        </div>

        <div className={`flex max-w-full items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <div className="min-w-0 max-w-full">
            {msg.text && (
              <div
                className={`break-words rounded-lg px-3.5 py-2 text-body leading-relaxed ${
                  isOwn
                    ? 'bg-rp-accent text-rp-accent-ink'
                    : 'border border-rp-line bg-rp-raised text-rp-text'
                }`}
              >
                {msg.text}
              </div>
            )}
            {msg.fileURL && (
              <FileBubble
                fileURL={msg.fileURL}
                fileName={msg.fileName}
                fileType={msg.fileType}
                fileSize={msg.fileSize}
                isOwn={isOwn}
              />
            )}
          </div>
          {isOwn && hovered && (
            <button
              type="button"
              onClick={() => onDelete(msg.id)}
              className="shrink-0 rounded-md p-1.5 text-rp-muted transition-colors hover:bg-rp-danger/10 hover:text-rp-danger"
              aria-label="Izbriši sporočilo"
              title="Izbriši"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageList({ chatId, currentUser }) {
  const { messages, loading } = useMessages(chatId);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-rp-accent border-t-transparent" />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-lg border border-rp-line bg-rp-overlay text-rp-muted" aria-hidden="true">
          <ChatIcon className="h-6 w-6" />
        </span>
        <p className="text-body text-rp-muted">Klepet je prazen. Povabi sošolca ali začni pogovor.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-4 py-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isOwn={msg.senderId === currentUser.uid}
          onDelete={(id) => deleteMessage(chatId, id)}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

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
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      <div className="flex items-end gap-2 rounded-lg border border-rp-line bg-rp-raised px-3.5 py-2.5">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKey}
          placeholder="Napiši sporočilo…"
          rows={1}
          disabled={sending}
          className="max-h-[120px] flex-1 resize-none bg-transparent text-body leading-relaxed text-rp-text outline-none placeholder:text-rp-muted"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-rp-accent text-rp-accent-ink transition-opacity disabled:opacity-30"
          aria-label="Pošlji sporočilo"
          title="Pošlji"
        >
          {sending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rp-accent-ink border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function RoomItem({ label, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-body font-medium transition-colors ${
        active ? 'bg-rp-accent/[.12] text-rp-accent' : 'text-rp-subtle hover:bg-rp-overlay hover:text-rp-text'
      }`}
    >
      <span className="shrink-0 opacity-80">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function SidePanel({ activeChatId, subjects, friends, currentUser, userProfile, onSelect }) {
  const navigate = useNavigate();
  const school = userProfile?.school?.trim();
  const schoolChatId = school ? `school_${school.toLowerCase().replace(/\s+/g, '_')}` : null;

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto py-3">
      <div>
        <p className="mb-1 px-3 text-label text-rp-muted">Kanali</p>
        <RoomItem
          label="Splošni"
          active={activeChatId === 'general'}
          onClick={() => onSelect('general', 'Splošni')}
          icon={<ChatIcon className="h-4 w-4" />}
        />
        {subjects.map((subject) => {
          const chatId = `subject_${subject.name.toLowerCase().replace(/\s+/g, '_')}`;
          return (
            <RoomItem
              key={subject.id}
              label={subject.name}
              active={activeChatId === chatId}
              onClick={() => onSelect(chatId, subject.name)}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              }
            />
          );
        })}
      </div>

      {schoolChatId && (
        <div>
          <p className="mb-1 px-3 text-label text-rp-muted">Moja šola</p>
          <RoomItem
            label={school}
            active={activeChatId === schoolChatId}
            onClick={() => onSelect(schoolChatId, school)}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>
      )}

      <div>
        <p className="mb-1 px-3 text-label text-rp-muted">Direktna sporočila</p>
        {friends.length === 0 ? (
          <p className="px-3 text-small text-rp-muted">Dodaj prijatelje v Prijateljih.</p>
        ) : (
          friends.map((friend) => {
            const dmId = getDmChatId(currentUser.uid, friend.uid);
            return (
              <RoomItem
                key={friend.uid}
                label={friend.displayName || 'Neznan'}
                active={activeChatId === dmId}
                onClick={() => onSelect(dmId, friend.displayName || 'Neznan')}
                icon={
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-rp-success text-[10px] font-bold text-rp-canvas">
                    {(friend.displayName?.[0] || '?').toUpperCase()}
                  </span>
                }
              />
            );
          })
        )}
      </div>

      <div className="mt-auto border-t border-rp-line px-3 pt-3">
        <button
          type="button"
          onClick={() => navigate('/friends')}
          className="flex w-full items-center gap-2 rounded-md border border-rp-accent/30 px-3 py-2 text-small font-semibold text-rp-accent transition-colors hover:bg-rp-accent/10"
        >
          <PlusIcon className="h-4 w-4" />
          Prijatelji
        </button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { currentUser, userProfile } = useAuth();
  const { subjects } = useSubjects();
  const { friends } = useFriends();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedChatId, setSelectedChatId] = useState('general');
  const [selectedName, setSelectedName] = useState('Splošni');
  const [mobileOpen, setMobileOpen] = useState(false);
  const dmUid = searchParams.get('dm');
  const dmFriend = friends.find((friend) => friend.uid === dmUid);
  const activeChatId = dmFriend && currentUser ? getDmChatId(currentUser.uid, dmFriend.uid) : selectedChatId;
  const activeName = dmFriend?.displayName || selectedName;

  function selectRoom(id, name) {
    setSelectedChatId(id);
    setSelectedName(name);
    if (dmUid) setSearchParams({});
    setMobileOpen(false);
  }

  const chatType = activeChatId === 'general'
    ? 'Skupni kanal'
    : activeChatId.startsWith('subject_')
      ? 'Kanal predmeta'
      : activeChatId.startsWith('school_')
        ? 'Šolski kanal'
        : 'Zasebni pogovor';

  const sidePanel = (
    <SidePanel
      activeChatId={activeChatId}
      subjects={subjects}
      friends={friends}
      currentUser={currentUser}
      userProfile={userProfile}
      onSelect={selectRoom}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-rp-line bg-rp-panel">
        <aside className="hidden w-56 shrink-0 flex-col overflow-hidden border-r border-rp-line md:flex">
          {sidePanel}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-rp-canvas/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 z-50 flex w-64 flex-col overflow-hidden border-r border-rp-line bg-rp-panel">
              <div className="flex items-center justify-between border-b border-rp-line px-4 py-3">
                <p className="text-body font-semibold text-rp-text">Klepet</p>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Zapri meni"
                  className="grid h-8 w-8 place-items-center rounded-md text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              {sidePanel}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col bg-rp-raised">
          <div className="flex shrink-0 items-center gap-3 border-b border-rp-line px-4 py-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Odpri seznam klepetov"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text md:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-rp-accent/25 bg-rp-accent/10 text-rp-accent"
              aria-hidden="true"
            >
              <ChatIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-body font-semibold text-rp-text">{activeName}</p>
              <p className="text-small text-rp-muted">{chatType}</p>
            </div>
          </div>

          <MessageList chatId={activeChatId} currentUser={currentUser} />
          <MessageInput chatId={activeChatId} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
