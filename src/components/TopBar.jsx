import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatSlovenianDate, getSlovenianDateKey } from '../utils/dates';
import Logo from './Logo';

// Loaded after the first paint so the database SDK never blocks the public page.
const TodayCount = lazy(() => import('./TodayCount'));
import { GearIcon, LogOutIcon, MenuIcon, MoonIcon, SunIcon, UserIcon } from './icons';

function AccountMenu() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function handleLogout() {
    try {
      await logout();
      setOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        title="Profil in nastavitve"
        aria-label="Profil in nastavitve"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="grid h-9 w-9 place-items-center rounded-md text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text"
      >
        <UserIcon className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            aria-label="Profil in nastavitve"
            className="rise absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-rp-line bg-rp-raised p-1.5 shadow-[var(--rp-shadow-3)]"
          >
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-body font-medium text-rp-text transition-colors hover:bg-rp-overlay"
            >
              <UserIcon className="h-4 w-4 text-rp-muted" />
              Moj profil
            </Link>
            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-body font-medium text-rp-text transition-colors hover:bg-rp-overlay"
            >
              <GearIcon className="h-4 w-4 text-rp-muted" />
              Nastavitve
            </Link>
            <div className="my-1.5 border-t border-rp-line" role="separator" />
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-body font-medium text-rp-danger transition-colors hover:bg-rp-danger/10"
            >
              <LogOutIcon className="h-4 w-4" />
              Odjava
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useSettings();
  const next = theme === 'noc' ? 'dnevnik' : 'noc';
  // The label names the theme the button switches *to*, not the current one.
  const label = next === 'noc' ? 'Preklopi na temni videz' : 'Preklopi na svetli videz';
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-md text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text"
    >
      {theme === 'noc' ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
    </button>
  );
}

export default function TopBar({ onOpenMenu }) {
  const dateLabel = formatSlovenianDate(getSlovenianDateKey(), { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className="sticky top-0 z-30 border-b border-rp-line bg-rp-panel/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Odpri meni"
          className="grid h-9 w-9 place-items-center rounded-md text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden" aria-label="SmartStudy domov">
          <Logo size={28} />
          <span className="font-display text-[15px] font-bold tracking-tight text-rp-text">SmartStudy</span>
        </Link>

        <div className="hidden min-w-0 items-baseline gap-3 lg:flex">
          <p className="truncate text-small text-rp-muted">{dateLabel}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={null}>
            <TodayCount />
          </Suspense>
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
