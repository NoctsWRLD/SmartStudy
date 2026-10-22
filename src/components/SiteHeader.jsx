import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { MenuIcon, XIcon } from './icons';

const LINKS = [
  { href: '#moznosti', label: 'Možnosti' },
  { href: '#kako-deluje', label: 'Kako deluje' },
  { href: '#vprasanja', label: 'Vprašanja' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-rp-line bg-rp-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Scribe — domov">
          <Logo size={32} />
          <span className="font-display text-[17px] font-bold tracking-tight text-rp-text">Scribe</span>
        </Link>

        <nav className="ml-8 hidden items-center gap-1 md:flex" aria-label="Navigacija po strani">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-body font-medium text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className="btn hidden sm:inline-flex">Prijava</Link>
          <Link to="/register" className="btn btn-primary whitespace-nowrap !px-4 !py-2 sm:!px-5">
            <span className="sm:hidden">Ustvari</span>
            <span className="hidden sm:inline">Ustvari račun</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Zapri meni' : 'Odpri meni'}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-md text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text md:hidden"
          >
            {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-rp-line bg-rp-canvas px-4 py-3 md:hidden" aria-label="Navigacija po strani">
          <ul className="grid gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-body font-medium text-rp-subtle transition-colors hover:bg-rp-overlay hover:text-rp-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="border-t border-rp-line pt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-body font-semibold text-rp-accent">
                Prijava
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
