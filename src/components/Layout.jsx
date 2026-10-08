import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccountMenu from './AccountMenu';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Nadzorna plošča',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/subjects',
    label: 'Predmeti',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    to: '/tasks',
    label: 'Naloge',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/schedule',
    label: 'Urnik',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/chat',
    label: 'Chat',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    to: '/friends',
    label: 'Prijatelji',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function SidebarContent({ onClose }) {
  const { currentUser } = useAuth();

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-rp-hl-med/60 px-5 py-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rp-iris to-rp-foam shadow-[0_6px_22px_rgba(185,161,255,.2)]">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight gradient-text">SmartStudy</span>
      </div>

      {/* Nav items */}
      <nav aria-label="Glavna navigacija" className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-rp-iris bg-rp-iris/[.08] border border-rp-iris/15 shadow-[inset_3px_0_0_0_#6d5bd0]'
                  : 'text-rp-subtle hover:text-rp-text hover:bg-rp-overlay/70 border border-transparent'
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-rp-hl-med/60 px-3 pb-4 pt-4">
        <AccountMenu user={currentUser} placement="top" variant="sidebar" onNavigate={onClose} />
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pageTitle = NAV_ITEMS.find((item) => item.to === location.pathname)?.label
    || (location.pathname === '/settings' ? 'Nastavitve' : 'Moj profil');
  const { currentUser } = useAuth();

  return (
    <div className="flex h-dvh min-h-[32rem] overflow-hidden">
      <a href="#main-content" className="sr-only z-[100] rounded-lg bg-rp-iris px-4 py-2 font-semibold text-rp-base focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Preskoči na vsebino</a>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-rp-hl-med/75 bg-rp-surface/90 backdrop-blur-xl md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-rp-hl-med bg-rp-surface">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="hidden h-[4.25rem] shrink-0 items-center justify-between border-b border-rp-hl-med/70 bg-rp-surface/80 px-6 backdrop-blur-xl md:flex xl:px-8">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-rp-muted">SmartStudy</span>
            <span className="text-rp-hl-high" aria-hidden="true">/</span>
            <h1 className="font-semibold text-rp-text">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-rp-muted lg:block">Lep napredek se začne z majhnim korakom.</span>
            <AccountMenu user={currentUser} placement="bottom" variant="avatar" />
          </div>
        </header>

        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-rp-hl-med/70 bg-rp-surface/90 px-4 py-3 backdrop-blur-xl md:hidden">
          <button
            type="button"
            aria-label="Odpri navigacijo"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-rp-subtle transition-all hover:bg-rp-overlay hover:text-rp-text"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-bold gradient-text">SmartStudy</span>
          <div className="w-9" />
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
