# SPEC — Scribe

**Product:** Scribe — the school day in one notebook.
**Type:** Student planning app (subjects, homework, exams, flashcards, timetable, chat, friends).
**Audience:** Secondary-school and university students (Slovenian UI).
**Stack:** React 19, Vite 7, Tailwind CSS 4, Firebase 12 (Auth + Cloud Firestore), Vitest 5.
**Deploy:** GitHub Pages (`/Scribe/` base) and Vercel (`/` base), from one codebase.

---

## 1. Objective

Make every existing function of the app better, make the ten screens visibly different from
one another, remove the decorative gradients so the product reads as a study tool rather
than a marketing site, move all account configuration into **Nastavitve**, and make the
friends feature work end to end against Firestore with hardened security rules.

Non-goals: no new product category, no analytics, no third-party embeds, no notifications
push infrastructure (the reminder preference is stored and surfaced, not scheduled).

---

## 2. Naming

The product is **Scribe** (replaces *SmartStudy*).

| Where | Value |
| --- | --- |
| UI wordmark, page titles, meta, OG copy | `Scribe` |
| Tagline | `Zapiši. Nauči se.` / `Write it down. Learn it.` |
| GitHub repo | `NoctsWRLD/Scribe` |
| Vercel project | `scribe` |
| Firebase project display name | `Scribe` (project **id** `smartstudy-e0d05` cannot be renamed) |
| Theme ids | `noc` (dark, "Noč"), `dnevnik` (light, display name "Dan") — ids unchanged, no data migration |

---

## 3. Design direction — the ruled schoolbook

The app stops looking like a SaaS dashboard and looks like the student's own notebook.

- **Ruled rows, not the card kit.** Lists are continuous ledger rows separated by
  hairlines (`ledger` / `ledger-row`). Cards survive only where content is card-like
  (flashcards, binder tabs for subjects).
- **Margin rule.** A 2px accent rule in the gutter (`.margin-rule`) marks the page
  section, like the margin column of an exercise book.
- **One pen colour.** Ink violet `--rp-accent`. The highlighter is *data* (subject
  colour, urgency, progress) and never decoration.
- **No gradients.** The aurora is deleted from the tokens, the logo, the hero, the
  rail fill, the focus arc and the progress bars. Flat fills only.
- **Mono for data.** Times, dates, counts, countdown numbers and friend codes are set
  in a system monospace stack, tabular. A ledger reads in columns.
- **One orchestrated motion.** The page header settles in; everything else moves only
  in response to an action.

### Token system (`src/index.css`)

| Group | Tokens |
| --- | --- |
| Surfaces | `rp-canvas`, `rp-panel`, `rp-raised`, `rp-overlay`, `rp-sunken` |
| Text | `rp-text`, `rp-subtle`, `rp-muted` |
| Lines | `rp-line`, `rp-line-strong`, `rp-fill`, `rp-rule` (margin rule) |
| Action | `rp-accent`, `rp-accent-hover`, `rp-accent-ink` |
| Status | `rp-warn`, `rp-danger`, `rp-success`, `rp-info` |
| Data hues | `rp-subject-1` … `rp-subject-10` |
| Type | `--font-display` (Space Grotesk), `--font-sans` (DM Sans), `--font-mono` (system) |
| Scale | `display / hero / page / title / subtitle / body / small / label`, each with line height and tracking |
| Spacing | 4px base: `--spacing-1` … `--spacing-24` |
| Radius | One value: **2px** (`xs / sm / md / lg / xl / 2xl` all resolve to it). The paper has corners, not pills. Only avatars and switch knobs stay round. |
| Buttons | One geometry: `.btn` (height, weight, 1px border, 2px corner). Three fills — plain, `.btn-primary`, `.btn-danger` — plus `.btn-sm`, `.btn-lg`, `.btn-icon`, `.btn-link`. |
| Elevation | `--rp-shadow-1/2/3` — nearly flat; rules do the separating |
| Motion | `--rp-duration-fast/base/slow`, `--rp-ease`, `--rp-ease-out`, `prefers-reduced-motion` honoured |

