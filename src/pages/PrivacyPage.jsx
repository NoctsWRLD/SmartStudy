import LegalProse from '../components/LegalProse';
import SiteShell from '../components/SiteShell';
import { useSeo } from '../hooks/useSeo';

export default function PrivacyPage() {
  useSeo({
    title: 'Pravilnik o zasebnosti',
    description: 'Katere podatke Scribe zbira, zakaj jih zbira, kdo jih obdeluje in kakšne pravice imaš do njih.',
    path: '/pravilnik-o-zasebnosti',
  });

  return (
    <SiteShell>
      <LegalProse
        title="Pravilnik o zasebnosti"
        intro="Ta pravilnik pojasnjuje, katere podatke Scribe zbira, zakaj jih zbira in kakšne pravice imaš do njih."
        updated="22. oktober 2026"
        note="TODO(vsebina): Manjkajo podatki o operaterju, kontaktni e-pošti in regiji hrambe podatkov. Besedilo je pripravljeno, a še ni pravno pregledano."
      >
        <h2>Katere podatke zbiram</h2>
        <p>
          Ob registraciji Scribe od tebe prebere e-poštni naslov, geslo in ime, ki ju
          vpišeš. V svoj profil lahko dodaš tudi šolo. Ko začneš uporabljati aplikacijo,
          shranjuješ predmete, naloge, preverjanja, kartice, zapise fokus sej in nastavitve
          videza.
        </p>
        <p>
          Vsak račun dobi tudi svojo <strong>prijateljsko kodo</strong> — šest znakov, s
          katerimi te sošolci najdejo. Kode drugih uporabnikov Scribe ne izpiše; vidiš
          le svojo. Ime in začetna črka tistih, ki iščeš sošolca, sta vidna drugim
          prijavljenim uporabnikom, in sicer samo takrat, ko iščeš po imenu.
        </p>
        <p>
          Gesla se nikoli ne shranjujejo v oblaku v čitljivi obliki — za njih skrbi ponudnik
          prijave.
        </p>

        <h2>Zakaj jih zbiram</h2>
        <p>
          E-poštni naslov in geslo sta potrebna za prijavo. Ime, šola, predmeti in naloge so
          tvoji učni podatki — brez njih aplikacija ne bi znala prikazati tvojega pregleda.
          Zapisi fokus sej omogočajo, da vidiš, koliko časa si res učil.
        </p>

        <h2>Kdo obdeluje tvoje podatke</h2>
        <p>
          Podatke obdeluje Google Firebase (Firebase Authentication in Cloud Firestore),
          ponudnik storitve v oblaku, ki ga uporablja ta aplikacija. Več o ponudniku:
          <a href="https://firebase.google.com/privacy" target="_blank" rel="noreferrer" className="text-rp-accent hover:underline">
            firebase.google.com/privacy
          </a>.
        </p>

        <h2>Komu podatkov ne posredujem</h2>
        <ul>
          <li>Scribe tvojih podatkov ne prodaja in jih ne deli z oglaševalci.</li>
          <li>Podatke ne pošiljamo tretjim osebam za namen trženja ali profiliranja.</li>
          <li>Uporabniške podatke v klepetu vidijo le udeleženci istega kanala ali pogovora.</li>
        </ul>

        <h2>Analytics in piškotki</h2>
        <p>
          Scribe ne uporablja analitičnih orodij tretjih oseb in ne postavlja tržnih
          piškotkov. Prijava uporablja piškotke, ki jih postavi Firebase Authentication —
          brez njih se računa ne more vzdrževati.
        </p>

        <h2>Hramba in brisanje</h2>
        <p>
          Podatki ostanejo v tvojem računu, dokler jih ne izbrišeš. Predmete, naloge,
          preverjanja in kartice izbrišeš v aplikaciji. Svoj račun odpraviš v Nastavitvah v
          razdelku »Nevarno območje«: Scribe tedaj izbriše tvoje predmete, naloge,
          preverjanja, kartice, zapise fokusa, zahteve za prijateljstvo in tvoja sporočila
          v klepetu ter odjavi tvoj račun. Tega ni mogoče razveljaviti.
        </p>

        <h2>Tvoje pravice</h2>
        <p>
          Imaš pravico do dostopa do svojih podatkov, do njihove poprave in do brisanja.
          Vse podatke lahko tudi izvoziš v obliki JSON — v Nastavitvah je gumb »Izvozi
          podatke«. Uvoziš jih lahko nazaj z gumbom »Uvozi podatke«.
        </p>

        <h2>Piškotki in sledenje</h2>
        <p>
          Ker aplikacija ne uporablja analitike in ne trženih piškotkov, posebnega soglasja
          za piškotke ne zahtevamo. Obvestilo o spremembi te politike bomo objavili na tej
          strani.
        </p>

        <h2>Kontakt</h2>
        <p>
          TODO(vsebina): Kontaktna e-pošta za vprašanja o zasebnosti še ni določena.
        </p>
      </LegalProse>
    </SiteShell>
  );
}
