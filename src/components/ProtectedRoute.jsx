import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseConfigured } from '../firebase';
import FirebaseSetupNotice from './FirebaseSetupNotice';

/**
 * The guard waits for the session before it decides anything: a visitor whose
 * session has not been resolved yet is neither signed in nor signed out, and
 * sending them to the login page would be wrong.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, sessionResolved } = useAuth();

  if (!isFirebaseConfigured) return <FirebaseSetupNotice />;

  if (!sessionResolved) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 md:px-6 lg:pt-9" aria-busy="true">
        <div className="skel h-8 w-56" />
        <div className="skel mt-4 h-4 w-80" />
        <div className="skel mt-8 h-40 w-full" />
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" replace />;
}
