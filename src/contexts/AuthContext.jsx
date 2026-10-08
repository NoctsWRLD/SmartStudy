import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function register(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName,
      email,
      school: '',
      photoURL: '',
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'publicProfiles', result.user.uid), {
      displayName,
      searchName: displayName.toLocaleLowerCase('sl-SI'),
      photoURL: '',
      createdAt: serverTimestamp(),
    });
    return result;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  /** Update display name and/or school */
  async function updateUserProfile({ displayName, school }) {
    const user = auth.currentUser;
    if (displayName) await updateProfile(user, { displayName });
    await updateDoc(doc(db, 'users', user.uid), {
      ...(displayName ? { displayName } : {}),
      ...(school !== undefined ? { school } : {}),
    });
    if (displayName) {
      await setDoc(doc(db, 'publicProfiles', user.uid), {
        displayName,
        searchName: displayName.toLocaleLowerCase('sl-SI'),
      }, { merge: true });
    }
    setCurrentUser({ ...user, displayName: displayName || user.displayName });
  }

  useEffect(() => {
    if (!auth) {
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setUserProfile(null);
      setLoading(false);
      if (!user) return;

      // Backfill a minimal public profile for accounts created before profile privacy was added.
      try {
        const publicProfileRef = doc(db, 'publicProfiles', user.uid);
        const publicProfile = await getDoc(publicProfileRef);
        if (!publicProfile.exists()) {
          await setDoc(publicProfileRef, {
            displayName: user.displayName || 'Učenec',
            searchName: (user.displayName || 'Učenec').toLocaleLowerCase('sl-SI'),
            photoURL: user.photoURL || '',
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Public profile initialization failed:', error);
      }
    });
    return unsubscribe;
  }, []);

  // Real-time Firestore profile listener
  const currentUid = currentUser?.uid;
  useEffect(() => {
    if (!currentUid || !db) return undefined;
    const unsub = onSnapshot(doc(db, 'users', currentUid), (snap) => {
      if (snap.exists()) setUserProfile({ uid: snap.id, ...snap.data() });
    });
    return unsub;
  }, [currentUid]);

  const value = { currentUser, userProfile, register, login, logout, updateUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
