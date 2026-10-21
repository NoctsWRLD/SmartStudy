# SmartStudy — redizajn: seznam nalog

Vir resnice: `SPEC.md` (zahteve), `tasks/plan.md` (načrt), `CONTENT.md` (besedilo).

Legenda: [ ] začen · [~] v teku · [x] končano

---

## Faza 1 — Temelj

- [x] **Naloga 1: Testna oprema in žetonska pogodba**
  - Sprejemljivo: `npm test` teče 11 testov, `test/setup.js` naloži jest-dom
  - Preverjanje: `npm test` · `npm run build`
  - Datoteke: `package.json`, `vite.config.js`, `test/setup.js`,
    `src/design-system/tokens.test.js`, `eslint.config.js`

- [x] **Naloga 2: Plast žetonov in tema `noc`**
  - Sprejemljivo: `src/index.css` ima plast 1/2/3; tema `noc` je privzeta;
    `dnevnik` in `noc` delita vse barvne žetone; stari id-ji se preslikajo
  - Preverjanje: `npm test` (pogodba žetonov) · `npm run lint`
  - Datoteke: `src/index.css`, `src/utils/themes.js`, `src/utils/colors.js`,
    `src/contexts/SettingsContext.jsx`

- [ ] **Naloga 3: Osnovni elementi in pisave**
  - Sprejemljivo: `Logo` uporablja aurora ploščico; `icons.jsx` vsebuje
    `SunIcon`, `MoonIcon`, `ChevronIcon`, `PlusIcon`, `CheckIcon`, `SparkIcon`,
    `TrashIcon`, `EditIcon`, `SearchIcon`; `Badge`, `Skeleton` in `EmptyState`
    uporabljajo le žetone
  - Preverjanje: `npm run lint` · `npm run build` · ogled v brskalniku
  - Datoteke: `src/components/Logo.jsx`, `src/components/icons.jsx`,
    `src/components/Badge.jsx`, `src/components/Skeleton.jsx`,
    `src/components/EmptyState.jsx`, `index.html`

## Checkpoint: Temelj
- [ ] `npm run lint` in `npm test` mimo
- [ ] `npm run build` uspešen
- [ ] Nova paleta je vidna brez napak v konzoli

---

## Faza 2 — Lupina

- [ ] **Naloga 4: `StudyRail`, `StatTile`, `EmptyState`**
  - Sprejemljivo: `StudyRail` izriše 7 segmentov, sprejme tone
    (`accent`/`warn`/`danger`/`muted`/`empty`) in ima `role="img"` z opisom;
    `StatTile` prikaže vrednost, oznako in ton; `EmptyState` prikaže naslov,
    razlago in akcijo
  - Preverjanje: `npm run lint` · `npm test` · ogled
  - Datoteke: `src/components/StudyRail.jsx`, `src/components/StatTile.jsx`,
    `src/components/EmptyState.jsx`

- [ ] **Naloga 5: `AppShell`**
  - Sprejemljivo: levi pas ≥1024 px z dvema skupinama, spodnja vrstica
    <1024 px s petimi cilji, ena plošča za preostalo, `Escape` zapre meni in
    vrne fokus
  - Preverjanje: `npm run lint` · ogled pri 1440 px in 390 px
  - Datoteke: `src/components/AppShell.jsx`, `src/components/SideNav.jsx`,
    `src/components/TopBar.jsx`, `src/components/MobileTabBar.jsx`,
    `src/components/Layout.jsx` (odstranjen)

- [ ] **Naloga 6: Preusmeritev in route struktura**
  - Sprejemljivo: `/` je javna stran, `/dashboard` je domov, prijavljen
    uporabnik na `/` pristane na `/dashboard`, `*` → `/`
  - Preverjanje: `npm test` (test varovanja poti) · `npm run build`
  - Datoteke: `src/App.jsx`, `src/components/ProtectedRoute.jsx`,
    `src/components/ProtectedRoute.test.jsx`

## Checkpoint: Lupina
- [ ] Vse strani se odprejo v novi lupini
- [ ] Nič napak v konzoli
- [ ] Ena glavna navigacija, ne tri

---

## Faza 3 — Zasloni

- [ ] **Naloga 7: Domov (`/dashboard`)**
  - Sprejemljivo: pozdrav z imenom, učni pas tedna, danešnje naloge, fokus,
    odštevanje do preverjanja, napredek predmetov
  - Preverjanje: `npm run build` · ogled pri 1440/768/390 px
  - Datoteke: `src/pages/DashboardPage.jsx`, `src/components/ExamCountdown.jsx`,
    `src/components/FocusTimer.jsx`, `src/components/WeekFocus.jsx`,
    `src/components/StudyTipCard.jsx`

- [ ] **Naloga 8: Naloge (`/tasks`)**
  - Sprejemljivo: povzetek, trije filtri, filter predmetov, sortiranje,
    iskanje, množično označevanje; filtriranje je izolirano v testirani
    funkciji
  - Preverjanje: `npm test` (test filtriranja) · `npm run build`
  - Datoteke: `src/pages/TasksPage.jsx`, `src/components/TaskCard.jsx`,
    `src/pages/TasksPage.test.jsx`

- [ ] **Naloga 9: Predmeti in preverjanja**
  - Sprejemljivo: kartončki predmetov z napredkom in barvo iz žetona;
    odštevanje do preverjanja v izolirani funkciji z testom
  - Preverjanje: `npm test` · `npm run build`
  - Datoteke: `src/pages/SubjectsPage.jsx`, `src/pages/ExamsPage.jsx`,
    `src/components/SubjectModal.jsx`, `src/utils/countdown.js`,
    `src/utils/countdown.test.js`

