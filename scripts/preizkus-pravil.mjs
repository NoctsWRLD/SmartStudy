/**
 * Preizkus pravil Firebase iz Node.js: prijava, uporabnikov dokument,
 * prijateljska koda in brisanje kode — točno tisto, kar aplikacija dela.
 *
 * Uporaba: node scripts/preizkus-pravil.mjs
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
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

const email = process.argv[2] || 'scribe.preverba@example.com';
const password = process.argv[3] || 'ScribeTest123!';

const credential = await signInWithEmailAndPassword(auth, email, password);
const uid = credential.user.uid;
console.log('prijava:', uid);

const userRef = doc(db, 'users', uid);
const snapshot = await getDoc(userRef);
console.log('dokument users obstaja:', snapshot.exists());

if (!snapshot.exists()) {
  try {
    await setDoc(userRef, {
      displayName: 'Testni Učenec',
      email,
      school: '',
      photoURL: '',
      createdAt: serverTimestamp(),
    });
    console.log('ustvarjanje users: uspešno');
  } catch (error) {
    console.log('ustvarjanje users: NEUSPEŠNO —', error.code, error.message);
  }
}

// nova koda pri vsakem preizkusu, da se ne trči z obstoječim dokumentom
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
let code = '';
for (let i = 0; i < 6; i += 1) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

try {
  await updateDoc(userRef, { friendCode: code });
  console.log('pisanje kode v profil: uspešno —', code);
} catch (error) {
  console.log('pisanje kode v profil: NEUSPEŠNO —', error.code, error.message);
}

try {
  await setDoc(doc(db, 'userCodes', code), { uid, createdAt: serverTimestamp() });
  console.log('dokument kode: uspešno');
} catch (error) {
  console.log('dokument kode: NEUSPEŠNO —', error.code, error.message);
}

try {
  await deleteDoc(doc(db, 'userCodes', code));
  console.log('brisanje kode: uspešno');
} catch (error) {
  console.log('brisanje kode: NEUSPEŠNO —', error.code, error.message);
}

process.exit(0);
