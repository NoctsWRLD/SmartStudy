import LegalProse from '../components/LegalProse';
import SiteShell from '../components/SiteShell';

export default function ImprintPage() {
  return (
    <SiteShell>
      <LegalProse
        title="Impressum"
        intro="Podatki o operaterju spletnega mesta in osebi, odgovorni za njegovo vsebino."
        updated="21. oktober 2026"
        note="TODO(vsebina): Ime operaterja, naslov, davčna številka in kontaktna e-pošta še niso določeni. Dopolni, preden objaviš."
      >
        <h2>Operater spletnega mesta</h2>
        <p>
          TODO(vsebina): Ime in priimek oziroma naziv podjetja, ki upravlja SmartStudy.
        </p>
        <p>
          TODO(vsebina): Poštni naslov.
        </p>

        <h2>Kontakt</h2>
        <p>
          TODO(vsebina): E-poštni naslov za vprašanja in podporo.
        </p>

        <h2>Odgovorna oseba</h2>
        <p>
          TODO(vsebina): Ime osebe, odgovorne za vsebino spletnega mesta.
        </p>

        <h2>Pristojnost in odpovedna odgovornost</h2>
        <p>
          TODO(vsebina): Določilo o pristojnosti, ki velja za ponudnika storitev.
        </p>

        <h2>Platforma in odločanje o pristojnosti</h2>
        <p>
          Spletno mesto je objavljeno na Vercelu in GitHub Pages. Za dostop do spletnega mesta
          je odgovoren ponudnik gostovanja, pri katerem je mesto registrirano.
        </p>
      </LegalProse>
    </SiteShell>
  );
}
