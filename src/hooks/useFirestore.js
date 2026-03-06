import { useState, useEffect } from 'react';
import {
  collection, query, where,
  onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useSubjects() {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'subjects'),
      where('uid', '==', currentUser.uid)
    );
    const unsub = onSnapshot(
      q,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by createdAt ascending on the client to avoid composite index requirement
        docs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setSubjects(docs);
        setLoading(false);
      },
      err => {
        console.error('UseSubjects error:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, [currentUser]);

  async function addSubject(data) {
    await addDoc(collection(db, 'subjects'), {
      ...data,
      uid: currentUser.uid,
      createdAt: serverTimestamp(),
    });
  }

  async function updateSubject(id, data) {
    await updateDoc(doc(db, 'subjects', id), data);
  }

  async function deleteSubject(id) {
    await deleteDoc(doc(db, 'subjects', id));
  }

  return { subjects, loading, addSubject, updateSubject, deleteSubject };
}

export function useTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', currentUser.uid)
    );
    const unsub = onSnapshot(
      q,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by createdAt descending on the client to avoid composite index requirement
        docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setTasks(docs);
        setLoading(false);
      },
      err => {
        console.error('UseTasks error:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, [currentUser]);

  async function addTask(data) {
    await addDoc(collection(db, 'tasks'), {
      ...data,
      completed: false,
      uid: currentUser.uid,
      createdAt: serverTimestamp(),
    });
  }

  async function updateTask(id, data) {
    await updateDoc(doc(db, 'tasks', id), data);
  }

  async function toggleTask(task) {
    await updateDoc(doc(db, 'tasks', task.id), { completed: !task.completed });
  }

  async function deleteTask(id) {
    await deleteDoc(doc(db, 'tasks', id));
  }

  return { tasks, loading, addTask, updateTask, toggleTask, deleteTask };
}
