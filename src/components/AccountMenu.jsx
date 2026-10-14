import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AccountAvatar({ user, className = '' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-rp-iris font-bold text-white ${className}`}>
      {user?.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : user?.displayName?.[0]?.toUpperCase() || '?'}
    </span>
  );
}

export default function AccountMenu({ user, placement = 'top', variant = 'sidebar', onNavigate }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const firstItemRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    firstItemRef.current?.focus();

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    try {
      await logout();
      setOpen(false);
      onNavigate?.();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  function handleMenuKeyDown(event) {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const items = [...rootRef.current.querySelectorAll('[role="menuitem"]')];
    const currentIndex = items.indexOf(document.activeElement);
    if (currentIndex < 0) {
      items[event.key === 'ArrowDown' ? 0 : items.length - 1]?.focus();
      return;
    }
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (currentIndex + offset + items.length) % items.length;
    items[nextIndex]?.focus();
  }

  return (
    <div ref={rootRef} className={`relative ${variant === 'sidebar' ? 'w-full' : 'shrink-0'}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Odpri uporabniški meni"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={variant === 'sidebar'
          ? 'flex w-full items-center gap-3 rounded-xl border border-rp-hl-med/70 bg-rp-base/75 px-3 py-3 text-left transition hover:bg-rp-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-iris'
          : 'flex h-9 w-9 items-center justify-center rounded-full border border-rp-iris/20 bg-rp-iris/10 transition hover:ring-4 hover:ring-rp-iris/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-iris'}
      >
        <AccountAvatar user={user} className={variant === 'sidebar' ? 'h-9 w-9 text-sm' : 'h-full w-full text-xs text-rp-iris'} />
        {variant === 'sidebar' && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-rp-text">{user?.displayName || 'Neznan uporabnik'}</span>
            <span className="mt-0.5 block text-xs text-rp-muted">Račun in nastavitve</span>
          </span>
        )}
        {variant === 'sidebar' && <svg className={`h-4 w-4 shrink-0 text-rp-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" /></svg>}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Meni uporabniškega računa"
          onKeyDown={handleMenuKeyDown}
          className={`account-menu-enter absolute z-[70] w-60 overflow-hidden rounded-2xl border border-rp-hl-med bg-rp-surface p-2 shadow-[0_18px_55px_rgba(25,35,55,.2)] ${placement === 'top' ? 'bottom-full left-0 mb-3 origin-bottom-left' : 'right-0 top-full mt-3 origin-top-right'}`}
        >
          <div className="mb-1 border-b border-rp-hl-med/80 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-rp-text">{user?.displayName || 'Neznan uporabnik'}</p>
            <p className="mt-0.5 truncate text-xs text-rp-muted">{user?.email || 'SmartStudy račun'}</p>
          </div>
          <Link ref={firstItemRef} role="menuitem" to="/profile" onClick={() => { setOpen(false); onNavigate?.(); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rp-subtle outline-none transition hover:bg-rp-overlay hover:text-rp-text focus:bg-rp-overlay focus:text-rp-text">
            <svg className="h-4 w-4 text-rp-iris" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.1a7.5 7.5 0 0115 0A17.9 17.9 0 0112 22.5a17.9 17.9 0 01-7.5-2.4z" /></svg>
            Uredi profil
          </Link>
          <Link role="menuitem" to="/settings" onClick={() => { setOpen(false); onNavigate?.(); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rp-subtle outline-none transition hover:bg-rp-overlay hover:text-rp-text focus:bg-rp-overlay focus:text-rp-text">
            <svg className="h-4 w-4 text-rp-iris" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06-1.5 2.6-.08-.02a1.65 1.65 0 00-1.73.56l-.05.07h-3l-.04-.08a1.65 1.65 0 00-1.5-.96c-.25 0-.5.06-.72.17l-.08.04-2.6-1.5.02-.08a1.65 1.65 0 00-.56-1.73l-.07-.05v-3l.08-.04a1.65 1.65 0 00.8-2.22l-.04-.08 1.5-2.6.08.02a1.65 1.65 0 001.73-.56l.05-.07h3l.04.08a1.65 1.65 0 002.22.8l.08-.04 2.6 1.5-.02.08a1.65 1.65 0 00.56 1.73l.07.05v3l-.08.04a1.65 1.65 0 00-.65.58z" /></svg>
            Nastavitve
          </Link>
          <div className="my-1 border-t border-rp-hl-med/80" />
          <button role="menuitem" type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rp-love outline-none transition hover:bg-rp-love/10 focus:bg-rp-love/10">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Odjava
          </button>
        </div>
      )}
    </div>
  );
}
