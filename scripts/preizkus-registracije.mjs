/**
 * Preizkus registracije: kaj se zgodi ob ustvarjanju računa in zakaj
 * uporabnikov dokument nastane ali ne.
 *
 * Uporaba: node scripts/preizkus-registracije.mjs [e-pošta] [geslo]
 */
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^"|"$/g, '')];
    }),
);

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

const email = process.argv[2] || `preizkus-${Date.now()}@example.com`;
const password = process.argv[3] || 'ScribeTest123!';

const result = await createUserWithEmailAndPassword(auth, email, password);
console.log('račun ustvarjen:', result.user.uid);

try {
  await updateProfile(result.user, { displayName: 'Testni Učenec' });
  console.log('updateProfile: uspešno, displayName =', result.user.displayName);
} catch (error) {
  console.log('updateProfile: NEUSPEŠNO —', error.code, error.message);
}

try {
  await setDoc(doc(db, 'users', result.user.uid), {
    displayName: 'Testni Učenec',
    email,
    school: '',
    photoURL: '',
    createdAt: serverTimestamp(),
  });
  console.log('dokument users: uspešno');
} catch (error) {
  console.log('dokument users: NEUSPEŠNO —', error.code, error.message);
}

try {
  await setDoc(doc(db, 'publicProfiles', result.user.uid), {
    displayName: 'Testni Učenec',
    searchName: 'Testni Učenec'.toLocaleLowerCase('sl-SI'),
    photoURL: '',
    createdAt: serverTimestamp(),
  });
  console.log('dokument publicProfiles: uspešno');
} catch (error) {
  console.log('dokument publicProfiles: NEUSPEŠNO —', error.code, error.message);
}

const snapshot = await getDoc(doc(db, 'users', result.user.uid));
console.log('users obstaja:', snapshot.exists());

process.exit(0);
