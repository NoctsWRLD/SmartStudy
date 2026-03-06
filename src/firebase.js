import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBS9JRYJRb1E9OiuAfm6oN7p3qC6o4kbGw',
  authDomain: 'smartstudy-e0d05.firebaseapp.com',
  projectId: 'smartstudy-e0d05',
  storageBucket: 'smartstudy-e0d05.appspot.com',
  messagingSenderId: '187473868678',
  appId: '1:187473868678:web:1234567890abcdef123456',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
