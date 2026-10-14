import { useState, useEffect } from 'react';
import {
  collection, query, where,
  onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

function reportWriteError(action, error) {
  console.error(`${action} failed:`, error);
  window.alert('Shranjevanje ni uspelo. Preveri povezavo in dostop do Firebase ter poskusi znova.');
}

function useUserCollection(name, sortFn) {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, name), where('uid', '==', currentUser.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (sortFn) docs.sort(sortFn);
        setItems(docs);
        setLoading(false);
      },
      (err) => {
        console.error(`${name} error:`, err);
        setLoading(false);
      },
    );
    return unsub;
  }, [currentUser, name]);

  return { items, loading };
}

/* Preverjanja: { title, subjectId, date: 'YYYY-MM-DD', uid, createdAt } */
export function useExams() {
  const { currentUser } = useAuth();
  const { items: exams, loading } = useUserCollection('exams', (a, b) => (a.date || '').localeCompare(b.date || ''));

  async function addExam(data) {
    try {
      const created = await addDoc(collection(db, 'exams'), { ...data, uid: currentUser.uid, createdAt: serverTimestamp() });
      return created.id;
    } catch (err) { reportWriteError('Adding exam', err); return null; }
  }
  async function updateExam(id, data) {
    try { await updateDoc(doc(db, 'exams', id), data); }
    catch (err) { reportWriteError('Updating exam', err); }
  }
  async function deleteExam(id) {
    try { await deleteDoc(doc(db, 'exams', id)); }
    catch (err) { reportWriteError('Deleting exam', err); }
  }
  return { exams, loading, addExam, updateExam, deleteExam };
}

/* Kartice: { subjectId, front, back, known, uid, createdAt } */
export function useFlashcards() {
  const { currentUser } = useAuth();
  const { items: cards, loading } = useUserCollection('flashcards', (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  async function addCard(data) {
    try {
      const created = await addDoc(collection(db, 'flashcards'), { ...data, known: false, uid: currentUser.uid, createdAt: serverTimestamp() });
      return created.id;
    } catch (err) { reportWriteError('Adding card', err); return null; }
  }
  async function updateCard(id, data) {
    try { await updateDoc(doc(db, 'flashcards', id), data); }
    catch (err) { reportWriteError('Updating card', err); }
  }
  async function deleteCard(id) {
    try { await deleteDoc(doc(db, 'flashcards', id)); }
    catch (err) { reportWriteError('Deleting card', err); }
  }
  return { cards, loading, addCard, updateCard, deleteCard };
}

/* Fokus: { minutes, mode: 'focus'|'break', day: 'YYYY-MM-DD', uid, createdAt } */
export function useFocusSessions() {
  const { currentUser } = useAuth();
  const { items: sessions, loading } = useUserCollection('focusSessions', (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  async function logSession({ minutes, mode, day }) {
    try {
      await addDoc(collection(db, 'focusSessions'), { minutes, mode, day, uid: currentUser.uid, createdAt: serverTimestamp() });
    } catch (err) { reportWriteError('Logging focus session', err); }
  }
  return { sessions, loading, logSession };
}
