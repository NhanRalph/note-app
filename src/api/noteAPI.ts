import firestore from "@react-native-firebase/firestore";
import { hasInternetConnection } from "../utils/checkInternet";
export interface NoteType {
  id: string;
  title: string;
  content: string;
  images: string[];
  groupId: string | null;
  locked: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}
export const updateNoteCount = async (
  userId: string,
  groupId: string,
  increment: number
) => {
  if (!groupId) return;

  const groupRef = firestore().doc(`users/${userId}/groups/${groupId}`);

  await groupRef.set(
    {
      noteCount: firestore.FieldValue.increment(increment),
    },
    { merge: true }
  );
};

export const getAllNotes = async (
  userId: string,
  pageSize: number,
  lastOrder?: number | null,
  keyword?: string
) => {
  let query = firestore()
    .collection("users")
    .doc(userId)
    .collection("notes")
    .orderBy("pinned", "desc")
    .orderBy("order", "desc")
    .limit(pageSize);

  if (lastOrder) {
    query = query.startAfter(lastOrder);
  }

  const snapshot = await query.get();

  let notes = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      images: data.images || [],
      groupId: data.groupId || null,
      locked: !!data.locked,
      pinned: !!data.pinned,
      createdAt:
        data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      order: data.order || 0,
    };
  });

  // Lọc theo keyword nếu có
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(lowerKeyword) ||
        note.content?.toLowerCase().includes(lowerKeyword)
    );
  }

  const lastNote = notes[notes.length - 1] || null;
  const newLastOrder = lastNote?.order ?? null;

  return { notes, newLastOrder };
};

export const getNotes = async (
  userId: string,
  pageSize: number,
  groupId?: string,
  lastOrder?: number | null,
  keyword?: string
) => {
  let query = firestore()
    .collection("users")
    .doc(userId)
    .collection("notes")
    .orderBy("pinned", "desc")
    .orderBy("order", "desc")
    .limit(pageSize);

  if (lastOrder) {
    query = query.startAfter(lastOrder);
  }

  if (groupId) {
    query = query.where("groupId", "==", groupId);
  }

  const snapshot = await query.get();

  let notes = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      images: data.images || [],
      groupId: data.groupId || null,
      locked: !!data.locked,
      pinned: !!data.pinned,
      createdAt:
        data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      order: data.order || 0,
    };
  });

  // Lọc theo keyword nếu có
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(lowerKeyword) ||
        note.content?.toLowerCase().includes(lowerKeyword)
    );
  }

  const lastNote = notes[notes.length - 1] || null;
  const newLastOrder = lastNote?.order ?? null;

  return { notes, newLastOrder };
};

