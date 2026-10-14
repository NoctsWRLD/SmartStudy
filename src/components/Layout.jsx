import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTasks } from '../hooks/useFirestore';
import { useExams } from '../hooks/useStudy';
import { useSettings } from '../contexts/SettingsContext';
import Logo from './Logo';
import { getSlovenianDateKey } from '../utils/dates';

const NAV_GROUPS = [
  {
    label: 'Učenje',
    items: [
      { to: '/', label: 'Domov' },
      { to: '/tasks', label: 'Naloge' },
      { to: '/exams', label: 'Preverjanja' },
      { to: '/flashcards', label: 'Kartice' },
      { to: '/schedule', label: 'Urnik' },
      { to: '/subjects', label: 'Predmeti' },
    ],
  },
  {
    label: 'Skupnost',
    items: [
      { to: '/chat', label: 'Klepet' },
      { to: '/friends', label: 'Prijatelji' },
    ],
  },
];

const PAGE_TITLES = {
  '/': 'Domov',
  '/subjects': 'Predmeti',
  '/tasks': 'Naloge',
  '/exams': 'Preverjanja',
  '/flashcards': 'Kartice',
  '/schedule': 'Urnik',
  '/chat': 'Klepet',
  '/friends': 'Prijatelji',
  '/profile': 'Moj profil',
  '/settings': 'Nastavitve',
};

const PIN_KEY = 'smartstudy.sidebar.v1';

function SideLink({ to, label, end, expanded }) {
  if (!expanded) {
    return (
      <NavLink
        to={to}
        end={end}
        title={label}
        aria-label={label}
        className={({ isActive }) =>
          `side-link relative mx-auto grid h-11 w-11 place-items-center rounded-2xl text-[15px] font-bold transition-all active:scale-90 ${
            isActive ? 'bg-rp-iris text-white' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
          }`
        }
      >
        {label[0]}
        <span className="sidebar-tip" aria-hidden="true">{label}</span>
      </NavLink>
    );
  }
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
          isActive ? 'bg-rp-iris/[.09] text-rp-text' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-rp-iris transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

function ThemeToggle({ collapsed }) {
  const { theme, setTheme } = useSettings();
  const dark = theme === 'tabla-temna';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'tabla' : 'tabla-temna')}
      title={dark ? 'Preklopi na svetli videz' : 'Preklopi na temni videz'}
      aria-label={dark ? 'Preklopi na svetli videz' : 'Preklopi na temni videz'}
      aria-pressed={dark}
      className={
        collapsed
          ? 'side-link relative mx-auto grid h-11 w-11 place-items-center rounded-2xl text-[15px] text-rp-muted transition-all hover:bg-rp-overlay hover:text-rp-text active:scale-90'
          : 'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text'
      }
    >
      <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
      {collapsed && <span className="sidebar-tip" aria-hidden="true">{dark ? 'Svetli videz' : 'Temni videz'}</span>}
    </button>
  );
}

