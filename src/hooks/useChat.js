import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, limit, where,
  onSnapshot, addDoc, deleteDoc, doc, updateDoc,
  getDocs, serverTimestamp, getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// ─── User profile (Firestore) ─────────────────────────────────────────────────
export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) setProfile({ uid: snap.id, ...snap.data() });
    });
    return unsub;
  }, [uid]);

  return { profile };
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export function useMessages(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) { setMessages([]); setLoading(false); return; }
    setLoading(true);
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(200)
    );
    const unsub = onSnapshot(q,
      (snap) => { setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      (err) => { console.error('useMessages:', err); setLoading(false); }
    );
    return unsub;
  }, [chatId]);

  return { messages, loading };
}

// ─── All users (for search in Profile) ───────────────────────────────────────
export function useAllUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        setUsers(
          snap.docs
            .map((d) => ({ uid: d.id, ...d.data() }))
            .filter((u) => u.uid !== currentUser.uid)
        );
      },
      (err) => {
        console.error("Napaka pri pridobivanju uporabnikov:", err);
      }
    );
    return unsub;
  }, [currentUser]);

  return { users };
}

// ─── Friends (accepted requests) ──────────────────────────────────────────────
export function useFriends() {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    // Listen to accepted requests where I'm sender OR receiver
    const qSent = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', uid),
      where('status', '==', 'accepted')
    );
    const qRecv = query(
      collection(db, 'friendRequests'),
      where('toUid', '==', uid),
      where('status', '==', 'accepted')
    );

    const map = new Map();

    const unsubSent = onSnapshot(qSent, (snap) => {
      snap.docs.forEach((d) => {
        const data = d.data();
        map.set(data.toUid, { uid: data.toUid, displayName: data.toName, reqId: d.id });
      });
      // Remove old entries from sent where status changed
      snap.docChanges().forEach((change) => {
        if (change.type === 'removed') map.delete(change.doc.data().toUid);
      });
      setFriends([...map.values()]);
    });

    const unsubRecv = onSnapshot(qRecv, (snap) => {
      snap.docs.forEach((d) => {
        const data = d.data();
        map.set(data.fromUid, { uid: data.fromUid, displayName: data.fromName, reqId: d.id });
      });
      snap.docChanges().forEach((change) => {
        if (change.type === 'removed') map.delete(change.doc.data().fromUid);
      });
      setFriends([...map.values()]);
    });

    return () => { unsubSent(); unsubRecv(); };
  }, [currentUser]);

  return { friends };
}

// ─── Incoming friend requests (pending) ──────────────────────────────────────
export function useFriendRequests() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'friendRequests'),
      where('toUid', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser]);

  return { requests };
}

// ─── Sent pending requests ────────────────────────────────────────────────────
export function useSentRequests() {
  const { currentUser } = useAuth();
  const [sent, setSent] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', currentUser.uid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snap) => {
      setSent(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser]);

  return { sent };
}

// ─── Send friend request ──────────────────────────────────────────────────────
export async function sendFriendRequest(fromUser, toUid, toName) {
  await addDoc(collection(db, 'friendRequests'), {
    fromUid: fromUser.uid,
    fromName: fromUser.displayName || fromUser.email,
    toUid,
    toName,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

// ─── Respond to friend request ────────────────────────────────────────────────
export async function respondToRequest(reqId, status) {
  await updateDoc(doc(db, 'friendRequests', reqId), { status });
}

// ─── Send text message ────────────────────────────────────────────────────────
export async function sendMessage(chatId, user, text, fileData = null) {
  const clean = text.trim().slice(0, 2000);
  if (!clean && !fileData) return;

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    text: clean,
    senderId: user.uid,
    senderName: user.displayName || 'Neznan',
    senderInitial: (user.displayName?.[0] || '?').toUpperCase(),
    timestamp: serverTimestamp(),
    ...(fileData || {}),
  });
}


// ─── Delete message ───────────────────────────────────────────────────────────
export async function deleteMessage(chatId, msgId) {
  await deleteDoc(doc(db, 'chats', chatId, 'messages', msgId));
}

// ─── DM chat ID (alphabetically sorted UIDs) ─────────────────────────────────
export function getDmChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}
