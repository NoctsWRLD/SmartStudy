import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from '../config';
import {
  BookIcon,
  CalendarIcon,
  CardIcon,
  ClockIcon,
  ExamIcon,
  TaskIcon,
} from '../components/icons';
import { useSeo, useJsonLd } from '../hooks/useSeo';

const CAPABILITIES = [
  {
    icon: BookIcon,
    title: 'Vsak predmet s svojim prostorom',
    copy: 'Naloge, preverjanja in kartice ostanejo razdeljeni po predmetih, zato na dan preveriš, kje zaostajaš.',
  },
  {
    icon: TaskIcon,
    title: 'Roki, ki jih vidiš naenkrat',
    copy: 'Vsaka naloga ima predmet in rok. Filtriraš po stanju, predmetu ali roku, označiš opravljeno in nadaljuješ.',
  },
  {
    icon: ExamIcon,
    title: 'Odštevanje do testa',
    copy: 'Vpišeš datum, Scribe odšteva dneve in pokaže, kdaj se sploh začne učiti.',
  },
  {
    icon: CalendarIcon,
    title: 'Teden, razporejen po dnevih',
    copy: 'Tvoj urnik v obliki tedna. Fotografijo urnika lahko uvoziš in preveriš prebrane vrstice.',
  },
  {
    icon: CardIcon,
    title: 'Ponovi snov iz glave',
    copy: 'Obrniš kartico in odgovori sam. Kar znaš, gre na stran, kar ne, ostane.',
  },
  {
    icon: ClockIcon,
    title: '25 minut brez odvajanja',
    copy: 'Časovnik za osredotočeno učenje. Zapisuje, koliko minut se danes zareset naučil.',
  },
];

const STEPS = [
  ['Ustvari predmete', 'Vpiši predmete, ki jih imaš v šoli. Vsak dobi svojo barvo, da ga prepoznaš tudi v množici.'],
  ['Dodaj naloge z roki', 'Vsako nalogo pripišeš predmetu in ji določiš rok. Če roka nimaš, jo preprosto pustiš brez datuma.'],
  ['Uči se in odštevaj', 'Domača stran pokaže, kaj je danes na vrsti, urnik pokaže, kdaj imaš pouk, odštevanje pa opozori, kdaj pride test.'],
];

const AUDIENCES = [
  ['Osnovnošolci', 'Naloge, ki jih učitelj zapiše v delovni list, spraviš v en predmet in jih na koncu odkljukaš. Skupaj s sošolci.'],
  ['Dijaki', 'Roki za matematiko, kemijo in jezike na enem mestu, plus kartice za ustni del.'],
  ['Študenti', 'Predmeti, roki, izpiti in fokus v eni aplikaciji, ki jo odpreš tudi med vajo v knjižnici.'],
];

const FAQ = [
  ['Kaj potrebujem, da začnem?', 'Račun z e-pošto in geslom. Predmete, naloge in kartice dodaš sam — nič ne vpisuješ v skupne sezname.'],
  ['Kako se razlikujejo naloge, preverjanja in kartice?', 'Naloga ima rok in predmet. Preverjanje ima datum, od katerega se odšteva. Kartica ima vprašanje in odgovor ter zapise, ali si jo že znal.'],
  ['Ali Scribe deluje brez interneta?', 'Ne. Podatki se shranijo v tvoj račun v oblaku, zato do njih dostopaš z vsake naprave, kjer si prijavljen.'],
  ['Ali lahko uvozim urnik iz slike?', 'Da. Na strani Urnik naložiš fotografijo urnika, Scribe jo prebere in pokaže pregled vrstic, ki jih potrdiš ali popraviš.'],
  ['Kaj se zgodi z mojimi podatki?', 'Ostanejo v tvojem računu. Scribe jih ne prodaja in ne deli z oglaševalci. Preberi pravilnik o zasebnosti.'],
  ['Ali me Scribe opozarja na naloge?', 'Ne pošilja obvestil. Naloge vidiš na domačem pregledu in v urniku, kjer so razporejene po dnevih.'],
];

const HERO_RAIL = [
  { day: 'Pon', value: 0.9, tone: 'accent' },
  { day: 'Tor', value: 0.55, tone: 'accent' },
  { day: 'Sre', value: 0.2, tone: 'warn' },
  { day: 'Čet', value: 1, tone: 'accent' },
  { day: 'Pet', value: 0.4, tone: 'accent' },
  { day: 'Sob', value: 0, tone: 'empty' },
  { day: 'Ned', value: 0, tone: 'empty' },
];