Palette:

| Token | Noč (dark, default) | Dan (light) |
| --- | --- | --- |
| canvas / panel / raised | `#0b1020` / `#121a33` / `#182140` | `#f4f5f8` / `#ffffff` / `#ffffff` |
| text / subtle / muted | `#f1f4ff` / `#bcc5e8` / `#8e98c2` | `#0e1226` / `#414a6b` / `#5c6485` |
| accent / hover / ink | `#9b8cff` / `#b0a4ff` / `#0b1020` | `#4f46e5` / `#3f38c9` / `#ffffff` |
| success / warn / danger / info | `#46d39a` / `#e8a44c` / `#f2778a` / `#6fa8ff` | `#0a6b54` / `#8f5806` / `#b03149` / `#1d4ed8` |

`src/design-system/tokens.test.js` is the contract: both themes define the same token
set, every fg/bg pairing meets WCAG AA, the margin rule reaches 3:1, and the stylesheet
contains no gradient at all.

---

## 4. Pages and their structural device

Every screen uses a different device, so no two screens read the same.

| Route | Screen | Device |
| --- | --- | --- |
| `/` | Landing | A ruled sheet showing today's real entries — the interface is the hero. No gradient wash, no stat row. |
| `/dashboard` | Domov | Day sheet: margin rule, sticky header, ruled week strip in flat accent. |
| `/tasks` | Naloge | Ledger: ruled rows, due date in mono, sticky filter bar, bulk toolbar. |
| `/subjects` | Predmeti | Binder tabs: subjects as coloured index tabs with slot counts and a progress rule. |
| `/exams` | Preverjanja | Countdown spine: one descending column, large mono countdown, date block. |
| `/flashcards` | Kartice | Flash-card stack — the one place a card is right. Flat accent progress bar. |
| `/schedule` | Urnik | Weekly grid with ruled cells; OCR import unchanged. |
| `/chat` | Klepet | Channel list + thread, mono timestamps, blurred overlay menu. |
| `/friends` | Prijatelji | Address book: ruled rows, a `+` button per row opening the blurred modal. |
| `/profile` | Moj profil | Index card of the user; read-only summary + link into Nastavitve. |
| `/settings` | Nastavitve | Catalogue: one section per topic, including the danger zone. |
| `/login`, `/register` | Auth | Split sheet; flat accent panel replaces the aurora wash. |
| `/pravilnik-o-zasebnosti`, `/impressum`, `/dostopnost` | Legal | Prose pages, no chrome. |

---

### Button and corner rules

- Every corner in the product is 2px. There is one button geometry, defined once
  in the `components` layer so a Tailwind utility can still override it.
- Exactly one primary action per view; everything else is the plain button.
- Icon-only controls use `.btn-icon` and always carry an `aria-label`.

## 5. Friends — the worked feature

### Data model

- `userCodes/{code}` → `{ uid, createdAt }`. The code is the primary key, so lookup is a
  single document read and two users can never share a code.
