# Implementation Plan: SmartStudy — redizajn v "Zora" temi

## Pregled

Preoblikujem SmartStudy iz svetlo-zelene generične aplikacije v temno aplikacijo
z aurora gradiento, belim in alkovin sivim besedilom, eno cijan akcijo in
strukturalno napravo — **učni pas** — ki nosi hierarhijo. Dodam javno
predstavitveno stran s pravnimi stranmi, preuredim aplikacijsko lupino iz
trojne navigacije v eno, in vse dvanajst zaslonov prebuildam na novi lupini.

Podatkovni model, Firestore pravila, avtentikacija in vsi klici so nedotaknjeni.

## Odločitve arhitekture

| # | Odločitev | Zakaj |
| --- | --- | --- |
| 1 | **Javna stran na `/`, aplikacija na `/dashboard`** | Koren naslova je tisto, kar se deli. Prijavljen uporabnik na `/` gre naprej na `/dashboard`; globoke povezave `/tasks` in ostale ostanejo nedotaknjene. |
| 2 | **Lupina: levi pas ≥1024 px, spodnja vrstica <1024 px** | Tri navigacije za enajst ciljev so bila glavna težava. Zdaj je ena. |
| 3 | **`StudyRail` kot komponenta, ne CSS primitiv** | Učni pas se pojavi na šestih mestih v šestih različnih skalah. Ena komponenta zagotovi, da je povsod enak. |
| 4 | **Javna stran ne potrebuje Firebase** | `App.jsx` loči javne poti od zaščitenih, da javna stran deluje tudi brez konfiguracije. |
| 5 | **Pot do nalog, predmetov, pregledanj, kartic, urnika, klepeta, prijateljev, profila in nastavitev ostane angleška** | Ne spreminjam obstoječih globokih povezav, razen korena. |
| 6 | **Pisave se nalagajo prek `<link>` v `index.html`** | CSS `@import` blokira izris; `preconnect` + `display=swap` je hitrejši in Lighthouse to nagradi. |
| 7 | **Barve predmetov so žetoni, ne hekse** | Predmet mora imeti isto identiteto v obeh temah. |

## Seznam nalog

### Faza 1 — Temelj

- [ ] **Naloga 1: Testna oprema in žetonska pogodba** *(Končano: 11 testov)*
  - Vitest 5 + jsdom + Testing Library, `test/setup.js`, skripta `npm test`
  - `src/design-system/tokens.test.js` — kontrast AA v obeh temah, popolnost
    zamenjave tem, ločljivost aurore
- [ ] **Naloga 2: Plast žetonov in tema `noc`**
  - `src/index.css`: plast 1 (vrednosti), 2 (semantika), 3 (Tailwind most)
  - Nova tema `noc` (privzeta) in `dnevnik`; selitev starih id-jev
  - `src/utils/themes.js`, `src/utils/colors.js` z žetoni predmetov
- [ ] **Naloga 3: Osnovni elementi in pisave**
  - `Logo` z aurora ploščico, `icons.jsx` (Son/Moon/Chevron/…), `Badge`,
    `Skeleton`, `FocusTimer` z lokom, `EmptyState`

### Checkpoint: Temelj
- [ ] `npm run lint` in `npm test` mimo
- [ ] `npm run build` uspešen
- [ ] V brskalniku se vidi nova paleta brez napak v konzoli

### Faza 2 — Lupina

- [ ] **Naloga 4: `StudyRail` + `StatTile` + `EmptyState`**
  - `src/components/StudyRail.jsx` — 7 segmentov, toni, `aria` opis
  - `src/components/StatTile.jsx`, `src/components/EmptyState.jsx`
- [ ] **Naloga 5: `AppShell` (levi pas, zgornja vrstica, spodnja vrstica)**
  - `src/components/AppShell.jsx` nadomesti `Layout.jsx`
  - Levi pas ≥1024 px, spodnja vrstica <1024 px, ena "preostalo" plošča
  - Skupaj z `SideNav`, `TopBar`, `MobileTabBar`
- [ ] **Naloga 6: Preusmeritev in route struktura**
  - `App.jsx`: `/` javno, `/dashboard` zaščiteno, `*` → `/`
  - `ProtectedRoute` obdrži vedenje, dobi test

### Checkpoint: Lupina
- [ ] Vse strani se odprejo v novi lupini
- [ ] Nič napak v konzoli
- [ ] Navigacija je na eni mesto, ne na tri