function SettingsRow({ expanded, onNavigate }) {
  if (!expanded) {
    return (
      <NavLink
        to="/settings"
        title="Nastavitve"
        aria-label="Nastavitve"
        className={({ isActive }) =>
          `side-link relative mx-auto grid h-11 w-11 place-items-center rounded-2xl text-[15px] transition-all active:scale-90 ${
            isActive ? 'bg-rp-iris text-white' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
          }`
        }
      >
        <span aria-hidden="true">⚙</span>
        <span className="sidebar-tip" aria-hidden="true">Nastavitve</span>
      </NavLink>
    );
  }
  return (
    <NavLink
      to="/settings"
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex flex-1 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
          isActive ? 'bg-rp-iris/[.09] text-rp-text' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
        }`
      }
    >
      <span aria-hidden="true">⚙</span>
      Nastavitve
    </NavLink>
  );
}

function TodayAgenda() {
  const { tasks } = useTasks();
  const { exams } = useExams();
  const today = getSlovenianDateKey();
  const dueToday = tasks.filter((t) => !t.completed && t.dueDate === today);
  const nextExam = exams.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];

  if (dueToday.length === 0 && !nextExam) return null;

  return (
    <div className="rounded-2xl bg-rp-iris/[.07] p-3.5" aria-label="Danes na kratko">
      <p className="text-xs font-bold text-rp-iris">Danes</p>
      {dueToday.length > 0 && (
        <p className="mt-1 text-[13px] font-medium leading-snug">
          {dueToday.length} {dueToday.length === 1 ? 'naloga zapade' : dueToday.length === 2 ? 'nalogi zapadeta' : 'nalog zapade'} danes
        </p>
      )}
      {nextExam && (
        <p className="mt-1 text-[13px] leading-snug text-rp-muted">
          {nextExam.title} · {nextExam.date.slice(8, 10)}.{nextExam.date.slice(5, 7)}.
        </p>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const active = PAGE_TITLES[location.pathname] || 'SmartStudy';
  const [pinned, setPinned] = useState(() => {
    try { return localStorage.getItem(PIN_KEY) !== 'collapsed'; } catch { return true; }
  });
  const [hovered, setHovered] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const expanded = pinned || hovered;

  useEffect(() => {
    try { localStorage.setItem(PIN_KEY, pinned ? 'expanded' : 'collapsed'); } catch { /* shramba ni nujna */ }
  }, [pinned]);

  // Zapre mobilni meni ob vsaki spremembi poti (zunanji sistem: usmerjevalnik).
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setMobileMenu(false);
  }, [location.pathname]);

  function togglePin() {
    // Pomembno: ob kliku ugasnemo še hover, sicer miška nad vrstico
    // drži razširjeno stanje in je videti, kot da gumb ne deluje.
    setPinned((p) => !p);
    setHovered(false);
  }

  return (
    <div className="flex min-h-dvh">
      <a href="#main-content" className="sr-only z-[100] rounded-xl bg-rp-iris px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Preskoči na vsebino
      </a>

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setHovered(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false); }}
        className={`sidebar-rail ${expanded ? 'sidebar-expanded w-[264px]' : 'sidebar-collapsed w-[76px]'} sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-rp-hl-med bg-rp-surface px-4 py-6 md:flex`}
        aria-label="Glavna navigacija"
      >
        <div className={`flex items-center ${expanded ? 'gap-2 px-1' : 'flex-col gap-3'}`}>
          <NavLink to="/" className="rounded-xl transition-transform hover:scale-105 active:scale-95" aria-label="SmartStudy domov">
            <Logo size={36} />
          </NavLink>
          {expanded && <span className="sidebar-label font-display text-[17px] font-bold tracking-tight">SmartStudy</span>}
          <button
            type="button"
            onClick={togglePin}
            title={pinned ? 'Zloži vrstico' : 'Razširi vrstico'}
            aria-label={pinned ? 'Zloži stransko vrstico' : 'Razširi stransko vrstico'}
            aria-pressed={pinned}
            className={`grid h-8 w-8 place-items-center rounded-xl text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text ${expanded ? 'ml-auto' : ''}`}
          >
            <svg className={`h-4 w-4 transition-transform duration-300 ${pinned ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav className={`flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden ${expanded ? 'mt-10' : 'mt-8 items-center'}`} aria-label="Glavna navigacija">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={expanded ? '' : 'flex flex-col items-center gap-1.5'}>
              {expanded && <p className="sidebar-label mb-2 px-3.5 text-xs font-medium text-rp-muted">{group.label}</p>}
              <div className={expanded ? 'flex flex-col gap-1' : 'flex flex-col items-center gap-1.5'}>
                {group.items.map((item) => (
                  <SideLink key={item.to} to={item.to} label={item.label} end={item.to === '/'} expanded={expanded} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className={`mt-6 space-y-4 ${expanded ? '' : 'flex flex-col items-center'}`}>
          {expanded && <TodayAgenda />}
          <div className={`border-t border-rp-hl-med pt-4 ${expanded ? '' : 'flex flex-col items-center gap-1.5 border-t-0 pt-0'}`}>
            {expanded ? (
              <div className="flex items-center gap-1">
                <SettingsRow expanded onNavigate={() => setHovered(false)} />
                <ThemeToggle />
              </div>
            ) : (
              <>
                <SettingsRow expanded={false} />
                <ThemeToggle collapsed />
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-rp-hl-med bg-rp-base/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 md:px-8">
            <div className="flex items-center gap-1 md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenu((v) => !v)}
                aria-label={mobileMenu ? 'Zapri meni' : 'Odpri meni'}
                aria-expanded={mobileMenu}
                className="grid h-10 w-10 place-items-center rounded-xl text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {mobileMenu
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
              <NavLink to="/" className="flex items-center gap-2" aria-label="SmartStudy domov">
                <Logo size={32} />
                <span className="font-display text-base font-bold tracking-tight">SmartStudy</span>
              </NavLink>
            </div>
            <h1 className="hidden font-display text-xl font-semibold tracking-tight md:block">{active}</h1>
            <div className="flex items-center gap-2">
              <NavLink to="/tasks" className="btn-primary hidden !py-2.5 min-[420px]:inline-flex md:inline-flex">Nova naloga</NavLink>
              <div className="md:hidden">
                <ThemeToggle collapsed={false} />
              </div>
            </div>
          </div>

          {mobileMenu && (
            <nav className="border-t border-rp-hl-med bg-rp-surface px-4 py-4 md:hidden" aria-label="Celoten meni">
              <div className="rise mx-auto grid max-w-6xl gap-5">
                {NAV_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="mb-1.5 text-xs font-medium text-rp-muted">{group.label}</p>
                    <div className="grid gap-1">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/'}
                          className={({ isActive }) =>
                            `rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition-colors ${
                              isActive ? 'bg-rp-iris/[.09] text-rp-text' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="grid gap-1 border-t border-rp-hl-med pt-4">
                  <NavLink to="/profile" className="rounded-xl px-3.5 py-2.5 text-[15px] font-medium text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">Moj profil</NavLink>
                  <NavLink to="/settings" className="rounded-xl px-3.5 py-2.5 text-[15px] font-medium text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">Nastavitve</NavLink>
                </div>
              </div>
            </nav>
          )}
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:px-8 md:pt-9">
          {children}
        </main>
      </div>

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
