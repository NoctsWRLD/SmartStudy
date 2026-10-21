# Spec: SmartStudy — redizajn v temnem "Zora" sistemu

## Objective

SmartStudy je aplikacija za dijake in študente: predmeti, naloge, preverjanja,
urnik, kartice, klepet in fokus. Ta spec opisuje **popoln redizajn vmesnika** in
dodajanje **javne predstavitvene strani**, ne spremembe podatkovnega modela.

Problem, ki ga rešujemo: aplikacija ima danes tri competing navigacije (dva
dropdown menija, hamburger meni in spodnjo vrstico) za enajst ciljev, svetlo
zeleno paleto, ki ne prenese nobenega gradienta, in občutek generičnega
dashboarda — identični zaobljeni kartončiki z mehkimi sencami, statistika brez
smisla.

Uspeh izgleda takole: ob odprtju aplikacije se človek ne sprašuje »katera je to
barva«, ampak »kdaj moram narediti to nalogo«. Temna canvas z aurora
gradientom, ki nosi čas, bel/alkovin sivi tekst, ena cijan akcija barva.

### Merljiva uspešna merila

1. V obeh temah vsak par fg/bg dosega WCAG AA (preverjeno s testom, ne z očesom).
2. Na širini 1440 px obstaja **natanko ena** glavna navigacija; na 390 px natanko
   ena spodnja vrstica in ena plošča za preostalo.
3. Javna stran `/` je dosegljiva brez prijave in brez konfiguracije Firebase.
4. Nobena stran ne vsebuje lorem ipsum, izmišljene cene, ocene ali podatka o
   podjetju.
5. `npm run lint`, `npm run build` in `npm test` gredo mimo; v brskalniku ni
   nobene napake v konzoli.

### Kraj scope

**V:** vizualni sistem, vse zaslonovne strani, aplikacijska lupina, javna
predstavitvena stran, pravne strani, SEO, dostopnost, izvedljivost.

**Ven:** podatkovni model, Firestore pravila, avtentikacija, klepet, OCR
uvoz urnika (obnaša se enako, samo vidno drugačen), potisna obvestila, izvoz
podatkov (obnaša se enako).

## Zmožnosti (capability map)

| id | Odgovornost | Odvisi od |
| --- | --- | --- |
| `design-system` | Token plast, primitivi, paleta predmetov, tipografija | — |
| `app-shell` | Levi pas, zgornja vrstica, spodnja vrstica, tema | `design-system` |
| `app-screens` | Dvanajst zaslonov, zgrajenih na lupini | `app-shell` |
| `public-site` | Javna stran, pravne strani, meta in SEO | `design-system` |
| `release` | Izhodna pripravljenost, zmogljivost, zakonuvost | `public-site`, `app-screens` |

Vrstni red gradnje: `design-system` → `app-shell` → `app-screens` →
`public-site` → `release`. Odvisnosti so enosmerne in brez ciklov.

## Tehnološki sklad

- React 19.2 + React Router 7.13 (`BaseRouter` z `basename` iz `BASE_URL`)
- Vite 7.3 — `base: process.env.BASE_PATH || '/'`, brez trdnega basa
- Tailwind CSS 4.2 prek `@tailwindcss/vite`, konfiguracija samo v `src/index.css`
- Firebase 12.19 (Auth + Firestore) — **ne spreminjeno**
- tesseract.js 7 — **ne spreminjeno**
- Vitest 5 + jsdom + Testing Library (nov)

## Ukazi

```
Namestitev   npm install
Razvoj        npm run dev
Gradnja      npm run build
Predogled    npm run preview
Lint         npm run lint
Testi        npm test
Testi (watch) npm run test:watch
```

## Struktura projekta

```
src/
  design-system/   tokens.test.js — pogodba sistema oblikovanja
  components/      ponovno uporabni deli (Layout, TaskCard, StudyRail, …)
  contexts/        AuthContext, SettingsContext
  hooks/           useFirestore, useStudy, useChat — ves dostop do Firestore
  pages/           ena datoteka na zaslon
  utils/           dates, colors, themes, timetable
  index.css        plast 1 (vrednosti), plast 2 (semantika), plast 3 (Tailwind)
test/setup.js      nastavitev Testing Library
tasks/             plan.md, todo.md
CONTENT.md         zaloga vsebine in vrzeli
SPEC.md            ta dokument
```

## Kodni slog

Komponenta bere samo semantične žetone. Nikoli surov heks v JSX.

```jsx
// Dobro
<section className="card p-5">
  <h2 className="text-title text-rp-text">{subject.name}</h2>
  <span className="chip text-rp-muted">{tasks.length} nalog</span>
</section>

// Slabo
<section className="rounded-2xl border border-[#2a2f55] bg-[#191e42] p-5">
  <h2 className="text-[15px] font-semibold text-[#f2f4ff]">{subject.name}</h2>
</section>
```

