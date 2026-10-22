import LegalProse from '../components/LegalProse';
import SiteShell from '../components/SiteShell';
import { useSeo } from '../hooks/useSeo';

export default function AccessibilityPage() {
  useSeo({
    title: 'Dostopnost',
    description: 'Kako Scribe skrbi za dostopnost, kaj je narejeno in kako sporočiti težavo.',
    path: '/dostopnost',
  });

  return (
    <SiteShell>
      <LegalProse
        title="Dostopnost"
        intro="Scribe je zasnovan tako, da ga lahko uporablja vsak dijak, dijakinja in študent — tudi z bralnikom zaslona, tipkovnico ali povečano sliko."
        updated="22. oktober 2026"
        note="TODO(vsebina): Ta izjava še ni bila pregledana po standardu WCAG 2.2 AA. Pred objavo jo preveri strokovnjak za dostopnost."
      >
        <h2>Cilj</h2>
        <p>
          Cilj aplikacije je skladnost s smernicami WCAG 2.2 na ravni AA. Trdimo, da je
          aplikacija dostopna v tem obsegu — pregled še ni opravljen, zato to velja kot
          namera, ne kot potrjena skladnost.
        </p>

        <h2>Kaj je narejeno</h2>
        <ul>
          <li>Vsa besedila so v slovenščini, vmesnik pa uporablja jasne, kratke stavke.</li>
          <li>Vsak par besedila in ozadja v obeh temah dosega kontrast WCAG AA; to preverja avtomatski test vgrajen v kodo projekta.</li>
          <li>Fokus je vedno viden, obrobe fokusa pa se razlikujejo od okolice.</li>
          <li>Vse funkcije so dosegljive s tipkovnico, meniji se zaprejo z Esc in vrnejo fokus na gumb.</li>
          <li>Premiki in animacije se izklopijo, kadar naprava nastavi zmanjšan gibanje — samodejno ali v Nastavitvah.</li>
          <li>Ikone, ki ne sporočajo vsebine same, so označene kot okrasne; gumbi, ki niso besedilni, imajo opis za bralnik zaslona.</li>
          <li>Grafični učni pas in druge slike imajo besedilni opis, ki pove, kaj prikazujejo.</li>
          <li>Številke, datumi, ure in prijateljske kode so zapisane v monospace pisavi in se zato preberejo v stolpcih.</li>
          <li>Modali zajamejo fokus, zaprejo se z Esc in fokus vrnejo na gumb, ki jih je odprl.</li>
        </ul>

        <h2>Znane omejitve</h2>
        <ul>
          <li>Ime šole in e-poštni naslov v klepetu se prikazujeta kot besedilo, ki bralnik zaslona prebere v celoti.</li>
          <li>Uvoz urnika iz slike uporablja prepoznavanje besedila v brskalniku; rezultat je odvisen od kakovosti fotografije in ni preverjen s strani uporabnika.</li>
        </ul>

        <h2>Kako sporočiti težavo</h2>
        <p>
          TODO(vsebina): Kontaktna e-pošta za prijavo težav z dostopnostjo še ni določena.
        </p>
      </LegalProse>
    </SiteShell>
  );
}
