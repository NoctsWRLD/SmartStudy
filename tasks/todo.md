# Todo — Scribe

- [x] Slice 1 — rename to Scribe (code, docs, repo `NoctsWRLD/Scribe`, Vercel project `scribe`, Firebase display name)
- [x] Slice 2 — token layer, flat surfaces, no gradients anywhere
- [x] Slice 3 — friend codes: generator, service, Firestore rules
- [x] Slice 4 — friends screen: `+` button, blurred modal, code + name search, accept / reject / withdraw / remove
- [x] Slice 5 — Nastavitve: profile, account, code, appearance, study preferences, export/import, delete account
- [x] Slice 6 — one structural device per screen
- [x] Slice 7 — hardened rules deployed to Firebase (`firebase deploy --only firestore:rules`)
- [x] Slice 8 — SEO and legal pages for Scribe
- [x] Slice 9 — lint, test, build, browser verification, Lighthouse (desktop 100, mobile 92)
- [x] Extra — 2px corners everywhere and one button system
- [x] Extra — the login code loads only when a session is needed (mobile Lighthouse 77 → 92)

## Open questions for the owner
- Real public domain (currently `https://scribeslo.vercel.app` in `src/config.js`).
- Operator name, address, tax number and contact e-mail for the imprint and privacy policy.
- Whether the Firebase project is on the Blaze plan — needed only if account deletion should
  also remove other participants' chat messages server-side.
