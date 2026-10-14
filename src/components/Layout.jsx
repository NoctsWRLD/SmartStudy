import { useState } from 'react';
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

function SideLink({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center rounded-xl px-4 py-2.5 text-[14.5px] font-medium transition-colors ${
          isActive ? 'bg-rp-iris/[.1] text-rp-text' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-rp-iris transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useSettings();
  const dark = theme === 'tabla-temna';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'tabla' : 'tabla-temna')}
      title={dark ? 'Preklopi na svetli videz' : 'Preklopi na temni videz'}
      aria-label={dark ? 'Preklopi na svetli videz' : 'Preklopi na temni videz'}
      aria-pressed={dark}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[15px] text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text active:scale-90"
    >
      <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
    </button>
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
    <div className="rounded-2xl bg-rp-iris/[.08] p-4" aria-label="Danes na kratko">
      <p className="text-xs font-bold text-rp-iris">Danes</p>
      {dueToday.length > 0 && (
        <p className="mt-1.5 text-[13px] font-medium leading-snug">
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
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <a href="#main-content" className="sr-only z-[100] rounded-xl bg-rp-iris px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Preskoči na vsebino
      </a>

      {/* Namizje: mirna stranska vrstica — brez zlaganja, brez animacij širine */}
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-rp-hl-med bg-rp-surface px-5 py-7 md:flex" aria-label="Glavna navigacija">
        <NavLink to="/" className="flex items-center gap-2.5 rounded-xl px-1 transition-transform hover:scale-[1.02] active:scale-95" aria-label="SmartStudy domov">
          <Logo size={36} />
          <span className="font-display text-[17px] font-bold tracking-tight">SmartStudy</span>
        </NavLink>

        <nav className="mt-10 flex flex-1 flex-col gap-7 overflow-y-auto" aria-label="Glavna navigacija">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-4 text-xs font-medium text-rp-muted">{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <SideLink key={item.to} to={item.to} label={item.label} end={item.to === '/'} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-8 space-y-4">
          <TodayAgenda />
          <div className="flex items-center gap-1 border-t border-rp-hl-med pt-4">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex flex-1 items-center gap-2.5 rounded-xl px-4 py-2.5 text-[14.5px] font-medium transition-colors ${
                  isActive ? 'bg-rp-iris/[.1] text-rp-text' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
                }`
              }
            >
              <span aria-hidden="true">⚙</span>
              Nastavitve
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        {/* Mobilna vrstica: meni, logotip, tema */}
        <header className="sticky top-0 z-30 border-b border-rp-hl-med bg-rp-base/90 backdrop-blur md:hidden">
          <div className="flex items-center gap-1 px-3 py-2.5">
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
            <NavLink to="/" className="flex items-center gap-2" aria-label="SmartStudy domov" onClick={() => setMobileMenu(false)}>
              <Logo size={30} />
              <span className="font-display text-base font-bold tracking-tight">SmartStudy</span>
            </NavLink>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          {mobileMenu && (
            <nav className="border-t border-rp-hl-med bg-rp-surface px-4 py-4" aria-label="Celoten meni">
              <div className="rise grid gap-5" key={location.pathname}>
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
                            `rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors ${
                              isActive ? 'bg-rp-iris/[.1] text-rp-text' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
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
                  <NavLink to="/profile" onClick={() => setMobileMenu(false)} className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">Moj profil</NavLink>
                  <NavLink to="/settings" onClick={() => setMobileMenu(false)} className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">Nastavitve</NavLink>
                </div>
              </div>
            </nav>
          )}
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 pb-10 pt-6 md:px-10 md:pt-10">
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