- [ ] **Naloga 10: Urnik**
  - Sprejemljivo: tedenska mreža, danes označen, mobilni dnevni pogled,
    uvoz iz slike deluje
  - Preverjanje: `npm run build` · ogled
  - Datoteke: `src/pages/SchedulePage.jsx`, `src/components/ScheduleImportModal.jsx`

- [ ] **Naloga 11: Kartice in klepet**
  - Sprejemljivo: obračanje kartice deluje, klepet ohrani kanale in sporočila
  - Preverjanje: `npm run build` · ogled
  - Datoteke: `src/pages/FlashcardsPage.jsx`, `src/pages/ChatPage.jsx`,
    `src/components/FlashcardModal.jsx`

- [ ] **Naloga 12: Prijatelji, profil, nastavitve**
  - Sprejemljivo: seznam prijateljev, urejanje profila, izbira teme iz novih
    žetonov, dostopnostna stikala
  - Preverjanje: `npm test` · `npm run build`
  - Datoteke: `src/pages/FriendsPage.jsx`, `src/pages/ProfilePage.jsx`,
    `src/pages/SettingsPage.jsx`

- [ ] **Naloga 13: Prijava in registracija**
  - Sprejemljivo: `AuthShell` z aurora prhi, prijava preusmeri na
    `/dashboard`, registracija preveri ujemanje gesel
  - Preverjanje: `npm run build` · ogled
  - Datoteke: `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`

## Checkpoint: Zasloni
- [ ] Vseh dvanajst zaslonov pregledanih
- [ ] Prazna stanja, napake in uspehi imajo besedilo
- [ ] `npm test` in `npm run build` mimo

---

## Faza 4 — Javno

- [ ] **Naloga 14: Javna stran `/`**
  - Sprejemljivo: naslov, podnaslov, CTA, prikaz »Danes« z učnim pasom,
    možnosti, trije koraki, tri skupine, vprašanja, zaključni poziv, noga
  - Preverjanje: `npm run build` · ogled pri 1440/768/390 px
  - Datoteke: `src/pages/LandingPage.jsx`, `src/components/SiteHeader.jsx`,
    `src/components/SiteFooter.jsx`

- [ ] **Naloga 15: Pravne strani**
  - Sprejemljivo: tri strani z besedilom, vrzeli označene z `TODO(vsebina)`;
    nobena trditev o skladnosti, ki ni pregledana
  - Preverjanje: `npm run build` · ogled
  - Datoteke: `src/pages/PrivacyPage.jsx`, `src/pages/ImprintPage.jsx`,
    `src/pages/AccessibilityPage.jsx`, `src/components/LegalProse.jsx`

- [ ] **Naloga 16: SEO**
  - Sprejemljivo: unikatni naslov in opis na stran, kanonični naslov, OG in
    Twitter oznake, JSON-LD `WebSite` + `SoftwareApplication`, `robots.txt`,
    `sitemap.xml` s pravimi naslovi, favicon
  - Preverjanje: `npm run build` · pregled `dist/index.html`
  - Datoteke: `index.html`, `src/components/Seo.jsx`, `public/robots.txt`,
    `public/sitemap.xml`, `public/.nojekyll`

## Checkpoint: Javno
- [ ] Javna stran deluje brez prijave
- [ ] Meta, JSON-LD, robots in sitemap so prisotni
- [ ] Vrzeli so navedene v `CONTENT.md`

---

## Faza 5 — Izdaja

- [ ] **Naloga 17: Izhodna pripravljenost**
  - Sprejemljivo: `base` iz okolja, `dist/404.html` obstaja, `vercel.json` z
    rewrites, Pages workflow z `BASE_PATH`, `.nojekyll`
  - Preverjanje: `BASE_PATH=/SmartStudy/ npm run build` · `ls dist/404.html` ·
    `grep -o 'src="[^"]*"' dist/index.html`
  - Datoteke: `vite.config.js`, `vercel.json`, `.github/workflows/deploy.yml`,
    `public/.nojekyll`

- [ ] **Naloga 18: Zmogljivost**
  - Sprejemljivo: poti so deljene z `React.lazy`, pisave se nalagajo prek
    `<link>` s `preconnect`, slike imajo `width`/`height`
  - Preverjanje: `npm run build` (velikost paketov) · Lighthouse
  - Datoteke: `src/App.jsx`, `index.html`

- [ ] **Naloga 19: Kritika zasnova**
  - Sprejemljivo: posnetki pri 1440/768/390 px in en primer pod obremenitvijo;
    vseh devet osi ocenjenih; vsi blokirajoči in zahtevani ugotovitve popravljeni
  - Preverjanje: ponovno posnetkanje po popravkih
  - Datoteke: po potrebi komponente

- [ ] **Naloga 20: Končno preverjanje**
  - Sprejemljivo: `npm run lint`, `npm test`, `npm run build` mimo; izhod
    pregledan; commit z opisom, kaj spletna stran je
  - Preverjanje: vse tri ukaza + `git log -1`
  - Datoteke: vse, kar je ostalo

## Checkpoint: Končno
- [ ] Vsi kriteriji iz `SPEC.md` izpolnjeni
- [ ] Poročilo z zapisanimi številkami
