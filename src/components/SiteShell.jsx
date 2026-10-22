import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/** The frame every public page sits in. */
export default function SiteShell({ children }) {
  return (
    <div className="relative min-h-dvh bg-rp-canvas">
      <SiteHeader />
      <main className="relative mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
