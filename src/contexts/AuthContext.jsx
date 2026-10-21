import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [sessionResolved, setSessionResolved] = useState(false);

  // Without a Firebase configuration there is no session to wait for, so the
  // public pages render straight away.
  const loading = Boolean(auth) && !sessionResolved;

  async function register(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    const { createUserProfile } = await import('../services/profileService');
    await createUserProfile(result.uid, { displayName, email });
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
    const { updateProfileDocuments } = await import('../services/profileService');
    await updateProfileDocuments(user.uid, { displayName, school });
    setCurrentUser({ ...user, displayName: displayName || user.displayName });
  }

  useEffect(() => {
    if (!auth) {
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setUserProfile(null);
      setSessionResolved(true);
      if (!user) return;

      // Backfill a minimal public profile for accounts created before profile privacy was added.
      try {
        const { ensurePublicProfile } = await import('../services/profileService');
        await ensurePublicProfile(user.uid, user.displayName);
      } catch (error) {
        console.error('Public profile initialization failed:', error);
      }
    });
    return unsubscribe;
  }, []);

  // Real-time Firestore profile listener
  const currentUid = currentUser?.uid;
  useEffect(() => {
    if (!currentUid) return undefined;
    let unsubscribe;
    let cancelled = false;
    import('../services/profileService').then(({ watchUserProfile }) => {
      if (cancelled) return;
      unsubscribe = watchUserProfile(currentUid, setUserProfile);
    }).catch((error) => {
      console.error('Profile listener failed:', error);
    });
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [currentUid]);

  const value = { currentUser, userProfile, register, login, logout, updateUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