Dogovori: funkcijske komponente z eksportom `export default`; imena datotek
PascalCase za komponente, camelCase za utilitete; slovenski nizi v `jsx`;
`import` poti v `../components/X` brez `/index`; nobenega `any` (JS, brez TS).

## DIZAJN SISTEM

### Paleta (tema `dnevnik` — svetla, `noc` — temna, privzeta)

| Vloga | Svetla | Temna |
| --- | --- | --- |
| canvas | `#f4f6fb` | `#0a0d1f` |
| panel | `#ffffff` | `#111530` |
| raised (kartončiki) | `#ffffff` | `#191e42` |
| overlay (zdrs, skoči) | `#edf0f9` | `#232a56` |
| sunken (vnosna polja) | `#fafbfe` | `#0e1228` |
| tekst 1 | `#0e1226` | `#f2f4ff` |
| tekst 2 | `#414a6b` | `#c3c9e8` |
| tekst 3 | `#5c6485` | `#98a0cb` |
| obroba | `#e2e7f3` | `rgb(139 147 190 / .22)` |
| akcija | `#0e7490` | `#2bd9e8` |
| črnilo na akciji | `#ffffff` | `#04121a` |
| opozori | `#8f5806` | `#f0a868` |
| nevarno | `#b03149` | `#f87d92` |
| uspeh | `#0a6b54` | `#3fd9a4` |
| informacija | `#1d4ed8` | `#6fa8ff` |

Aurora gradient: `#3bc9d9 → #5e6bf2 → #b45cf0` (temna), `#12b5ce → #5b5be0 →
#b44be0` (svetla). Uporablja se **samo** v: prhi heroja, polnjenja učnega
pasa, loka časovnika, logotipa in napredkov.

Deset barv predmetov je ločenih žetonov `--rp-subject-1 … --rp-subject-10`, ki
imajo svetlo in temno vrednost, ter v obeh temah dosegajo AA kot besedilo.

### Tipografija

- **Display:** Space Grotesk 500/700 — naslovi, številke
- **Body:** DM Sans 400/500/700 — vmesnik
- Skala (vloge): `text-display` → `text-hero` → `text-page` → `text-title` →
  `text-subtitle` → `text-body` → `text-small` → `text-label`
- Oznake so velike začetnice, nikoli `ALL CAPS`; razmak med besedami je
  največ 0,01 em

### Ritm, polmeri, gibanje

- Osnovna enota 4 px; razmaki so večkratniki `1 2 3 4 6 8 12 16 24`
- Polmeri: `xs 6 · sm 10 · md 12 · lg 16 · xl 20 · 2xl 24 px`
- Gibanje: `fast 120ms · base 200ms · slow 340ms`, krivulja
  `cubic-bezier(.2,.8,.2,1)`
- En sam dogodek ob nalaganju: učni pas se napolni od leve proti desni
- `prefers-reduced-motion` in stikalo v nastavitvah oba izklopita gibanje

## Strani in sekcije

### Javno (`/`, `/pravilnik-o-zasebnosti`, `/impressum`, `/dostopnost`)

| Stran | Sekcije |
| --- | --- |
| `/` | navigacija · hero (naslov, podnaslov, CTA, prikaz "Danes") · možnosti · kako deluje · za koga · vprašanja · zaključni poziv · noga |
| `/pravilnik-o-zasebnosti` | obdelovalci · katere podatke · namen · pravice · hramba · brisanje · kontakt |
| `/impressum` | operater · kontakt · odgovorna oseba · odločitev o pristojnosti |
| `/dostopnost` | cilj · kaj je narejeno · znane omejitve · prijava težave |

### Aplikacija (zaščiteno)

| Pot | Zaslon | Ključna vsebina |
| --- | --- | --- |
| `/dashboard` | Domov | pozdrav · učni pas tedna · danešnje naloge · fokus · naslednje preverjanje · napredek predmetov |
| `/tasks` | Naloge | povzetek · filtre · iskanje · množično označevanje · seznam |
| `/subjects` | Predmeti | koraki · iskanje · kartončiki predmetov z napredkom |
| `/exams` | Preverjanja | odštevanje · prihajajoča · pretekla |
| `/flashcards` | Kartice | učenje · obračanje · znano/neznano |
| `/schedule` | Urnik | tedenska mreža · uvoz iz slike · preklop na dnevni pogled |
| `/chat` | Klepet | kanali · sporočila |
| `/friends` | Prijatelji | iskanje · vabila · seznam |
| `/profile` | Profil | ime · šola · posodobitev |
| `/settings` | Nastavitve | tema · dostopnost · račun · učni podatki · izvoz |

Preusmeritev: `/` (bivši domov) → `/dashboard`, da zunanji naslov nosi javno
stran. Prijavljen uporabnik na `/` gre na `/dashboard`.

