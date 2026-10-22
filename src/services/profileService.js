import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebaseDb';

/**
 * Everything that reads or writes the user's own Firestore documents. Kept
 * apart from the auth context so the database SDK can be loaded on demand.
 */

const DEFAULT_NAME = 'Učenec';

/**
 * Make sure the private profile document exists. Accounts created before this
 * document existed, or created while the write was blocked, get it here —
 * without it the settings cannot be saved at all.
 */
export async function ensureUserDocument(uid, { displayName, email } = {}) {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) return;

  await setDoc(userRef, {
    displayName: displayName || DEFAULT_NAME,
    email: email || '',
    school: '',
    photoURL: '',
    createdAt: serverTimestamp(),
  });
}

/**
 * Make sure the searchable profile exists and carries the current name. The
 * name is only replaced when a real one is known, so a late first write does
 * not overwrite a good name with the fallback.
 */
export async function ensurePublicProfile(uid, displayName) {
  const name = displayName || DEFAULT_NAME;
  const profileRef = doc(db, 'publicProfiles', uid);
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    await setDoc(profileRef, {
      displayName: name,
      searchName: name.toLocaleLowerCase('sl-SI'),
      photoURL: '',
      createdAt: serverTimestamp(),
    });
    return;
  }

  const stored = snapshot.data()?.displayName;
  if (stored && stored !== name && name !== DEFAULT_NAME) {
    await updateDoc(profileRef, {
      displayName: name,
      searchName: name.toLocaleLowerCase('sl-SI'),
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
