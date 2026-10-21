import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseConfigured } from '../firebase';
import FirebaseSetupNotice from './FirebaseSetupNotice';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!isFirebaseConfigured) return <FirebaseSetupNotice />;
  return currentUser ? children : <Navigate to="/login" replace />;
}
