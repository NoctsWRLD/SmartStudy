import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, orderBy, limit,
  onSnapshot, addDoc, deleteDoc, doc,
  getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Real-time listener for messages in a chat room.
 * chatId examples: 'general', 'subject_abc123', 'dm_uid1_uid2'
 */
export function useMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(docs);
        setLoading(false);
      },
      (err) => {
        console.error('useMessages error:', err);
        setLoading(false);
      }
    );

    return unsub;
  }, [chatId]);

  return { messages, loading };
}

/**
 * Fetch all registered users (for DM list). Excludes self.
 */
export function useChatUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    getDocs(collection(db, 'users'))
      .then((snap) => {
        const all = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => u.uid !== currentUser.uid);
        setUsers(all);
        setLoading(false);
      })
      .catch((err) => {
        console.error('useChatUsers error:', err);
        setLoading(false);
      });
  }, [currentUser]);

  return { users, loading };
}

/**
 * Send a message to a chat room.
 */
export async function sendMessage(chatId, user, text) {
  const clean = text.trim().slice(0, 2000);
  if (!clean) return;

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    text: clean,
    senderId: user.uid,
    senderName: user.displayName || 'Neznan',
    senderInitial: (user.displayName?.[0] || '?').toUpperCase(),
    timestamp: serverTimestamp(),
  });
}

/**
 * Delete own message.
 */
export async function deleteMessage(chatId, msgId) {
  await deleteDoc(doc(db, 'chats', chatId, 'messages', msgId));
}

/**
 * Build a deterministic DM chat ID from two UIDs (always sorted alphabetically).
 */
export function getDmChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}
