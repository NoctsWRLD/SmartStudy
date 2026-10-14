import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccountMenu from './AccountMenu';

const NAV_ITEMS = [
  { to: '/', label: 'Domov', short: 'Domov', icon: '⌂' },
  { to: '/subjects', label: 'Predmeti', short: 'Šola', icon: '✎' },
  { to: '/tasks', label: 'Naloge', short: 'Naloge', icon: '✓' },
  { to: '/schedule', label: 'Urnik', short: 'Urnik', icon: '◷' },
  { to: '/chat', label: 'Klepet', short: 'Klepet', icon: '◌' },
  { to: '/friends', label: 'Prijatelji', short: 'Folks', icon: '☺' },
];

function Logo({ size = 'md' }) {
  const box = size === 'lg' ? 'h-11 w-11 text-xl' : 'h-10 w-10 text-lg';
  return (
    <span className={`grid ${box} place-items-center rounded-2xl bg-rp-iris font-display font-bold text-white`} aria-hidden="true">
      S
    </span>
  );
}

function RailLink({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      title={label}
      className={({ isActive }) =>
        `rail-link group relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-medium transition-all duration-200 ${
          isActive ? 'text-rp-text' : 'text-rp-muted hover:text-rp-text hover:bg-rp-overlay'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`grid h-10 w-12 place-items-center rounded-2xl text-base transition-all duration-200 group-active:scale-90 ${
              isActive ? 'bg-rp-iris text-white shadow-[0_6px_16px_rgba(67,73,232,.3)]' : 'bg-transparent group-hover:bg-rp-hl-med/60'
            }`}
          >
            {icon}
          </span>
          {label}
          <span
            className={`nav-dot absolute -left-[13px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-rp-iris ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
            aria-hidden="true"
          />
        </>
      )}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const { currentUser } = useAuth();
  const active = NAV_ITEMS.find((item) => item.to === location.pathname)?.label
    || (location.pathname === '/settings' ? 'Nastavitve' : 'Moj profil');
  const firstName = currentUser?.displayName?.trim().split(/\s+/)[0] || 'hej';

  return (
    <div className="flex min-h-dvh">
      <a href="#main-content" className="sr-only z-[100] rounded-full bg-rp-iris px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Preskoči na vsebino
      </a>

      {/* Slim icon rail — desktop */}
      <aside className="sticky top-0 hidden h-dvh w-[92px] shrink-0 flex-col items-center gap-1 border-r border-rp-hl-med bg-rp-surface/95 px-2 py-4 backdrop-blur-xl md:flex" aria-label="Glavna navigacija">
        <NavLink to="/" className="mb-3 transition-transform hover:scale-105 active:scale-95" aria-label="SmartStudy domov">
          <Logo />
        </NavLink>
        <nav className="flex w-full flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <RailLink key={item.to} to={item.to} label={item.short} icon={item.icon} end={item.to === '/'} />
          ))}
        </nav>
        <div className="mt-2">
          <AccountMenu user={currentUser} placement="top" variant="avatar" />
        </div>
      </aside>

      {/* Content column */}
      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-rp-hl-med/70 bg-rp-base/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="md:hidden"><Logo /></span>
              <div className="min-w-0">
                <p className="font-hand text-lg leading-none text-rp-muted">živjo, {firstName}! ✳</p>
                <h1 className="font-display truncate text-lg font-bold tracking-tight">{active}</h1>
              </div>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/settings" className="btn-ghost" aria-label="Nastavitve">⚙ <span className="hidden lg:inline">Nastavitve</span></NavLink>
              <NavLink to="/tasks" className="btn-primary !py-2.5">+ Nova naloga</NavLink>
            </div>
            <div className="md:hidden">
              <AccountMenu user={currentUser} placement="bottom" variant="avatar" />
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-6xl px-4 pt-5 md:px-8 md:pt-8">
          {children}
        </main>
      </div>

      {/* Bottom bar — mobile */}
      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-3xl border border-rp-hl-med bg-rp-surface/95 px-2 py-2 shadow-[0_12px_32px_rgba(19,27,42,.12)] backdrop-blur-xl md:hidden" aria-label="Glavna navigacija">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex min-w-12 flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[10px] font-semibold transition-all active:scale-90 ${isActive ? 'text-rp-iris' : 'text-rp-muted'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`grid h-8 w-10 place-items-center rounded-xl text-base ${isActive ? 'bg-rp-iris text-white' : ''}`}>{item.icon}</span>
                {item.short}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