### Faza 3 — Zasloni

- [ ] **Naloga 7: Domov (`/dashboard`)**
  - Učni pas tedna, danešnje naloge, fokus, odštevanje, napredek predmetov
- [ ] **Naloga 8: Naloge (`/tasks`)**
  - Povzetek, filter, iskanje, množične akcije — logika filtriranja v testu
- [ ] **Naloga 9: Predmeti in preverjanja**
  - `/subjects` (kartončki z napredkom), `/exams` (odštevanje)
- [ ] **Naloga 10: Urnik**
  - Tedenska mreža, danes označen, mobilni dnevni pogled
- [ ] **Naloga 11: Kartice in klepet**
  - `/flashcards` (obračanje), `/chat` (kanali)
- [ ] **Naloga 12: Prijatelji, profil, nastavitve**
  - `/friends`, `/profile`, `/settings` (nova tema z žetoni)
- [ ] **Naloga 13: Prijava in registracija**
  - `AuthShell` z aurora prhi, pravilna usmerjanja ob prijavi

### Checkpoint: Zasloni
- [ ] Vseh dvanajst zaslonov preoblikovanih in pregledanih
- [ ] Prazna stanja, napake in uspehi imajo besedilo
- [ ] `npm test` in `npm run build` mimo

### Faza 4 — Javno

- [ ] **Naloga 14: Javna stran `/`**
  - `src/pages/LandingPage.jsx` + `SiteHeader` + `SiteFooter`
  - Hero z resničnim prikazom »Danes«, možnosti, kako deluje, za koga, vprašanja
- [ ] **Naloga 15: Pravne strani**
  - `/pravilnik-o-zasebnosti`, `/impressum`, `/dostopnost`
  - Označena mesta za manjkajoče podatke (`TODO(vsebina)`)
- [ ] **Naloga 16: SEO in zakonuvost**
  - Naslov in opis na stran, kanonični naslovi, OG/Twitter, JSON-LD
  - `public/robots.txt`, `public/sitemap.xml`, favicon

### Checkpoint: Javno
- [ ] Javna stran deluje brez prijave
- [ ] Meta, JSON-LD, robots in sitemap so prisotni
- [ ] Vrzeli so navedene in vidne

### Faza 5 — Izdaja

- [ ] **Naloga 17: Izhodna pripravljenost**
  - `base` iz okolja, `404.html` SPA, `vercel.json`, Pages workflow, `.nojekyll`
- [ ] **Naloga 18: Zmogljivost**
  - Razdeljen koda, `font-display: swap`, `preconnect`, dimenzije slik
- [ ] **Naloga 19: Kritika zasnova in popravki**
  - Posnetki pri 1440/768/390 px, vseh devet osi, popravki blokirajočih
- [ ] **Naloga 20: Končno preverjanje**
  - lint + test + build, pregled izhoda, commit

### Checkpoint: Končno
- [ ] Vsi zgornji kriteriji iz `SPEC.md` izpolnjeni
- [ ] Poročilo z zapisanimi številkami

## Tveganja in zmanjševanje

| Tveganje | Vpliv | Ukrep |
| --- | --- | --- |
| Velik paket (924 kB) | Slab LCP | Kodo razdelim po potih (`React.lazy`) |
| Pisave blokirajo izris | Slab LCP | `preconnect` + `display=swap` v `index.html` |
| Učni pas ne deluje z realnimi podatki | Izguba naprave | Pas dobi tone iz realnih nalog, ne iz lažnih števil |
| Barve predmetov ne dosežejo AA | Neberljiv predmet | Vrednosti preveri žetonski test, ne oko |
| Selitev starih tem | Uporabnik izgubi nastavitve | `normalizeThemeId` preslikava `tabla` → `dnevnik` |
| Globoke povezave se pokvarijo | Uporabnik izgubi bookmark | Koren preusmeri na `/dashboard`, ostale poti ostanejo |

## Vzporedne možnosti

Varno vzporedno: testi za že napisane funkcije (npr. `themes.test.js` ob
`themes.js`), dokumentacija, SEO metapodatki.
Zaporedno: vse, kar spreminja `App.jsx` ali `AppShell.jsx` — skupni vir.

## Odprta vprašanja

Cennik, operater, javna domena in kanal podpore — v `CONTENT.md` kot vrzeli.
Gradnje ne blokirajo.
