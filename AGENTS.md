# SmartStudy

A student planning app: subjects, tasks, timetable, chat with classmates, and
flashcards. UI copy is **Slovenian**; timestamps use the `Europe/Ljubljana`
timezone.

## Stack

- **React 19** + **React Router 7** (protected routes in `src/components/ProtectedRoute.jsx`)
- **Vite 7** — dev server and build
- **Tailwind CSS 4** via the `@tailwindcss/vite` plugin
- **Firebase 12** — Auth + Cloud Firestore, real-time via `onSnapshot`
- **tesseract.js** — OCR for importing a timetable from an image

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint (flat config) |
| `npm run preview` | Serve the production build locally |

`npm run lint` must pass before a change is considered done.

## Layout

```
src/
  pages/       one file per screen (Login, Register, Dashboard, Tasks, …)
  components/  reusable UI (modals, cards, Layout, ProtectedRoute)
  contexts/    AuthContext, SettingsContext
  hooks/       useFirestore, useStudy, useChat — all Firestore access lives here
  utils/       dates, colors, timetable helpers
  firebase.js  app initialization only
```

## Conventions

- **Firestore access goes through `src/hooks/`.** `useFirestore.js`,
  `useStudy.js` and `useChat.js` own the `onSnapshot` listeners and the
  queries. Components and pages consume hooks, they do not call Firestore
  directly. Adding a new collection means adding a hook.
- **`src/firebase.js` is the only place that initializes the app.** It exports
  `app`, `auth`, `db` and `isFirebaseConfigured`, and reads `VITE_FIREBASE_*`
  from the environment. The `isFirebaseConfigured` guard exists so the app can
  render a setup screen instead of crashing when config is missing — do not
  remove it, and do not read `import.meta.env` for Firebase keys anywhere else.
- **SDK functions come from `firebase/firestore` / `firebase/auth`; instances
  come from `../firebase`.** Keep that split — it is why `db` and `auth` are
  `null` when unconfigured and every consumer can check
  `isFirebaseConfigured` first.
- **ESLint flat config** in `eslint.config.js`: `js.configs.recommended` plus
  the `reactHooks` and `reactRefresh` (Vite) presets. Only `*.js` and `*.jsx`
  are linted. `no-unused-vars` ignores `^[A-Z_]` (components and constants).
- **Tailwind 4, no separate config file.** Utilities live in `src/index.css`
  and are applied in JSX. Do not add a `tailwind.config.js`.
- Keep user-facing strings in Slovenian to match the rest of the UI.

## Testing

**There is no test runner configured.** The `test-driven-development` and
`browser-testing-with-devtools` skills both assume one exists.

Before using TDD here, set up Vitest — it shares Vite's config, so it needs no
extra build tooling:

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

and add `"test": "vitest"` to `package.json` scripts. Firestore and Auth need
mocks; `firebase/firestore` can be stubbed with `vi.mock`.

## Security

- `VITE_FIREBASE_*` values are **bundled into the client and are public by
  design.** Never put a real secret in a `VITE_` variable, and never put
  service-account credentials in this repo. `.env.example` says so — keep it
  that way.
- Actual access control lives in **Firebase Security Rules**, in the Firebase
  console, not in this repo. Any change that widens what a client can read or
  write must be checked against those rules — assume the client is hostile.
- `.env.local` is gitignored. Only `.env.example` is committed.

## Deployment

The app ships to **both** GitHub Pages and Vercel from the same codebase.

**Base path.** `vite.config.js` uses `base: process.env.BASE_PATH || '/'`. It is
never hardcoded, because the two targets need different values:

| Target | `base` | Set by |
| --- | --- | --- |
| Local dev | `/` | unset |
| Vercel | `/` | unset |
| GitHub Pages project site | `/SmartStudy/` | `actions/configure-pages` `base_path` output |

**Client-side routing.** `src/App.jsx` uses `BaseRouter` (in
`src/components/BaseRouter.jsx`), not `BrowserRouter` directly. It sets the router
`basename` from `import.meta.env.BASE_URL` and restores the path stashed by the
Pages `404.html` fallback. **Use `BaseRouter` in any new entry point** — a plain
`BrowserRouter` breaks every deep link on GitHub Pages.

The `404.html` fallback is emitted by the `githubPagesSpaFallback` plugin in
`vite.config.js` at build time, with the base baked in. If you add a second build
target with a different base, that plugin is what keeps deep links working.

**Commands**

- GitHub Pages — push to `main`; `.github/workflows/deploy.yml` builds with the
  correct `BASE_PATH` and deploys.
- Vercel — `vercel --prod` locally, or connect the repo in the Vercel dashboard for
  automatic deploys and per-PR previews.

**Environment variables.** `VITE_FIREBASE_*` are set in the Vercel dashboard and in
the GitHub Actions environment — never in a committed file. They are baked into the
client bundle and are public.

**Before calling a deploy done**, check the live URL: assets must resolve from the
right base, and a deep link must return the app rather than a 404. A green build
does not prove either.