export const createNote = async (
  userId: string,
  data: {
    title: string;
    content: string;
    images?: string[];
    groupId: string | null;
  }
) => {
  const isConnected = await hasInternetConnection();
  const notesSnap = await firestore()
    .collection(`users/${userId}/notes`)
    .orderBy("order", "desc")
    .limit(1)
    .get();

  const maxOrder = notesSnap.empty
    ? 0
    : (notesSnap.docs[0].data().order || 0) + 1;

  const noteRef = firestore().collection(`users/${userId}/notes`).doc();

  await noteRef.set({
    ...data,
    images: data.images || [],
    locked: false,
    pinned: false,
    order: maxOrder,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  if (data.groupId) {
    if (isConnected) {
      console.log("Online");
      await updateNoteCount(userId, data.groupId, 1);
    } else {
      console.log("Offline, not updating note count");
      updateNoteCount(userId, data.groupId, 1);
    }
  }

  return {
    id: noteRef.id,
    ...data,
    images: data.images || [],
    locked: false,
    pinned: false,
    order: maxOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const updateNote = async (userId: string, noteId: string, data: any) => {
  const noteRef = firestore().doc(`users/${userId}/notes/${noteId}`);
  const noteSnap = await noteRef.get();

  if (!noteSnap.exists) {
    throw new Error("Note không tồn tại");
  }

  let oldGroupId = noteSnap.data()?.groupId ?? null;
  if (oldGroupId === "") oldGroupId = null;

  let newGroupId = data.groupId ?? oldGroupId;
  if (newGroupId === "") newGroupId = null;

  const batch = firestore().batch();

  // Nếu groupId thay đổi thì xử lý update noteCount
  if (oldGroupId !== newGroupId) {
    if (oldGroupId) {
      const oldGroupRef = firestore().doc(
        `users/${userId}/groups/${oldGroupId}`
      );
      batch.update(oldGroupRef, {
        noteCount: firestore.FieldValue.increment(-1),
      });
    }

    if (newGroupId) {
      const newGroupRef = firestore().doc(
        `users/${userId}/groups/${newGroupId}`
      );
      batch.update(newGroupRef, {
        noteCount: firestore.FieldValue.increment(1),
      });
    }
  }

  batch.update(noteRef, {
    ...data,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
};

export const deleteNote = async (userId: string, noteId: string) => {
  const noteSnap = await firestore()
    .doc(`users/${userId}/notes/${noteId}`)
    .get();

  const noteData = noteSnap.data();
  const groupId = noteData?.groupId || null;

  await firestore().doc(`users/${userId}/notes/${noteId}`).delete();

  if (groupId) {
    await updateNoteCount(userId, groupId, -1);
  }
};

//move note to another group
export const moveNoteToGroup = async (
  userId: string,
  noteId: string,
  newGroupId: string | null
) => {
  const noteRef = firestore().doc(`users/${userId}/notes/${noteId}`);
  const noteSnap = await noteRef.get();

  if (!noteSnap.exists) {
    throw new Error("Note không tồn tại");
  }

  const noteData = noteSnap.data();
  const oldGroupId = noteData?.groupId || null;

  console.log("old", oldGroupId);
  console.log("new", newGroupId);

  const batch = firestore().batch();

  if (oldGroupId && oldGroupId !== newGroupId) {
    const oldGroupRef = firestore().doc(`users/${userId}/groups/${oldGroupId}`);
    batch.update(oldGroupRef, {
      noteCount: firestore.FieldValue.increment(-1),
    });
  }

  if (newGroupId && oldGroupId !== newGroupId) {
    const newGroupRef = firestore().doc(`users/${userId}/groups/${newGroupId}`);
    batch.update(newGroupRef, {
      noteCount: firestore.FieldValue.increment(1),
    });
  }

  batch.update(noteRef, {
    groupId: newGroupId,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
};

//toggle pin
export const togglePinNote = async (
  userId: string,
  noteId: string,
  pinned: boolean
) => {
  await firestore().doc(`users/${userId}/notes/${noteId}`).update({
    pinned,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

//toggle locked
export const toggleLockNote = async (
  userId: string,
  noteId: string,
  locked: boolean
) => {
  await firestore().doc(`users/${userId}/notes/${noteId}`).update({
    locked,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

export const getPinnedNotes = async (
  userId: string,
  pageSize: number,
  lastOrder?: number | null,
  keyword?: string
) => {
  let query = firestore()
    .collection("users")
    .doc(userId)
    .collection("notes")
    .where("pinned", "==", true)
    .orderBy("order", "desc")
    .limit(pageSize);

  if (lastOrder) {
    query = query.startAfter(lastOrder);
  }

  const snapshot = await query.get();

  let notes = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      images: data.images || [],
      groupId: data.groupId || null,
      locked: !!data.locked,
      pinned: !!data.pinned,
      createdAt:
        data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      order: data.order || 0,
    };
  });

  // Lọc theo keyword nếu có
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(lowerKeyword) ||
        note.content?.toLowerCase().includes(lowerKeyword)
    );
  }

  const lastNote = notes[notes.length - 1] || null;
  const newLastOrder = lastNote?.order ?? null;

  return { notes, newLastOrder };
};

export const getLockedNotes = async (
  userId: string,
  pageSize: number,
  lastOrder?: number | null,
  keyword?: string
) => {
  let query = firestore()
    .collection("users")
    .doc(userId)
    .collection("notes")
    .where("locked", "==", true)
    .orderBy("order", "desc")
    .limit(pageSize);

  if (lastOrder) {
    query = query.startAfter(lastOrder);
  }

  const snapshot = await query.get();

  let notes = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      images: data.images || [],
      groupId: data.groupId || null,
      locked: !!data.locked,
      pinned: !!data.pinned,
      createdAt:
        data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      order: data.order || 0,
    };
  });

  // Lọc theo keyword nếu có
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(lowerKeyword) ||
        note.content?.toLowerCase().includes(lowerKeyword)
    );
  }

  const lastNote = notes[notes.length - 1] || null;
  const newLastOrder = lastNote?.order ?? null;

  return { notes, newLastOrder };
};

export const updateNoteOrder = async (userId: string, notes: NoteType[]) => {
  const batch = firestore().batch();

  notes.forEach((note, index) => {
    const ref = firestore().doc(`users/${userId}/notes/${note.id}`);
    batch.update(ref, { order: index });
  });

  await batch.commit();
};
