import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseDb';
import { generateCode, isValidCode, normalizeCode } from '../utils/friendCode';

/**
 * Friend codes live in their own collection so a code can be looked up with a
 * single read and two accounts can never share one.
 *
 * The user's own document keeps the current code, which lets the Firestore
 * rules check that a code document may only be created for the account that
 * owns it.
 */
export async function ensureFriendCode(uid, currentCode) {
  if (currentCode && isValidCode(currentCode)) {
    // The code document may be missing after an interrupted write.
    const codeRef = doc(db, 'userCodes', currentCode);
    const existing = await getDoc(codeRef);
    if (!existing.exists()) {
      await setDoc(codeRef, { uid, createdAt: serverTimestamp() });
    }
    return currentCode;
  }

  const code = generateCode();
  await updateDoc(doc(db, 'users', uid), { friendCode: code });
  await setDoc(doc(db, 'userCodes', code), { uid, createdAt: serverTimestamp() });
  return code;
}

/**
 * Replace the user's code. The new code is written first, so a failure
 * halfway through never leaves the account without a usable code.
 */
export async function regenerateFriendCode(uid, previousCode) {
  const code = generateCode();
  await updateDoc(doc(db, 'users', uid), { friendCode: code });
  await setDoc(doc(db, 'userCodes', code), { uid, createdAt: serverTimestamp() });
  if (previousCode && previousCode !== code) {
    try {
      await deleteDoc(doc(db, 'userCodes', previousCode));
    } catch {
      // The old code is harmless on its own: it only points at this account.
    }
  }
  return code;
}

/**
 * Resolve a code to one person. Returns `null` when the code is unknown, and
 * the profile is missing when the account behind the code no longer exists.
 */
export async function lookupUserByCode(rawCode) {
  const code = normalizeCode(rawCode);
  if (!isValidCode(code)) {
    return { status: 'invalid' };
  }

  const codeDoc = await getDoc(doc(db, 'userCodes', code));
  if (!codeDoc.exists()) {
    return { status: 'not-found' };
  }

  const uid = codeDoc.data()?.uid;
  if (!uid) return { status: 'not-found' };

  const profileDoc = await getDoc(doc(db, 'publicProfiles', uid));
  if (!profileDoc.exists()) {
    return { status: 'gone' };
  }

  return {
    status: 'found',
    user: { uid, ...profileDoc.data() },
  };
}
