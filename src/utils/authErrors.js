/**
 * Firebase reports what went wrong; the interface says what to do next.
 * Every message names the next step, and none of them blame the student.
 */
const MESSAGES = {
  'auth/wrong-password': 'Geslo ni pravilno. Vpiši geslo za svoj račun.',
  'auth/invalid-credential': 'Geslo ni pravilno. Vpiši geslo za svoj račun.',
  'auth/user-mismatch': 'Ta račun je prijavljen z drugačnim geslom.',
  'auth/weak-password': 'Novo geslo je prekratko. Uporabi vsaj 6 znakov.',
  'auth/invalid-email': 'E-poštni naslov ni veljaven. Preveri, ali vsebuje @ in domeno.',
  'auth/email-already-in-use': 'Ta e-poštni naslov je že zaseden.',
  'auth/requires-recent-login': 'Zaradi varnosti se moraš znova prijaviti in nato poskusiti še enkrat.',
  'auth/too-many-requests': 'Preveč poskusov zaporedoma. Počakaj minuto in poskusi znova.',
  'auth/network-request-failed': 'Povezava ni uspela. Preveri internet in poskusi znova.',
  'auth/missing-password': 'Vpiši geslo.',
  'auth/user-disabled': 'Ta račun je onemogočen. Obrni se na upravnika.',
  'permission-denied': 'Ta zbirka ni dovoljena. Poskusi znova ali se odjavi in prijavi.',
};

export function authErrorMessage(error) {
  if (!error) return 'Nekaj je šlo narobe. Poskusi znova.';
  const code = error.code || '';
  if (MESSAGES[code]) return MESSAGES[code];
  if (code === 'auth/invalid-email') return MESSAGES['auth/invalid-email'];
  if (code === 'auth/user-not-found') return 'Ta račun ne obstaja.';
  return 'Nekaj je šlo narobe. Poskusi znova.';
}
