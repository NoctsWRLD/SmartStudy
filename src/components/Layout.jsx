import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { GearIcon } from './icons';
import { getSlovenianDateKey } from '../utils/dates';

const NAV_GROUPS = [
  {
    label: 'Učenje',
    items: [
      { to: '/', label: 'Domov', hint: 'Pregled dneva' },
      { to: '/tasks', label: 'Naloge', hint: 'Roki in kljukice' },
      { to: '/exams', label: 'Preverjanja', hint: 'Odštevanje do testov' },
      { to: '/flashcards', label: 'Kartice', hint: 'Ponovi snov' },
      { to: '/schedule', label: 'Urnik', hint: 'Teden po dnevih' },
      { to: '/subjects', label: 'Predmeti', hint: 'Tvoji predmeti' },
    ],
  },
  {
    label: 'Skupnost',
    items: [
      { to: '/chat', label: 'Klepet', hint: 'Kanali in pogovori' },
      { to: '/friends', label: 'Prijatelji', hint: 'Sošolci in vabila' },
    ],
  },
];

function TodayPill() {
  const { tasks } = useTasks();
  const today = getSlovenianDateKey();
  const dueToday = tasks.filter((t) => !t.completed && t.dueDate === today).length;
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;
  const total = dueToday + overdue;
  if (total === 0) return null;
  return (
    <Link
      to="/tasks"
      className="hidden items-center gap-2 rounded-full border border-rp-hl-med bg-rp-surface px-3.5 py-2 text-[13px] font-semibold text-rp-subtle transition-colors hover:border-rp-hl-high hover:text-rp-text sm:inline-flex"
      aria-label={`${total} ${total === 1 ? 'rok danes' : 'rokov danes'}, odpri naloge`}
    >
      <span className={`h-2 w-2 animate-pulse rounded-full ${overdue > 0 ? 'bg-rp-love' : 'bg-rp-gold'}`} aria-hidden="true" />
      Danes {total}
    </Link>
  );
}

function NavDropdown({ group, pathname }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const active = group.items.some((item) => item.to === pathname || (item.to !== '/' && pathname.startsWith(item.to)));

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open ]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[14.5px] font-semibold transition-colors ${
          active ? 'text-rp-text' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
        }`}
      >
        {group.label}
        <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
        <span className={`absolute inset-x-4 -bottom-[1px] h-[2.5px] rounded-full bg-rp-iris transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            aria-label={group.label}
            className="rise absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-rp-hl-med bg-rp-surface p-1.5"
          >
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `group/item flex items-baseline justify-between gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                    isActive ? 'bg-rp-iris/[.1]' : 'hover:bg-rp-overlay'
                  }`
                }
              >
                <span className="text-[14.5px] font-semibold text-rp-text">{item.label}</span>
                <span className="truncate text-xs text-rp-muted">{item.hint}</span>
              </NavLink>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SettingsMenu({ active }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open ]);

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
    <div
      className="relative hidden sm:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        title="Nastavitve in račun"
        aria-label="Nastavitve in račun"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${
          active || open ? 'bg-rp-iris/[.12] text-rp-iris' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
        }`}
      >
        <GearIcon className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            aria-label="Nastavitve in račun"
            className="rise absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-rp-hl-med bg-rp-surface p-1.5"
          >
            <NavLink
              to="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] font-semibold text-rp-text transition-colors hover:bg-rp-overlay"
            >
              <GearIcon className="h-4 w-4 text-rp-muted" />
              Nastavitve
            </NavLink>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[14.5px] font-semibold text-rp-love transition-colors hover:bg-rp-love/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Odjava
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);

  async function handleMobileLogout() {
    try {
      await logout();
      setMobileMenu(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="sr-only z-[100] rounded-xl bg-rp-iris px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Preskoči na vsebino
      </a>

      {/* Zgornji meni */}
      <header className="sticky top-0 z-30 border-b border-rp-hl-med bg-rp-base/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-2.5 md:px-8">
          <button
            type="button"
            onClick={() => setMobileMenu((v) => !v)}
            aria-label={mobileMenu ? 'Zapri meni' : 'Odpri meni'}
            aria-expanded={mobileMenu}
            className="grid h-10 w-10 place-items-center rounded-xl text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {mobileMenu
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <NavLink to="/" className="flex items-center gap-2.5 rounded-xl transition-transform hover:scale-[1.02] active:scale-95" aria-label="SmartStudy domov">
            <Logo size={34} />
            <span className="font-display text-[17px] font-bold tracking-tight">SmartStudy</span>
          </NavLink>

          <nav className="ml-6 hidden items-center gap-0.5 md:flex" aria-label="Glavna navigacija">
            {NAV_GROUPS.map((group) => (
              <NavDropdown key={group.label} group={group} pathname={location.pathname} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <TodayPill />
            <NavLink to="/tasks" className="btn-primary hidden !py-2.5 min-[480px]:inline-flex">Nova naloga</NavLink>
            <SettingsMenu active={location.pathname === '/settings' || location.pathname === '/profile'} />
          </div>
        </div>

        {mobileMenu && (
          <nav className="border-t border-rp-hl-med bg-rp-surface px-4 py-4 md:hidden" aria-label="Celoten meni">
            <div className="rise mx-auto grid max-w-6xl gap-5" key={location.pathname}>
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 text-xs font-medium text-rp-muted">{group.label}</p>
                  <div className="grid gap-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={() => setMobileMenu(false)}
                        className={({ isActive }) =>
                          `flex items-baseline justify-between gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                            isActive ? 'bg-rp-iris/[.1]' : 'hover:bg-rp-overlay'
                          }`
                        }
                      >
                        <span className="text-[15px] font-semibold text-rp-text">{item.label}</span>
                        <span className="truncate text-xs text-rp-muted">{item.hint}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
              <div className="grid gap-1 border-t border-rp-hl-med pt-4">
                <NavLink to="/profile" onClick={() => setMobileMenu(false)} className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">Moj profil</NavLink>
                <NavLink to="/settings" onClick={() => setMobileMenu(false)} className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">Nastavitve</NavLink>
                <button type="button" onClick={handleMobileLogout} className="rounded-xl px-4 py-2.5 text-left text-[15px] font-semibold text-rp-love transition-colors hover:bg-rp-love/10">Odjava</button>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-6 md:px-8 md:pt-10">
        {children}
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-rp-hl-med bg-rp-surface px-1 py-1.5 md:hidden" aria-label="Glavna navigacija">
        {[
          { to: '/', label: 'Domov' },
          { to: '/tasks', label: 'Naloge' },
          { to: '/exams', label: 'Testi' },
          { to: '/flashcards', label: 'Kartice' },
          { to: '/schedule', label: 'Urnik' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileMenu(false)}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${isActive ? 'bg-rp-iris/[.12] text-rp-iris' : 'text-rp-muted'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
