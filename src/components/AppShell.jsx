import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ACCOUNT_LINKS, NAV_GROUPS, isPathActive } from '../navigation';
import { useSeo } from '../hooks/useSeo';
import { getPageTitle } from '../utils/pageTitles';
import SideNav from './SideNav';
import TopBar from './TopBar';
import MobileTabBar from './MobileTabBar';
import NavIcon from './NavIcon';
import Logo from './Logo';
import { LogOutIcon, XIcon } from './icons';

function MoreSheet({ pathname, onClose }) {
  const sheetRef = useRef(null);
  const closeRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = sheetRef.current?.querySelectorAll(
        'a[href], button:not([disabled])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleLogout() {
    try {
      await logout();
      onClose();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="overlay-fade absolute inset-0 bg-rp-canvas/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Meni"
        className="modal-pop absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-rp-line bg-rp-panel"
      >
        <div className="flex h-16 items-center justify-between border-b border-rp-line px-4">
          <span className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display text-[15px] font-bold tracking-tight text-rp-text">Scribe</span>
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Zapri meni"
            className="grid h-9 w-9 place-items-center rounded-md text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 text-label text-rp-muted">{group.label}</p>
              <ul className="grid gap-0.5">
                {group.items.map((item) => {
                  const active = isPathActive(pathname, item.to);
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium transition-colors ${
                          active
                            ? 'bg-rp-accent/[.12] text-rp-accent'
                            : 'text-rp-subtle hover:bg-rp-overlay hover:text-rp-text'
                        }`}
                      >
                        <NavIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="grid gap-0.5 border-t border-rp-line pt-4">
            {ACCOUNT_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text"
              >
                <NavIcon name={link.icon} className="h-[18px] w-[18px] shrink-0" />
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-body font-medium text-rp-danger transition-colors hover:bg-rp-danger/10"
            >
              <LogOutIcon className="h-[18px] w-[18px] shrink-0" />
              Odjava
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useSeo({ title: getPageTitle(location.pathname), path: location.pathname });

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <div className="min-h-dvh bg-rp-canvas">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-md bg-rp-accent px-4 py-2 font-semibold text-rp-accent-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Preskoči na vsebino
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-rp-line bg-rp-panel lg:block">
        <SideNav pathname={location.pathname} />
      </aside>

      <div className="flex min-h-dvh flex-col lg:pl-60">
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <main
          id="main-content"
          className={
            location.pathname === '/chat'
              ? 'mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-0 pb-0 pt-0 md:px-6 lg:pt-0'
              : 'mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-6 lg:pb-14 lg:pt-9'
          }
        >
          {children}
        </main>
      </div>

      <MobileTabBar pathname={location.pathname} />

      {menuOpen && (
        <MoreSheet pathname={location.pathname} onClose={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
