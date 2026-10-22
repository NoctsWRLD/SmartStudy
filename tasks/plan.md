# Plan — Scribe

Vertical slices. Each slice ships green: `npm run lint`, `npm test`, `npm run build`.

## Slice 1 — Rename to Scribe
- **Files:** `src/config.js`, `src/index.html` (via `index.html`), `src/components/Logo.jsx`,
  `src/components/SideNav.jsx`, `src/components/TopBar.jsx`, `src/pages/*` headings,
  `src/pages/LandingPage.jsx`, `src/pages/PrivacyPage.jsx`, `src/pages/ImprintPage.jsx`,
  `src/pages/AccessibilityPage.jsx`, `README.md`, `AGENTS.md`, `package.json`,
  `public/robots.txt`, `public/sitemap.xml`.
- **Acceptance:** no occurrence of "SmartStudy"/"smartstudy" in `src/`, `public/`,
  `README.md`, `package.json` except the Firebase project id and the historical
  `smartstudyslo.vercel.app` URL until the domain is settled; wordmark renders "Scribe";
  meta titles and OG copy say Scribe.
- **Commit:** `Preimenuj aplikacijo v Scribe`

## Slice 2 — Token layer + flat surfaces
- **Files:** `src/index.css`, `src/design-system/tokens.test.js`, `src/utils/themes.js`,
  `src/components/Logo.jsx`, `src/components/FocusTimer.jsx`,
  `src/pages/FlashcardsPage.jsx`, `src/pages/SettingsPage.jsx`,
  `src/components/SiteShell.jsx`, `src/components/AuthShell.jsx`,
  `src/components/FirebaseSetupNotice.jsx`, `src/pages/LandingPage.jsx`.
- **Acceptance:** token test passes; no `gradient` in the stylesheet or components;
  logo is a flat ink square with the book glyph; rail fill is flat accent; the hero
  has no aurora wash; theme display names are "Noč" and "Dan".
- **Commit:** `Uvedi token sistem Scribe brez gradientov`

## Slice 3 — Friend codes (data + rules)
- **Files:** `src/utils/friendCode.js` (+ test), `src/services/friendService.js`,
  `firestore.rules`.
- **Acceptance:** code generator produces 6 unambiguous characters and is
  deterministic-testable; the code document is written once per account and looked up
  by id; rules allow only the owner to create a code and no one to update it.
- **Commit:** `Dodaj kode prijateljev in pravila Firestore`

## Slice 4 — Friends screen and modal
- **Files:** `src/pages/FriendsPage.jsx`, `src/components/AddFriendModal.jsx`,
  `src/hooks/useChat.js`, `src/components/Modal.jsx` (backdrop blur).
- **Acceptance:** a `+` button on every search result opens the modal over a blurred
  background; the modal searches by code and by name; a request can be sent, accepted,
  rejected and withdrawn; a friend can be removed; every state has Slovenian copy;
  unit tests cover code normalisation and pair-id derivation.
- **Commit:** `Dopolni dodajanje in brisanje prijateljev`

## Slice 5 — Nastavitve (account, preferences, data, danger zone)
- **Files:** `src/pages/SettingsPage.jsx`, `src/pages/ProfilePage.jsx`,
  `src/contexts/SettingsContext.jsx`, `src/contexts/AuthContext.jsx`,
  `src/services/profileService.js`, `src/services/accountService.js`,
  `src/components/ReauthModal.jsx`, `src/utils/preferences.js` (+ test).
- **Acceptance:** profile, e-mail, password, friend code, appearance, study
  preferences, export/import and account deletion all live in Nastavitve; e-mail and
  password changes require the current password; import validates the file before
  writing; deletion removes the user's Firestore documents and the auth account.
- **Commit:** `Združi nastavitve računa in dodaj nevarno območje`

## Slice 6 — Screen differentiation
- **Files:** `src/pages/DashboardPage.jsx`, `TasksPage.jsx`, `SubjectsPage.jsx`,
  `ExamsPage.jsx`, `FlashcardsPage.jsx`, `SchedulePage.jsx`, `ChatPage.jsx`,
  `LandingPage.jsx`, `src/components/*` (ledger, sheet, tab primitives).
- **Acceptance:** each screen uses the device named in SPEC §4; lists are ledger rows
  with hairline separators; the landing hero is a ruled sheet of today's entries; no
  two screens share the same layout skeleton; every screen keeps its empty, loading
  and error states.
- **Commit:** `Vsakemu zaslonu daj svojo strukturo`

## Slice 7 — Security hardening and rules deploy
- **Files:** `firestore.rules`, `src/services/accountService.js`.
- **Acceptance:** rules are tightened (no cross-user writes, whitelisted keys, names
  bound to the server profile, one request per pair, own-messages deletion);
  `firebase deploy --only firestore:rules` succeeds; the deployed rules are listed in
  the report.
- **Commit:** `Okrepi in namesti pravila Firestore`

## Slice 8 — SEO and legal
- **Files:** `src/config.js`, `src/hooks/useSeo.js`, `src/utils/pageTitles.js`,
  `src/pages/PrivacyPage.jsx`, `ImprintPage.jsx`, `AccessibilityPage.jsx`,
  `public/robots.txt`, `public/sitemap.xml`, `index.html`.
- **Acceptance:** every route has a unique title and description, canonical URL and
  OG tags; sitemap lists the real public routes; the legal pages name Google/Firebase
  as the processor and mark the operator details as gaps.
- **Commit:** `Posodobi SEO in pravne strani za Scribe`

## Slice 9 — Verification
- **Files:** none (verification only).
- **Acceptance:** lint, tests and build pass; the app was opened in Chromium at
  1440/768/390 with no console errors; Lighthouse desktop and mobile scores recorded.
