import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubjects, useTasks } from '../hooks/useFirestore';
import { countedNoun } from '../utils/slovenian';
import { GearIcon } from '../components/icons';

/**
 * The user's own index card. Everything that can be changed lives in
 * Nastavitve; this page is the card you show to someone — what it says about
 * you, and where to change it.
 */
export default function ProfilePage() {
  const { currentUser, userProfile } = useAuth();
  const { subjects } = useSubjects();
  const { tasks } = useTasks();

  const completed = tasks.filter((task) => task.completed).length;
  const displayName = currentUser?.displayName?.trim() || 'Učenec';

  return (
    <div className="max-w-2xl space-y-5">
      <section className="rise">
        <h1 className="text-page text-rp-text">Moj profil</h1>
        <p className="mt-2 max-w-xl text-body text-rp-muted">
          Tvoja kartica. Spreminja se v nastavitvah.
        </p>
      </section>

      <section className="sheet">
        <div className="flex items-center gap-4 border-b border-rp-line px-5 py-5">
          <span
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-rp-accent text-2xl font-bold text-rp-accent-ink"
            aria-hidden="true"
          >
            {displayName[0].toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-subtitle text-rp-text">{displayName}</p>
            <p className="mt-0.5 truncate text-small text-rp-muted">
              {userProfile?.school || 'Šola ni dodana'}
            </p>
            {userProfile?.friendCode && (
              <p className="mono mt-1.5 text-small tracking-[0.18em] text-rp-subtle">
                {userProfile.friendCode}
              </p>
            )}
          </div>
        </div>

        <dl className="grid gap-3 px-5 py-5 text-body">
          <div className="flex justify-between gap-4 border-b border-rp-line pb-3">
            <dt className="text-rp-muted">E-pošta</dt>
            <dd className="truncate font-medium text-rp-text">{currentUser?.email || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-rp-line pb-3">
            <dt className="text-rp-muted">Predmeti</dt>
            <dd className="font-medium text-rp-text">{subjects.length}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-rp-muted">Naloge</dt>
            <dd className="font-medium text-rp-text">
              {countedNoun(tasks.length, 'naloga', 'nalogi', 'naloge', 'nalog')}
              {tasks.length > 0 && (
                <span className="text-rp-muted"> · {completed} opravljenih</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <Link to="/settings" className="card card-hover flex items-center justify-between p-4">
        <span className="flex items-center gap-3.5">
          <span
            className="grid h-9 w-9 place-items-center rounded-md border border-rp-accent/25 bg-rp-accent/10 text-rp-accent"
            aria-hidden="true"
          >
            <GearIcon className="h-[18px] w-[18px]" />
          </span>
          <span>
            <span className="block text-body font-semibold text-rp-text">Nastavitve</span>
            <span className="mt-0.5 block text-small text-rp-muted">
              Ime, šola, e-pošta, geslo, koda prijatelja in videz
            </span>
          </span>
        </span>
        <GearIcon className="h-5 w-5 text-rp-muted" aria-hidden="true" />
      </Link>
    </div>
  );
}
