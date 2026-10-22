import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseDb';

/**
 * Everything that reads or writes the user's own Firestore documents. Kept
 * apart from the auth context so the database SDK can be loaded on demand.
 */

export async function ensurePublicProfile(uid, displayName) {
  const name = displayName || 'Učenec';
  const publicProfileRef = doc(db, 'publicProfiles', uid);
  const publicProfile = await getDoc(publicProfileRef);
  if (!publicProfile.exists()) {
    await setDoc(publicProfileRef, {
      displayName: name,
      searchName: name.toLocaleLowerCase('sl-SI'),
      photoURL: '',
      createdAt: serverTimestamp(),
    });
  }
}

export async function createUserProfile(uid, { displayName, email }) {
  await setDoc(doc(db, 'users', uid), {
    displayName,
    email,
    school: '',
    photoURL: '',
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'publicProfiles', uid), {
    displayName,
    searchName: displayName.toLocaleLowerCase('sl-SI'),
    photoURL: '',
    createdAt: serverTimestamp(),
  });
}

export async function updateProfileDocuments(uid, { displayName, school }) {
  await updateDoc(doc(db, 'users', uid), {
    ...(displayName ? { displayName } : {}),
    ...(school !== undefined ? { school } : {}),
  });
  if (displayName) {
    await setDoc(doc(db, 'publicProfiles', uid), {
      displayName,
      searchName: displayName.toLocaleLowerCase('sl-SI'),
    }, { merge: true });
  }
}

export function watchUserProfile(uid, onData) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) onData({ uid: snap.id, ...snap.data() });
  });
}

/** Store the study preferences on the user's own document. */
export async function updatePreferences(uid, preferences) {
  const { normalizePreferences } = await import('../utils/preferences');
  await updateDoc(doc(db, 'users', uid), { preferences: normalizePreferences(preferences) });
}
