import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccountMenu from './AccountMenu';

const NAV_ITEMS = [
  { to: '/', label: 'Domov' },
  { to: '/subjects', label: 'Predmeti' },
  { to: '/tasks', label: 'Naloge' },
  { to: '/schedule', label: 'Urnik' },
  { to: '/chat', label: 'Klepet' },
  { to: '/friends', label: 'Prijatelji' },
];

function Wordmark() {
  return (
    <NavLink to="/" className="flex items-center gap-2.5 rounded-xl" aria-label="SmartStudy domov">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-rp-text font-display text-base font-bold text-[var(--rp-base)]" aria-hidden="true">S</span>
      <span className="font-display text-[17px] font-bold tracking-tight">SmartStudy</span>
    </NavLink>
  );
}

function SideLink({ to, label, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `relative flex items-center rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
          isActive ? 'bg-rp-iris/[.08] text-rp-text' : 'text-rp-muted hover:bg-rp-overlay hover:text-rp-text'
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

export default function Layout({ children }) {
  const location = useLocation();
  const { currentUser } = useAuth();
  const active = NAV_ITEMS.find((item) => item.to === location.pathname)?.label
    || (location.pathname === '/settings' ? 'Nastavitve' : 'Moj profil');

  return (
    <div className="flex min-h-dvh">
      <a href="#main-content" className="sr-only z-[100] rounded-xl bg-rp-iris px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Preskoči na vsebino
      </a>

      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-rp-hl-med bg-rp-surface px-4 py-5 md:flex" aria-label="Glavna navigacija">
        <Wordmark />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <SideLink key={item.to} to={item.to} label={item.label} end={item.to === '/'} />
          ))}
        </nav>
        <div className="border-t border-rp-hl-med pt-4">
          <AccountMenu user={currentUser} placement="top" variant="sidebar" />
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="sticky top-0 z-30 border-b border-rp-hl-med bg-rp-base/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 md:px-8">
            <div className="md:hidden"><Wordmark /></div>
            <p className="hidden text-sm text-rp-muted md:block">{active}</p>
            <div className="flex items-center gap-2">
              <NavLink to="/tasks" className="btn-primary !py-2.5">Nova naloga</NavLink>
              <AccountMenu user={currentUser} placement="bottom" variant="avatar" />
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-5xl px-4 pb-10 pt-6 md:px-8 md:pt-9">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-rp-hl-med bg-rp-surface px-1 py-1.5 md:hidden" aria-label="Glavna navigacija">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${isActive ? 'bg-rp-iris/[.1] text-rp-iris' : 'text-rp-muted'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