function TodayPanel() {
  return (
    <div className="sheet w-full max-w-sm overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 border-b border-rp-line px-5 py-3.5">
        <p className="text-small font-semibold text-rp-text">Danes</p>
        <p className="mono text-small text-rp-muted">ponedeljek, 21. oktober</p>
      </div>

      <ul className="rail mx-5 mt-4" aria-label="Učni pas tedna">
        {HERO_RAIL.map((segment) => (
          <li key={segment.day} className="rail-seg" data-tone={segment.tone}>
            <span aria-hidden="true" style={{ width: `${segment.value * 100}%` }} />
          </li>
        ))}
      </ul>
      <ul className="mx-5 mb-4 mt-2 flex gap-[3px]" aria-hidden="true">
        {HERO_RAIL.map((segment) => (
          <li key={segment.day} className="flex-1 text-center text-[11px] leading-4 text-rp-muted">
            {segment.day}
          </li>
        ))}
      </ul>

      <div className="border-t border-rp-line px-5 py-4">
        <ul>
          {[
            ['08:00', 'Matematika', 'Pouk'],
            ['10:00', 'Fizika', 'Pouk'],
            ['13:00', 'Dnevnik — esej', 'Naloga'],
          ].map(([time, title, kind]) => (
            <li key={time} className="flex items-baseline gap-3 border-b border-rp-line py-2 last:border-0">
              <span className="mono w-12 shrink-0 text-small text-rp-muted">{time}</span>
              <span className="truncate text-body font-medium text-rp-text">{title}</span>
              <span className="ml-auto shrink-0 text-small text-rp-muted">{kind}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-rp-line px-5 py-3">
        <span className="text-small text-rp-muted">Preverjanje čez 4 dni</span>
        <span className="mono chip chip-accent">25:00</span>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-rp-line last:border-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 py-4 text-left text-subtitle font-semibold text-rp-text transition-colors hover:text-rp-accent"
        >
          {question}
          <span
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border border-rp-line text-rp-muted transition-transform ${
              open ? 'rotate-45' : ''
            }`}
            aria-hidden="true"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      </h3>
      {open && <p className="pb-4 pr-10 text-body leading-6 text-rp-muted">{answer}</p>}
    </div>
  );
}

export default function LandingPage() {
  useSeo({
    title: 'Scribe',
    description: 'Predmeti, naloge, preverjanja, urnik in kartice v enem pregledu. Za dijake in študente.',
    path: '/',
  });

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: absoluteUrl('/'),
          inLanguage: 'sl-SI',
        },
        {
          '@type': 'SoftwareApplication',
          name: SITE_NAME,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web',
          description: SITE_DESCRIPTION,
          url: absoluteUrl('/'),
          inLanguage: 'sl-SI',
        },
      ],
    }),
    [],
  );

  useJsonLd(structuredData);

  return (
    <div className="relative min-h-dvh bg-rp-canvas">
      <SiteHeader />

      <main className="relative">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
            <div>
              <p className="text-label text-rp-accent">Šolski dnevnik</p>
              <h1 className="mt-4 text-hero text-rp-text">
                En dnevnik za celoten šolski dan.
              </h1>
              <p className="mt-5 max-w-lg text-body leading-7 text-rp-subtle">
                Scribe združi predmete, naloge, preverjanja, urnik, kartice in sošolce.
                Brez oglasov in brez nepotrebnih okrasitev — samo zapiski, roki in
                odštevanje.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary !px-6 !py-3">Ustvari račun</Link>
                <Link to="/login" className="btn-ghost !px-6 !py-3">Prijava</Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <TodayPanel />
            </div>
          </div>
        </section>

        {/* Možnosti */}
        <section id="moznosti" className="border-t border-rp-line bg-rp-panel/40 py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="max-w-2xl text-page text-rp-text">
              Vse, kar imaš za šolo, na enem mestu
            </h2>
            <p className="mt-3 max-w-xl text-body leading-6 text-rp-muted">
              Šest stvari, ki jih Scribe drži skupaj — in jih po potrebi pokaže tudi tebi
              na telefonu.
            </p>

            <ul className="mt-10 divide-y divide-rp-line border-y border-rp-line">
              {CAPABILITIES.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.title}
                    className="grid gap-3 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:gap-6"
                  >
                    <span
                      className="grid h-10 w-10 place-items-center rounded-md border border-rp-line bg-rp-raised text-rp-accent"
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-subtitle text-rp-text">{item.title}</h3>
                      <p className="mt-2 max-w-xl text-body leading-6 text-rp-muted">{item.copy}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Kako deluje */}
        <section id="kako-deluje" className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
              <div>
                <h2 className="text-page text-rp-text">Tri koraki, potem vsak dan isto.</h2>
                <p className="mt-3 max-w-sm text-body leading-6 text-rp-muted">
                  Ustvarjanje traja minuto. Uporaba traja tako dolgo, dokler ne odpraviš vsega.
                </p>
              </div>

              <ol className="ledger sheet">
                {STEPS.map(([title, copy], index) => (
                  <li key={title} className="ledger-row flex gap-4 px-5 py-4">
                    <span className="mono shrink-0 text-body font-bold text-rp-accent" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span className="block text-subtitle text-rp-text">{title}</span>
                      <span className="mt-1 block text-body leading-6 text-rp-muted">{copy}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Za koga */}
        <section className="border-t border-rp-line bg-rp-panel/40 py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-page text-rp-text">Narejeno za šolo, ne za odrasle.</h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-3">
              {AUDIENCES.map(([group, copy]) => (
                <li key={group}>
                  <span className="block h-px w-10 bg-rp-accent" aria-hidden="true" />
                  <h3 className="mt-4 text-subtitle text-rp-text">{group}</h3>
                  <p className="mt-2 text-body leading-6 text-rp-muted">{copy}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Vprašanja */}
        <section id="vprasanja" className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <h2 className="text-page text-rp-text">Vprašanja</h2>
            <div className="mt-8">
              {FAQ.map(([question, answer]) => (
                <FaqItem key={question} question={question} answer={answer} />
              ))}
            </div>
          </div>
        </section>

        {/* Zaključni poziv */}
        <section className="border-t border-rp-line bg-rp-panel/40 py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
            <h2 className="text-page text-rp-text">Odpri predmete in dodaj prvo nalogo.</h2>
            <p className="mt-3 text-body text-rp-muted">
              Račun ustvariš v enem koraku, nato dodaš prvega predmeta in prvo nalogo.
              Svojega sošolca poiščeš po kodi, ki jo dobiš od njega.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="btn-primary !px-6 !py-3">Ustvari račun</Link>
              <Link to="/login" className="btn-ghost !px-6 !py-3">Že imaš račun? Prijava</Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
