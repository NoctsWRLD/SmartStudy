import { getFirestore } from 'firebase/firestore';
import { app } from './firebase';

/**
 * Firestore lives in its own module so the database SDK is only downloaded by
 * the screens that actually read from it — never by the public landing page.
 */
export const db = app ? getFirestore(app) : null;