## Zaloga komponent

**Nove:** `StudyRail` (učni pas), `AppShell` (lupina), `SideNav` (levi pas),
`TopBar` (zgornja vrstica), `MobileTabBar` (spodnja vrstica), `SectionHeading`,
`EmptyState`, `StatTile`, `FaqAccordion`, `SiteFooter`, `SiteHeader`,
`LegalProse`, `AuroraWash`.

**Preoblikovane:** `Layout` → `AppShell`, `TaskCard`, `FocusTimer`,
`ExamCountdown`, `WeekFocus`, `StudyTipCard`, `SubjectModal`, `TaskModal`,
`ExamModal`, `FlashcardModal`, `SubjectTaskModal`, `ScheduleImportModal`,
`Badge`, `Skeleton`, `Logo`, `icons`.

**Brez sprememb v obnašanju:** `useFirestore`, `useStudy`, `useChat`,
`AuthContext`, `firebase.js`, `ProtectedRoute`, `BaseRouter`.

## Zaloga vsebine in vrzeli

Vse besedilo je v `CONTENT.md`. Vrzeli (osem) so označene v kodi s
`TODO(vsebina)` in ne smejo biti izmišljene: cena, operater, kontakt, javna
domena, mnenja, statistika, podrobnosti hrambe, potrditev WCAG.

## Dostopnost

- WCAG 2.2 AA kot cilj; vsi pari fg/bg v obeh temah preverjeni s testom
- Fokus vedno viden: `2px` obrobe v `rp-accent`, `3px` odmik
- Vsa interaktivna polja dosegljiva s tipkovnico; meniji se zaprejo z `Escape`
  in vrnejo fokus na gumb
- Poudarjena vsebina (aria-live) pri časovniku in obvestilih
- Gibanje: `prefers-reduced-motion` + stikalo v nastavitvah
- Ikone v gumbih imajo `aria-label`; okrasne ikone `aria-hidden`
- Vmesnik je v slovenščini; jezik dokumenta `lang="sl"`

## Testna strategija

**Testiramo logiko, ne postavitve.**

| Obravnava | Kje |
| --- | --- |
| DIZAJN pogodba: kontrast, popolnost zamenjave tem, ločljivost aurore | `src/design-system/tokens.test.js` |
| Filtriranje in razvrščanje nalog | `src/pages/TasksPage.test.jsx` |
| Odštevanje do preverjanja | `src/utils/countdown.js` + test |
| Barve predmetov in njihova veljavnost | `src/utils/colors.test.js` |
| Normalizacija teme (stara → nova) | `src/utils/themes.test.js` |
| Varovanje poti (prijavljen/prijava) | `src/components/ProtectedRoute.test.jsx` |
| Oblika (postavitev) | **ne** — preveri se z ogledom v brskalniku |

Preverjanje: `npm test` mora miniti pred vsakim commitom.

## meje

**Vedno:** zažen `npm run lint && npm test && npm run build` pred commitom;
commitaj posamezno nalogo, `git add` samo prebranih datotek; vse uporabniku
vidno besedilo v slovenščini; vsak nov prikaz uporablja žetone.

**Najprej vprašaj:** sprememba podatkovnega modela ali Firestore pravil; nova
zunanja odvisnost; sprememba `base` poti ali poteka izdaje; trditev o skladnosti
(GDPR, WCAG), ki ni bila pregledana.

**Nikoli:** skrivnosti v `VITE_` spremenljivki; izmišljene cene, ocene ali
podatki o podjetju; brisanje neuspešnih testov; `git add -A`; potiskanje na
ponudnika storitev brez dovoljenja.

## Definicija konca

1. `npm run lint`, `npm test`, `npm run build` — vse mimo.
2. Vse strani obiskane v brskalniku pri 1440 / 768 / 390 px; **nič** napak v
   konzoli; **nič** neuspešnih zahtev.
3. Obe temi izgledata kot en sistem; vrzeli označene in navedene.
4. `dist/404.html` obstaja; `base` iz okolja; `vercel.json` in Pages workflow
   sta prisotna.
5. Kritika zasnova: vsi blokirajoči in zahtevani ugotovitve popravljeni.
6. Lighthouse (namizni in mobilni) zabeležen s številkami.
7. Meta, OG, Twitter, JSON-LD, `robots.txt`, `sitemap.xml` in tri pravne strani
   so prisotni.

## Odprta vprašanja

Odgovorov na naslednja vprašanja nimam — vsa so v `CONTENT.md` kot vrzeli in
ne blokirajo gradnje:

1. Cennik in naročniški model?
2. Ime operaterja, naslov in odgovorna oseba za Impressum?
3. Končna javna domena (za kanonične naslove in `sitemap.xml`)?
4. Kateri kanal podpore uporabljamo?
