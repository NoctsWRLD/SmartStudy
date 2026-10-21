# SmartStudy — redizajn: seznam nalog

Vir resnice: `SPEC.md` (zahteve), `tasks/plan.md` (načrt), `CONTENT.md` (besedilo).

Legenda: [ ] začen · [~] v teku · [x] končano

---

## Faza 1 — Temelj

- [x] **Naloga 1: Testna oprema in žetonska pogodba**
  - Sprejemljivo: `npm test` teče 44 testov, `test/setup.js` naloži jest-dom
  - Preverjanje: `npm test` · `npm run build`
  - Datoteke: `package.json`, `vite.config.js`, `test/setup.js`,
    `src/design-system/tokens.test.js`, `eslint.config.js`
- [x] **Naloga 2: Plast žetonov in tema `noc`**
  - Sprejemljivo: `src/index.css` ima plast 1/2/3; tema `noc` je privzeta;
    `dnevnik` in `noc` delita vse barvne žetone; stari id-ji se preslikajo
  - Preverjanje: `npm test` (pogodba žetonov) · `npm run lint`
  - Datoteke: `src/index.css`, `src/utils/themes.js`, `src/utils/colors.js`,
    `src/contexts/SettingsContext.jsx`
- [x] **Naloga 3: Osnovni elementi in pisave**
  - Sprejemljivo: `Logo` uporablja aurora ploščico (SVG barvni strelec, ne
    CSS gradient v `fill`); ikone so en komplet; `Badge`, `Skeleton`,
    `EmptyState`, `ErrorState`, `StatTile`, `StudyRail` berejo le žetone
  - Preverjanje: `npm run lint` · `npm run build` · ogled v brskalniku
  - Datoteke: `src/components/Logo.jsx`, `src/components/icons.jsx`,
    `src/components/Badge.jsx`, `src/components/Skeleton.jsx`,
    `src/components/EmptyState.jsx`, `src/components/ErrorState.jsx`,
    `src/components/StatTile.jsx`, `src/components/StudyRail.jsx`

## Checkpoint: Temelj
- [x] `npm run lint` in `npm test` mimo
- [x] `npm run build` uspešen
- [x] Nova paleta je vidna brez napak v konzoli

---

## Faza 2 — Lupina

- [x] **Naloga 4: `StudyRail`, `StatTile`, `EmptyState`**
  - Sprejemljivo: `StudyRail` izriše 7 segmentov, sprejme tone in ima
    besedilni opis; `StatTile` prikaže vrednost, oznako in ton; `EmptyState`
    ne raztegne čez stolpec
  - Preverjanje: `npm run lint` · `npm test` · ogled
  - Datoteke: `src/components/StudyRail.jsx`, `src/components/StatTile.jsx`,
    `src/components/EmptyState.jsx`, `src/utils/rail.js`
- [x] **Naloga 5: `AppShell`**
  - Sprejemljivo: levi pas ≥1024 px z dvema skupinama, spodnja vrstica
    <1024 px s petimi cilji, ena plošča za preostalo, `Escape` zapre meni in
    vrne fokus
  - Preverjanje: `npm run lint` · ogled pri 1440 px in 390 px
  - Datoteke: `src/components/AppShell.jsx`, `src/components/SideNav.jsx`,
    `src/components/TopBar.jsx`, `src/components/MobileTabBar.jsx`,
    `src/components/NavIcon.jsx`, `src/navigation.js`
- [x] **Naloga 6: Preusmeritev in route struktura**
  - Sprejemljivo: `/` je javna stran, `/dashboard` je domov, prijavljen
    uporabnik na `/` pristane na `/dashboard`, `*` → `/`
  - Preverjanje: `npm run build` · ogled vseh poti v brskalniku
  - Datoteke: `src/App.jsx`, `src/components/ProtectedRoute.jsx`

## Checkpoint: Lupina
- [x] Vse strani se odprejo v novi lupini
- [x] Nič napak v konzoli
- [x] Ena glavna navigacija, ne tri

---

## Faza 3 — Zasloni

- [x] **Naloga 7: Domov (`/dashboard`)** — učni pas, danešnje naloge, fokus,
  odštevanje, napredek predmetov
- [x] **Naloga 8: Naloge (`/tasks`)** — filtriranje v `src/utils/tasks.js` je
  pokrito s testom; množične akcije delujejo
- [x] **Naloga 9: Predmeti in preverjanja** — kartončki z napredkom, odštevanje
  v `src/utils/countdown.js` s testom
- [x] **Naloga 10: Urnik** — tedenska mreža v deljeni plošči, danes označen,
  mobilni dnevni pogled, uvoz iz slike deluje
- [x] **Naloga 11: Kartice in klepet** — obračanje kartice, kanali, poln
  višinski klepet
- [x] **Naloga 12: Prijatelji, profil, nastavitve** — nova plošča, izbira teme
  iz skupnega seznama
- [x] **Naloga 13: Prijava in registracija** — aurora prha, pravilna
  usmerjanja ob prijavi

## Checkpoint: Zasloni
- [x] Vseh dvanajst zaslonov pregledanih
- [x] Prazna stanja, napake in uspehi imajo besedilo
- [x] `npm test` in `npm run build` mimo

---

## Faza 4 — Javno

- [x] **Naloga 14: Javna stran `/`** — naslov, podnaslov, CTA, prikaz »Danes«
  z učnim pasom, možnosti, trije koraki, tri skupine, vprašanja, noga
- [x] **Naloga 15: Pravne strani** — tri strani z besedilom, vrzeli označene z
  `TODO(vsebina)`
- [x] **Naloga 16: SEO** — unikatni naslov in opis na stran, kanonični naslov,
  OG in Twitter oznake, JSON-LD, `robots.txt`, `sitemap.xml`, `llms.txt`,
  favicon in nova ikona

## Checkpoint: Javno
- [x] Javna stran deluje brez prijave
- [x] Meta, JSON-LD, robots in sitemap so prisotni
- [x] Vrzeli so navedene v `CONTENT.md`

---

## Faza 5 — Izdaja

- [x] **Naloga 17: Izhodna pripravljenost** — `base` iz okolja, `dist/404.html`,
  `vercel.json` z rewrites, Pages workflow z `BASE_PATH`, `.nojekyll`
- [x] **Naloga 18: Zmogljivost** — poti deljene, pisave samostojno shranjene,
  LCP 2001 ms namizni / 1440 ms mobilni, CLS 0.00
- [x] **Naloga 19: Kritika zasnova** — devet osi ocenjenih, blokirajoči in
  zahtevani popravki narejeni in ponovno posnetkani
- [x] **Naloga 20: Končno preverjanje** — lint, test, build mimo; izhod
  pregledan; commit

## Checkpoint: Končno
- [x] Vsi kriteriji iz `SPEC.md` izpolnjeni
- [x] Poročilo z zapisanimi številkami
- [ ] **Čaka na uporabnika:** `firebase deploy --only firestore:rules` (nova
  tema v pravilih) in dejanska domena v `src/config.js`
