import { SparkIcon } from './icons';

/**
 * Shown when the Firebase environment variables are missing. The app boots,
 * the public pages work — only the parts that need a database are blocked.
 */
export default function FirebaseSetupNotice() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div className="aurora-wash" aria-hidden="true" />
      <section className="card relative w-full max-w-xl p-6 sm:p-8" aria-labelledby="setup-title">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-rp-accent/10 text-rp-accent" aria-hidden="true">
          <SparkIcon className="h-6 w-6" />
        </div>
        <p className="mt-5 text-label text-rp-accent">Še en korak</p>
        <h1 id="setup-title" className="mt-2 text-page text-rp-text">
          Poveži Firebase, da zaženeš SmartStudy
        </h1>
        <p className="mt-3 text-body leading-6 text-rp-subtle">
          Aplikacija se je uspešno naložila, vendar še nima Firebase nastavitev. Zato
          prijava in shranjevanje podatkov še nista na voljo.
        </p>
        <ol className="mt-6 space-y-3 text-body leading-6 text-rp-subtle">
          <li>
            <span className="mr-2 font-semibold text-rp-accent">1.</span>
            V terminalu, znotraj mape <code className="rounded bg-rp-overlay px-1.5 py-0.5 text-rp-text">Aplikacija</code>,
            zaženi <code className="rounded bg-rp-overlay px-1.5 py-0.5 text-rp-text">cp .env.example .env.local</code>.
          </li>
          <li>
            <span className="mr-2 font-semibold text-rp-accent">2.</span>
            V <code className="rounded bg-rp-overlay px-1.5 py-0.5 text-rp-text">.env.local</code> vnesi
            konfiguracijo Web app iz Firebase Console → Project settings → Your apps.
          </li>
          <li>
            <span className="mr-2 font-semibold text-rp-accent">3.</span>
            Omogoči prijavo z e-pošto in geslom ter objavi Firestore pravila z ukazom{' '}
            <code className="rounded bg-rp-overlay px-1.5 py-0.5 text-rp-text">firebase deploy --only firestore:rules</code>.
          </li>
          <li>
            <span className="mr-2 font-semibold text-rp-accent">4.</span>
            Ustavi in znova zaženi razvojni strežnik.
          </li>
        </ol>
        <p className="mt-6 rounded-md border border-rp-warn/25 bg-rp-warn/[.06] p-3 text-small leading-5 text-rp-warn">
          Vrednosti iz Firebase so nastavitve brskalniške aplikacije. V{' '}
          <code className="rounded bg-rp-overlay px-1 py-0.5 text-rp-text">.env.local</code> nikoli ne
          dodajaj Admin SDK zasebnega ključa.
        </p>
      </section>
    </main>
  );
}
