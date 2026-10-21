import { Link } from 'react-router-dom';
import Logo from './Logo';

const LEGAL_LINKS = [
  { to: '/pravilnik-o-zasebnosti', label: 'Pravilnik o zasebnosti' },
  { to: '/impressum', label: 'Impressum' },
  { to: '/dostopnost', label: 'Dostopnost' },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-rp-line bg-rp-panel">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="max-w-xs">
            <span className="flex items-center gap-2.5">
              <Logo size={30} />
              <span className="font-display text-[15px] font-bold tracking-tight text-rp-text">SmartStudy</span>
            </span>
            <p className="mt-3 text-small leading-6 text-rp-muted">
              Predmeti, naloge, preverjanja, urnik in kartice v enem pregledu.
            </p>
          </div>

          <nav aria-label="Pravne povezave">
            <ul className="grid gap-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-small text-rp-muted transition-colors hover:text-rp-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 border-t border-rp-line pt-6 text-small text-rp-muted">
          © {new Date().getFullYear()} SmartStudy
        </p>
      </div>
    </footer>
  );
}
