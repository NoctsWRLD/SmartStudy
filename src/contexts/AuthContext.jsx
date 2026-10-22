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

  /** Store the study preferences on the user's own document. */
  async function updatePreferences(preferences) {
    const user = auth.currentUser;
    const { updatePreferences: save } = await import('../services/profileService');
    await save(user.uid, preferences);
  }

  /** Change the e-mail address of the account. */
  async function changeEmail(newEmail, password) {
    const { changeAccountEmail } = await import('../services/accountService');
    await changeAccountEmail(auth.currentUser, password, newEmail);
  }

  /** Change the password of the account. */
  async function changePassword(newPassword, password) {
    const { changeAccountPassword } = await import('../services/accountService');
    await changeAccountPassword(auth.currentUser, password, newPassword);
  }

  /** Delete the account and everything in it. */
  async function deleteAccount(password, chatIds = []) {
    const { deleteAccount: remove } = await import('../services/accountService');
    await remove(auth.currentUser, password, chatIds);
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

  const value = {
    currentUser,
    userProfile,
    register,
    login,
    logout,
    updateUserProfile,
    updatePreferences,
    changeEmail,
    changePassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
