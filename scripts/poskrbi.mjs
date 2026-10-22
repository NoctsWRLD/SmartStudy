/**
 * Čiščenje preizkusnih podatkov: pobriše zahteve za prijateljstvo in
 * dokumente računa, ki so nastali med preizkusom pravil.
 *
 * Uporaba: node scripts/poskrbi.mjs [e-pošta] [geslo]
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  where,
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

const outgoing = await getDocs(query(collection(db, 'friendRequests'), where('fromUid', '==', uid)));
for (const document of outgoing.docs) {
  await deleteDoc(document.ref);
  console.log('izbrisana zahteva:', document.id);
}

const incoming = await getDocs(query(collection(db, 'friendRequests'), where('toUid', '==', uid)));
for (const document of incoming.docs) {
  await deleteDoc(document.ref).catch(() => {});
  console.log('izbrisana prejeta zahteva:', document.id);
}

for (const name of ['subjects', 'tasks', 'exams', 'flashcards', 'focusSessions']) {
  const snapshot = await getDocs(query(collection(db, name), where('uid', '==', uid)));
  for (const document of snapshot.docs) {
    await deleteDoc(document.ref);
    console.log(`izbrisan dokument ${name}:`, document.id);
  }
}

const code = (await import('firebase/firestore')).getDoc;
void code;

process.exit(0);