- Code format: 6 characters from an unambiguous alphabet (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`),
  upper-case, generated client-side and written once.
- `friendRequests/{pairId}` where `pairId` is the two uids sorted and joined. A
  deterministic id means one request per pair: a second attempt fails instead of
  creating a duplicate.

### Add a friend

1. Each row in the search results and each person in the name list carries a small **+**
   button.
2. It opens a modal over a **blurred backdrop** (`backdrop-blur-md`, canvas at 80%).
3. The modal has two tabs:
   - **Po kodah** — paste a 6-character code. The app resolves it to exactly one person,
     shows name, initials and school, and enables *Pošlji zahtevo*.
   - **Po imenu** — name search; every result shows the person's code so the right
     classmate can be picked among identical names.
4. States: idle, invalid code, code not found, already a friend, request already sent,
   yourself, sending, sent.

### Remove a friend

- `Odstrani` on a friend row deletes the accepted request document from both sides, so
  the friendship disappears for both users.
- A pending request can be withdrawn by its sender, or rejected by its receiver.

### Rules (enforced server-side, deployed)

- A request can only be created by its sender, to a **different** uid that has a public
  profile, with names that match the server-side profiles, and with a `pending` status.
- A request can only be answered by its receiver, and only from `pending`.
- A request can be deleted by its sender or receiver (withdraw / unfriend).
- `userCodes` documents can be created only by the uid they point at, read only by
  signed-in users, and never updated.

---

## 6. Nastavitve — all account configuration in one place

| Section | Contents |
| --- | --- |
| **Profil** | Display name, school, avatar initial — saved to Firestore. |
| **Račun** | E-mail change (verified by the current password), password change, sign-out everywhere. |
| **Prijatelji** | The user's own code, copy button, regenerate, explanation. |
| **Videz** | Theme (Noč / Dan), high contrast, reduced motion. |
| **Učne nastavitve** | Default focus length, daily reminder time, deadline warning window, week start, language of dates. Stored in the user's Firestore profile. |
| **Podatki** | Export JSON (existing), import JSON (new). |
| **Nevarno območje** | Delete the account: wipes the user's Firestore documents and deletes the Firebase Auth account. Two-step confirmation. |

E-mail and password changes re-authenticate with `EmailAuthProvider` before the change is
attempted, and report a precise error ("Preveri geslo" vs. "Nova e-pošta ni veljavna").

---

## 7. Security

- Firebase Security Rules live in `firestore.rules` and are **deployed**
  (`firebase deploy --only firestore:rules`).
- No client can write another user's documents; `uid` is bound to `request.auth.uid`.
- Profile fields have strict key whitelists, length limits and type checks.
- `publicProfiles` exposes only display name, search name, avatar and the code — never
  e-mail or school.
- Chat writes are limited to the participants; message content is length-checked.
- Friend requests are bound to server-side names (no impersonation) and to one per pair.
- Deleting the account removes the user's documents and their own messages.

---

## 8. Accessibility

- WCAG AA on every fg/bg pairing, checked by the token test.
- Keyboard: visible focus ring on everything interactive, focus trap and restore in
  modals, Escape closes.
- `prefers-reduced-motion` and the in-app motion switch both stop animation.
- Screen reader labels on icon-only controls, `aria-live` on status messages,
  `aria-pressed` on toggles, semantic landmarks and headings per screen.
- Target size ≥ 40px on primary touch controls.

---

## 9. Content inventory and gaps

Slovenian throughout. Voice: plain, second person, no exclamation marks, one verb per
button, the button's verb repeated in the confirmation.

Priority slots written for this round: the landing headline and subhead, the friends
modal (tabs, labels, empty / error / success states), the settings section headings and
helper texts, the account-deletion confirmation, and the empty states of every list.

**Open gaps** (need information only the owner has; the full list with locations is in
`CONTENT.md`): legal operator name, address and tax number for the imprint, the contact
e-mail, the lawful basis and retention period, a privacy-policy review by a lawyer,
confirmation of the final public domain, and the Firebase Blaze plan needed for a Cloud
Function if account deletion is ever to remove other people's messages server-side.

---

## 10. Definition of done

- `npm run lint`, `npm run build`, `npm test` pass.
- Every screen in §4 has its own device; no screen is a re-skin of another.
- No gradient exists in the stylesheet or in any component.
- Every corner is 2px and every button uses the single `.btn` system.
- Friends can be added by code or by name through a blurred modal, and removed, and the
  changes survive a page reload (they are in Firestore).
- Nastavitve contains profile, account, friends code, appearance, study preferences,
  data export/import and account deletion.
- Firestore rules are hardened and deployed.
- `dist/index.html` references assets under the environment base path, `dist/404.html`
  exists, `vercel.json` and the Pages workflow are in place.
- The GitHub repository is `NoctsWRLD/Scribe` and the Vercel project is `scribe`.
