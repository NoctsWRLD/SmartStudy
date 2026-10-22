# Todo — Scribe

- [ ] Slice 1 — rename to Scribe (code, docs, repo, Vercel, Firebase display name)
- [ ] Slice 2 — token layer, flat surfaces, no gradients anywhere
- [ ] Slice 3 — friend codes: generator, service, Firestore rules
- [ ] Slice 4 — friends screen: `+` button, blurred modal, code + name search, remove
- [ ] Slice 5 — Nastavitve: profile, account, code, appearance, study preferences, export/import, delete account
- [ ] Slice 6 — one structural device per screen
- [ ] Slice 7 — harden and deploy Firestore rules
- [ ] Slice 8 — SEO and legal pages for Scribe
- [ ] Slice 9 — lint, test, build, browser verification, Lighthouse

## Open questions for the owner
- Real public domain (the Vercel URL `smartstudyslo.vercel.app` is still referenced in
  `src/config.js` until the domain is settled).
- Operator name, address and contact e-mail for the imprint and privacy pages.
- Whether the Firebase project is on the Blaze plan (needed for a Cloud Function that
  removes other participants' messages when an account is deleted).
