/**
 * Napolni testni račun z vsebino, da je zaslon mogoče pregledati z realnimi
 * podatki (naloge, predmet, preverjanje, kartice).
 *
 * Uporaba: node scripts/napolni-testne-podatke.mjs [e-pošta] [geslo]
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, getFirestore, serverTimestamp, updateDoc } from 'firebase/firestore';
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

const today = new Date();
const key = (offset) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const subjects = [
  { name: 'Matematika', colorIndex: 0 },
  { name: 'Fizika', colorIndex: 5 },
  { name: 'Slovenščina', colorIndex: 1 },
];

const subjectIds = [];
for (const subject of subjects) {
  const created = await addDoc(collection(db, 'subjects'), {
    ...subject,
    uid,
    createdAt: serverTimestamp(),
  });
  subjectIds.push(created.id);
}
console.log('predmeti:', subjectIds.length);

const tasks = [
  { title: 'Reši enačbo s tremi neznankami', description: 'Stran 42, naloga 7.', subjectId: subjectIds[0], dueDate: key(0), completed: false },
  { title: 'Ponovi odvod derivacije', description: 'Pripravi list z nalogami.', subjectId: subjectIds[1], dueDate: key(1), completed: false },
  { title: 'Napiši esej o pravljih', description: '1500 besed, vir: drama.', subjectId: subjectIds[2], dueDate: key(3), completed: false },
  { title: 'Preberi poglavje 4', description: '', subjectId: subjectIds[2], dueDate: key(-2), completed: false },
  { title: 'Izračunaj navor na vozniku', description: '', subjectId: subjectIds[1], dueDate: '', completed: false },
];

let doneId = null;
for (const task of tasks) {
  const created = await addDoc(collection(db, 'tasks'), {
    ...task,
    uid,
    createdAt: serverTimestamp(),
  });
  if (task.title === 'Preberi poglavje 4') doneId = created.id;
}
// Pravila dovolijo ustvariti nalogo v stanju "neopravljeno"; zaključeno
// nalogo označi šele s posodobitvijo, tako kot aplikacija.
if (doneId) await updateDoc(doc(db, 'tasks', doneId), { completed: true });
console.log('naloge:', tasks.length);

await addDoc(collection(db, 'exams'), {
  title: 'Pisni izpit iz matematike',
  subjectId: subjectIds[0],
  date: key(6),
  uid,
  createdAt: serverTimestamp(),
});
await addDoc(collection(db, 'exams'), {
  title: 'Kemija — zapisna esej',
  subjectId: subjectIds[1],
  date: key(13),
  uid,
  createdAt: serverTimestamp(),
});
console.log('preverjanja: 2');

const cards = [
  { front: 'Kaj je foton?', back: 'Delec elektromagnetnega sevanja.' },
  { front: 'Kako se izračuna delo?', back: 'W = F · s.' },
  { front: 'Kdaj uporabimo genitiv?', back: 'Za lastnost, izvor, vrsto.' },
];
for (const card of cards) {
  await addDoc(collection(db, 'flashcards'), {
    subjectId: subjectIds[0],
    front: card.front,
    back: card.back,
    known: false,
    uid,
    createdAt: serverTimestamp(),
  });
}
console.log('kartice:', cards.length);

process.exit(0);
