import { NavLink } from 'react-router-dom';
import { NAV_GROUPS, isPathActive } from '../navigation';
import NavIcon from './NavIcon';
import Logo from './Logo';
import { PlusIcon } from './icons';

export default function SideNav({ pathname, onNavigate }) {
  return (
    <div className="flex h-full flex-col gap-6 px-4 py-5">
      <NavLink
        to="/dashboard"
        onClick={onNavigate}
        aria-label="SmartStudy domov"
        className="flex items-center gap-2.5 rounded-lg px-1 transition-opacity hover:opacity-80"
      >
        <Logo size={32} />
        <span className="font-display text-[17px] font-bold tracking-tight text-rp-text">
          SmartStudy
        </span>
      </NavLink>

      <nav className="flex-1 overflow-y-auto" aria-label="Glavna navigacija">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-label text-rp-muted">{group.label}</p>
            <ul className="grid gap-0.5">
              {group.items.map((item) => {
                const active = isPathActive(pathname, item.to);
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-body font-medium transition-colors ${
                        active
                          ? 'bg-rp-accent/[.12] text-rp-accent'
                          : 'text-rp-subtle hover:bg-rp-overlay hover:text-rp-text'
                      }`}
                    >
                      <NavIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <NavLink to="/tasks?new=1" onClick={onNavigate} className="btn-primary w-full">
        <PlusIcon className="h-4 w-4" />
        Nova naloga
      </NavLink>
    </div>
  );
}
