/**
 * Preizkus pravil za zahtevo za prijateljstvo: isti zapis, ki ga naredi
 * aplikacija, plus poskusi z različnimi različicami, da se najde pogoj, ki
 * pravila zavračajo.
 *
 * Uporaba: node scripts/preizkus-zahteve.mjs
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

const email = process.argv[2] || 'scribe.preverba@example.com';
const password = process.argv[3] || 'ScribeTest123!';

const credential = await signInWithEmailAndPassword(auth, email, password);
const uid = credential.user.uid;

const senderProfile = await getDoc(doc(db, 'publicProfiles', uid));
console.log('posiljatelj:', uid, senderProfile.exists() ? senderProfile.data() : 'manjka');

const targetId = process.argv[4] || '7Atl443isYX0As7fyBafSl76tn52';
const targetProfile = await getDoc(doc(db, 'publicProfiles', targetId));
console.log('prejemnik:', targetId, targetProfile.exists() ? targetProfile.data() : 'manjka');

if (!senderProfile.exists() || !targetProfile.exists()) {
  console.log('brez obeh profilov ni mogoče poslati zahteve.');
  process.exit(0);
}

const fromName = senderProfile.data().displayName;
const toName = targetProfile.data().displayName;
const requestId = [uid, targetId].sort().join('_');

const attempts = [
  ['polno', {
    fromUid: uid,
    fromName,
    toUid: targetId,
    toName,
    status: 'pending',
    createdAt: serverTimestamp(),
  }],
  ['brez imen', {
    fromUid: uid,
    toUid: targetId,
    status: 'pending',
    createdAt: serverTimestamp(),
  }],
  ['imeni iz auth', {
    fromUid: uid,
    fromName: credential.user.displayName || 'Učenec',
    toUid: targetId,
    toName: credential.user.displayName || 'Učenec',
    status: 'pending',
    createdAt: serverTimestamp(),
  }],
];

for (const [label, data] of attempts) {
  try {
    await setDoc(doc(db, 'friendRequests', `${requestId}-${label}`), data);
    console.log(`poskus ${label}: uspešno`);
  } catch (error) {
    console.log(`poskus ${label}: NEUSPEŠNO —`, error.code);
  }
}

process.exit(0);
